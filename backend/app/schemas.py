from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


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


class SignupResponse(BaseModel):
    id: str
    role: str
    name: str
    message: str = "회원가입이 완료되었습니다."
