-- 지원자 목록이 안 보이는 문제 실시간 진단
USE team2_db;

-- =============================================
-- 1. 특정 고용주(user_id: employer-c33d319f)의 전체 연결 체인 확인
-- =============================================
SET @employer_user_id = 'employer-c33d319f';

SELECT 
    '고용주 연결 체인' as check_type,
    su.id as signup_user_id,
    su.name as employer_name,
    ep.id as profile_id,
    ep.company_name,
    e.id as employer_id,
    e.businessNo,
    COUNT(DISTINCT j.id) as job_count,
    COUNT(DISTINCT a.applicationId) as application_count
FROM signup_users su
LEFT JOIN employer_profiles ep ON ep.user_id COLLATE utf8mb4_unicode_ci = su.id COLLATE utf8mb4_unicode_ci
LEFT JOIN employers e ON e.businessNo COLLATE utf8mb4_unicode_ci = ep.id COLLATE utf8mb4_unicode_ci
LEFT JOIN jobs j ON j.employerId COLLATE utf8mb4_unicode_ci = e.id COLLATE utf8mb4_unicode_ci
LEFT JOIN applications a ON a.jobId COLLATE utf8mb4_unicode_ci = j.id COLLATE utf8mb4_unicode_ci
WHERE su.id = @employer_user_id
  AND su.role = 'employer'
GROUP BY su.id, su.name, ep.id, ep.company_name, e.id, e.businessNo;

-- =============================================
-- 2. 이 고용주의 공고 목록 확인
-- =============================================
SELECT 
    '공고 목록' as check_type,
    j.id as job_id,
    j.title,
    j.employerId,
    j.store_id,
    e.id as employer_exists,
    e.businessNo,
    COUNT(a.applicationId) as application_count
FROM jobs j
LEFT JOIN employers e ON j.employerId COLLATE utf8mb4_unicode_ci = e.id COLLATE utf8mb4_unicode_ci
LEFT JOIN applications a ON a.jobId COLLATE utf8mb4_unicode_ci = j.id COLLATE utf8mb4_unicode_ci
WHERE j.employerId IN (
    SELECT e.id 
    FROM employer_profiles ep
    INNER JOIN employers e ON e.businessNo COLLATE utf8mb4_unicode_ci = ep.id COLLATE utf8mb4_unicode_ci
    WHERE ep.user_id = @employer_user_id
)
GROUP BY j.id, j.title, j.employerId, j.store_id, e.id, e.businessNo
ORDER BY j.createdAt DESC;

-- =============================================
-- 3. 이 고용주의 공고에 대한 지원 내역 확인
-- =============================================
SELECT 
    '지원 내역' as check_type,
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title as job_title,
    j.employerId,
    js.name as jobseeker_name,
    su.name as signup_user_name
FROM applications a
INNER JOIN jobs j ON a.jobId COLLATE utf8mb4_unicode_ci = j.id COLLATE utf8mb4_unicode_ci
INNER JOIN employers e ON j.employerId COLLATE utf8mb4_unicode_ci = e.id COLLATE utf8mb4_unicode_ci
INNER JOIN employer_profiles ep ON e.businessNo COLLATE utf8mb4_unicode_ci = ep.id COLLATE utf8mb4_unicode_ci
LEFT JOIN jobseekers js ON js.id COLLATE utf8mb4_unicode_ci = a.seekerId COLLATE utf8mb4_unicode_ci
LEFT JOIN signup_users su ON su.id COLLATE utf8mb4_unicode_ci = a.seekerId COLLATE utf8mb4_unicode_ci
WHERE ep.user_id = @employer_user_id
ORDER BY a.appliedAt DESC;

-- =============================================
-- 4. 전체 지원 내역 확인 (최근 10개)
-- =============================================
SELECT 
    '전체 지원 내역' as check_type,
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title as job_title,
    j.employerId,
    e.businessNo,
    ep.user_id as employer_user_id
FROM applications a
INNER JOIN jobs j ON a.jobId COLLATE utf8mb4_unicode_ci = j.id COLLATE utf8mb4_unicode_ci
LEFT JOIN employers e ON j.employerId COLLATE utf8mb4_unicode_ci = e.id COLLATE utf8mb4_unicode_ci
LEFT JOIN employer_profiles ep ON e.businessNo COLLATE utf8mb4_unicode_ci = ep.id COLLATE utf8mb4_unicode_ci
ORDER BY a.appliedAt DESC
LIMIT 10;

-- =============================================
-- 5. 문제 진단: 연결이 끊어진 부분 확인
-- =============================================

-- 5-1. employer_profiles와 employers 연결 확인
SELECT 
    '문제: 프로필-고용주 연결' as problem,
    COUNT(*) as count
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo COLLATE utf8mb4_unicode_ci = ep.id COLLATE utf8mb4_unicode_ci
WHERE ep.user_id = @employer_user_id
  AND e.id IS NULL;

-- 5-2. jobs.employerId 연결 확인
SELECT 
    '문제: 공고-고용주 연결' as problem,
    COUNT(*) as count
FROM jobs j
LEFT JOIN employers e ON j.employerId COLLATE utf8mb4_unicode_ci = e.id COLLATE utf8mb4_unicode_ci
WHERE j.store_id IN (
    SELECT s.id 
    FROM stores s
    WHERE s.user_id = @employer_user_id
)
  AND (j.employerId IS NULL OR e.id IS NULL);

-- 5-3. 지원 내역과 공고 연결 확인
SELECT 
    '문제: 지원-공고 연결' as problem,
    COUNT(*) as count
FROM applications a
LEFT JOIN jobs j ON a.jobId COLLATE utf8mb4_unicode_ci = j.id COLLATE utf8mb4_unicode_ci
WHERE j.id IS NULL;

