# 채용 탭 지원자 정보 기능 구현에 필요한 데이터베이스 필드

## 📋 필요한 테이블 및 필드

### 1. `applications` 테이블 (지원서)
```sql
- applicationId (VARCHAR, PRIMARY KEY): 지원서 ID
- seekerId (VARCHAR, NOT NULL): 지원자 user_id (signup_users.id 참조)
- jobId (VARCHAR, NOT NULL): 공고 ID (jobs.id 참조)
- status (VARCHAR, DEFAULT 'applied'): 지원 상태 ('applied', 'hired', 'rejected')
- appliedAt (DATETIME): 지원 일시
- updatedAt (DATETIME): 수정 일시
- hiredAt (DATETIME, NULL): 채용 확정 일시
```

### 2. `jobseekers` 테이블 (구직자)
```sql
- id (VARCHAR, PRIMARY KEY): 구직자 ID (signup_users.id와 동일)
- name (VARCHAR, NOT NULL): 이름
- nationality (VARCHAR, NOT NULL): 국적
- phone (VARCHAR, NOT NULL): 전화번호
- languageLevel (VARCHAR, NOT NULL): 언어 수준
- visaType (VARCHAR, NOT NULL): 비자 유형
- availability (VARCHAR, NOT NULL): 근무 가능 여부
- location (TEXT, NULL): 위치 정보 (JSON)
- experience (TEXT, DEFAULT '[]'): 경력 정보 (JSON 배열)
- preferences (TEXT, DEFAULT '{}'): 선호도 정보 (JSON 객체)
```

### 3. `jobs` 테이블 (공고)
```sql
- id (VARCHAR, PRIMARY KEY): 공고 ID
- employerId (VARCHAR, NOT NULL): 고용주 ID (employers.id 참조)
- title (VARCHAR, NOT NULL): 공고 제목
- description (TEXT, NOT NULL): 공고 설명
- category (VARCHAR, NOT NULL): 업직종
- wage (INT, NOT NULL): 급여
- wage_type (VARCHAR, DEFAULT 'hourly'): 급여 타입 ('hourly', 'weekly', 'monthly')
- workDays (VARCHAR, NOT NULL): 근무일
- workHours (VARCHAR, NOT NULL): 근무시간
- deadline (VARCHAR, NOT NULL): 마감일
- positions (INT, NOT NULL): 모집 인원
- requiredLanguage (VARCHAR, NOT NULL): 필수 언어
- requiredVisa (TEXT, DEFAULT '[]'): 필수 비자 (JSON 배열)
- benefits (TEXT, NULL): 혜택
- status (VARCHAR, DEFAULT 'active'): 공고 상태 ('active', 'paused', 'closed')
- createdAt (VARCHAR, NOT NULL): 생성 일시
- postedAt (VARCHAR, NULL): 게시 일시
- location (TEXT, NULL): 위치 정보
- shop_name (VARCHAR, NULL): 매장명
- shop_address (VARCHAR, NULL): 매장 주소
- shop_address_detail (VARCHAR, NULL): 매장 상세 주소
- shop_phone (VARCHAR, NULL): 매장 전화번호
- store_id (VARCHAR, NULL): 매장 ID (stores.id 참조)
```

### 4. `employers` 테이블 (고용주)
```sql
- id (VARCHAR, PRIMARY KEY): 고용주 ID
- businessNo (VARCHAR, NOT NULL): 사업자 번호
- shopName (VARCHAR, NOT NULL): 매장명
- industry (VARCHAR, NOT NULL): 업종
- address (VARCHAR, NOT NULL): 주소
- location (TEXT, NULL): 위치 정보 (JSON)
- openHours (VARCHAR, NOT NULL): 영업 시간
- contact (VARCHAR, NOT NULL): 연락처
- media (TEXT, DEFAULT '[]'): 미디어 URL (JSON 배열)
- minLanguageLevel (VARCHAR, NOT NULL): 최소 언어 수준
- needVisa (TEXT, DEFAULT '[]'): 필요 비자 (JSON 배열)
- baseWage (INT, NOT NULL): 기본 급여
- schedule (VARCHAR, NOT NULL): 일정
- rating (FLOAT, NULL): 평점
```

### 5. `employer_profiles` 테이블 (고용주 프로필)
```sql
- id (VARCHAR, PRIMARY KEY): 프로필 ID
- user_id (VARCHAR, NOT NULL): 사용자 ID (signup_users.id 참조)
- business_no (VARCHAR, NOT NULL): 사업자 번호
- company_name (VARCHAR, NOT NULL): 회사명
- industry (VARCHAR, NOT NULL): 업종
- address (VARCHAR, NOT NULL): 주소
- phone (VARCHAR, NOT NULL): 전화번호
- created_at (DATETIME, NOT NULL): 생성 일시
- updated_at (DATETIME, NOT NULL): 수정 일시
```

### 6. `signup_users` 테이블 (사용자)
```sql
- id (VARCHAR, PRIMARY KEY): 사용자 ID
- email (VARCHAR, NOT NULL): 이메일
- password (VARCHAR, NOT NULL): 비밀번호 (해시)
- role (VARCHAR, NOT NULL): 역할 ('employer', 'jobseeker')
- name (VARCHAR, NOT NULL): 이름
- phone (VARCHAR, NOT NULL): 전화번호
- nationality_code (VARCHAR, NULL): 국적 코드
- created_at (DATETIME, NOT NULL): 생성 일시
- updated_at (DATETIME, NOT NULL): 수정 일시
```

## 🔗 관계 (Foreign Keys)

1. `applications.seekerId` → `signup_users.id`
2. `applications.jobId` → `jobs.id`
3. `jobs.employerId` → `employers.id`
4. `jobseekers.id` → `signup_users.id`
5. `employer_profiles.user_id` → `signup_users.id`
6. `employers.businessNo` → `employer_profiles.id` (비즈니스 로직)

## 📝 참고 사항

- 모든 테이블은 이미 존재하는 것으로 보입니다
- 추가로 필요한 필드는 없습니다
- 문제는 백엔드 코드의 에러 핸들링 부족이었습니다

**현재 수정된 백엔드 코드로 다시 테스트해보세요!** 🎉

