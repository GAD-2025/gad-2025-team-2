"""
Seed script to populate database with realistic test data
Run: python -m app.seed
"""
from sqlmodel import Session
from app.db import engine, create_db_and_tables
from app.models import (
    User, JobSeeker, Employer, Job, Application, 
    Conversation, Message, LearningProgress, Nationality
)
from datetime import datetime, timedelta
import json
import hashlib

# Simple password hashing for seeding
def hash_password(password: str) -> str:
    """Simple SHA256 hash for development seed data"""
    return hashlib.sha256(password.encode()).hexdigest()


def seed_data():
    """Seed database with test data"""
    create_db_and_tables()
    
    with Session(engine) as session:
        # Clear existing data (optional)
        print("Seeding database...")
        
        # Create Nationalities - Major Countries Only
        nationalities = [
            Nationality(code="US", name="United States", phone_code="+1"),
            Nationality(code="CA", name="Canada", phone_code="+1"),
            Nationality(code="EG", name="مصر‎ (Egypt)", phone_code="+20"),
            Nationality(code="ZA", name="South Africa", phone_code="+27"),
            Nationality(code="GR", name="Ελλάδα (Greece)", phone_code="+30"),
            Nationality(code="NL", name="Nederland", phone_code="+31"),
            Nationality(code="FR", name="France", phone_code="+33"),
            Nationality(code="ES", name="España", phone_code="+34"),
            Nationality(code="IT", name="Italia", phone_code="+39"),
            Nationality(code="GB", name="United Kingdom", phone_code="+44"),
            Nationality(code="DE", name="Deutschland (Germany)", phone_code="+49"),
            Nationality(code="MX", name="México", phone_code="+52"),
            Nationality(code="BR", name="Brasil", phone_code="+55"),
            Nationality(code="AU", name="Australia", phone_code="+61"),
            Nationality(code="ID", name="Indonesia", phone_code="+62"),
            Nationality(code="PH", name="Pilipinas (Philippines)", phone_code="+63"),
            Nationality(code="NZ", name="Aotearoa (New Zealand)", phone_code="+64"),
            Nationality(code="TH", name="ประเทศไทย (Thailand)", phone_code="+66"),
            Nationality(code="JP", name="日本 (Japan)", phone_code="+81"),
            Nationality(code="KR", name="대한민국 (South Korea)", phone_code="+82"),
            Nationality(code="VN", name="Việt Nam (Vietnam)", phone_code="+84"),
            Nationality(code="CN", name="中国 (China)", phone_code="+86"),
            Nationality(code="IN", name="भारत (India)", phone_code="+91"),
            Nationality(code="PK", name="پاکستان (Pakistan)", phone_code="+92"),
            Nationality(code="LK", name="ශ්‍රී ලංකාව (Sri Lanka)", phone_code="+94"),
            Nationality(code="MM", name="မြန်မာ (Myanmar)", phone_code="+95"),
            Nationality(code="RU", name="Россия (Russia)", phone_code="+7"),
            Nationality(code="UA", name="Україна (Ukraine)", phone_code="+380"),
            Nationality(code="KW", name="الكويت‎ (Kuwait)", phone_code="+965"),
            Nationality(code="SA", name="السعودية‎ (Saudi Arabia)", phone_code="+966"),
            Nationality(code="AE", name="الإمارات العربية المتحدة‎ (United Arab Emirates)", phone_code="+971"),
            Nationality(code="QA", name="قطر‎ (Qatar)", phone_code="+974"),
        ]
        for nationality in nationalities:
            # Check if exists, if not add
            existing = session.get(Nationality, nationality.code)
            if not existing:
                session.add(nationality)
        session.commit()  # Commit nationalities immediately
        print("✅ Nationalities seeded")
        
        # Create JobSeekers
        seekers = [
            JobSeeker(
                id="seeker-1",
                name="수정",
                nationality="베트남",
                phone="010-1234-5678",
                languageLevel="TOPIK 2급",
                visaType="D-2",
                availability="주말",
                experience=json.dumps([
                    {"role": "카페 바리스타", "years": 1, "tags": ["서비스", "음료제조"]}
                ]),
                preferences=json.dumps({
                    "industries": ["음식점", "카페"],
                    "wageRange": {"min": 10000, "max": 15000},
                    "area": "종로구",
                    "radiusKm": 5,
                    "preferDays": ["토", "일"]
                })
            ),
            JobSeeker(
                id="seeker-2",
                name="민준",
                nationality="중국",
                phone="010-2345-6789",
                languageLevel="TOPIK 3급",
                visaType="D-4",
                availability="평일 야간",
                experience=json.dumps([]),
                preferences=json.dumps({
                    "industries": ["편의점", "배달"],
                    "wageRange": {"min": 9500, "max": 12000},
                    "area": "중구",
                    "radiusKm": 3,
                    "preferDays": ["월", "수", "금"]
                })
            ),
        ]
        
        for seeker in seekers:
            session.add(seeker)
        
        # Create Employers
        employers = [
            Employer(
                id="employer-1",
                businessNo="123-45-67890",
                shopName="이태원 농담",
                industry="음식점 (파스타 전문)",
                address="서울 용산구 녹사평대로32길 3 2층",
                openHours="11:00-22:00",
                contact="02-1234-5678",
                media=json.dumps([]),
                minLanguageLevel="TOPIK 3급",
                needVisa=json.dumps(["비자-C-4"]),
                baseWage=12000,
                schedule="주 2일, 6시간",
                rating=4.6
            ),
            Employer(
                id="employer-2",
                businessNo="234-56-78901",
                shopName="왕십리 스타벅스",
                industry="카페",
                address="서울 성동구 왕십리로 123",
                openHours="07:00-22:00",
                contact="02-2345-6789",
                media=json.dumps([]),
                minLanguageLevel="TOPIK 2급",
                needVisa=json.dumps(["D-2", "D-4"]),
                baseWage=11000,
                schedule="주 3일, 4시간",
                rating=4.3
            ),
            Employer(
                id="employer-3",
                businessNo="345-67-89012",
                shopName="카페 파트타이머 구인",
                industry="카페",
                address="서울 성동구 행당로 45",
                openHours="08:00-20:00",
                contact="010-3456-7890",
                media=json.dumps([]),
                minLanguageLevel="TOPIK 3급",
                needVisa=json.dumps(["D-2"]),
                baseWage=12000,
                schedule="협의",
                rating=4.5
            ),
            Employer(
                id="employer-4",
                businessNo="456-78-90123",
                shopName="홀서빙 파트타이머 구인",
                industry="음식점",
                address="서울 용산구 이태원로 234",
                openHours="10:00-23:00",
                contact="010-4567-8901",
                media=json.dumps([]),
                minLanguageLevel="TOPIK 2급",
                needVisa=json.dumps(["비자-C-4"]),
                baseWage=13300,
                schedule="주말",
                rating=4.2
            ),
        ]
        
        for employer in employers:
            session.add(employer)
        
        # Create Jobs
        deadline_dates = [
            (datetime.now() + timedelta(days=8)).isoformat(),
            (datetime.now() + timedelta(days=12)).isoformat(),
            (datetime.now() + timedelta(days=5)).isoformat(),
            (datetime.now() + timedelta(days=15)).isoformat(),
        ]
        
        jobs = [
            Job(
                id="job-1",
                employerId="employer-1",
                title="카페 파트타이머 구인",
                description="친절하고 책임감 있는 파트타이머를 구합니다.",
                category="카페/음료",
                wage=12000,
                workDays="주 2일",
                workHours="시간, 요일 협의",
                deadline=deadline_dates[0],
                positions=2,
                requiredLanguage="TOPIK 3급",
                requiredVisa=json.dumps(["비자-C-4"]),
                benefits="인근 거주 우대, 영어 가능자 우대",
                employerMessage="저희 가게는 깨끗하고 친절한 분위기 손님들도 좋습니다. 청결하고 격려합 훈련을 잘 해줄 것입니다.",
            ),
            Job(
                id="job-2",
                employerId="employer-2",
                title="홀서빙 파트타이머 구인",
                description="주말 근무 가능한 분을 찾습니다.",
                category="음식점",
                wage=13300,
                workDays="주말",
                workHours="10:00-17:00",
                deadline=deadline_dates[1],
                positions=1,
                requiredLanguage="TOPIK 2급",
                requiredVisa=json.dumps(["비자-C-4"]),
                benefits="식사 제공",
                employerMessage="밝고 성실한 분이면 좋겠습니다!",
            ),
            Job(
                id="job-3",
                employerId="employer-3",
                title="카페 파트타이머 구인",
                description="카페 경험자 우대합니다.",
                category="카페",
                wage=12000,
                workDays="평일",
                workHours="14:00-19:00",
                deadline=deadline_dates[2],
                positions=2,
                requiredLanguage="TOPIK 3급",
                requiredVisa=json.dumps(["D-2"]),
            ),
            Job(
                id="job-4",
                employerId="employer-4",
                title="편의점 야간 알바",
                description="야간 근무 가능한 분을 모집합니다.",
                category="편의점",
                wage=11500,
                workDays="주 4일",
                workHours="22:00-06:00",
                deadline=deadline_dates[3],
                positions=1,
                requiredLanguage="TOPIK 2급",
                requiredVisa=json.dumps(["D-2", "D-4"]),
                benefits="야간수당 별도",
            ),
        ]
        
        for job in jobs:
            session.add(job)
        
        # Create Users
        users = [
            User(
                id="user-seeker-1",
                email="seeker1@example.com",
                hashedPassword=hash_password("password123"),
                role="jobseeker",
                profileId="seeker-1"
            ),
            User(
                id="user-employer-1",
                email="employer1@example.com",
                hashedPassword=hash_password("password123"),
                role="employer",
                profileId="employer-1"
            ),
        ]
        
        for user in users:
            session.add(user)
        
        # Create Learning Progress
        learning = LearningProgress(
            id="learn-1",
            seekerId="seeker-1",
            currentLevel="한국어 입문",
            completedLessons=3,
            totalLessons=6,
            progressPercent=65
        )
        session.add(learning)
        
        # Commit all
        session.commit()
        print("✅ Database seeded successfully!")
        print("\nTest accounts:")
        print("  Jobseeker: seeker1@example.com / password123")
        print("  Employer: employer1@example.com / password123")


if __name__ == "__main__":
    seed_data()

