# 구직자 지원 → 고용주 채용탭 표시 기능 구현에 필요한 데이터베이스 필드 (최소한)

## 📋 핵심 연결 필드만 (5개 연결)

### 1. `applications` 테이블
```sql
- applicationId (VARCHAR, PRIMARY KEY)
- seekerId (VARCHAR, NOT NULL) ← 구직자 user_id
- jobId (VARCHAR, NOT NULL) ← 공고 ID
- status (VARCHAR, DEFAULT 'applied')
- appliedAt (VARCHAR, NOT NULL)
```

### 2. `jobs` 테이블
```sql
- id (VARCHAR, PRIMARY KEY)
- employerId (VARCHAR, NOT NULL) ← 고용주 ID
```

### 3. `employers` 테이블
```sql
- id (VARCHAR, PRIMARY KEY)
- businessNo (VARCHAR, NOT NULL) ← 사업자 번호
```

### 4. `employer_profiles` 테이블
```sql
- id (VARCHAR, PRIMARY KEY) ← 사업자 번호와 매칭
- user_id (VARCHAR, NOT NULL) ← 고용주 user_id
```

### 5. `jobseekers` 테이블 (지원자 정보 표시용)
```sql
- id (VARCHAR, PRIMARY KEY) ← 구직자 user_id
- name (VARCHAR, NOT NULL)
- nationality (VARCHAR, NOT NULL)
- languageLevel (VARCHAR, NOT NULL)
- experience (TEXT, DEFAULT '[]')
```

## 🔗 연결 관계 (5단계)

```
1. applications.seekerId → signup_users.id (구직자)
2. applications.jobId → jobs.id (공고)
3. jobs.employerId → employers.id (고용주)
4. employers.businessNo → employer_profiles.id (프로필)
5. employer_profiles.user_id → signup_users.id (고용주)
```

## ✅ 확인 SQL (최소한)

```sql
USE team2_db;

-- 1. 지원 내역이 있는지 확인
SELECT COUNT(*) as total FROM applications;

-- 2. 지원 내역과 공고 연결 확인
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    j.employerId
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
LIMIT 10;

-- 3. 고용주 연결 확인
SELECT 
    ep.user_id as employer_user_id,
    e.id as employer_id,
    COUNT(a.applicationId) as application_count
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
GROUP BY ep.user_id, e.id;
```

**이 5개 연결만 확인하면 됩니다!**

