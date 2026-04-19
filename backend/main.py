"""
main.py — TBVision AI Backend
FastAPI application entry point.

Run locally:
    cd backend
    python -m uvicorn main:app --reload --port 8000

API docs: http://127.0.0.1:8000/docs
"""
import auth
from config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_router, scan_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered tuberculosis screening — REST API",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────
# Allow the Vite dev server (port 8080) and any production origin.
# Tighten `allow_origins` in production to your actual frontend URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(auth_router.router, prefix="/api/auth",  tags=["Auth"])
app.include_router(scan_router.router, prefix="/api/scans", tags=["Scans"])


# ── Startup ───────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    auth.init_db()
    auth.seed_admin()

    # Pre-warm the model so first request is not slow
    from services.inference_service import get_model
    try:
        get_model()
        print("[startup] TB model loaded successfully.")
    except Exception as e:
        print(f"[startup] Warning — model not loaded: {e}")


# ── Health check ──────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok", "service": settings.PROJECT_NAME}


# ── Dev entry point ───────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
