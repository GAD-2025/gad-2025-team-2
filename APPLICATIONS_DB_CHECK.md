# 구직자 지원 내역이 고용주에게 안 뜨는 문제 - 데이터베이스 확인

## 🔍 MySQL에서 확인할 사항

### 1. `applications` 테이블 존재 및 구조 확인

```sql
USE team2_db;

-- 테이블 존재 확인
SHOW TABLES LIKE 'applications';

-- 테이블 구조 확인
DESCRIBE applications;

-- 또는 더 자세한 정보
SHOW CREATE TABLE applications;
```

### 2. `applications` 테이블에 데이터가 있는지 확인

```sql
USE team2_db;

-- 전체 지원 내역 확인
SELECT * FROM applications;

-- 지원 내역 개수 확인
SELECT COUNT(*) as total_applications FROM applications;

-- 최근 지원 내역 확인
SELECT * FROM applications ORDER BY appliedAt DESC LIMIT 10;
```

### 3. `applications`와 `jobs` 테이블 연결 확인

```sql
USE team2_db;

-- 지원 내역과 공고 정보를 함께 확인
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.id as job_id,
    j.title as job_title,
    j.employerId as job_employer_id
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
ORDER BY a.appliedAt DESC;
```

### 4. 고용주의 공고와 지원 내역 연결 확인

```sql
USE team2_db;

-- 특정 고용주의 공고에 대한 지원 내역 확인
-- (employerId를 실제 고용주 ID로 변경하세요)
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    j.title as job_title,
    j.employerId
FROM applications a
INNER JOIN jobs j ON a.jobId = j.id
WHERE j.employerId = '여기에_고용주_ID_입력'
ORDER BY a.appliedAt DESC;
```

### 5. `employer_profiles`와 `employers` 테이블 연결 확인

```sql
USE team2_db;

-- 고용주 프로필과 고용주 정보 연결 확인
SELECT 
    ep.id as profile_id,
    ep.user_id,
    ep.company_name,
    e.id as employer_id,
    e.businessNo,
    e.shopName
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id;
```

### 6. 특정 고용주(user_id)의 모든 지원 내역 확인

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

## 🔧 문제 진단 SQL

### 문제 1: `applications` 테이블이 없거나 구조가 잘못됨

```sql
USE team2_db;

-- 테이블 구조 확인
DESCRIBE applications;

-- 필요한 필드가 있는지 확인:
-- applicationId (VARCHAR, PRIMARY KEY)
-- seekerId (VARCHAR, NOT NULL)
-- jobId (VARCHAR, NOT NULL)
-- status (VARCHAR, DEFAULT 'applied')
-- appliedAt (VARCHAR 또는 DATETIME)
-- updatedAt (VARCHAR 또는 DATETIME)
-- hiredAt (VARCHAR 또는 DATETIME, NULL)
```

### 문제 2: `applications` 테이블에 데이터가 없음

```sql
USE team2_db;

-- 데이터 확인
SELECT COUNT(*) FROM applications;

-- 데이터가 0이면 구직자가 지원을 했는지 확인 필요
```

### 문제 3: `applications.jobId`가 `jobs.id`와 연결되지 않음

```sql
USE team2_db;

-- 연결되지 않은 지원 내역 확인
SELECT 
    a.applicationId,
    a.jobId,
    j.id as job_exists
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
WHERE j.id IS NULL;

-- 결과가 있으면 jobId가 잘못되었거나 jobs 테이블에 해당 공고가 없음
```

### 문제 4: `jobs.employerId`가 올바르지 않음

```sql
USE team2_db;

-- employerId가 없는 공고 확인
SELECT 
    j.id,
    j.title,
    j.employerId,
    e.id as employer_exists
FROM jobs j
LEFT JOIN employers e ON j.employerId = e.id
WHERE j.employerId IS NULL OR e.id IS NULL;
```

### 문제 5: `employer_profiles`와 `employers` 연결 문제

```sql
USE team2_db;

-- 연결되지 않은 고용주 프로필 확인
SELECT 
    ep.id as profile_id,
    ep.user_id,
    e.id as employer_id,
    e.businessNo
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
WHERE e.id IS NULL;

-- 연결되지 않은 고용주 확인
SELECT 
    e.id as employer_id,
    e.businessNo,
    ep.id as profile_exists
FROM employers e
LEFT JOIN employer_profiles ep ON e.businessNo = ep.id
WHERE ep.id IS NULL;
```

## 📋 필요한 테이블 구조

### `applications` 테이블이 없다면 생성

```sql
USE team2_db;

CREATE TABLE IF NOT EXISTS applications (
    applicationId VARCHAR(255) PRIMARY KEY COMMENT '지원서 ID',
    seekerId VARCHAR(255) NOT NULL COMMENT '구직자 user_id (signup_users.id 참조)',
    jobId VARCHAR(255) NOT NULL COMMENT '공고 ID (jobs.id 참조)',
    status VARCHAR(20) DEFAULT 'applied' COMMENT '상태: applied, hired, rejected',
    appliedAt VARCHAR(255) NOT NULL COMMENT '지원일시 (ISO8601)',
    updatedAt VARCHAR(255) NOT NULL COMMENT '수정일시 (ISO8601)',
    hiredAt VARCHAR(255) NULL COMMENT '채용 확정일시 (ISO8601)',
    INDEX idx_seekerId (seekerId),
    INDEX idx_jobId (jobId),
    INDEX idx_status (status),
    INDEX idx_appliedAt (appliedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='지원 내역 테이블';
```

## 🧪 종합 확인 쿼리

```sql
USE team2_db;

-- 1. 전체 지원 내역 확인
SELECT '=== 전체 지원 내역 ===' as info;
SELECT COUNT(*) as total FROM applications;

-- 2. 지원 내역과 공고 연결 확인
SELECT '=== 지원 내역과 공고 연결 ===' as info;
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN j.id IS NULL THEN 1 ELSE 0 END) as missing_jobs
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id;

-- 3. 공고와 고용주 연결 확인
SELECT '=== 공고와 고용주 연결 ===' as info;
SELECT 
    COUNT(*) as total_jobs,
    SUM(CASE WHEN e.id IS NULL THEN 1 ELSE 0 END) as missing_employers
FROM jobs j
LEFT JOIN employers e ON j.employerId = e.id;

-- 4. 고용주 프로필 연결 확인
SELECT '=== 고용주 프로필 연결 ===' as info;
SELECT 
    COUNT(*) as total_employers,
    SUM(CASE WHEN ep.id IS NULL THEN 1 ELSE 0 END) as missing_profiles
FROM employers e
LEFT JOIN employer_profiles ep ON e.businessNo = ep.id;
```

## 💡 문제 해결 순서

1. **먼저 위의 확인 쿼리들을 실행**하여 어디에 문제가 있는지 파악
2. **결과를 확인**하고 문제가 있는 부분을 찾기
3. **필요한 경우 테이블 생성 또는 수정**
4. **데이터 연결 확인**

**위의 SQL 명령어들을 MySQL Workbench에서 실행하여 결과를 확인하세요!** 🔍


