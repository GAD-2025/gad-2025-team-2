# 지원서는 생성되지만 고용주 채용탭에 안 보이는 문제 해결

## ✅ 확인된 사실

1. **지원서 생성은 성공**: 
   - 프론트엔드: `[DEBUG] 지원 성공:` 로그 확인
   - Network 탭: `/applications` 요청이 `201 Created`
   - 백엔드: `[DEBUG] create_application - 지원서 생성 완료:` 로그 확인

2. **문제**: 고용주 채용탭에 지원 내역이 표시되지 않음

## 🔍 문제 진단

### 1단계: 데이터베이스에 실제로 저장되었는지 확인

MySQL Workbench에서 실행:

```sql
USE team2_db;

-- 최근 지원 내역 확인
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title,
    j.employerId
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
ORDER BY a.appliedAt DESC
LIMIT 10;
```

**이 쿼리 결과가 비어있으면**: 지원서가 실제로 저장되지 않은 것
**이 쿼리 결과가 있으면**: 다음 단계로 진행

### 2단계: 고용주 조회 로직 확인

고용주로 로그인 → 채용탭 접속 → 백엔드 로그 확인:

```
[DEBUG] list_applications - 요청 파라미터:
  userId: ...
[DEBUG] list_applications - employerId 설정: ...
[DEBUG] list_applications - 조회된 지원서 개수: ...
[DEBUG] list_applications - 최종 반환할 결과 개수: ...
```

**만약 `조회된 지원서 개수: 0`이면**: 
- `employer_profiles`와 `employers` 연결 문제
- 또는 `jobs.employerId`가 잘못됨

**만약 `조회된 지원서 개수: N`인데 `최종 반환할 결과 개수: 0`이면**:
- `jobseeker` 정보를 찾지 못해서 필터링됨

### 3단계: 고용주 연결 확인

```sql
USE team2_db;

-- 고용주 user_id로 지원 내역 확인
SELECT 
    ep.user_id as 고용주_user_id,
    e.id as employer_id,
    j.id as job_id,
    j.title,
    a.applicationId,
    a.seekerId,
    a.appliedAt
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
WHERE ep.user_id = '여기에_고용주_user_id_입력'
ORDER BY a.appliedAt DESC;
```

## 🐛 가능한 문제들

### 문제 1: employer_profiles와 employers 연결 안 됨
**증상**: `employer_id`가 NULL
**해결**: `CREATE_MISSING_EMPLOYERS.sql` 실행

### 문제 2: jobs.employerId가 잘못됨
**증상**: 지원 내역은 있지만 고용주와 연결 안 됨
**해결**: 공고 생성 시 `employerId` 확인

### 문제 3: jobseeker 정보 없음
**증상**: `조회된 지원서 개수: N`인데 `최종 반환할 결과 개수: 0`
**해결**: `jobseekers` 테이블에 구직자 레코드 확인

## 📋 체크리스트

다음 순서대로 확인하세요:

1. **MySQL에서 지원 내역 확인**
   ```sql
   SELECT * FROM applications ORDER BY appliedAt DESC LIMIT 5;
   ```
   - 지원 내역이 있나요? ✅ → 다음 단계
   - 지원 내역이 없나요? ❌ → 지원서 생성 로직 문제

2. **고용주 연결 확인**
   ```sql
   SELECT ep.user_id, e.id, COUNT(a.applicationId) as 지원수
   FROM employer_profiles ep
   LEFT JOIN employers e ON e.businessNo = ep.id
   LEFT JOIN jobs j ON j.employerId = e.id
   LEFT JOIN applications a ON a.jobId = j.id
   WHERE ep.user_id = '고용주_user_id'
   GROUP BY ep.user_id, e.id;
   ```
   - 지원수가 0이면 연결 문제
   - 지원수가 있으면 프론트엔드 문제

3. **백엔드 로그 확인**
   - 고용주 채용탭 접속 시 `list_applications` 로그 확인
   - `최종 반환할 결과 개수` 확인

## 🔧 다음 단계

1. **MySQL에서 지원 내역이 있는지 확인** (위 SQL 실행)
2. **백엔드 로그에서 `list_applications` 결과 확인**
3. **결과를 알려주시면 정확한 해결 방법 제시하겠습니다!**

