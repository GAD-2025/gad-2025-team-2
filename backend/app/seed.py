from sqlmodel import Session, select
from app.models import Nationality, SignupUser, JobSeekerProfile
from app.db import engine
import json
import uuid
from datetime import datetime


def seed_nationalities():
    """Seed nationality data"""
    nationalities_data = [
        {"code": "KR", "name": "대한민국 (South Korea)", "phone_code": "+82"},
        {"code": "US", "name": "United States", "phone_code": "+1"},
        {"code": "CA", "name": "Canada", "phone_code": "+1"},
        {"code": "JP", "name": "日本 (Japan)", "phone_code": "+81"},
        {"code": "CN", "name": "中国 (China)", "phone_code": "+86"},
        {"code": "VN", "name": "Việt Nam (Vietnam)", "phone_code": "+84"},
        {"code": "TH", "name": "ประเทศไทย (Thailand)", "phone_code": "+66"},
        {"code": "PH", "name": "Philippines", "phone_code": "+63"},
        {"code": "ID", "name": "Indonesia", "phone_code": "+62"},
        {"code": "MY", "name": "Malaysia", "phone_code": "+60"},
        {"code": "SG", "name": "Singapore", "phone_code": "+65"},
        {"code": "TW", "name": "台灣 (Taiwan)", "phone_code": "+886"},
        {"code": "HK", "name": "香港 (Hong Kong)", "phone_code": "+852"},
        {"code": "MO", "name": "澳門 (Macau)", "phone_code": "+853"},
        {"code": "IN", "name": "India", "phone_code": "+91"},
        {"code": "BD", "name": "Bangladesh", "phone_code": "+880"},
        {"code": "PK", "name": "Pakistan", "phone_code": "+92"},
        {"code": "NP", "name": "Nepal", "phone_code": "+977"},
        {"code": "LK", "name": "Sri Lanka", "phone_code": "+94"},
        {"code": "MM", "name": "Myanmar", "phone_code": "+95"},
        {"code": "KH", "name": "Cambodia", "phone_code": "+855"},
        {"code": "LA", "name": "Laos", "phone_code": "+856"},
        {"code": "MN", "name": "Mongolia", "phone_code": "+976"},
        {"code": "KZ", "name": "Kazakhstan", "phone_code": "+7"},
        {"code": "UZ", "name": "Uzbekistan", "phone_code": "+998"},
        {"code": "RU", "name": "Russia", "phone_code": "+7"},
        {"code": "AU", "name": "Australia", "phone_code": "+61"},
        {"code": "NZ", "name": "New Zealand", "phone_code": "+64"},
        {"code": "GB", "name": "United Kingdom", "phone_code": "+44"},
        {"code": "FR", "name": "France", "phone_code": "+33"},
        {"code": "DE", "name": "Germany", "phone_code": "+49"},
    ]
    
    with Session(engine) as session:
        # Check if data already exists
        existing = session.exec(select(Nationality)).first()
        if existing:
            print("Nationalities already seeded")
            return
        
        # Add all nationalities
        for nat_data in nationalities_data:
            nationality = Nationality(**nat_data)
            session.add(nationality)
        
        session.commit()
        print(f"Seeded {len(nationalities_data)} nationalities")


