"""
services/inference_service.py — TBVision AI Backend
All ML logic: X-ray validation, image quality checks, CNN inference,
Grad-CAM computation, and heatmap overlay.
"""
import io
import base64
import json
import re
from typing import Optional

import cv2
import numpy as np
import tensorflow as tf
from PIL import Image
import matplotlib.cm as cm

from config import settings

# ── Model singleton ───────────────────────────────────────────
_model = None


def get_model():
    global _model
    if _model is None:
        from tensorflow.keras.models import load_model
        _model = load_model("model/model.h5")
    return _model


# ── Chest X-ray validation (AI path) ─────────────────────────
def _is_chest_xray_ai(pil_img: Image.Image) -> tuple[bool, str]:
    import anthropic

    thumb = pil_img.convert("RGB").copy()
    thumb.thumbnail((512, 512), Image.LANCZOS)
    buf = io.BytesIO()
    thumb.save(buf, format="JPEG", quality=80)
    b64_data = base64.standard_b64encode(buf.getvalue()).decode("utf-8")

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    prompt = (
        "You are a radiology expert. Examine this image and determine strictly "
        "whether it is a chest X-ray (PA or AP view of the human thorax used in "
        "medical radiology).\n\n"
        "Reply ONLY with a JSON object — no prose, no markdown — in this exact format:\n"
        '{"is_chest_xray": true/false, "reason": "one short sentence"}\n\n'
        "Return is_chest_xray=true ONLY if you are confident this is a genuine "
        "PA/AP chest radiograph showing lungs, ribs, spine, and diaphragm."
    )
    msg = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=120,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": b64_data}},
                {"type": "text", "text": prompt},
            ],
        }],
    )
    raw = re.sub(r"^```[a-z]*\n?", "", msg.content[0].text.strip()).rstrip("`").strip()
    data     = json.loads(raw)
    is_valid = bool(data.get("is_chest_xray", False))
    reason   = str(data.get("reason", ""))
    if is_valid:
        return True, "Image confirmed as a chest radiograph by AI vision check."
    return False, f"AI validation rejected this image: {reason}"


# ── Chest X-ray validation (heuristic fallback) ───────────────
def _is_chest_xray_heuristic(pil_img: Image.Image) -> tuple[bool, str]:
    img_gray = np.array(pil_img.convert("L").resize((256, 256), Image.LANCZOS), dtype=np.float32)
    img_arr  = np.array(pil_img.convert("RGB").resize((256, 256), Image.LANCZOS), dtype=np.float32)

    # 1. Colour saturation — X-rays are grayscale
    sat = np.max(img_arr, axis=2) - np.min(img_arr, axis=2)
    if float(sat.mean()) > 40:
        return False, "Invalid image: Detected a colour photograph. Please upload a standard grayscale chest X-ray."

    dark_ratio = float(np.sum(img_gray < 30)) / img_gray.size
    # 2. Must have a dark background (relaxed for images with white borders)
    if dark_ratio < 0.03:
        return False, "Invalid image: Does not appear to be a chest X-ray. The photometric properties do not match a clinical radiograph."
    # 3. Must not be almost entirely black (dark UI screenshot)
    if dark_ratio > 0.72:
        return False, "Invalid image: The file is excessively dark and does not contain visible chest anatomy."

    # 4. Mid-tone content (lung tissue, mediastinum)
    mid_tone = float(np.sum((img_gray >= 40) & (img_gray <= 190))) / img_gray.size
    if mid_tone < 0.15:
        return False, "Invalid image: Lacks the expected soft tissue contrast of a chest radiograph."

    # 5. Edge direction — organic curves vs. horizontal text lines
    h_energy = float(np.mean(np.abs(cv2.Sobel(img_gray, cv2.CV_64F, 0, 1, ksize=3))))
    v_energy = float(np.mean(np.abs(cv2.Sobel(img_gray, cv2.CV_64F, 1, 0, ksize=3))))
    if v_energy > 0 and (h_energy / (v_energy + 1e-6)) > 2.5:
        return False, "Invalid image: Detected patterns resembling text or documents rather than a medical scan."

    # 6. Minimum contrast
    if float(img_gray.std()) < 20:
        return False, "Invalid image: Contrast is too low to be an X-ray."

    # 7. Aspect ratio
    w, h  = pil_img.size
    ratio = w / h if h > 0 else 1.0
    if ratio < 0.45 or ratio > 2.2:
        return False, f"Invalid image: Abnormal dimensions ({w}×{h}) for a PA/AP chest X-ray."

    # 8. Tonal diversity
    if len(np.unique((img_gray / 8).astype(np.uint8))) < 20:
        return False, "Invalid image: The file lacks the tonal depth of a computed radiograph."

    # 9. Bright bone/tissue structures
    if float(np.sum(img_gray > 180)) / img_gray.size < 0.01:
        return False, "Invalid image: Could not detect bright bone structures typical of a chest X-ray."

    return True, "Image passed heuristic chest-radiograph checks."


def is_chest_xray(pil_img: Image.Image) -> tuple[bool, str]:
    """Validate using Claude Vision when an API key is available; fall back to heuristics."""
    if settings.ANTHROPIC_API_KEY:
        try:
            return _is_chest_xray_ai(pil_img)
        except Exception as e:
            print(f"[inference] AI X-ray check failed ({e}), falling back to heuristics.")
    return _is_chest_xray_heuristic(pil_img)


