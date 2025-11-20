from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, time


class SignInRequest(BaseModel):
    email: str
    password: str


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
    phone: str
    birthdate: str  # YYYY-MM-DD
    gender: str  # "male" | "female"
    nationality_code: str
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
    phone: str
    birthdate: str  # YYYY-MM-DD
    gender: str
    nationality_code: str
    nationality_name: Optional[str] = None
    created_at: str


class WorkSchedulePayload(BaseModel):
    available_dates: List[str]  # ['YYYY-MM-DD', ...]
    start_time: str  # 'HH:mm'
    end_time: str  # 'HH:mm'
    days_of_week: List[str]  # ['MON', 'TUE', ...] or ['월', '화', ...]


class ExperiencePayload(BaseModel):
    sections: List[str] = []  # ['career', 'license', 'skills', 'introduction']
    data: dict = {}  # { 'career': '...', 'license': '...', ... }


class JobSeekerProfileCreate(BaseModel):
    user_id: str
    basic_info_file_name: Optional[str] = None
    preferred_regions: List[str] = []
    preferred_jobs: List[str] = []
    work_schedule: WorkSchedulePayload
    experience: Optional[ExperiencePayload] = None


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
    created_at: str
    updated_at: str