def seed_job_seekers():
    """Seed job seeker test data"""
    job_seekers_data = [
        {
            "name": "김민수",
            "nationality": "VN",
            "birthdate": "1995-03-15",
            "phone": "01012345678",
            "preferred_regions": ["서울", "경기"],
            "preferred_jobs": ["service", "delivery"],
            "work_days": ["월", "화", "수", "목", "금"],
            "work_time": "09:00-18:00",
            "skills": json.dumps({"workSkills": ["서비스", "배달"], "strengths": ["성실함", "책임감"], "mbti": ["ISFJ"]}),
            "introduction": "안녕하세요. 한국에서 성실하게 일하고 싶습니다. 한국어 중급 수준이며 서비스업 경험이 있습니다."
        },
        {
            "name": "레 티 마이",
            "nationality": "VN",
            "birthdate": "1998-07-22",
            "phone": "01023456789",
            "preferred_regions": ["서울", "인천"],
            "preferred_jobs": ["store", "serving"],
            "work_days": ["월", "화", "수", "목", "금", "토"],
            "work_time": "10:00-19:00",
            "skills": json.dumps({"workSkills": ["매장관리", "서빙"], "strengths": ["밝은 성격", "고객 응대"], "mbti": ["ENFP"]}),
            "introduction": "안녕하세요! 밝고 긍정적인 성격으로 고객 서비스를 잘합니다. 카페와 식당에서 일한 경험이 있습니다."
        },
        {
            "name": "탄 응우옌",
            "nationality": "VN",
            "birthdate": "1996-11-08",
            "phone": "01034567890",
            "preferred_regions": ["경기", "인천"],
            "preferred_jobs": ["kitchen", "labor"],
            "work_days": ["월", "화", "수", "목", "금", "토", "일"],
            "work_time": "08:00-17:00",
            "skills": json.dumps({"workSkills": ["주방", "청소"], "strengths": ["체력", "성실함"], "mbti": ["ISTP"]}),
            "introduction": "주방 보조와 단순 노무 일을 찾고 있습니다. 체력이 좋고 성실하게 일합니다."
        },
        {
            "name": "마리아 산토스",
            "nationality": "PH",
            "birthdate": "1994-05-20",
            "phone": "01045678901",
            "preferred_regions": ["서울", "강남구"],
            "preferred_jobs": ["office", "sales"],
            "work_days": ["월", "화", "수", "목", "금"],
            "work_time": "09:00-18:00",
            "skills": json.dumps({"workSkills": ["사무", "영업"], "strengths": ["커뮤니케이션", "영어"], "mbti": ["ENFJ"]}),
            "introduction": "영어와 한국어가 가능합니다. 사무직과 영업 경험이 있으며 적극적으로 일합니다."
        },
        {
            "name": "존 리",
            "nationality": "PH",
            "birthdate": "1997-09-12",
            "phone": "01056789012",
            "preferred_regions": ["부산", "울산"],
            "preferred_jobs": ["delivery", "labor"],
            "work_days": ["월", "화", "수", "목", "금", "토"],
            "work_time": "10:00-20:00",
            "skills": json.dumps({"workSkills": ["배달", "운전"], "strengths": ["책임감", "시간엄수"], "mbti": ["ISTJ"]}),
            "introduction": "오토바이 운전과 배달 경험이 많습니다. 항상 시간을 지키며 책임감 있게 일합니다."
        },
        {
            "name": "왕리",
            "nationality": "CN",
            "birthdate": "1999-02-28",
            "phone": "01067890123",
            "preferred_regions": ["서울", "종로구"],
            "preferred_jobs": ["store", "service"],
            "work_days": ["화", "수", "목", "금", "토", "일"],
            "work_time": "11:00-20:00",
            "skills": json.dumps({"workSkills": ["매장관리", "고객응대"], "strengths": ["친절", "빠른 적응"], "mbti": ["ESFJ"]}),
            "introduction": "한국어, 중국어, 영어 가능합니다. 리테일 매장 경험이 있으며 고객 응대를 잘합니다."
        },
    ]
    
    with Session(engine) as session:
        # Check if job seekers already exist
        existing = session.exec(select(SignupUser).where(SignupUser.role == "job_seeker")).first()
        if existing:
            print("Job seekers already seeded")
            return
        
        created_count = 0
        for seeker_data in job_seekers_data:
            # Create SignupUser
            user_id = f"signup-{uuid.uuid4().hex[:8]}"
            user = SignupUser(
                id=user_id,
                role="job_seeker",
                name=seeker_data["name"],
                phone=seeker_data["phone"],
                password="hashed_password",  # In production, use proper hashing
                nationality_code=seeker_data["nationality"],
                birthdate=seeker_data["birthdate"],
                created_at=datetime.utcnow().isoformat()
            )
            session.add(user)
            
            # Create JobSeekerProfile
            profile_id = f"profile-{uuid.uuid4().hex[:8]}"
            profile = JobSeekerProfile(
                id=profile_id,
                user_id=user_id,
                preferred_regions=json.dumps(seeker_data["preferred_regions"]),
                preferred_jobs=json.dumps(seeker_data["preferred_jobs"]),
                work_available_dates=json.dumps([]),
                work_start_time=seeker_data["work_time"].split("-")[0] if seeker_data["work_time"] else None,
                work_end_time=seeker_data["work_time"].split("-")[1] if seeker_data["work_time"] else None,
                work_days_of_week=json.dumps(seeker_data["work_days"]),
                experience_sections=json.dumps(["skills", "introduction"]),
                experience_skills=seeker_data["skills"],
                experience_introduction=seeker_data["introduction"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(profile)
            created_count += 1
        
        session.commit()
        print(f"Seeded {created_count} job seekers with profiles")


if __name__ == "__main__":
    seed_nationalities()
    seed_job_seekers()
