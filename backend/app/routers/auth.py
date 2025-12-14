from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import uuid
import hashlib
import traceback

from app.db import get_session
from app.models import User, JobSeeker, Employer, SignupUser, Nationality, EmployerProfile, Store
from app.schemas import (
    SignInRequest, NewSignInRequest, SignUpRequest, AuthResponse, SignupPayload, SignupResponse, 
    SignupUserResponse, EmployerSignupPayload, EmployerSignupResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("JWT_SECRET", "devsecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/signin/new")

async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = session.get(SignupUser, user_id)
    if user is None:
        raise credentials_exception
    return user

# Simple password hashing for development
def hash_password(password: str) -> str:
    """Simple SHA256 hash for development"""
    # 공백 제거 및 인코딩 일관성 보장
    password = password.strip() if password else ""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    if not plain_password or not hashed_password:
        return False
    # 공백 제거 및 인코딩 일관성 보장
    plain_password = plain_password.strip() if plain_password else ""
    hashed_password = hashed_password.strip() if hashed_password else ""
    computed_hash = hash_password(plain_password)
    return computed_hash == hashed_password


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


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
async def signin_new(request: NewSignInRequest, session: Session = Depends(get_session), origin: str = None):
    """New signin endpoint for identifier (email or phone) + password + role"""
    from fastapi import Request
    from fastapi.responses import JSONResponse
    
    try:
        # 전화번호에서 하이픈(-) 제거
        identifier = request.identifier.replace('-', '')
        
        print(f"[LOGIN] 로그인 시도: role={request.role}, identifier={identifier}")
        
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
            print(f"[ERROR] 사용자를 찾을 수 없음: {request.identifier}")
            raise HTTPException(status_code=401, detail="계정을 찾을 수 없습니다")
        
        print(f"[SUCCESS] 사용자 발견: id={user.id}, name={user.name}, role={user.role}, has_password={user.password is not None}")
        
        # Check if selected role matches actual role
        if request.role != user.role:
            print(f"[WARNING] 선택한 role({request.role})과 실제 role({user.role})이 다릅니다. 실제 role로 로그인합니다.")
        
        # Verify password
        if not user.password:
            print(f"[ERROR] 비밀번호가 설정되지 않음")
            raise HTTPException(status_code=401, detail="비밀번호가 설정되지 않았습니다. 관리자에게 문의하세요.")
        
        # 상세 디버깅 정보
        input_hash = hash_password(request.password)
        stored_hash = user.password.strip() if user.password else ""
        print(f"[DEBUG] 입력 비밀번호 원문 길이: {len(request.password)}")
        print(f"[DEBUG] 입력 비밀번호 해시: {input_hash}")
        print(f"[DEBUG] 입력 비밀번호 해시 길이: {len(input_hash)}")
        print(f"[DEBUG] 저장된 비밀번호 해시: {stored_hash}")
        print(f"[DEBUG] 저장된 비밀번호 해시 길이: {len(stored_hash)}")
        print(f"[DEBUG] 해시 일치 여부: {input_hash == stored_hash}")
        
        if not verify_password(request.password, user.password):
            print(f"[ERROR] 비밀번호 불일치")
            print(f"[ERROR] 입력 해시: {input_hash}")
            print(f"[ERROR] 저장 해시: {stored_hash}")
            raise HTTPException(status_code=401, detail="비밀번호가 일치하지 않습니다")
        
        print(f"[SUCCESS] 로그인 성공: {user.id} (role: {user.role})")
        
        # Create token
        token = create_access_token({"sub": user.id, "role": user.role})
        
        return {
            "user_id": user.id,
            "token": token,
            "role": user.role,
            "name": user.name,
        }
    except HTTPException:
        # HTTPException은 global exception handler에서 CORS 헤더 추가
        raise
    except Exception as e:
        import traceback
        error_detail = f"Signin failed: {str(e)}\n{traceback.format_exc()}"
        # Windows cp949 인코딩 문제 방지를 위해 에러 메시지만 출력
        try:
            print(f"[ERROR] 로그인 실패: {str(e)}")
        except:
            print("[ERROR] 로그인 실패 (인코딩 오류)")
        # 일반 Exception도 HTTPException으로 변환하여 global handler에서 처리
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
            # Use frontend-consistent label
            languageLevel="Lv.1 기초",
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
            # Use frontend-consistent label for minimum language requirement
            minLanguageLevel="Lv.1 기초",
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
        
        # 국적 코드 검증을 느슨하게: DB에 없어도 통과시키고 기본값 보정만 수행
        if request.role == "job_seeker":
            request.nationality_code = request.nationality_code or "UNK"
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
        
        # Hash password (공백 제거 및 일관성 보장)
        hashed_password = hash_password(request.password)
        print(f"[SIGNUP] 비밀번호 해시 생성: 원문 길이={len(request.password)}, 해시={hashed_password[:20]}...")
        
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
        # 가입 완료 시 기본으로 안심(신뢰) 배지 부여
        is_verified=True,
    )
    
    session.add(employer_profile)
    session.commit()
    session.refresh(employer_profile)
    
    # Create main store (기본매장) from signup data
    # 회사 정보가 있는 경우에만 매장 생성
    print(f"Creating store for user {user_id}, company_name: {request.company_name}, address: {request.address}")
    # determine final industry: if industry == '기타' use industry_custom when provided
    final_industry = None
    try:
        if hasattr(request, 'industry') and request.industry:
            if request.industry == '기타' and getattr(request, 'industry_custom', None):
                final_industry = request.industry_custom
            else:
                final_industry = request.industry
    except Exception:
        final_industry = None

    stores_response = []
    main_store = None
    if request.company_name and request.company_name.strip() and request.address and request.address.strip():
        # Prevent duplicate stores: if a store already exists for this user, skip creation
        try:
            existing_stmt = select(Store).where(Store.user_id == user_id)
            existing_store = session.exec(existing_stmt).first()
            if existing_store:
                print(f"Existing store found for user {user_id}, skipping creation: {existing_store.id}")
                main_store = existing_store
            else:
                # proceed to create store
                store_id = f"store-{uuid.uuid4().hex[:8]}"
                # address_detail이 빈 문자열이면 None으로 변환
                address_detail = request.address_detail if request.address_detail and request.address_detail.strip() else None
                # determine phone
                phone = ""
                if getattr(request, 'phone', None) and request.phone.strip():
                    phone = request.phone.replace('-', '').strip()

                main_store = Store(
                    id=store_id,
                    user_id=user_id,
                    is_main=True,  # 기본매장
                    store_name=request.company_name.strip(),
                    address=request.address.strip(),
                    address_detail=address_detail,
                    phone=phone,
                    industry=final_industry or "기타",  # use submitted industry if provided
                    business_license=None,
                    management_role="본사 관리자",  # 기본값
                    store_type="직영점",  # 기본값
                )
                session.add(main_store)
                session.commit()
                session.refresh(main_store)
                print(f"Store created successfully: {store_id}, is_main: {main_store.is_main}")
        except Exception as e:
            print(f"Error checking/creating store for user {user_id}: {e}")

        if main_store:
            stores_response.append({
                "id": main_store.id,
                "user_id": main_store.user_id,
                "is_main": main_store.is_main,
                "store_name": main_store.store_name,
                "address": main_store.address,
                "address_detail": main_store.address_detail,
                "phone": main_store.phone,
                "industry": main_store.industry,
                "business_license": main_store.business_license,
                "management_role": main_store.management_role,
                "store_type": main_store.store_type,
                "created_at": main_store.created_at.isoformat() if hasattr(main_store, 'created_at') else None,
                "updated_at": main_store.updated_at.isoformat() if hasattr(main_store, 'updated_at') else None,
            })
    else:
        print(f"Store not created: company_name={request.company_name}, address={request.address}")

    employer_profile_resp = None
    try:
        if employer_profile:
            employer_profile_resp = {
                "id": employer_profile.id,
                "user_id": employer_profile.user_id,
                "business_type": employer_profile.business_type,
                "company_name": employer_profile.company_name,
                "address": employer_profile.address,
                "address_detail": employer_profile.address_detail,
                "business_license": employer_profile.business_license,
                "is_verified": employer_profile.is_verified,
                "created_at": employer_profile.created_at.isoformat() if hasattr(employer_profile, 'created_at') else None,
                "updated_at": employer_profile.updated_at.isoformat() if hasattr(employer_profile, 'updated_at') else None,
            }
    except Exception:
        employer_profile_resp = None

    return EmployerSignupResponse(
        id=signup_user.id,
        name=signup_user.name,
        company_name=employer_profile.company_name if employer_profile else None,
        employer_profile=employer_profile_resp,
        stores=stores_response,
        message="고용주 회원가입이 완료되었습니다."
    )

