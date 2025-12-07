from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, time


class SignInRequest(BaseModel):
    email: str
    password: str


class NewSignInRequest(BaseModel):
    identifier: str  # 이메일 또는 전화번호
    password: str
    role: str  # "job_seeker" | "employer"


class SignUpRequest(BaseModel):
    email: str
    password: str
    role: str


class AuthResponse(BaseModel):
    user: dict
    token: str


class ApplicationCreate(BaseModel):
    seekerId: str
    jobId: str


class ApplicationUpdate(BaseModel):
    status: str


class MessageCreate(BaseModel):
    conversationId: str
    senderId: str
    text: str


class MessageRead(BaseModel):
    messageId: str


class TranslateRequest(BaseModel):
    messageId: str
    text: str
    targetLang: str


class TranslateResponse(BaseModel):
    translatedText: str


class LevelTestSubmit(BaseModel):
    seekerId: str
    answers: dict


class TermsPayload(BaseModel):
    tos_required: bool
    privacy_required: bool
    sms_optional: bool
    marketing_optional: bool


class SignupPayload(BaseModel):
    role: str  # "job_seeker" | "employer"
    name: str
    phone: Optional[str] = None  # 고용주는 선택적
    email: Optional[str] = None  # 고용주 필수, 구직자 선택적
    password: str  # 비밀번호
    birthdate: Optional[str] = None  # YYYY-MM-DD, 고용주는 선택적
    gender: Optional[str] = None  # "male" | "female", 고용주는 선택적
    nationality_code: Optional[str] = None  # 고용주는 선택적
    terms: TermsPayload


class NationalityResponse(BaseModel):
    code: str
    name: str
    phone_code: str


class SignupResponse(BaseModel):
    id: str
    role: str
    name: str
    message: str = "회원가입이 완료되었습니다."


class SignupUserResponse(BaseModel):
    id: str
    role: str
    name: str
    phone: Optional[str] = None
    birthdate: Optional[str] = None  # YYYY-MM-DD
    gender: Optional[str] = None
    nationality_code: Optional[str] = None
    nationality_name: Optional[str] = None
    created_at: str


class WorkSchedulePayload(BaseModel):
    available_dates: List[str] = []  # ['YYYY-MM-DD', ...]
    start_time: Optional[str] = None  # 'HH:mm'
    end_time: Optional[str] = None  # 'HH:mm'
    days_of_week: List[str] = []  # ['MON', 'TUE', ...] or ['월', '화', ...]


class ExperiencePayload(BaseModel):
    sections: List[str] = []  # ['career', 'license', 'skills', 'introduction']
    data: dict = {}  # { 'career': '...', 'license': '...', ... }


class JobSeekerProfileCreate(BaseModel):
    user_id: str
    basic_info_file_name: Optional[str] = None
    preferred_regions: List[str] = []
    preferred_jobs: List[str] = []
    work_schedule: Optional[WorkSchedulePayload] = None
    experience: Optional[ExperiencePayload] = None
    visa_type: Optional[str] = None


class JobSeekerProfileResponse(BaseModel):
    id: str
    user_id: str
    basic_info_file_name: Optional[str] = None
    preferred_regions: List[str] = []
    preferred_jobs: List[str] = []
    work_available_dates: List[str] = []
    work_start_time: Optional[str] = None
    work_end_time: Optional[str] = None
    work_days_of_week: List[str] = []
    experience_sections: List[str] = []
    experience_career: Optional[str] = None
    experience_license: Optional[str] = None
    experience_skills: Optional[str] = None
    experience_introduction: Optional[str] = None
    visa_type: Optional[str] = None
    created_at: str
    updated_at: str


class EmployerSignupPayload(BaseModel):
    name: str
    email: str
    password: str  # 비밀번호
    business_type: str  # 'business' or 'individual'
    company_name: str
    address: str
    address_detail: Optional[str] = None


class EmployerSignupResponse(BaseModel):
    id: str
    name: str
    company_name: str
    message: str = "고용주 회원가입이 완료되었습니다."


class EmployerProfileCreate(BaseModel):
    user_id: str
    business_type: str  # 'business' or 'individual'
    company_name: str
    address: str
    address_detail: Optional[str] = None


class EmployerProfileResponse(BaseModel):
    id: str
    user_id: str
    business_type: str
    company_name: str
    address: str
    address_detail: Optional[str] = None
    created_at: str
    updated_at: str


class JobCreateRequest(BaseModel):
    employer_profile_id: str
    title: str
    description: str
    category: str
    wage: int
    work_days: str  # e.g., "월,화,수" or "MON,TUE,WED"
    work_hours: str  # e.g., "09:00-18:00"
    deadline: str  # ISO8601
    positions: int
    required_language: str  # e.g., "TOPIK 1급"
    required_visa: List[str] = []
    benefits: Optional[str] = None
    employer_message: Optional[str] = None
    status: Optional[str] = "active"  # 'active', 'paused', 'closed'


class JobResponse(BaseModel):
    id: str
    employer_id: str
    title: str
    description: str
    category: str
    wage: int
    work_days: str
    work_hours: str
    deadline: str
    positions: int
    required_language: str
    required_visa: List[str]
    benefits: Optional[str] = None
    employer_message: Optional[str] = None
    created_at: str
    employer: dict = {}