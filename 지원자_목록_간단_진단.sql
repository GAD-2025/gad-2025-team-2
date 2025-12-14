-- 지원자 목록이 안 보이는 문제 간단 진단 (Collation 오류 없이)
USE team2_db;

-- =============================================
-- 1. 특정 고용주(user_id: employer-c33d319f)의 전체 연결 체인 확인
-- =============================================
SET @employer_user_id = 'employer-c33d319f';

-- 1-1. 고용주 프로필 확인
SELECT 
    '고용주 프로필' as check_type,
    ep.id as profile_id,
    ep.user_id,
    ep.company_name
FROM employer_profiles ep
WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @employer_user_id COLLATE utf8mb4_unicode_ci;

-- 1-2. 고용주 레코드 확인
SELECT 
    '고용주 레코드' as check_type,
    e.id as employer_id,
    e.businessNo,
    e.shopName
FROM employers e
WHERE CAST(e.businessNo AS CHAR) = (
    SELECT CAST(ep.id AS CHAR) FROM employer_profiles ep WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @employer_user_id COLLATE utf8mb4_unicode_ci
);

-- 1-3. 이 고용주의 공고 확인
SELECT 
    '공고 목록' as check_type,
    j.id as job_id,
    j.title,
    j.employerId,
    j.store_id
FROM jobs j
WHERE j.employerId IN (
    SELECT e.id 
    FROM employers e
    WHERE CAST(e.businessNo AS CHAR) = (
        SELECT CAST(ep.id AS CHAR) FROM employer_profiles ep WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @employer_user_id COLLATE utf8mb4_unicode_ci
    )
);

-- 1-4. 이 고용주의 공고에 대한 지원 내역 확인
SELECT 
    '지원 내역' as check_type,
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title as job_title
FROM applications a
INNER JOIN jobs j ON a.jobId = j.id
WHERE j.employerId IN (
    SELECT e.id 
    FROM employers e
    WHERE CAST(e.businessNo AS CHAR) = (
        SELECT CAST(ep.id AS CHAR) FROM employer_profiles ep WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @employer_user_id COLLATE utf8mb4_unicode_ci
    )
)
ORDER BY a.appliedAt DESC;

-- =============================================
-- 2. 전체 지원 내역 확인 (최근 10개)
-- =============================================
SELECT 
    '전체 지원 내역' as check_type,
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title as job_title,
    j.employerId
FROM applications a
INNER JOIN jobs j ON a.jobId = j.id
ORDER BY a.appliedAt DESC
LIMIT 10;

-- =============================================
-- 3. 문제 진단: 연결이 끊어진 부분 확인
-- =============================================

-- 3-1. employer_profiles와 employers 연결 확인
SELECT 
    '문제: 프로필-고용주 연결' as problem,
    COUNT(*) as count
FROM employer_profiles ep
WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @employer_user_id COLLATE utf8mb4_unicode_ci
  AND NOT EXISTS (
      SELECT 1 FROM employers e WHERE CAST(e.businessNo AS CHAR) = CAST(ep.id AS CHAR)
  );

-- 3-2. jobs.employerId 연결 확인 (store_id 기반)
SELECT 
    '문제: 공고-고용주 연결' as problem,
    j.id as job_id,
    j.title,
    j.employerId,
    j.store_id
FROM jobs j
WHERE j.store_id IN (
    SELECT s.id 
    FROM stores s
    WHERE s.user_id COLLATE utf8mb4_unicode_ci = @employer_user_id COLLATE utf8mb4_unicode_ci
)
  AND (j.employerId IS NULL OR j.employerId = '');

-- 3-3. 지원 내역과 공고 연결 확인
SELECT 
    '문제: 지원-공고 연결' as problem,
    COUNT(*) as count
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
WHERE j.id IS NULL;

-- =============================================
-- 4. 최종 확인: 고용주별 요약
-- =============================================
SELECT 
    '최종 요약' as check_type,
    (SELECT COUNT(*) FROM employer_profiles WHERE user_id COLLATE utf8mb4_unicode_ci = @employer_user_id COLLATE utf8mb4_unicode_ci) as profile_count,
    (SELECT COUNT(*) FROM employers e 
     WHERE CAST(e.businessNo AS CHAR) = (
         SELECT CAST(ep.id AS CHAR) FROM employer_profiles ep WHERE ep.user_id COLLATE utf8mb4_unicode_ci = @employer_user_id COLLATE utf8mb4_unicode_ci
     )) as employer_count,
    (SELECT COUNT(*) FROM jobs j 
     INNER JOIN stores s ON j.store_id = s.id 
     WHERE s.user_id COLLATE utf8mb4_unicode_ci = @employer_user_id COLLATE utf8mb4_unicode_ci) as job_count,
    (SELECT COUNT(*) FROM applications a 
     INNER JOIN jobs j ON a.jobId = j.id 
     INNER JOIN stores s ON j.store_id = s.id 
     WHERE s.user_id COLLATE utf8mb4_unicode_ci = @employer_user_id COLLATE utf8mb4_unicode_ci) as application_count;

