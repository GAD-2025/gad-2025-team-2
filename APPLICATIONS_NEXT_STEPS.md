# 구직자 지원 내역 확인 - 다음 단계

## ✅ 현재까지 확인된 사항

이미지에서 확인:
- `applications` 테이블 존재 ✓
- `jobs`와 `employers` 연결 정상 (`missing_employers: 0`) ✓
- `total_jobs: 2` (공고 2개 존재) ✓

## 🔍 다음으로 확인할 사항

### 1. applications 테이블에 실제 데이터가 있는지 확인

```sql
USE team2_db;

-- 지원 내역 개수 확인
SELECT COUNT(*) as total_applications FROM applications;

-- 실제 지원 내역 데이터 확인
SELECT * FROM applications;
```

### 2. applications와 jobs 연결 확인

```sql
USE team2_db;

-- 지원 내역과 공고가 올바르게 연결되어 있는지 확인
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.id as job_exists,
    j.title as job_title,
    j.employerId
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id;
```

### 3. 고용주의 공고에 대한 지원 내역 확인

```sql
USE team2_db;

-- 모든 공고에 대한 지원 내역 확인
SELECT 
    j.id as job_id,
    j.title as job_title,
    j.employerId,
    COUNT(a.applicationId) as application_count
FROM jobs j
LEFT JOIN applications a ON j.id = a.jobId
GROUP BY j.id, j.title, j.employerId;
```

### 4. 특정 고용주의 모든 지원 내역 확인

```sql
USE team2_db;

-- 먼저 고용주 정보 확인
SELECT 
    ep.user_id,
    ep.company_name,
    e.id as employer_id,
    e.businessNo
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id;

-- 위 결과에서 employer_id를 찾은 후, 아래 쿼리에서 사용
-- (employer_id를 실제 값으로 변경하세요)
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title as job_title,
    j.employerId
FROM applications a
INNER JOIN jobs j ON a.jobId = j.id
WHERE j.employerId = '여기에_employer_id_입력'
ORDER BY a.appliedAt DESC;
```

### 5. 고용주 user_id로 직접 조회 (가장 중요!)

```sql
USE team2_db;

-- 고용주 user_id로 모든 지원 내역 조회
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

### 6. 연결되지 않은 지원 내역 확인

```sql
USE team2_db;

-- jobId가 jobs 테이블에 없는 지원 내역 확인
SELECT 
    a.applicationId,
    a.jobId,
    'jobId가 jobs 테이블에 없음' as problem
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
WHERE j.id IS NULL;
```

## 📋 종합 진단 쿼리

```sql
USE team2_db;

-- 1. 전체 지원 내역 개수
SELECT '=== 지원 내역 개수 ===' as info;
SELECT COUNT(*) as total_applications FROM applications;

-- 2. 지원 내역과 공고 연결 상태
SELECT '=== 지원 내역-공고 연결 ===' as info;
SELECT 
    COUNT(*) as total_applications,
    SUM(CASE WHEN j.id IS NULL THEN 1 ELSE 0 END) as missing_jobs,
    SUM(CASE WHEN j.id IS NOT NULL THEN 1 ELSE 0 END) as connected_jobs
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id;

-- 3. 공고별 지원 내역 개수
SELECT '=== 공고별 지원 내역 ===' as info;
SELECT 
    j.id as job_id,
    j.title,
    j.employerId,
    COUNT(a.applicationId) as application_count
FROM jobs j
LEFT JOIN applications a ON j.id = a.jobId
GROUP BY j.id, j.title, j.employerId;

-- 4. 고용주별 지원 내역 개수
SELECT '=== 고용주별 지원 내역 ===' as info;
SELECT 
    e.id as employer_id,
    e.shopName,
    ep.user_id,
    COUNT(a.applicationId) as total_applications
FROM employers e
LEFT JOIN employer_profiles ep ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
GROUP BY e.id, e.shopName, ep.user_id;
```

## 💡 문제 해결 순서

1. **먼저 위의 "종합 진단 쿼리" 실행** → 전체 상황 파악
2. **"1. applications 테이블에 실제 데이터가 있는지 확인" 실행** → 데이터 존재 여부 확인
3. **"2. applications와 jobs 연결 확인" 실행** → 연결 상태 확인
4. **"5. 고용주 user_id로 직접 조회" 실행** → 특정 고용주의 지원 내역 확인

**위 쿼리들을 순서대로 실행하여 결과를 확인하세요!** 🔍

