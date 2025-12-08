from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import uuid
from datetime import datetime

from app.db import get_session
from app.models import EmployerProfile, SignupUser, Store
from app.schemas import EmployerProfileResponse, EmployerProfileCreate, StoreCreate, StoreResponse

router = APIRouter(prefix="/employer", tags=["employer"])


@router.get("/profile/{user_id}", response_model=EmployerProfileResponse)
async def get_employer_profile(user_id: str, session: Session = Depends(get_session)):
    """Get employer profile by user_id"""
    statement = select(EmployerProfile).where(EmployerProfile.user_id == user_id)
    profile = session.exec(statement).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="고용주 프로필을 찾을 수 없습니다.")
    
    return EmployerProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        business_type=profile.business_type,
        company_name=profile.company_name,
        address=profile.address,
        address_detail=profile.address_detail,
        created_at=profile.created_at.isoformat(),
        updated_at=profile.updated_at.isoformat(),
    )


@router.post("/profile", response_model=EmployerProfileResponse, status_code=201)
async def create_or_update_employer_profile(
    payload: EmployerProfileCreate, session: Session = Depends(get_session)
):
    """Create or update employer profile for a signup user"""
    user = session.exec(select(SignupUser).where(SignupUser.id == payload.user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="해당 사용자(고용주)를 찾을 수 없습니다.")
    if user.role != "employer":
        raise HTTPException(status_code=400, detail="고용주가 아닌 사용자입니다.")

    existing = session.exec(select(EmployerProfile).where(EmployerProfile.user_id == payload.user_id)).first()

    if existing:
        existing.business_type = payload.business_type
        existing.company_name = payload.company_name
        existing.address = payload.address
        existing.address_detail = payload.address_detail
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        session.commit()
        session.refresh(existing)
        profile = existing
    else:
        profile = EmployerProfile(
            id=f"profile-{uuid.uuid4().hex[:8]}",
            user_id=payload.user_id,
            business_type=payload.business_type,
            company_name=payload.company_name,
            address=payload.address,
            address_detail=payload.address_detail,
        )
        session.add(profile)
        session.commit()
        session.refresh(profile)

    return EmployerProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        business_type=profile.business_type,
        company_name=profile.company_name,
        address=profile.address,
        address_detail=profile.address_detail,
        created_at=profile.created_at.isoformat(),
        updated_at=profile.updated_at.isoformat(),
    )


@router.get("/stores/{user_id}", response_model=List[StoreResponse])
async def get_stores(user_id: str, session: Session = Depends(get_session)):
    """Get all stores for an employer"""
    print(f"Fetching stores for user_id: {user_id}")
    statement = select(Store).where(Store.user_id == user_id).order_by(Store.is_main.desc(), Store.created_at)
    stores = session.exec(statement).all()
    print(f"Found {len(stores)} stores for user {user_id}")
    
    if not stores:
        # 매장이 없으면 빈 배열 반환 (404가 아닌 200 OK)
        return []
    
    return [
        StoreResponse(
            id=store.id,
            user_id=store.user_id,
            is_main=store.is_main,
            store_name=store.store_name,
            address=store.address,
            address_detail=store.address_detail,
            phone=store.phone,
            industry=store.industry,
            business_license=store.business_license,
            management_role=store.management_role,
            store_type=store.store_type,
            created_at=store.created_at.isoformat(),
            updated_at=store.updated_at.isoformat(),
        )
        for store in stores
    ]


@router.get("/stores/{user_id}/{store_id}", response_model=StoreResponse)
async def get_store(user_id: str, store_id: str, session: Session = Depends(get_session)):
    """Get a specific store"""
    statement = select(Store).where(Store.id == store_id, Store.user_id == user_id)
    store = session.exec(statement).first()
    
    if not store:
        raise HTTPException(status_code=404, detail="매장을 찾을 수 없습니다.")
    
    return StoreResponse(
        id=store.id,
        user_id=store.user_id,
        is_main=store.is_main,
        store_name=store.store_name,
        address=store.address,
        address_detail=store.address_detail,
        phone=store.phone,
        industry=store.industry,
        business_license=store.business_license,
        management_role=store.management_role,
        store_type=store.store_type,
        created_at=store.created_at.isoformat(),
        updated_at=store.updated_at.isoformat(),
    )


@router.post("/stores", response_model=StoreResponse, status_code=201)
async def create_store(payload: StoreCreate, session: Session = Depends(get_session)):
    """Create a new store"""
    print(f"Creating store for user_id: {payload.user_id}")
    print(f"Store data: name={payload.store_name}, address={payload.address}, phone={payload.phone}, industry={payload.industry}")
    
    try:
        user = session.exec(select(SignupUser).where(SignupUser.id == payload.user_id)).first()
        if not user:
            print(f"User not found: {payload.user_id}")
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        if user.role != "employer":
            print(f"User is not an employer: {user.role}")
            raise HTTPException(status_code=400, detail="고용주가 아닌 사용자입니다.")
        
        # If this is set as main store, unset other main stores
        if payload.is_main:
            statement = select(Store).where(Store.user_id == payload.user_id, Store.is_main == True)
            existing_main = session.exec(statement).all()
            for main_store in existing_main:
                main_store.is_main = False
                session.add(main_store)
        
        store = Store(
            id=f"store-{uuid.uuid4().hex[:8]}",
            user_id=payload.user_id,
            is_main=payload.is_main,
            store_name=payload.store_name,
            address=payload.address,
            address_detail=payload.address_detail,
            phone=payload.phone,
            industry=payload.industry,
            business_license=payload.business_license,
            management_role=payload.management_role,
            store_type=payload.store_type,
        )
        
        session.add(store)
        session.commit()
        session.refresh(store)
        
        print(f"Store created successfully: {store.id}, is_main: {store.is_main}")
        
        return StoreResponse(
            id=store.id,
            user_id=store.user_id,
            is_main=store.is_main,
            store_name=store.store_name,
            address=store.address,
            address_detail=store.address_detail,
            phone=store.phone,
            industry=store.industry,
            business_license=store.business_license,
            management_role=store.management_role,
            store_type=store.store_type,
            created_at=store.created_at.isoformat(),
            updated_at=store.updated_at.isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Store creation failed: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=f"매장 등록 중 오류가 발생했습니다: {str(e)}")
