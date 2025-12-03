"""
DB 재생성 스크립트
기존 테이블을 모두 삭제하고 새로 생성합니다.
"""
import os
from sqlmodel import SQLModel, create_engine, text
from app.models import (
    Nationality, SignupUser, JobSeekerProfile,
    JobSeeker, Employer, Job, Application,
    Conversation, Message, LearningProgress, User
)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./workfair.db")
engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})

def reset_database():
    """기존 테이블을 모두 삭제하고 새로 생성"""
    print("기존 테이블 삭제 중...")
    
    # SQLite에서 직접 테이블 삭제
    with engine.connect() as conn:
        conn.execute(text("PRAGMA foreign_keys=OFF"))
        # 모든 테이블 삭제
        tables = [
            "nationalities", "signup_users", "job_seeker_profiles",
            "jobseekers", "employers", "jobs", "applications",
            "conversations", "messages", "learning_progress", "users"
        ]
        for table in tables:
            try:
                conn.execute(text(f"DROP TABLE IF EXISTS {table}"))
                print(f"  - {table} 테이블 삭제")
            except Exception as e:
                print(f"  - {table} 삭제 실패: {e}")
        conn.commit()
        conn.execute(text("PRAGMA foreign_keys=ON"))
    
    print("테이블 삭제 완료")
    print("새 테이블 생성 중...")
    
    # 새 테이블 생성
    SQLModel.metadata.create_all(engine)
    
    print("테이블 생성 완료!")

if __name__ == "__main__":
    reset_database()
