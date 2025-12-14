# 구직자 지원 → 고용주 채용탭 표시 기능 구현에 필요한 데이터베이스 필드

## 🔍 문제 상황
구직자가 공고에 지원했는데 고용주 채용탭에 표시되지 않음

## 📋 필요한 데이터베이스 필드 (최소한)

### 1. `applications` 테이블 (필수)
```sql
- applicationId (VARCHAR, PRIMARY KEY) - 지원서 ID
- seekerId (VARCHAR, NOT NULL) - 구직자 user_id (signup_users.id 참조)
- jobId (VARCHAR, NOT NULL) - 공고 ID (jobs.id 참조)
- status (VARCHAR, DEFAULT 'applied') - 상태 ('applied', 'hired', 'rejected')
- appliedAt (VARCHAR, NOT NULL) - 지원일시 (ISO8601)
- updatedAt (VARCHAR, NOT NULL) - 수정일시 (ISO8601)
- hiredAt (VARCHAR, NULL) - 채용 확정일시 (ISO8601)
```

### 2. `jobs` 테이블 (필수)
```sql
- id (VARCHAR, PRIMARY KEY) - 공고 ID
- employerId (VARCHAR, NOT NULL) - 고용주 ID (employers.id 참조)
- title (VARCHAR, NOT NULL) - 공고 제목
```

### 3. `employers` 테이블 (필수)
```sql
- id (VARCHAR, PRIMARY KEY) - 고용주 ID
- businessNo (VARCHAR, NOT NULL) - 사업자 번호
```

### 4. `employer_profiles` 테이블 (필수)
```sql
- id (VARCHAR, PRIMARY KEY) - 프로필 ID (사업자 번호와 매칭)
- user_id (VARCHAR, NOT NULL) - 고용주 user_id (signup_users.id 참조)
```

### 5. `jobseekers` 테이블 (지원자 정보 표시용)
```sql
- id (VARCHAR, PRIMARY KEY) - 구직자 ID (signup_users.id와 동일)
- name (VARCHAR, NOT NULL) - 이름
- nationality (VARCHAR, NOT NULL) - 국적
- phone (VARCHAR, NOT NULL) - 전화번호
- languageLevel (VARCHAR, NOT NULL) - 언어 수준
- visaType (VARCHAR, NOT NULL) - 비자 유형
- experience (TEXT, DEFAULT '[]') - 경력 정보 (JSON 배열)
```

## 🔗 데이터 연결 관계

```
signup_users (user_id)
    ↓
applications (seekerId = user_id, jobId)
    ↓
jobs (id = jobId, employerId)
    ↓
employers (id = employerId, businessNo)
    ↓
employer_profiles (id = businessNo, user_id)
```

## ✅ 확인해야 할 SQL 쿼리

### 1. 구직자가 지원했는지 확인
```sql
USE team2_db;

-- 최근 지원 내역 확인
SELECT * FROM applications ORDER BY appliedAt DESC LIMIT 10;
```

### 2. 지원 내역과 공고 연결 확인
```sql
USE team2_db;

-- 지원 내역과 공고 정보 함께 확인
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.id as job_id,
    j.title as job_title,
    j.employerId
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
ORDER BY a.appliedAt DESC;
```

### 3. 고용주별 지원 내역 확인
```sql
USE team2_db;

-- 특정 고용주 user_id로 모든 지원 내역 조회
-- (user_id를 실제 고용주 user_id로 변경하세요)
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title as job_title,
    j.employerId,
    ep.user_id as employer_user_id
FROM applications a
INNER JOIN jobs j ON a.jobId = j.id
INNER JOIN employers e ON j.employerId = e.id
INNER JOIN employer_profiles ep ON e.businessNo = ep.id
WHERE ep.user_id = '여기에_고용주_user_id_입력'
ORDER BY a.appliedAt DESC;
```

## 🎯 문제 진단 체크리스트

1. **applications 테이블에 데이터가 있는지 확인**
   ```sql
   SELECT COUNT(*) FROM applications;
   ```

2. **applications.seekerId가 올바른지 확인**
   ```sql
   SELECT DISTINCT seekerId FROM applications;
   ```

3. **applications.jobId가 올바른지 확인**
   ```sql
   SELECT DISTINCT jobId FROM applications;
   ```

4. **jobs.employerId가 올바른지 확인**
   ```sql
   SELECT id, title, employerId FROM jobs;
   ```

5. **employer_profiles와 employers 연결 확인**
   ```sql
   SELECT 
       ep.user_id,
       ep.id as profile_id,
       e.id as employer_id,
       e.businessNo
   FROM employer_profiles ep
   LEFT JOIN employers e ON e.businessNo = ep.id;
   ```

## 💡 최소한 필요한 필드만 정리

**핵심 연결 필드만 있으면 됩니다:**

1. `applications.seekerId` → `signup_users.id` (구직자)
2. `applications.jobId` → `jobs.id` (공고)
3. `jobs.employerId` → `employers.id` (고용주)
4. `employers.businessNo` → `employer_profiles.id` (프로필)
5. `employer_profiles.user_id` → `signup_users.id` (고용주)

**이 5개 연결만 제대로 되어 있으면 고용주가 지원 내역을 볼 수 있습니다!**

