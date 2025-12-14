-- 고용주가 지원자를 볼 수 없는 문제 진단 SQL
USE team2_db;

-- =============================================
-- 1. 전체 지원 내역 확인
-- =============================================
SELECT 
    '전체 지원 내역' as check_type,
    COUNT(*) as count
FROM applications;

-- =============================================
-- 2. 지원 내역과 공고 연결 확인
-- =============================================
SELECT 
    '지원-공고 연결' as check_type,
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    j.id as job_exists,
    j.employerId,
    j.title as job_title
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
ORDER BY a.appliedAt DESC
LIMIT 20;

-- =============================================
-- 3. 공고와 고용주 연결 확인
-- =============================================
SELECT 
    '공고-고용주 연결' as check_type,
    j.id as job_id,
    j.title,
    j.employerId,
    e.id as employer_exists,
    e.businessNo,
    COUNT(a.applicationId) as application_count
FROM jobs j
LEFT JOIN employers e ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
GROUP BY j.id, j.title, j.employerId, e.id, e.businessNo
ORDER BY application_count DESC
LIMIT 20;

-- =============================================
-- 4. 고용주 프로필과 고용주 연결 확인
-- =============================================
SELECT 
    '고용주 프로필-고용주 연결' as check_type,
    ep.id as profile_id,
    ep.user_id as employer_user_id,
    ep.company_name,
    e.id as employer_id,
    e.businessNo,
    COUNT(j.id) as job_count,
    COUNT(a.applicationId) as application_count
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
GROUP BY ep.id, ep.user_id, ep.company_name, e.id, e.businessNo
ORDER BY application_count DESC;

-- =============================================
-- 5. 특정 고용주의 전체 연결 체인 확인
-- =============================================
-- 아래 user_id를 실제 고용주 user_id로 변경하세요
SET @employer_user_id = 'employer-xxxxx';  -- 여기를 변경하세요

SELECT 
    '고용주 전체 연결 체인' as check_type,
    su.id as signup_user_id,
    su.name as employer_name,
    ep.id as profile_id,
    ep.company_name,
    e.id as employer_id,
    e.businessNo,
    COUNT(DISTINCT j.id) as job_count,
    COUNT(DISTINCT a.applicationId) as application_count
FROM signup_users su
LEFT JOIN employer_profiles ep ON ep.user_id = su.id
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
WHERE su.id = @employer_user_id
  AND su.role = 'employer'
GROUP BY su.id, su.name, ep.id, ep.company_name, e.id, e.businessNo;

-- =============================================
-- 6. 지원 내역과 구직자 정보 연결 확인
-- =============================================
SELECT 
    '지원-구직자 연결' as check_type,
    a.applicationId,
    a.seekerId,
    js.id as jobseeker_exists,
    js.name as jobseeker_name,
    su.id as signup_user_id,
    su.name as signup_user_name
FROM applications a
LEFT JOIN jobseekers js ON js.id = a.seekerId
LEFT JOIN signup_users su ON su.id = a.seekerId
ORDER BY a.appliedAt DESC
LIMIT 20;

-- =============================================
-- 7. 문제 진단: 누락된 연결 확인
-- =============================================

-- 7-1. 지원 내역은 있지만 공고가 없는 경우
SELECT 
    '문제: 지원 내역에 공고 없음' as problem,
    COUNT(*) as count
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
WHERE j.id IS NULL;

-- 7-2. 공고는 있지만 고용주가 없는 경우
SELECT 
    '문제: 공고에 고용주 없음' as problem,
    COUNT(*) as count
FROM jobs j
LEFT JOIN employers e ON j.employerId = e.id
WHERE e.id IS NULL;

-- 7-3. 고용주 프로필은 있지만 고용주 레코드가 없는 경우
SELECT 
    '문제: 프로필에 고용주 레코드 없음' as problem,
    COUNT(*) as count
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
WHERE e.id IS NULL;

-- 7-4. 지원 내역은 있지만 구직자 정보가 없는 경우
SELECT 
    '문제: 지원 내역에 구직자 정보 없음' as problem,
    COUNT(*) as count
FROM applications a
LEFT JOIN jobseekers js ON js.id = a.seekerId
WHERE js.id IS NULL;

-- =============================================
-- 8. 최근 지원 내역 상세 확인
-- =============================================
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title as job_title,
    j.employerId,
    e.businessNo,
    ep.user_id as employer_user_id,
    js.name as jobseeker_name,
    su.name as signup_user_name
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
LEFT JOIN employers e ON j.employerId = e.id
LEFT JOIN employer_profiles ep ON e.businessNo = ep.id
LEFT JOIN jobseekers js ON js.id = a.seekerId
LEFT JOIN signup_users su ON su.id = a.seekerId
ORDER BY a.appliedAt DESC
LIMIT 10;

