"""
services/report_service.py — TBVision AI Backend
Generates a professional PDF clinical report using ReportLab.
"""
import io
import datetime

from PIL import Image

# ---------------------------------------------------------------------------
# Try ReportLab first (much better PDF quality), fall back to Matplotlib
# ---------------------------------------------------------------------------

def generate_pdf_report(
    result_label: str,
    confidence: float,
    raw_score: float,
    timestamp: str,
    scan_id: str,
    img_pil: Image.Image,
    heatmap_img: Image.Image | None = None,
    quality: dict | None = None,
    patient_name: str = "",
    patient_age: str = "",
    patient_gender: str = "",
    patient_id: str = "",
    doctor_name: str = "",
    hospital_name: str = "",
    symptoms: str = "",
    symptom_duration: str = "",
    refer_notes: str = "",
) -> bytes | None:
    try:
        return _generate_reportlab_pdf(
            result_label=result_label,
            timestamp=timestamp,
            scan_id=scan_id,
            img_pil=img_pil,
            heatmap_img=heatmap_img,
            quality=quality,
            patient_name=patient_name,
            patient_age=patient_age,
            patient_gender=patient_gender,
            patient_id=patient_id,
            doctor_name=doctor_name,
            hospital_name=hospital_name,
            symptoms=symptoms,
            symptom_duration=symptom_duration,
            refer_notes=refer_notes,
        )
    except Exception as e:
        print(f"[report] PDF generation error: {e}")
        return None


def _pil_to_reportlab_image(pil_img: Image.Image, width: float) -> "RLImage":
    """Convert a PIL image to a ReportLab Image object."""
    from reportlab.platypus import Image as RLImage

    buf = io.BytesIO()
    pil_img.save(buf, format="PNG")
    buf.seek(0)
    iw, ih = pil_img.size
    aspect = ih / iw
    return RLImage(buf, width=width, height=width * aspect)


