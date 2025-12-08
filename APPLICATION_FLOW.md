# 지원 플로우 데이터베이스 설계 및 API 가이드

## 문제점
1. 구직자가 공고에 지원 후 "지원 현황"에서 지원한 공고가 보이지 않음
2. 고용주가 "채용" 탭에서 지원한 구직자 정보가 보이지 않음

## 해결 방안

### 1. 데이터베이스 구조

#### 필요한 테이블 및 관계
```
applications (지원 내역 테이블)
├── applicationId (PK)
├── seekerId (FK → jobseekers.id)
├── jobId (FK → jobs.id)
├── status (applied, pending, reviewed, accepted, rejected, hired)
├── appliedAt
├── updatedAt
┴── hiredAt

jobs (공고 테이블)
├── id (PK)
├── employerId (FK → employers.id)
├── shop_name
├── shop_address
├── shop_address_detail
├── shop_phone
├── location
└── ...

jobseekers (구직자 테이블)
├── id (PK)
├── name
├── nationality
├── phone
└── ...

employers (고용주 테이블)
├── id (PK)
├── shopName
└── ...
```

### 2. 필요한 정보 및 저장 방법

#### 구직자 지원 시 저장되는 정보:
- `applicationId`: 자동 생성 (app-{uuid})
- `seekerId`: 구직자 ID (jobseekers.id)
- `jobId`: 지원한 공고 ID (jobs.id)
- `status`: "applied" (기본값)
- `appliedAt`: 현재 시간 (ISO8601)

#### 구직자 지원 현황 조회 시 필요한 정보:
```json
{
  "applicationId": "app-xxx",
  "jobId": "job-xxx",
  "status": "pending",
  "appliedAt": "2025-01-04T...",
  "job": {
    "id": "job-xxx",
    "title": "카페 바리스타",
    "shopName": "스타벅스 강남점",
    "wage": 12000,
    "location": "강남구",
    "category": "외식업",
    "workDays": "월,화,수",
    "workHours": "09:00 ~ 18:00",
    "employerId": "emp-xxx"
  }
}
```

#### 고용주 지원자 목록 조회 시 필요한 정보:
```json
{
  "applicationId": "app-xxx",
  "jobId": "job-xxx",
  "status": "pending",
  "appliedAt": "2025-01-04T...",
  "jobseeker": {
    "id": "seeker-xxx",
    "name": "홍길동",
    "nationality": "베트남",
    "phone": "01012345678",
    "languageLevel": "Lv.3 중급",
    "visaType": "E-9",
    "experience": [...],
    "preferences": {...}
  },
  "job": {
    "id": "job-xxx",
    "title": "카페 바리스타",
    "category": "외식업"
  }
}
```

### 3. API 엔드포인트

#### GET /applications
**쿼리 파라미터:**
- `seekerId`: 구직자 ID (구직자 지원 현황 조회 시)
- `employerId`: 고용주 ID (고용주 지원자 목록 조회 시)
- `userId`: 고용주 user_id (signup_users.id) - 백엔드에서 employerId로 변환
- `jobId`: 공고 ID (특정 공고의 지원자 목록)

**응답:**
- seekerId로 조회 시: Job 정보 포함
- employerId/userId로 조회 시: JobSeeker 정보 포함

### 4. 프론트엔드 수정 사항

#### 구직자 지원 현황 (MyApplications.tsx)
- `GET /applications?seekerId={seekerId}` 호출
- 응답 데이터를 UI에 맞게 변환

#### 고용주 채용 탭 (Recruitment.tsx)
- `GET /applications?userId={userId}` 호출 (백엔드가 employerId로 변환)
- 응답 데이터를 UI에 맞게 변환

#### 구직자 지원 (JobDetail.tsx)
- 실제 seekerId 사용 (localStorage의 signup_user_id 기반으로 jobseeker ID 찾기)

### 5. 데이터 매핑 필요

현재 시스템에서는:
- `signup_users.id` (회원가입 시 생성되는 ID)
- `jobseekers.id` (구직자 프로필 ID)
- `employers.id` (고용주 프로필 ID)

이들 간의 매핑이 필요합니다:
- signup_users → jobseekers: user_id로 연결 필요
- signup_users → employers: user_id로 연결 필요

### 6. 권장 사항

1. **구직자 지원 시**: 
   - signup_user_id로 jobseekers 레코드를 찾거나 생성
   - 해당 jobseekers.id를 seekerId로 사용

2. **고용주 지원자 조회 시**:
   - signup_user_id → employer_profile → employer → employerId 찾기
   - employerId로 applications 조회

3. **데이터베이스 최적화**:
   - applications 테이블에 인덱스 추가 (seekerId, jobId, status)
   - JOIN 쿼리 성능 최적화


