from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from sqlalchemy import or_
from typing import Optional, List
import uuid
from datetime import datetime
import json

from app.db import get_session
from app.models import (
    Application,
    Job,
    JobSeeker,
    Employer,
    SignupUser,
    JobSeekerProfile,
    EmployerProfile,
)
from app.models import Store  # 매장 정보로 공고 소유주 조회
from app.schemas import ApplicationCreate, ApplicationUpdate

router = APIRouter(prefix="/applications", tags=["applications"])


def ensure_jobseeker_exists(session: Session, seeker_id: str):
    """Ensure a JobSeeker row exists for the signup user so FK constraint passes."""
    print(f"[DEBUG] ensure_jobseeker_exists - 시작: seeker_id={seeker_id}")
    
    js = session.get(JobSeeker, seeker_id)
    if js:
        print(f"[DEBUG] ensure_jobseeker_exists - 이미 존재함: {seeker_id}")
        return js

    print(f"[DEBUG] ensure_jobseeker_exists - jobseeker 레코드 없음, 생성 시작")
    
    signup_user = session.get(SignupUser, seeker_id)
    print(f"[DEBUG] ensure_jobseeker_exists - signup_user: {signup_user.id if signup_user else 'NOT FOUND'}")
    
    profile = session.exec(
        select(JobSeekerProfile).where(JobSeekerProfile.user_id == seeker_id)
    ).first()
    print(f"[DEBUG] ensure_jobseeker_exists - jobseeker_profile: {profile.id if profile else 'NOT FOUND'}")

    # Fallback defaults if profile data 부족
    name = signup_user.name if signup_user else "Unknown"
    nationality = signup_user.nationality_code if signup_user else "Unknown"
    phone = signup_user.phone if signup_user else ""
    language_level = "Lv.2 초급"
    visa_type = profile.visa_type if profile and profile.visa_type else "F-4"
    availability = "full-time"
    preferences = json.dumps({})
    experience = json.dumps([])
    
    # 온보딩 정보가 있으면 사용 (JobSeekerProfile에는 name, nationality, phone이 없으므로 signup_user에서 가져옴)
    # JobSeekerProfile에는 visa_type, experience 관련 필드만 있음
    if profile and profile.visa_type:
        visa_type = profile.visa_type

    print(f"[DEBUG] ensure_jobseeker_exists - 생성할 데이터:")
    print(f"  name: {name}")
    print(f"  nationality: {nationality}")
    print(f"  phone: {phone}")
    print(f"  language_level: {language_level}")
    print(f"  visa_type: {visa_type}")

    js = JobSeeker(
        id=seeker_id,
        name=name,
        nationality=nationality,
        phone=phone,
        languageLevel=language_level,
        visaType=visa_type,
        availability=availability,
        preferences=preferences,
        experience=experience,
    )
    session.add(js)
    session.commit()
    session.refresh(js)
    print(f"[DEBUG] ensure_jobseeker_exists - jobseeker 생성 완료: {seeker_id}")
    return js