def _generate_reportlab_pdf(
    result_label: str,
    timestamp: str,
    scan_id: str,
    img_pil: Image.Image,
    heatmap_img: Image.Image | None = None,
    quality: dict | None = None,
    patient_name: str = "",
    patient_age: str = "",
    patient_gender: str = "",
    patient_id: str = "",
    doctor_name: str = "",
    hospital_name: str = "",
    symptoms: str = "",
    symptom_duration: str = "",
    refer_notes: str = "",
) -> bytes | None:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm, cm
    from reportlab.lib.colors import HexColor, white, black
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        Image as RLImage, HRFlowable, KeepTogether
    )
    from reportlab.lib.utils import ImageReader

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=15 * mm,
        bottomMargin=20 * mm,
    )

    # -- Colors --
    DARK      = HexColor("#0a0f1a")
    CYAN      = HexColor("#00d4ff")
    CYAN_DARK = HexColor("#0a2a3a")
    GRAY      = HexColor("#6b7280")
    LIGHT_BG  = HexColor("#f8fafc")
    RED       = HexColor("#dc2626")
    GREEN     = HexColor("#16a34a")
    AMBER     = HexColor("#d97706")
    WHITE     = white

    is_tb = result_label == "TUBERCULOSIS DETECTED"

    # -- Styles --
    styles = getSampleStyleSheet()

    s_title = ParagraphStyle("Title", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=18, textColor=DARK,
        spaceAfter=2 * mm)

    s_subtitle = ParagraphStyle("Subtitle", parent=styles["Normal"],
        fontName="Helvetica", fontSize=8, textColor=GRAY,
        spaceAfter=5 * mm)

    s_section = ParagraphStyle("Section", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=9, textColor=CYAN_DARK,
        spaceBefore=4 * mm, spaceAfter=2 * mm)

    s_body = ParagraphStyle("Body", parent=styles["Normal"],
        fontName="Helvetica", fontSize=8.5, textColor=HexColor("#374151"),
        leading=13)

    s_body_bold = ParagraphStyle("BodyBold", parent=s_body,
        fontName="Helvetica-Bold")

    s_small = ParagraphStyle("Small", parent=styles["Normal"],
        fontName="Helvetica", fontSize=7, textColor=GRAY, leading=10)

    s_disclaimer = ParagraphStyle("Disclaimer", parent=styles["Normal"],
        fontName="Helvetica", fontSize=7, textColor=HexColor("#92400e"),
        leading=10)

    s_footer = ParagraphStyle("Footer", parent=styles["Normal"],
        fontName="Helvetica", fontSize=6.5, textColor=GRAY)

    elements = []
    page_width = A4[0] - 36 * mm  # usable width

    # ═══════════════════════════════════════════════════════════
    # HEADER
    # ═══════════════════════════════════════════════════════════
    header_data = [[
        Paragraph("<b>TBVISION AI</b>", ParagraphStyle("H",
            fontName="Helvetica-Bold", fontSize=14, textColor=DARK)),
        Paragraph(f"Scan ID: <b>{scan_id}</b><br/>Report Generated: {timestamp}",
            ParagraphStyle("HR", fontName="Helvetica", fontSize=7,
                           textColor=GRAY, alignment=2))
    ]]
    header_table = Table(header_data, colWidths=[page_width * 0.5, page_width * 0.5])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    elements.append(header_table)
    elements.append(Paragraph("Clinical Decision Support System — Chest Radiograph TB Analysis", s_subtitle))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#e5e7eb")))
    elements.append(Spacer(1, 3 * mm))

    # ═══════════════════════════════════════════════════════════
    # PATIENT INFORMATION
    # ═══════════════════════════════════════════════════════════
    elements.append(Paragraph("PATIENT INFORMATION", s_section))

    pt_data = [
        ["Patient Name", patient_name or "N/A", "Patient ID", patient_id or "N/A"],
        ["Age", patient_age or "N/A", "Gender", patient_gender or "N/A"],
        ["Attending Doctor", doctor_name or "N/A", "Hospital", hospital_name or "N/A"],
    ]
    pt_table = Table(pt_data, colWidths=[
        page_width * 0.20, page_width * 0.30,
        page_width * 0.20, page_width * 0.30])
    pt_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTNAME", (3, 0), (3, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TEXTCOLOR", (0, 0), (0, -1), GRAY),
        ("TEXTCOLOR", (2, 0), (2, -1), GRAY),
        ("TEXTCOLOR", (1, 0), (1, -1), DARK),
        ("TEXTCOLOR", (3, 0), (3, -1), DARK),
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
        ("GRID", (0, 0), (-1, -1), 0.3, HexColor("#e5e7eb")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(pt_table)
    elements.append(Spacer(1, 2 * mm))

    # ═══════════════════════════════════════════════════════════
    # CLINICAL PRESENTATION
    # ═══════════════════════════════════════════════════════════
    if symptoms or symptom_duration or refer_notes:
        elements.append(Paragraph("CLINICAL PRESENTATION", s_section))
        clinical_parts = []
        if symptoms:
            clinical_parts.append(f"<b>Symptoms:</b> {symptoms}")
        if symptom_duration:
            clinical_parts.append(f"<b>Duration:</b> {symptom_duration}")
        if refer_notes:
            clinical_parts.append(f"<b>Notes:</b> {refer_notes}")
        elements.append(Paragraph("<br/>".join(clinical_parts), s_body))
        elements.append(Spacer(1, 2 * mm))

    # ═══════════════════════════════════════════════════════════
    # PRIMARY FINDING
    # ═══════════════════════════════════════════════════════════
    elements.append(Paragraph("PRIMARY FINDING", s_section))

    result_color = RED if is_tb else GREEN
    result_bg = HexColor("#fef2f2") if is_tb else HexColor("#f0fdf4")
    result_border = HexColor("#fca5a5") if is_tb else HexColor("#86efac")
    result_icon = "⚠  " if is_tb else "✓  "
    display_label = "TUBERCULOSIS DETECTED" if is_tb else "NO TB DETECTED"

    finding_data = [[Paragraph(
        f'<font size="14"><b>{result_icon}{display_label}</b></font>',
        ParagraphStyle("Finding", fontName="Helvetica-Bold",
                       fontSize=14, textColor=result_color, alignment=TA_CENTER)
    )]]
    finding_table = Table(finding_data, colWidths=[page_width])
    finding_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), result_bg),
        ("BOX", (0, 0), (-1, -1), 1.5, result_border),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(finding_table)
    elements.append(Spacer(1, 4 * mm))

    # ═══════════════════════════════════════════════════════════
    # RADIOGRAPH IMAGES
    # ═══════════════════════════════════════════════════════════
    elements.append(Paragraph("RADIOGRAPH ANALYSIS", s_section))

    img_width = page_width * 0.46
    orig_rl = _pil_to_reportlab_image(img_pil.convert("RGB"), img_width)

    if heatmap_img is not None:
        heat_rl = _pil_to_reportlab_image(heatmap_img, img_width)
        img_data = [
            [Paragraph("<b>Uploaded Radiograph</b>", s_small),
             Paragraph("<b>Grad-CAM Activation Map</b>", s_small)],
            [orig_rl, heat_rl],
        ]
        img_table = Table(img_data, colWidths=[page_width * 0.49, page_width * 0.49])
        img_table.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]))
        elements.append(img_table)
    else:
        elements.append(Paragraph("<b>Uploaded Radiograph</b>", s_small))
        elements.append(orig_rl)

    elements.append(Spacer(1, 3 * mm))

    # ═══════════════════════════════════════════════════════════
    # XAI EXPLANATION
    # ═══════════════════════════════════════════════════════════
    xai_text = (
        "Gradient-weighted Class Activation Mapping (Grad-CAM) highlights regions "
        "of the radiograph that most influenced the model's decision. Warmer regions "
        "(red/yellow) indicate high TB-relevant feature activation, while cooler regions "
        "(blue) show low activation. This provides radiologists with spatial context "
        "for AI-assisted review."
    )
    xai_data = [[Paragraph(
        f'<b>Explainable AI (XAI) — Grad-CAM Interpretation</b><br/><br/>{xai_text}',
        ParagraphStyle("XAI", fontName="Helvetica", fontSize=7.5,
                       textColor=HexColor("#1e40af"), leading=11)
    )]]
    xai_table = Table(xai_data, colWidths=[page_width])
    xai_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#eff6ff")),
        ("BOX", (0, 0), (-1, -1), 0.5, HexColor("#93c5fd")),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(xai_table)
    elements.append(Spacer(1, 4 * mm))

    # ═══════════════════════════════════════════════════════════
    # DISCLAIMER
    # ═══════════════════════════════════════════════════════════
    disc_text = (
        "<b>CLINICAL DISCLAIMER</b><br/><br/>"
        "This report is generated by an AI research prototype for academic and educational "
        "purposes ONLY. It does NOT constitute a medical diagnosis and must NOT be used for "
        "clinical decisions. All findings MUST be reviewed and confirmed by a qualified "
        "radiologist or licensed physician. This system has not been validated in a "
        "prospective clinical environment."
    )
    disc_data = [[Paragraph(disc_text, s_disclaimer)]]
    disc_table = Table(disc_data, colWidths=[page_width])
    disc_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#fffbeb")),
        ("BOX", (0, 0), (-1, -1), 0.8, AMBER),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(disc_table)
    elements.append(Spacer(1, 5 * mm))

    # ═══════════════════════════════════════════════════════════
    # FOOTER
    # ═══════════════════════════════════════════════════════════
    elements.append(HRFlowable(width="100%", thickness=0.3, color=HexColor("#d1d5db")))
    elements.append(Spacer(1, 2 * mm))
    footer_data = [[
        Paragraph("TBVision AI  ·  Deep Learning for Medical Imaging", s_footer),
        Paragraph(
            '<font color="#d97706"><b>RESEARCH USE ONLY — NOT FOR CLINICAL DIAGNOSIS</b></font>',
            ParagraphStyle("FR", fontName="Helvetica-Bold", fontSize=6.5,
                           textColor=AMBER, alignment=2))
    ]]
    footer_table = Table(footer_data, colWidths=[page_width * 0.5, page_width * 0.5])
    elements.append(footer_table)

    # Build PDF
    doc.build(elements)
    buf.seek(0)
    return buf.read() or None
