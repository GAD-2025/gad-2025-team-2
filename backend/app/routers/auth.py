from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from jose import jwt
from datetime import datetime, timedelta
import os
import uuid
import hashlib

from app.db import get_session
from app.models import User, JobSeeker, Employer, SignupUser, Nationality
from app.schemas import SignInRequest, SignUpRequest, AuthResponse, SignupPayload, SignupResponse, SignupUserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("JWT_SECRET", "devsecret")

# Simple password hashing for development
def hash_password(password: str) -> str:
    """Simple SHA256 hash for development"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return hash_password(plain_password) == hashed_password


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")


@router.post("/signin", response_model=AuthResponse)
async def signin(request: SignInRequest, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == request.email)
    user = session.exec(statement).first()
    
    if not user or not verify_password(request.password, user.hashedPassword):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Get profile
    if user.role == "jobseeker":
        profile_stmt = select(JobSeeker).where(JobSeeker.id == user.profileId)
        profile = session.exec(profile_stmt).first()
    else:
        profile_stmt = select(Employer).where(Employer.id == user.profileId)
        profile = session.exec(profile_stmt).first()
    
    token = create_access_token({"sub": user.id, "role": user.role})
    
    return AuthResponse(
        user={
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "profile": profile.dict() if profile else {}
        },
        token=token
    )


@router.post("/signup/legacy", response_model=AuthResponse)
async def signup_legacy(request: SignUpRequest, session: Session = Depends(get_session)):
    # Check if user exists
    statement = select(User).where(User.email == request.email)
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create profile
    profile_id = f"{request.role}-{uuid.uuid4().hex[:8]}"
    
    if request.role == "jobseeker":
        profile = JobSeeker(
            id=profile_id,
            name="New User",
            nationality="KR",
            phone="",
            languageLevel="TOPIK 1급",
            visaType="D-2",
            availability="주말",
        )
        session.add(profile)
    else:
        profile = Employer(
            id=profile_id,
            businessNo="",
            shopName="New Shop",
            industry="기타",
            address="",
            openHours="",
            contact="",
            minLanguageLevel="TOPIK 1급",
            baseWage=10000,
            schedule="",
        )
        session.add(profile)
    
    # Create user
    user = User(
        id=f"user-{uuid.uuid4().hex[:8]}",
        email=request.email,
        hashedPassword=hash_password(request.password),
        role=request.role,
        profileId=profile_id,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    session.refresh(profile)
    
    token = create_access_token({"sub": user.id, "role": user.role})
    
    return AuthResponse(
        user={
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "profile": profile.dict()
        },
        token=token
    )


@router.post("/signup", response_model=SignupResponse, status_code=201)
async def signup_new(request: SignupPayload, session: Session = Depends(get_session)):
    """New signup endpoint for wizard flow"""
    # Validate required terms
    if not request.terms.tos_required or not request.terms.privacy_required:
        raise HTTPException(
            status_code=400,
            detail="필수 약관에 동의해주세요."
        )
    
    # Validate nationality exists
    nationality = session.get(Nationality, request.nationality_code)
    if not nationality:
        raise HTTPException(
            status_code=400,
            detail="유효하지 않은 국적 코드입니다."
        )
    
    # Create SignupUser
    user_id = f"signup-{uuid.uuid4().hex[:8]}"
    signup_user = SignupUser(
        id=user_id,
        role=request.role,
        name=request.name,
        phone=request.phone,
        birthdate=datetime.strptime(request.birthdate, "%Y-%m-%d").date(),
        gender=request.gender,
        nationality_code=request.nationality_code,
        terms_tos_required=request.terms.tos_required,
        terms_privacy_required=request.terms.privacy_required,
        terms_sms_optional=request.terms.sms_optional,
        terms_marketing_optional=request.terms.marketing_optional,
    )
    
    session.add(signup_user)
    session.commit()
    session.refresh(signup_user)
    
    return SignupResponse(
        id=signup_user.id,
        role=signup_user.role,
        name=signup_user.name,
        message="회원가입이 완료되었습니다."
    )


@router.get("/signup-user/{user_id}", response_model=SignupUserResponse)
async def get_signup_user(user_id: str, session: Session = Depends(get_session)):
    """Get SignupUser info by user_id"""
    statement = select(SignupUser).where(SignupUser.id == user_id)
    signup_user = session.exec(statement).first()
    
    if not signup_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get nationality name
    nationality = session.get(Nationality, signup_user.nationality_code)
    nationality_name = nationality.name if nationality else None
    
    return SignupUserResponse(
        id=signup_user.id,
        role=signup_user.role,
        name=signup_user.name,
        phone=signup_user.phone,
        birthdate=signup_user.birthdate.isoformat(),
        gender=signup_user.gender,
        nationality_code=signup_user.nationality_code,
        nationality_name=nationality_name,
        created_at=signup_user.created_at.isoformat(),
    )

