from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date
import json


class GeoPoint(SQLModel):
    lat: float
    lng: float


class Experience(SQLModel, table=False):
    role: str
    years: int
    tags: List[str] = Field(default_factory=list)


class Preferences(SQLModel, table=False):
    industries: List[str] = Field(default_factory=list)
    wageRange: dict = Field(default_factory=lambda: {"min": 0, "max": 100000})
    area: str = ""
    radiusKm: int = 10
    preferDays: List[str] = Field(default_factory=list)


class JobSeeker(SQLModel, table=True):
    __tablename__ = "jobseekers"
    
    id: str = Field(primary_key=True)
    name: str
    nationality: str
    phone: str
    languageLevel: str
    visaType: str
    availability: str
    location: Optional[str] = None  # JSON string of GeoPoint
    experience: str = Field(default="[]")  # JSON string of Experience[]
    preferences: str = Field(default="{}")  # JSON string of Preferences


class Employer(SQLModel, table=True):
    __tablename__ = "employers"
    
    id: str = Field(primary_key=True)
    businessNo: str
    shopName: str
    industry: str
    address: str
    location: Optional[str] = None  # JSON string of GeoPoint
    openHours: str
    contact: str
    media: str = Field(default="[]")  # JSON string of media URLs
    minLanguageLevel: str
    needVisa: str = Field(default="[]")  # JSON string
    baseWage: int
    schedule: str
    rating: Optional[float] = None


class Job(SQLModel, table=True):
    __tablename__ = "jobs"
    
    id: str = Field(primary_key=True)
    employerId: str = Field(foreign_key="employers.id")
    title: str
    description: str
    category: str
    wage: int
    wage_type: str = Field(default="hourly")  # 'hourly', 'weekly', 'monthly'
    workDays: str
    workHours: str
    deadline: str  # ISO8601
    positions: int
    requiredLanguage: str
    requiredVisa: str = Field(default="[]")  # JSON string
    benefits: Optional[str] = None
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    status: str = Field(default="active")  # active, paused, closed
    views: int = Field(default=0)
    applications: int = Field(default=0)
    postedAt: Optional[str] = Field(default_factory=lambda: datetime.utcnow().isoformat())
    location: Optional[str] = None
    shop_name: Optional[str] = None
    shop_address: Optional[str] = None
    shop_address_detail: Optional[str] = None
    shop_phone: Optional[str] = None
    store_id: Optional[str] = None  # 매장 ID (stores.id 참조)


class Application(SQLModel, table=True):
    __tablename__ = "applications"
    
    applicationId: str = Field(primary_key=True)
    seekerId: str  # User ID (signup_user_id)
    jobId: str  # Job ID
    status: str = Field(default="applied")  # applied, reviewed, hired, rejected, hold
    appliedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    hiredAt: Optional[str] = None


class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"
    
    id: str = Field(primary_key=True)
    participants: str = Field(default="[]")  # JSON string of user IDs
    updatedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class Message(SQLModel, table=True):
    __tablename__ = "messages"
    
    id: str = Field(primary_key=True)
    conversationId: str = Field(foreign_key="conversations.id")
    senderId: str
    text: str
    translatedText: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    read: bool = Field(default=False)


class LearningProgress(SQLModel, table=True):
    __tablename__ = "learning_progress"
    
    id: str = Field(primary_key=True)
    seekerId: str = Field(foreign_key="jobseekers.id")
    currentLevel: str
    completedLessons: int = 0
    totalLessons: int = 100
    progressPercent: int = 0


class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    hashedPassword: str
    role: str  # jobseeker, employer
    profileId: str  # references JobSeeker.id or Employer.id


class Nationality(SQLModel, table=True):
    __tablename__ = "nationalities"
    
    code: str = Field(primary_key=True)
    name: str
    phone_code: str


class SignupUser(SQLModel, table=True):
    __tablename__ = "signup_users"
    
    id: str = Field(primary_key=True)
    role: str  # job_seeker, employer
    name: str
    phone: Optional[str] = None  # Optional for employers
    email: Optional[str] = None  # For employers
    password: Optional[str] = None  # Hashed password
    birthdate: Optional[date] = None  # Optional for employers
    gender: Optional[str] = None  # male, female, optional for employers
    nationality_code: Optional[str] = Field(default=None, foreign_key="nationalities.code")
    terms_tos_required: bool = Field(default=False)
    terms_privacy_required: bool = Field(default=False)
    terms_sms_optional: bool = Field(default=False)
    terms_marketing_optional: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class JobSeekerProfile(SQLModel, table=True):
    __tablename__ = "job_seeker_profiles"
    
    id: str = Field(primary_key=True)
    user_id: str  # references signup_users.id
    basic_info_file_name: Optional[str] = None
    preferred_regions: str = Field(default="[]")  # JSON string of list[str]
    preferred_jobs: str = Field(default="[]")  # JSON string of list[str]
    work_available_dates: str = Field(default="[]")  # JSON string of list[str] (YYYY-MM-DD)
    work_start_time: Optional[str] = None  # 'HH:mm'
    work_end_time: Optional[str] = None  # 'HH:mm'
    work_days_of_week: str = Field(default="[]")  # JSON string of list[str] (e.g., ['MON', 'TUE'])
    # Experience fields
    experience_sections: str = Field(default="[]")  # JSON string of list[str] (e.g., ['career', 'license'])
    experience_career: Optional[str] = None
    experience_license: Optional[str] = None
    experience_skills: Optional[str] = None
    experience_introduction: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    visa_type: Optional[str] = None


class EmployerProfile(SQLModel, table=True):
    __tablename__ = "employer_profiles"
    
    id: str = Field(primary_key=True)
    user_id: str  # references signup_users.id
    business_type: str  # 'business' or 'individual'
    company_name: str
    address: str
    address_detail: Optional[str] = None
    business_license: Optional[str] = None  # 사업자등록증 파일명 또는 URL
    is_verified: bool = Field(default=False)  # 인증 여부
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Store(SQLModel, table=True):
    __tablename__ = "stores"
    
    id: str = Field(primary_key=True)
    user_id: str  # references signup_users.id
    is_main: bool = Field(default=False)  # 대표가게 여부
    store_name: str
    address: str
    address_detail: Optional[str] = None
    phone: str
    industry: str  # 업종
    business_license: Optional[str] = None  # 사업자등록증 파일명 또는 URL
    management_role: str  # '본사 관리자' | '지점 관리자'
    store_type: str  # '직영점' | '가맹점' | '개인·독립 매장'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Post(SQLModel, table=True):
    __tablename__ = "posts"
    
    id: str = Field(primary_key=True)
    user_id: str  # 작성자 ID (signup_users.id 또는 users.id)
    title: str
    body: str  # 본문 내용
    created_at: datetime = Field(default_factory=datetime.utcnow)