"""
auth.py — TBVision AI Backend
Data Access Layer: user management and scan records via Supabase.
"""
import hashlib
import secrets
import datetime

from config import settings


# ─────────────────────────────────────────────────────────────
# SUPABASE CLIENT
# ─────────────────────────────────────────────────────────────
def _client():
    """Return a fresh Supabase client built from env settings."""
    from supabase import create_client

    url = settings.SUPABASE_URL
    key = settings.SUPABASE_KEY
    if not url or not key:
        raise RuntimeError(
            "Supabase credentials not found. "
            "Add SUPABASE_URL and SUPABASE_KEY to your .env file."
        )
    return create_client(url, key)


# ─────────────────────────────────────────────────────────────
# DATABASE INIT  (no-op — tables managed via Supabase dashboard)
# ─────────────────────────────────────────────────────────────
def init_db() -> None:
    pass


# ─────────────────────────────────────────────────────────────
# PASSWORD HELPERS
# ─────────────────────────────────────────────────────────────
def _hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        200_000,
    ).hex()


def _new_salt() -> str:
    return secrets.token_hex(32)


# ─────────────────────────────────────────────────────────────
# USER MANAGEMENT
# ─────────────────────────────────────────────────────────────
def register_user(
    username: str,
    email: str,
    password: str,
    full_name: str = "",
    hospital: str = "",
    role: str = "doctor",
) -> tuple[bool, str]:
    if len(password) < 6:
        return False, "Password must be at least 6 characters."
    if len(username) < 3:
        return False, "Username must be at least 3 characters."

    salt    = _new_salt()
    pw_hash = _hash_password(password, salt)
    now     = datetime.datetime.now().isoformat()

    try:
        _client().table("users").insert({
            "username":      username.strip().lower(),
            "email":         email.strip().lower(),
            "password_hash": pw_hash,
            "salt":          salt,
            "full_name":     full_name.strip(),
            "role":          role,
            "hospital":      hospital.strip(),
            "created_at":    now,
        }).execute()
        return True, "Account created successfully."
    except Exception as e:
        err = str(e).lower()
        if "username" in err or "users_username_key" in err:
            return False, "Username already taken."
        if "email" in err or "users_email_key" in err:
            return False, "Email already registered."
        return False, f"Registration failed: {e}"


def authenticate_user(username: str, password: str) -> dict | None:
    """Returns the user row dict on success, None on failure."""
    res = (
        _client()
        .table("users")
        .select("*")
        .eq("username", username.strip().lower())
        .limit(1)
        .execute()
    )
    if not res.data:
        return None

    row     = res.data[0]
    pw_hash = _hash_password(password, row["salt"])
    if not secrets.compare_digest(pw_hash, row["password_hash"]):
        return None

    # Stamp last login (best-effort)
    try:
        _client().table("users").update(
            {"last_login": datetime.datetime.now().isoformat()}
        ).eq("id", row["id"]).execute()
    except Exception:
        pass

    return row


def get_user_by_id(user_id: int) -> dict | None:
    res = (
        _client()
        .table("users")
        .select("*")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def update_user_profile(user_id: int, full_name: str, hospital: str) -> bool:
    try:
        _client().table("users").update(
            {"full_name": full_name, "hospital": hospital}
        ).eq("id", user_id).execute()
        return True
    except Exception:
        return False


def change_password(
    user_id: int, old_password: str, new_password: str
) -> tuple[bool, str]:
    user = get_user_by_id(user_id)
    if not user:
        return False, "User not found."
    if len(new_password) < 6:
        return False, "New password must be at least 6 characters."

    if not secrets.compare_digest(
        _hash_password(old_password, user["salt"]),
        user["password_hash"],
    ):
        return False, "Current password is incorrect."

    new_salt = _new_salt()
    new_hash = _hash_password(new_password, new_salt)
    try:
        _client().table("users").update(
            {"password_hash": new_hash, "salt": new_salt}
        ).eq("id", user_id).execute()
        return True, "Password changed successfully."
    except Exception as e:
        return False, f"Failed to change password: {e}"


# ─────────────────────────────────────────────────────────────
# SCAN RECORDS
# ─────────────────────────────────────────────────────────────
def save_scan(user_id: int, record: dict) -> bool:
    try:
        _client().table("scan_records").insert({
            "user_id":        user_id,
            "scan_id":        record.get("id", ""),
            "timestamp":      record.get("time", ""),
            "filename":       record.get("file", ""),
            "result":         record.get("result", ""),
            "confidence":     record.get("confidence", ""),
            "raw_score":      record.get("raw", ""),
            "quality":        record.get("quality", ""),
            "patient_name":   record.get("patient_name", ""),
            "patient_age":    record.get("patient_age", ""),
            "patient_gender": record.get("patient_gender", ""),
            "patient_id":     record.get("patient_id", ""),
            "doctor_name":    record.get("doctor_name", ""),
            "hospital_name":  record.get("hospital_name", ""),
        }).execute()
        return True
    except Exception:
        return False


def get_user_scans(user_id: int) -> list[dict]:
    res = (
        _client()
        .table("scan_records")
        .select("*")
        .eq("user_id", user_id)
        .order("id", desc=True)
        .execute()
    )
    return res.data or []


def delete_user_scans(user_id: int) -> bool:
    try:
        _client().table("scan_records").delete().eq("user_id", user_id).execute()
        return True
    except Exception:
        return False


def get_all_users_stats() -> list[dict]:
    """Admin only — per-user scan summary (aggregated in Python)."""
    users_res = _client().table("users").select("*").order("created_at", desc=True).execute()
    scans_res = _client().table("scan_records").select("user_id, result").execute()

    scans_by_user: dict = {}
    for s in (scans_res.data or []):
        scans_by_user.setdefault(s["user_id"], []).append(s["result"])

    stats = []
    for u in (users_res.data or []):
        uid   = u["id"]
        scans = scans_by_user.get(uid, [])
        stats.append({
            **u,
            "total_scans": len(scans),
            "tb_positive": sum(1 for r in scans if r == "TUBERCULOSIS DETECTED"),
        })
    return stats


# ─────────────────────────────────────────────────────────────
# SEED ADMIN  (first-run only)
# ─────────────────────────────────────────────────────────────
def seed_admin() -> None:
    """Create a default admin account if no users exist."""
    try:
        res = _client().table("users").select("id").limit(1).execute()
        if not res.data:
            register_user(
                username="admin",
                email="admin@tbvision.ai",
                password="admin123",
                full_name="System Administrator",
                hospital="TBVision AI",
                role="admin",
            )
    except Exception:
        pass
