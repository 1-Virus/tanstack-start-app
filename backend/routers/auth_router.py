"""
routers/auth_router.py — TBVision AI Backend
Authentication endpoints: register, login, profile management.
"""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

import auth
from config import settings
from deps import create_access_token, get_current_user
from schemas import PasswordChange, Token, UserCreate, UserProfileUpdate, UserResponse

router = APIRouter()


@router.post("/register", response_model=dict, summary="Register a new user")
def register(user: UserCreate):
    ok, msg = auth.register_user(
        username=user.username,
        email=user.email,
        password=user.password,
        full_name=user.full_name,
        hospital=user.hospital,
    )
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}


@router.post("/login", response_model=Token, summary="Login and receive a JWT")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(
        data={"sub": str(user["id"])},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse, summary="Get current user")
def read_me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.put("/me/update", response_model=dict, summary="Update profile")
def update_me(
    profile: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    ok = auth.update_user_profile(current_user["id"], profile.full_name, profile.hospital)
    if not ok:
        raise HTTPException(status_code=400, detail="Profile update failed.")
    return {"message": "Profile updated successfully."}


@router.post("/me/password", response_model=dict, summary="Change password")
def change_password(
    body: PasswordChange,
    current_user: dict = Depends(get_current_user),
):
    ok, msg = auth.change_password(current_user["id"], body.old_password, body.new_password)
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}


@router.get("/admin/stats", response_model=list, summary="Get all users with scan stats (admin only)")
def admin_stats(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return auth.get_all_users_stats()
