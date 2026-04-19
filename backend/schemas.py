"""
schemas.py — TBVision AI Backend
Pydantic request/response models for all API endpoints.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional


# ── Auth ──────────────────────────────────────────────────────
class UserCreate(BaseModel):
    username:  str
    email:     EmailStr
    password:  str
    full_name: Optional[str] = ""
    hospital:  Optional[str] = ""


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type:   str


class UserProfileUpdate(BaseModel):
    full_name: str
    hospital:  str


class PasswordChange(BaseModel):
    old_password: str
    new_password: str


class UserResponse(BaseModel):
    id:        int
    username:  str
    email:     str
    full_name: str
    hospital:  str
    role:      str


# ── Scans ─────────────────────────────────────────────────────
class ScanResponse(BaseModel):
    id:             int
    user_id:        int
    scan_id:        str
    timestamp:      str
    filename:       str
    result:         str
    confidence:     str
    raw_score:      str
    quality:        str
    patient_name:   str
    patient_age:    str
    patient_gender: str
    patient_id:     str
    doctor_name:    str
    hospital_name:  str