@router.post("", response_model=dict, status_code=201)
async def create_application(
    request: ApplicationCreate,
    session: Session = Depends(get_session),
):
    """Create new application"""
    try:
        print(f"[DEBUG] create_application - 시작:")
        print(f"  seekerId: {request.seekerId}")
        print(f"  jobId: {request.jobId}")
        
        # Ensure jobseeker exists for FK
        try:
            ensure_jobseeker_exists(session, request.seekerId)
            print(f"[DEBUG] create_application - jobseeker 확인/생성 완료")
        except Exception as e:
            print(f"[ERROR] create_application - jobseeker 생성 실패: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"구직자 정보 생성 실패: {str(e)}")

        # Check for duplicate
        statement = select(Application).where(
            Application.seekerId == request.seekerId,
            Application.jobId == request.jobId
        )
        existing = session.exec(statement).first()
        
        if existing:
            print(f"[WARNING] create_application - 이미 지원한 공고: {request.jobId}")
            raise HTTPException(status_code=409, detail="Already applied to this job")
        
        # Check if job exists
        job = session.get(Job, request.jobId)
        if not job:
            print(f"[ERROR] create_application - 공고를 찾을 수 없음: {request.jobId}")
            raise HTTPException(status_code=404, detail="Job not found")
        
        print(f"[DEBUG] create_application - 공고 확인 완료:")
        print(f"  job.employerId: {job.employerId}")
        print(f"  job.title: {job.title}")
        
        application = Application(
            applicationId=f"app-{uuid.uuid4().hex[:12]}",
            seekerId=request.seekerId,
            jobId=request.jobId,
            status="applied",
        )
        
        session.add(application)
        session.commit()
        session.refresh(application)
        
        print(f"[DEBUG] create_application - 지원서 생성 완료:")
        print(f"  applicationId: {application.applicationId}")
        print(f"  seekerId: {application.seekerId}")
        print(f"  jobId: {application.jobId}")
        print(f"  status: {application.status}")
        print(f"  appliedAt: {application.appliedAt}")
        
        # 데이터베이스에 실제로 저장되었는지 확인
        verify_stmt = select(Application).where(Application.applicationId == application.applicationId)
        verified = session.exec(verify_stmt).first()
        if verified:
            print(f"[DEBUG] create_application - 데이터베이스 저장 확인됨: {verified.applicationId}")
        else:
            print(f"[ERROR] create_application - 데이터베이스 저장 실패! applicationId: {application.applicationId}")
        
        return {
            "applicationId": application.applicationId,
            "seekerId": application.seekerId,
            "jobId": application.jobId,
            "status": application.status,
            "appliedAt": application.appliedAt,
            "updatedAt": application.updatedAt,
            "hiredAt": application.hiredAt,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] create_application - 예상치 못한 오류: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"지원서 생성 중 오류 발생: {str(e)}")


