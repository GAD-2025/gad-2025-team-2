from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from jose import jwt
from datetime import datetime, timedelta
import os
import uuid
import hashlib
import traceback

from app.db import get_session
from app.models import User, JobSeeker, Employer, SignupUser, Nationality, EmployerProfile, Store
from app.schemas import (
    SignInRequest, NewSignInRequest, SignUpRequest, AuthResponse, SignupPayload, SignupResponse, 
    SignupUserResponse, EmployerSignupPayload, EmployerSignupResponse
)

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


@router.post("/signin/new")
async def signin_new(request: NewSignInRequest, session: Session = Depends(get_session)):
    """New signin endpoint for identifier (email or phone) + password + role"""
    try:
        # 전화번호에서 하이픈(-) 제거
        identifier = request.identifier.replace('-', '')
        
        print(f"🔐 로그인 시도: role={request.role}, identifier={identifier}")
        
        # Find user by identifier (email or phone) - try both
        user = None
        
        # Try to find by phone first (for job seekers)
        statement = select(SignupUser).where(SignupUser.phone == identifier)
        user = session.exec(statement).first()
        
        # If not found, try to find by email (for employers)
        if not user:
            statement = select(SignupUser).where(SignupUser.email == identifier)
            user = session.exec(statement).first()
        
        if not user:
            print(f"❌ 사용자를 찾을 수 없음: {request.identifier}")
            raise HTTPException(status_code=401, detail="계정을 찾을 수 없습니다")
        
        print(f"✅ 사용자 발견: id={user.id}, name={user.name}, role={user.role}, has_password={user.password is not None}")
        
        # Check if selected role matches actual role
        if request.role != user.role:
            print(f"⚠️ 선택한 role({request.role})과 실제 role({user.role})이 다릅니다. 실제 role로 로그인합니다.")
        
        # Verify password
        if not user.password:
            print(f"❌ 비밀번호가 설정되지 않음")
            raise HTTPException(status_code=401, detail="비밀번호가 설정되지 않았습니다. 관리자에게 문의하세요.")
        
        input_hash = hash_password(request.password)
        print(f"🔑 입력 비밀번호 해시: {input_hash}")
        print(f"🔑 저장된 비밀번호 해시: {user.password}")
        
        if not verify_password(request.password, user.password):
            print(f"❌ 비밀번호 불일치")
            raise HTTPException(status_code=401, detail="비밀번호가 일치하지 않습니다")
        
        print(f"✅ 로그인 성공: {user.id} (role: {user.role})")
        
        # Create token
        token = create_access_token({"sub": user.id, "role": user.role})
        
        return {
            "user_id": user.id,
            "token": token,
            "role": user.role,
            "name": user.name,
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Signin failed: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=f"로그인 중 오류가 발생했습니다: {str(e)}")


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
    try:
        # Validate required terms
        if not request.terms.tos_required or not request.terms.privacy_required:
            raise HTTPException(
                status_code=400,
                detail="필수 약관에 동의해주세요."
            )
        
        # Validate nationality exists (only for job_seeker)
        if request.role == "job_seeker":
            if not request.nationality_code:
                raise HTTPException(
                    status_code=400,
                    detail="구직자는 국적 코드가 필요합니다."
                )
            nationality = session.get(Nationality, request.nationality_code)
            if not nationality:
                # 사용 가능한 국적 코드 목록 가져오기
                all_nationalities = session.exec(select(Nationality)).all()
                available_codes = [n.code for n in all_nationalities]
                raise HTTPException(
                    status_code=400,
                    detail=f"유효하지 않은 국적 코드입니다: {request.nationality_code}. 사용 가능한 코드: {', '.join(available_codes[:10])}"
                )
        else:
            # 고용주는 국적 코드가 없을 수 있음
            request.nationality_code = request.nationality_code or "KR"  # 기본값 설정
        
        # Create SignupUser
        user_id = f"signup-{uuid.uuid4().hex[:8]}"
        
        # 고용주는 birthdate, gender가 없을 수 있으므로 기본값 처리
        birthdate = None
        if request.birthdate:
            try:
                birthdate = datetime.strptime(request.birthdate, "%Y-%m-%d").date()
            except ValueError:
                # 고용주는 생년월일이 없을 수 있으므로 오늘 날짜로 설정
                birthdate = datetime.utcnow().date()
        else:
            birthdate = datetime.utcnow().date()
        
        gender = request.gender or "male"  # 고용주는 기본값
        nationality_code = request.nationality_code or "KR"  # 고용주는 기본값
        
        # 전화번호에서 하이픈(-) 제거
        phone = request.phone.replace('-', '') if request.phone else ""
        
        # Hash password
        hashed_password = hash_password(request.password)
        
        signup_user = SignupUser(
            id=user_id,
            role=request.role,
            name=request.name,
            phone=phone,  # 하이픈 제거된 전화번호
            email=request.email,  # 고용주 필수
            password=hashed_password,  # 해시된 비밀번호 저장
            birthdate=birthdate,
            gender=gender,
            nationality_code=nationality_code,
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
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Signup failed: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)  # 로그 출력
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/signup-user/{user_id}", response_model=SignupUserResponse)
async def get_signup_user(user_id: str, session: Session = Depends(get_session)):
    """Get SignupUser info by user_id"""
    statement = select(SignupUser).where(SignupUser.id == user_id)
    signup_user = session.exec(statement).first()
    
    if not signup_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get nationality name (optional for employers)
    nationality_name = None
    if signup_user.nationality_code:
        nationality = session.get(Nationality, signup_user.nationality_code)
        nationality_name = nationality.name if nationality else None
    
    return SignupUserResponse(
        id=signup_user.id,
        role=signup_user.role,
        name=signup_user.name,
        phone=signup_user.phone,
        birthdate=signup_user.birthdate.isoformat() if signup_user.birthdate else None,
        gender=signup_user.gender,
        nationality_code=signup_user.nationality_code,
        nationality_name=nationality_name,
        created_at=signup_user.created_at.isoformat(),
    )


