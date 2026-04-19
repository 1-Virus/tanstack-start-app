"""
routers/scan_router.py — TBVision AI Backend
Endpoints: analyze an X-ray, fetch scan history, download PDF reports.
"""
import base64
import datetime
import io
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image

import auth
from deps import get_current_user
from services.inference_service import run_inference
from services.report_service import generate_pdf_report

router = APIRouter()


@router.post("/analyze", response_model=dict, summary="Analyse a chest X-ray for TB")
async def analyze_scan(
    file: UploadFile = File(...),
    patient_name:      str = Form(""),
    patient_age:       str = Form(""),
    patient_gender:    str = Form(""),
    patient_id:        str = Form(""),
    symptoms:          str = Form(""),
    symptom_duration:  str = Form(""),
    refer_notes:       str = Form(""),
    current_user: dict = Depends(get_current_user),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    contents = await file.read()
    try:
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not decode the uploaded image.")

    results = run_inference(pil_img, run_gradcam=True)

    if not results["is_xray"]:
        raise HTTPException(status_code=400, detail=results["xray_reason"])

    scan_id = str(uuid.uuid4())[:8].upper()
    now     = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    record = {
        "id":             scan_id,
        "time":           now,
        "file":           file.filename,
        "result":         results["result"],
        "confidence":     f"{results['confidence']:.2f}%",
        "raw":            f"{results['raw_score']:.4f}",
        "quality":        "PASS" if results["quality"]["overall_ok"] else "WARN",
        "patient_name":   patient_name,
        "patient_age":    patient_age,
        "patient_gender": patient_gender,
        "patient_id":     patient_id,
        "doctor_name":    current_user.get("full_name") or current_user.get("username", ""),
        "hospital_name":  current_user.get("hospital", ""),
    }
    auth.save_scan(current_user["id"], record)

    response: dict = {
        "scan_id":    scan_id,
        "result":     results["result"],
        "confidence": results["confidence"],
        "quality":    results["quality"],
    }

    # Encode Grad-CAM heatmap as base64 JPEG for inline display
    if results.get("heatmap_img") is not None:
        hbuf = io.BytesIO()
        results["heatmap_img"].save(hbuf, format="JPEG", quality=85)
        response["heatmap_base64"] = base64.b64encode(hbuf.getvalue()).decode("utf-8")

    return response


@router.get("/history", response_model=list, summary="Get scan history for current user")
def get_history(current_user: dict = Depends(get_current_user)):
    return auth.get_user_scans(current_user["id"])


@router.delete("/history", response_model=dict, summary="Clear all scan history")
def clear_history(current_user: dict = Depends(get_current_user)):
    ok = auth.delete_user_scans(current_user["id"])
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to delete scan history.")
    return {"message": "Scan history cleared."}


@router.post("/{scan_id}/pdf", summary="Generate and download a PDF report")
async def download_pdf(
    scan_id: str,
    file: UploadFile = File(...),
    patient_name:     str = Form(""),
    patient_age:      str = Form(""),
    patient_gender:   str = Form(""),
    patient_id:       str = Form(""),
    symptoms:         str = Form(""),
    symptom_duration: str = Form(""),
    refer_notes:      str = Form(""),
    current_user: dict = Depends(get_current_user),
):
    contents = await file.read()
    try:
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not decode the uploaded image.")

    results = run_inference(pil_img, run_gradcam=True)
    now     = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    pdf_bytes = generate_pdf_report(
        result_label=results["result"],
        confidence=results["confidence"],
        raw_score=results["raw_score"],
        timestamp=now,
        scan_id=scan_id,
        img_pil=results["corrected_img"],
        heatmap_img=results.get("heatmap_img"),
        quality=results["quality"],
        patient_name=patient_name,
        patient_age=patient_age,
        patient_gender=patient_gender,
        patient_id=patient_id,
        doctor_name=current_user.get("full_name") or current_user.get("username", ""),
        hospital_name=current_user.get("hospital", ""),
        symptoms=symptoms,
        symptom_duration=symptom_duration,
        refer_notes=refer_notes,
    )

    if pdf_bytes is None:
        raise HTTPException(status_code=500, detail="PDF generation failed.")

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=TB_Report_{scan_id}.pdf"},
    )
