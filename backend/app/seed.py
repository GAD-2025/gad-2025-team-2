from sqlmodel import Session, select
from app.models import Nationality, SignupUser, JobSeekerProfile
from app.db import engine
import json
import uuid
from datetime import datetime, date


def seed_nationalities():
    """Seed nationality data"""
    nationalities_data = [
        {'code': 'KR', 'name': '대한민국 (South Korea)', 'phone_code': '+82'},
        {'code': 'US', 'name': 'United States', 'phone_code': '+1'},
        {'code': 'CA', 'name': 'Canada', 'phone_code': '+1'},
        {'code': 'JP', 'name': '日本 (Japan)', 'phone_code': '+81'},
        {'code': 'CN', 'name': '中国 (China)', 'phone_code': '+86'},
        {'code': 'VN', 'name': 'Việt Nam (Vietnam)', 'phone_code': '+84'},
        {'code': 'TH', 'name': 'ประเทศไทย (Thailand)', 'phone_code': '+66'},
        {'code': 'PH', 'name': 'Philippines', 'phone_code': '+63'},
        {'code': 'ID', 'name': 'Indonesia', 'phone_code': '+62'},
        {'code': 'MY', 'name': 'Malaysia', 'phone_code': '+60'},
        {'code': 'SG', 'name': 'Singapore', 'phone_code': '+65'},
        {'code': 'TW', 'name': '台灣 (Taiwan)', 'phone_code': '+886'},
        {'code': 'HK', 'name': '香港 (Hong Kong)', 'phone_code': '+852'},
        {'code': 'MO', 'name': '澳門 (Macau)', 'phone_code': '+853'},
        {'code': 'IN', 'name': 'India', 'phone_code': '+91'},
        {'code': 'BD', 'name': 'Bangladesh', 'phone_code': '+880'},
        {'code': 'PK', 'name': 'Pakistan', 'phone_code': '+92'},
        {'code': 'NP', 'name': 'Nepal', 'phone_code': '+977'},
        {'code': 'LK', 'name': 'Sri Lanka', 'phone_code': '+94'},
        {'code': 'MM', 'name': 'Myanmar', 'phone_code': '+95'},
        {'code': 'KH', 'name': 'Cambodia', 'phone_code': '+855'},
        {'code': 'LA', 'name': 'Laos', 'phone_code': '+856'},
        {'code': 'MN', 'name': 'Mongolia', 'phone_code': '+976'},
        {'code': 'KZ', 'name': 'Kazakhstan', 'phone_code': '+7'},
        {'code': 'UZ', 'name': 'Uzbekistan', 'phone_code': '+998'},
        {'code': 'RU', 'name': 'Russia', 'phone_code': '+7'},
        {'code': 'AU', 'name': 'Australia', 'phone_code': '+61'},
        {'code': 'NZ', 'name': 'New Zealand', 'phone_code': '+64'},
        {'code': 'GB', 'name': 'United Kingdom', 'phone_code': '+44'},
        {'code': 'FR', 'name': 'France', 'phone_code': '+33'},
        {'code': 'DE', 'name': 'Germany', 'phone_code': '+49'},
    ]
    
    with Session(engine) as session:
        for nat_data in nationalities_data:
            statement = select(Nationality).where(Nationality.code == nat_data['code'])
            existing = session.exec(statement).first()
            if not existing:
                nationality = Nationality(**nat_data)
                session.add(nationality)
                print(f"Adding nationality: {nat_data['code']}")
        
        session.commit()
        print("Nationality seeding complete.")


def seed_job_seekers():
    """Seed job seeker test data"""
    job_seekers_data = [
        {
            "work_days": ["월", "화", "수", "목", "금"],
            "work_time": "09:00-18:00",
        },
        {
            "work_days": ["월", "화", "수", "목", "금", "토"],
            "work_time": "10:00-19:00",
        },
        {
            "work_days": ["월", "화", "수", "목", "금", "토", "일"],
            "work_time": "08:00-17:00",
        },
        {
            "work_days": ["월", "화", "수", "목", "금"],
            "work_time": "09:00-18:00",
        },
        {
            "work_days": ["월", "화", "수", "목", "금", "토"],
            "work_time": "10:00-20:00",
        },
        {
            "work_days": ["화", "수", "목", "금", "토", "일"],
            "work_time": "11:00-20:00",
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
                name="test user",
                phone="01000000000",
                password="hashed_password",  # In production, use proper hashing
                nationality_code="KR",
                birthdate=datetime.fromisoformat("2000-01-01").date(),
                created_at=datetime.utcnow()
            )
            session.add(user)
            
            # Create JobSeekerProfile
            profile_id = f"profile-{uuid.uuid4().hex[:8]}"
            profile = JobSeekerProfile(
                id=profile_id,
                user_id=user_id,
                preferred_regions=json.dumps([]),
                preferred_jobs=json.dumps([]),
                work_available_dates=json.dumps([]),
                work_start_time=seeker_data["work_time"].split("-")[0] if seeker_data["work_time"] else None,
                work_end_time=seeker_data["work_time"].split("-")[1] if seeker_data["work_time"] else None,
                work_days_of_week=json.dumps(seeker_data["work_days"]),
                experience_sections=json.dumps(["skills", "introduction"]),
                experience_skills=json.dumps({}),
                experience_introduction="",
                # Assign sample visa types for testing
                visa_type="E-9",
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