# ── Image quality assessment ──────────────────────────────────
def check_image_quality(pil_img: Image.Image) -> dict:
    w, h    = pil_img.size
    gray    = np.array(pil_img.convert("L"))
    lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    ratio   = w / h if h > 0 else 1.0

    # Resolution
    res_ok     = w >= 200 and h >= 200
    res_status = "✓ Good" if res_ok else "✗ Too Low"

    # Sharpness
    if lap_var > 300:
        blur_status = "✓ Sharp"
    elif lap_var > 80:
        blur_status = "⚠ Moderate"
    else:
        blur_status = "✗ Blurry"

    # Orientation + auto-rotation
    corrected        = pil_img
    orientation_status = "✓ Normal"
    if ratio > 2.0:
        corrected        = pil_img.rotate(90, expand=True)
        orientation_status = "↻ Auto-rotated"
    elif ratio < 0.4:
        corrected        = pil_img.rotate(-90, expand=True)
        orientation_status = "↺ Auto-rotated"
    elif ratio < 0.6 or ratio > 1.6:
        orientation_status = "⚠ Check"

    return {
        "width":              w,
        "height":             h,
        "resolution_ok":      res_ok,
        "resolution_status":  res_status,
        "blur_score":         round(lap_var, 1),
        "blur_status":        blur_status,
        "orientation_status": orientation_status,
        "overall_ok":         res_ok and lap_var > 80,
        "corrected_image":    corrected,  # PIL Image — do not serialise directly
    }


# ── Grad-CAM ──────────────────────────────────────────────────
def compute_gradcam(model, img_array, class_idx: int = 0) -> Optional[np.ndarray]:
    """Compute Grad-CAM heatmap by building a functional sub-model tracking intermediate conv layers."""
    try:
        # Reconstruct model graph explicitly to ensure GradientTape tracks operations
        inputs = tf.keras.Input(shape=(500, 500, 1))
        x = inputs
        last_conv_output = None
        
        for layer in model.layers:
            x = layer(x)
            if isinstance(layer, tf.keras.layers.Conv2D):
                last_conv_output = x
                
        if last_conv_output is None:
            print("[inference] Grad-CAM: no Conv2D layer found.")
            return None

        grad_model = tf.keras.Model(inputs=inputs, outputs=[last_conv_output, x])
        img_tensor = tf.constant(img_array, dtype=tf.float32)
        
        with tf.GradientTape() as tape:
            conv_output, predictions = grad_model(img_tensor, training=False)
            loss = predictions[:, 0]

        grads = tape.gradient(loss, conv_output)
        if grads is None:
            print("[inference] Grad-CAM: gradients are None.")
            return None

        pooled = tf.reduce_mean(grads, axis=(0, 1, 2))
        heatmap = tf.squeeze(conv_output[0] @ pooled[..., tf.newaxis])
        heatmap = tf.maximum(heatmap, 0)
        max_val = tf.math.reduce_max(heatmap)
        if max_val < 1e-8:
            print("[inference] Grad-CAM: heatmap max too small.")
            return None
        return (heatmap / (max_val + 1e-8)).numpy()
    except Exception as e:
        print(f"[inference] Grad-CAM error: {e}")
        return None


def overlay_gradcam(pil_img: Image.Image, heatmap: np.ndarray, alpha: float = 0.45) -> Image.Image:
    img_arr         = np.array(pil_img.convert("RGB").resize((500, 500)))
    hm_resized      = Image.fromarray(np.uint8(255 * heatmap)).resize((500, 500))
    hm_colored      = np.uint8(cm.jet(np.array(hm_resized) / 255.0)[:, :, :3] * 255)
    overlay         = np.uint8(img_arr * (1 - alpha) + hm_colored * alpha)
    return Image.fromarray(overlay)


# ── Full inference pipeline ───────────────────────────────────
def run_inference(pil_img: Image.Image, run_gradcam: bool = True) -> dict:
    # 1. Validate image
    is_xray, xray_reason = is_chest_xray(pil_img)

    # 2. Quality check
    quality           = check_image_quality(pil_img)
    corrected_img     = quality.pop("corrected_image")

    # 3. Preprocess → channels-last grayscale (500×500×1)
    tensor = np.array(
        corrected_img.convert("L").resize((500, 500)),
        dtype=np.float32,
    ) / 255.0
    tensor = np.expand_dims(tensor, axis=(0, -1))  # (1, 500, 500, 1)

    # 4. Inference
    model     = get_model()
    raw_score = float(model.predict(tensor, verbose=0)[0][0])

    if raw_score >= 0.5:
        result     = "TUBERCULOSIS DETECTED"
        confidence = raw_score * 100.0
    else:
        result     = "NO TB DETECTED"
        confidence = (1 - raw_score) * 100.0

    # 5. Grad-CAM (for all results — helps doctors see model focus areas)
    heatmap_img = None
    if run_gradcam:
        heatmap = compute_gradcam(model, tensor)
        if heatmap is not None:
            heatmap_img = overlay_gradcam(corrected_img, heatmap)

    return {
        "is_xray":       is_xray,
        "xray_reason":   xray_reason,
        "quality":       quality,
        "raw_score":     raw_score,
        "result":        result,
        "confidence":    confidence,
        "heatmap_img":   heatmap_img,
        "corrected_img": corrected_img,
    }