@router.post("/signup/employer", response_model=EmployerSignupResponse, status_code=201)
async def signup_employer(request: EmployerSignupPayload, session: Session = Depends(get_session)):
    """Employer signup endpoint"""
    # Create SignupUser for employer
    user_id = f"employer-{uuid.uuid4().hex[:8]}"
    
    # Hash password
    hashed_password = hash_password(request.password)
    
    signup_user = SignupUser(
        id=user_id,
        role="employer",
        name=request.name,
        email=request.email,
        password=hashed_password,  # 해시된 비밀번호 저장
        terms_tos_required=True,  # Assumed agreed via modal
        terms_privacy_required=True,
    )
    
    session.add(signup_user)
    session.commit()
    session.refresh(signup_user)
    
    # Create EmployerProfile
    profile_id = f"profile-{uuid.uuid4().hex[:8]}"
    employer_profile = EmployerProfile(
        id=profile_id,
        user_id=user_id,
        business_type=request.business_type,
        company_name=request.company_name,
        address=request.address,
        address_detail=request.address_detail,
    )
    
    session.add(employer_profile)
    session.commit()
    session.refresh(employer_profile)
    
    # Create main store (기본매장) from signup data
    # 회사 정보가 있는 경우에만 매장 생성
    print(f"Creating store for user {user_id}, company_name: {request.company_name}, address: {request.address}")
    if request.company_name and request.company_name.strip() and request.address and request.address.strip():
        store_id = f"store-{uuid.uuid4().hex[:8]}"
        # address_detail이 빈 문자열이면 None으로 변환
        address_detail = request.address_detail if request.address_detail and request.address_detail.strip() else None
        main_store = Store(
            id=store_id,
            user_id=user_id,
            is_main=True,  # 기본매장
            store_name=request.company_name.strip(),
            address=request.address.strip(),
            address_detail=address_detail,
            phone="",  # 회원가입 시 전화번호는 없을 수 있음
            industry="기타",  # 기본값, 나중에 수정 가능
            business_license=None,
            management_role="본사 관리자",  # 기본값
            store_type="직영점",  # 기본값
        )
        session.add(main_store)
        session.commit()
        session.refresh(main_store)
        print(f"Store created successfully: {store_id}, is_main: {main_store.is_main}")
    else:
        print(f"Store not created: company_name={request.company_name}, address={request.address}")
    
    return EmployerSignupResponse(
        id=signup_user.id,
        name=signup_user.name,
        company_name=employer_profile.company_name,
        message="고용주 회원가입이 완료되었습니다."
    )

