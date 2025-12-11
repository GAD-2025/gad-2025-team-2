from sqlmodel import Session, select
from app.models import Nationality, SignupUser, JobSeekerProfile
from app.db import engine
import json
import uuid
from datetime import datetime, date


def seed_nationalities():
    """Seed nationality data"""
    nationalities_data = []
    
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
