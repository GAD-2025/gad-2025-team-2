# 구직자 지원 → 고용주 채용탭 표시 디버깅

## ✅ 백엔드 디버그 로깅 추가

### 1. 지원 생성 시 로깅
- 구직자 ID, 공고 ID, 고용주 ID 확인
- 지원서 생성 완료 확인

### 2. 지원 내역 조회 시 로깅
- 요청 파라미터 확인 (userId, employerId 등)
- employer profile 찾기 과정 확인
- employer 찾기 과정 확인
- 공고 개수 및 IDs 확인
- 조회된 지원서 개수 확인
- 최종 반환 결과 개수 확인

## 🔍 문제 진단 방법

### 1. 구직자가 지원했는지 확인
```sql
USE team2_db;

-- 최근 지원 내역 확인
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt
FROM applications a
ORDER BY a.appliedAt DESC
LIMIT 10;
```

### 2. 지원 내역과 공고 연결 확인
```sql
USE team2_db;

-- 지원 내역과 공고가 올바르게 연결되어 있는지
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    j.id as job_exists,
    j.title,
    j.employerId
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
ORDER BY a.appliedAt DESC;
```

### 3. 고용주 연결 확인
```sql
USE team2_db;

-- 고용주 user_id로 모든 지원 내역 조회
-- (user_id를 실제 고용주 user_id로 변경)
SELECT 
    ep.user_id as employer_user_id,
    ep.id as profile_id,
    e.id as employer_id,
    e.businessNo,
    j.id as job_id,
    j.title,
    a.applicationId,
    a.seekerId
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
WHERE ep.user_id = '여기에_고용주_user_id_입력'
ORDER BY a.appliedAt DESC;
```

## 🧪 테스트 순서

1. **구직자로 로그인** → 공고에 지원하기 클릭
2. **백엔드 로그 확인**:
   - `[DEBUG] create_application - 구직자 지원:` 로그 확인
   - `[DEBUG] create_application - 지원서 생성 완료:` 로그 확인
3. **MySQL에서 확인**:
   - `SELECT * FROM applications ORDER BY appliedAt DESC LIMIT 1;` 실행
   - 지원 내역이 저장되었는지 확인
4. **고용주로 로그인** → 채용탭 접속
5. **백엔드 로그 확인**:
   - `[DEBUG] list_applications - 요청 파라미터:` 로그 확인
   - `[DEBUG] list_applications - employerId 설정:` 로그 확인
   - `[DEBUG] list_applications - 조회된 지원서 개수:` 로그 확인
6. **MySQL에서 확인**:
   - 위의 "고용주 연결 확인" SQL 실행
   - 지원 내역이 조회되는지 확인

**백엔드 로그를 확인하여 어디서 문제가 발생하는지 파악하세요!** 🔍

