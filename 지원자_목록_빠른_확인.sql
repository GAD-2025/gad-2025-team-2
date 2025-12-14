-- 지원자 목록 문제 빠른 확인
USE team2_db;

-- =============================================
-- 1. 프론트엔드에서 사용하는 userId 확인
-- =============================================
-- 콘솔 로그에 'employer-033d319f'가 보였으므로 확인
SET @user_id_from_frontend = 'employer-033d319f';

-- 1-1. 이 userId로 employer_profile 찾기
SELECT 
    '1-1. employer_profile 확인' as check_step,
    ep.id as profile_id,
    ep.user_id,
    ep.company_name
FROM employer_profiles ep
WHERE ep.user_id = @user_id_from_frontend;

-- 1-2. 이 profile.id로 employer 찾기
SELECT 
    '1-2. employer 확인' as check_step,
    e.id as employer_id,
    e.businessNo,
    e.shopName
FROM employers e
WHERE e.businessNo = (
    SELECT ep.id FROM employer_profiles ep WHERE ep.user_id = @user_id_from_frontend
);

-- 1-3. 이 employer의 공고 찾기
SELECT 
    '1-3. 공고 확인' as check_step,
    j.id as job_id,
    j.title,
    j.employerId
FROM jobs j
WHERE j.employerId = (
    SELECT e.id FROM employers e 
    WHERE e.businessNo = (
        SELECT ep.id FROM employer_profiles ep WHERE ep.user_id = @user_id_from_frontend
    )
);

-- 1-4. 이 공고들의 지원 내역 찾기
SELECT 
    '1-4. 지원 내역 확인' as check_step,
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title as job_title
FROM applications a
INNER JOIN jobs j ON a.jobId = j.id
WHERE j.employerId = (
    SELECT e.id FROM employers e 
    WHERE e.businessNo = (
        SELECT ep.id FROM employer_profiles ep WHERE ep.user_id = @user_id_from_frontend
    )
)
ORDER BY a.appliedAt DESC;

-- =============================================
-- 2. 다른 가능한 userId들도 확인
-- =============================================
-- 'employer-c33d319f'도 확인
SET @user_id_alt = 'employer-c33d319f';

SELECT 
    '2-1. 대체 userId로 employer_profile 확인' as check_step,
    ep.id as profile_id,
    ep.user_id,
    ep.company_name
FROM employer_profiles ep
WHERE ep.user_id = @user_id_alt;

-- =============================================
-- 3. 모든 employer user_id 확인
-- =============================================
SELECT 
    '3. 모든 employer user_id 목록' as check_step,
    ep.user_id,
    ep.id as profile_id,
    ep.company_name,
    (SELECT COUNT(*) FROM employers e WHERE e.businessNo = ep.id) as employer_exists,
    (SELECT COUNT(*) FROM jobs j 
     INNER JOIN employers e ON j.employerId = e.id 
     WHERE e.businessNo = ep.id) as job_count,
    (SELECT COUNT(*) FROM applications a 
     INNER JOIN jobs j ON a.jobId = j.id 
     INNER JOIN employers e ON j.employerId = e.id 
     WHERE e.businessNo = ep.id) as application_count
FROM employer_profiles ep
ORDER BY application_count DESC;