@router.get("", response_model=List[dict])
async def list_applications(
    seekerId: Optional[str] = None,
    jobId: Optional[str] = None,
    employerId: Optional[str] = None,
    userId: Optional[str] = None,  # For employer: signup_user_id
    session: Session = Depends(get_session),
):
    """List applications with filters and JOINed data"""
    print(f"[DEBUG] list_applications - 요청 파라미터:")
    print(f"  userId: {userId}")
    print(f"  employerId: {employerId}")
    print(f"  seekerId: {seekerId}")
    print(f"  jobId: {jobId}")
    
    # If userId(가입 고용주 ID)로 조회하면 소유 공고(매장/사업자 모두) 기준으로 필터링
    # employerId가 이미 넘어오면 그대로 사용
    owned_job_ids: list[str] = []
    if userId and not seekerId:
        try:
            # 1) 매장 기반: user_id가 소유한 store 목록 → 해당 store_id의 공고
            store_ids = [s.id for s in session.exec(select(Store).where(Store.user_id == userId)).all()]
            if store_ids:
                job_ids_by_store = [j.id for j in session.exec(select(Job).where(Job.store_id.in_(store_ids))).all()]
                owned_job_ids.extend(job_ids_by_store)
                print(f"[DEBUG] list_applications - store 기반 공고 수: {len(job_ids_by_store)}")
            
            # 1-1) 고용주 ID가 job.employerId로 직접 저장된 경우
            direct_job_ids = [j.id for j in session.exec(select(Job).where(Job.employerId == userId)).all()]
            if direct_job_ids:
                owned_job_ids.extend(direct_job_ids)
                print(f"[DEBUG] list_applications - employerId==userId 직접 매핑 공고 수: {len(direct_job_ids)}")
            
            # 2) 사업자 기반: employer_profiles.user_id == userId → employer.businessNo == profile.id → 그 employerId의 공고
            profile = session.exec(select(EmployerProfile).where(EmployerProfile.user_id == userId)).first()
            if profile:
                employer = session.exec(select(Employer).where(Employer.businessNo == profile.id)).first()
                if employer:
                    employerId = employer.id  # 아래 employerId 필터 재사용
                    job_ids_by_employer = [j.id for j in session.exec(select(Job).where(Job.employerId == employer.id)).all()]
                    owned_job_ids.extend(job_ids_by_employer)
                    print(f"[DEBUG] list_applications - employer 기반 공고 수: {len(job_ids_by_employer)}")
            
            # 중복 제거
            owned_job_ids = list(dict.fromkeys(owned_job_ids))
            print(f"[DEBUG] list_applications - 최종 owned_job_ids 수: {len(owned_job_ids)}")
        except Exception as e:
            print(f"[ERROR] list_applications - userId 기반 공고 조회 실패: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    # Base query
    statement = select(Application)
    
    if seekerId:
        statement = statement.where(Application.seekerId == seekerId)
    if jobId:
        statement = statement.where(Application.jobId == jobId)
    if employerId:
        # Filter by employer's jobs
        try:
            print(f"[DEBUG] list_applications - employerId로 공고 필터링 시작: {employerId}")
            job_ids_stmt = select(Job.id).where(Job.employerId == employerId)
            job_ids = [j.id for j in session.exec(job_ids_stmt).all()]
            print(f"[DEBUG] list_applications - employerId {employerId}의 공고 개수: {len(job_ids)}")
            print(f"[DEBUG] list_applications - 공고 IDs: {job_ids}")
            
            if not job_ids:
                print(f"[WARNING] list_applications - 이 고용주에게 공고가 없음: employerId={employerId}")
                print(f"[WARNING] list_applications - 공고를 먼저 등록해야 지원 내역을 볼 수 있음")
                return []
            
            # Use or_ to create IN clause equivalent (more compatible with SQLModel)
            conditions = [Application.jobId == job_id for job_id in job_ids]
            statement = statement.where(or_(*conditions))
            print(f"[DEBUG] list_applications - 공고 필터 적용 완료: {len(job_ids)}개 공고")
        except Exception as e:
            print(f"[ERROR] Failed to filter by employerId {employerId}: {e}")
            import traceback
            traceback.print_exc()
            return []
    # userId로 확보한 owned_job_ids가 있다면 추가 필터 적용
    if userId and owned_job_ids:
        conditions = [Application.jobId == jid for jid in owned_job_ids]
        statement = statement.where(or_(*conditions))
    
    try:
        applications = session.exec(statement).all()
    except Exception as e:
        print(f"[ERROR] Failed to execute applications query: {e}")
        import traceback
        traceback.print_exc()
        return []
    
    results = []
    
    for app in applications:
        try:
            app_dict = app.dict()  # This includes seekerId, jobId, status, etc.
            
            # If filtering by seekerId, include Job information
            if seekerId:
                job = session.exec(select(Job).where(Job.id == app.jobId)).first()
                if job:
                    job_dict = job.dict()
                    # Get employer info
                    employer = session.exec(select(Employer).where(Employer.id == job.employerId)).first()
                    employer_dict = employer.dict() if employer else {}
                    
                    app_dict['job'] = {
                        'id': job_dict['id'],
                        'title': job_dict['title'],
                        'shopName': job_dict.get('shop_name') or employer_dict.get('shopName', ''),
                        'wage': job_dict['wage'],
                        'location': job_dict.get('location') or job_dict.get('shop_address', ''),
                        'category': job_dict['category'],
                        'workDays': job_dict['workDays'],
                        'workHours': job_dict['workHours'],
                        'employerId': job_dict['employerId'],
                    }
            
            # If filtering by jobId, employerId, or userId, include JobSeeker information
            if jobId or employerId or userId:
                seeker = session.exec(select(JobSeeker).where(JobSeeker.id == app.seekerId)).first()
                if not seeker:
                    print(f"[WARNING] JobSeeker not found for seekerId: {app.seekerId}")
                    print(f"[WARNING] jobseekers 테이블에 구직자 정보가 없음 - ensure_jobseeker_exists가 실행되지 않았을 수 있음")
                    # JobSeeker가 없어도 지원 내역은 반환 (기본 정보만)
                    app_dict['jobseeker'] = {
                        'id': app.seekerId,
                        'name': '알 수 없음',
                        'nationality': '알 수 없음',
                        'phone': '',
                        'languageLevel': '알 수 없음',
                        'visaType': '알 수 없음',
                        'experience': [],
                        'preferences': {},
                    }
                elif seeker:
                    seeker_dict = seeker.dict()
                    # Parse JSON fields
                    experience = []
                    if seeker_dict.get('experience'):
                        try:
                            experience = json.loads(seeker_dict['experience']) if isinstance(seeker_dict['experience'], str) else seeker_dict['experience']
                        except:
                            experience = []
                    
                    preferences = {}
                    if seeker_dict.get('preferences'):
                        try:
                            preferences = json.loads(seeker_dict['preferences']) if isinstance(seeker_dict['preferences'], str) else seeker_dict['preferences']
                        except:
                            preferences = {}
                    
                    app_dict['jobseeker'] = {
                        'id': seeker_dict['id'],
                        'name': seeker_dict['name'],
                        'nationality': seeker_dict['nationality'],
                        'phone': seeker_dict['phone'],
                        'languageLevel': seeker_dict['languageLevel'],
                        'visaType': seeker_dict['visaType'],
                        'experience': experience,
                        'preferences': preferences,
                    }
            
            # If filtering by employerId or userId, include Job information
            if employerId or userId:
                job = session.exec(select(Job).where(Job.id == app.jobId)).first()
                if employerId:
                    # If employerId is set, verify job belongs to this employer
                    if not job or job.employerId != employerId:
                        continue  # Skip if job doesn't belong to this employer
                if job and 'job' not in app_dict:  # Only add if not already added
                    app_dict['job'] = {
                        'id': job.id,
                        'title': job.title,
                        'category': job.category,
                    }
            
            results.append(app_dict)
        except Exception as e:
            print(f"[ERROR] Failed to process application {app.applicationId if hasattr(app, 'applicationId') else 'unknown'}: {e}")
            import traceback
            traceback.print_exc()
            continue  # Skip this application and continue with others
    
    print(f"[DEBUG] list_applications - 최종 반환할 결과 개수: {len(results)}")
    
    # 디버깅: 반환할 결과의 첫 번째 항목 로깅
    if results:
        print(f"[DEBUG] list_applications - 첫 번째 결과 샘플:")
        first_result = results[0]
        print(f"  applicationId: {first_result.get('applicationId', 'N/A')}")
        print(f"  seekerId: {first_result.get('seekerId', 'N/A')}")
        print(f"  jobId: {first_result.get('jobId', 'N/A')}")
        print(f"  jobseeker 존재: {'jobseeker' in first_result}")
        if 'jobseeker' in first_result:
            jobseeker = first_result['jobseeker']
            print(f"  jobseeker.name: {jobseeker.get('name', 'N/A')}")
            print(f"  jobseeker.nationality: {jobseeker.get('nationality', 'N/A')}")
    else:
        print(f"[WARNING] list_applications - 반환할 결과가 없습니다!")
        print(f"[WARNING] list_applications - 조회된 applications 개수: {len(applications)}")
        if employerId:
            print(f"[WARNING] list_applications - employerId: {employerId}")
            # employerId로 공고 개수 확인
            job_count_stmt = select(Job).where(Job.employerId == employerId)
            job_count = len(session.exec(job_count_stmt).all())
            print(f"[WARNING] list_applications - 이 고용주의 공고 개수: {job_count}")
            
            # 이 고용주의 공고에 대한 지원 내역 확인
            if job_count > 0:
                job_ids_stmt = select(Job.id).where(Job.employerId == employerId)
                job_ids = [j.id for j in session.exec(job_ids_stmt).all()]
                # Use or_ for IN clause
                app_conditions = [Application.jobId == job_id for job_id in job_ids]
                app_count_stmt = select(Application).where(or_(*app_conditions))
                app_count = len(session.exec(app_count_stmt).all())
                print(f"[WARNING] list_applications - 이 고용주의 공고에 대한 지원 내역 개수: {app_count}")
    
    return results


@router.patch("/{application_id}", response_model=dict)
async def update_application(
    application_id: str,
    request: ApplicationUpdate,
    session: Session = Depends(get_session),
):
    """Update application status"""
    statement = select(Application).where(Application.applicationId == application_id)
    application = session.exec(statement).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application.status = request.status
    application.updatedAt = datetime.utcnow().isoformat()
    
    if request.status == "hired":
        application.hiredAt = datetime.utcnow().isoformat()
    
    session.add(application)
    session.commit()
    session.refresh(application)
    
    return {
        "applicationId": application.applicationId,
        "seekerId": application.seekerId,
        "jobId": application.jobId,
        "status": application.status,
        "appliedAt": application.appliedAt,
        "updatedAt": application.updatedAt,
        "hiredAt": application.hiredAt,
    }

