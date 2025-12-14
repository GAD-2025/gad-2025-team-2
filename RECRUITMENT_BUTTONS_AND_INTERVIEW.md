# 채용탭 버튼 3개 추가 및 면접 제안 완료 페이지

## ✅ 수정 완료 사항

### 1. 채용탭 지원자 카드에 버튼 3개 추가
- **저장 버튼** (왼쪽): 북마크 아이콘, 저장/해제 토글
- **채팅 버튼** (가운데): 채팅 아이콘과 텍스트
- **면접 제안하기 버튼** (오른쪽): 지원자 상세 페이지로 이동

### 2. 면접 제안 완료 페이지 생성
- 파일: `frontend/src/pages/employer/InterviewProposed.tsx`
- 면접 제안 완료 메시지 표시
- 제안한 면접 일정 상세 정보 표시
- "채용 탭으로 돌아가기" 및 "홈으로 가기" 버튼

### 3. 지원자 정보 표시 개선
- 구직자가 온보딩에서 입력한 정보를 채용탭에서 표시
- 백엔드에서 `jobseeker` 정보를 포함하여 반환
- 지원자 카드에 이름, 나이, 국적, 언어 능력, 경력 등 표시

## 🔧 수정된 파일

1. **frontend/src/pages/employer/Recruitment.tsx**
   - 지원자 카드 Footer에 버튼 3개 추가
   - 저장 기능 구현 (localStorage 사용)
   - 채팅 버튼 추가
   - 면접 제안하기 버튼 추가

2. **frontend/src/pages/employer/InterviewProposed.tsx** (새 파일)
   - 면접 제안 완료 페이지 생성
   - 제안한 면접 일정 상세 정보 표시

3. **frontend/src/pages/employer/ApplicantDetail.tsx**
   - 면접 제안 완료 후 `InterviewProposed` 페이지로 이동하도록 수정

4. **frontend/src/router.tsx**
   - `/employer/interview-proposed` 라우트 추가

## 📋 필요한 데이터베이스 필드

구직자가 온보딩에서 입력한 정보를 채용탭에서 표시하기 위해 필요한 필드:

### `job_seeker_profiles` 테이블
```sql
- id (VARCHAR, PRIMARY KEY)
- user_id (VARCHAR, NOT NULL) - 구직자 user_id
- name (VARCHAR, NULL) - 이름
- phone (VARCHAR, NULL) - 전화번호
- nationality_code (VARCHAR, NULL) - 국적 코드
- birthdate (VARCHAR, NULL) - 생년월일
- basic_info_file_name (VARCHAR, NULL) - 기본 정보 파일명
- preferred_regions (TEXT, JSON 배열) - 선호 지역
- preferred_jobs (TEXT, JSON 배열) - 선호 직종
- work_available_dates (TEXT, JSON 배열) - 근무 가능 날짜
- work_start_time (VARCHAR, NULL) - 근무 시작 시간
- work_end_time (VARCHAR, NULL) - 근무 종료 시간
- work_days_of_week (TEXT, JSON 배열) - 근무 가능 요일
- experience_sections (TEXT, JSON 배열) - 경력 섹션
- experience_career (TEXT, NULL) - 경력 내용
- experience_license (TEXT, NULL) - 자격증 내용
- experience_skills (TEXT, NULL) - 스킬 내용
- experience_introduction (TEXT, NULL) - 자기소개
- visa_type (VARCHAR, NULL) - 비자 유형
- created_at (DATETIME, NOT NULL)
- updated_at (DATETIME, NOT NULL)
```

### `jobseekers` 테이블 (레거시)
```sql
- id (VARCHAR, PRIMARY KEY) - 구직자 ID (signup_users.id와 동일)
- name (VARCHAR, NOT NULL) - 이름
- nationality (VARCHAR, NOT NULL) - 국적
- phone (VARCHAR, NOT NULL) - 전화번호
- languageLevel (VARCHAR, NOT NULL) - 언어 수준
- visaType (VARCHAR, NOT NULL) - 비자 유형
- availability (VARCHAR, NOT NULL) - 근무 가능 여부
- location (TEXT, NULL) - 위치 정보 (JSON)
- experience (TEXT, DEFAULT '[]') - 경력 정보 (JSON 배열)
- preferences (TEXT, DEFAULT '{}') - 선호도 정보 (JSON 객체)
```

### `applications` 테이블
```sql
- applicationId (VARCHAR, PRIMARY KEY) - 지원서 ID
- seekerId (VARCHAR, NOT NULL) - 구직자 user_id (signup_users.id 참조)
- jobId (VARCHAR, NOT NULL) - 공고 ID (jobs.id 참조)
- status (VARCHAR, DEFAULT 'applied') - 상태 ('applied', 'hired', 'rejected')
- appliedAt (VARCHAR, NOT NULL) - 지원일시 (ISO8601)
- updatedAt (VARCHAR, NOT NULL) - 수정일시 (ISO8601)
- hiredAt (VARCHAR, NULL) - 채용 확정일시 (ISO8601)
```

## 🎯 데이터 흐름

1. **구직자가 공고에 지원**:
   - `applications` 테이블에 지원 내역 저장
   - `seekerId`에 구직자 `user_id` 저장

2. **고용주가 채용탭 접속**:
   - `/applications?userId=고용주_user_id` API 호출
   - 백엔드에서 `jobseeker` 정보를 포함하여 반환
   - 프론트엔드에서 지원자 카드에 표시

3. **지원자 정보 표시**:
   - `app.jobseeker.name` - 이름
   - `app.jobseeker.nationality` - 국적
   - `app.jobseeker.languageLevel` - 언어 수준
   - `app.jobseeker.experience` - 경력 정보
   - `app.jobseeker.visaType` - 비자 유형

## 🧪 테스트 방법

1. **채용탭 접속**:
   - `/recruitment` 접속
   - 지원자 목록 확인

2. **버튼 3개 테스트**:
   - 저장 버튼 클릭 → 저장/해제 확인
   - 채팅 버튼 클릭 → 채팅 페이지로 이동 확인
   - 면접 제안하기 버튼 클릭 → 지원자 상세 페이지로 이동 확인

3. **면접 제안 완료 페이지 테스트**:
   - 지원자 상세 페이지에서 "면접 제안하기" 클릭
   - 면접 일정 선택 후 제안 보내기
   - 면접 제안 완료 페이지로 이동 확인

## 📝 참고 사항

- 구직자 프로필 정보는 백엔드에서 `jobseeker` 객체로 반환됩니다
- 지원자 카드에 표시되는 정보는 백엔드 응답의 `app.jobseeker`에서 가져옵니다
- 저장 기능은 `localStorage`를 사용하여 클라이언트 측에서 관리됩니다

**모든 기능이 구현되었습니다!** 🎉

