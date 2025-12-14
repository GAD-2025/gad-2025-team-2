-- 구직자 지원 생성 확인 SQL

USE team2_db;

-- ============================================
-- 1단계: 최근 지원 내역 확인
-- ============================================
SELECT 
    a.applicationId,
    a.seekerId as 구직자_user_id,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title as 공고제목,
    j.employerId
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
ORDER BY a.appliedAt DESC
LIMIT 20;

-- ============================================
-- 2단계: 구직자 정보 확인
-- ============================================
-- 특정 구직자의 정보 확인 (seekerId를 실제 값으로 변경)
SELECT 
    js.id as jobseeker_id,
    js.name,
    js.nationality,
    js.phone,
    js.languageLevel,
    js.visaType,
    js.availability
FROM jobseekers js
WHERE js.id = '여기에_구직자_user_id_입력';

-- ============================================
-- 3단계: signup_users 확인
-- ============================================
SELECT 
    su.id as user_id,
    su.name,
    su.role,
    su.nationality_code,
    su.phone
FROM signup_users su
WHERE su.role = 'jobseeker'
ORDER BY su.id DESC
LIMIT 20;

-- ============================================
-- 4단계: job_seeker_profiles 확인
-- ============================================
SELECT 
    jsp.user_id,
    jsp.name,
    jsp.nationality,
    jsp.phone,
    jsp.language_level,
    jsp.visa_type,
    jsp.availability
FROM job_seeker_profiles jsp
ORDER BY jsp.user_id DESC
LIMIT 20;

-- ============================================
-- 5단계: 지원 내역이 없는 구직자 확인
-- ============================================
-- job_seeker_profiles는 있는데 applications가 없는 경우
SELECT 
    jsp.user_id,
    jsp.name,
    COUNT(a.applicationId) as 지원수
FROM job_seeker_profiles jsp
LEFT JOIN applications a ON a.seekerId = jsp.user_id
GROUP BY jsp.user_id, jsp.name
HAVING 지원수 = 0
ORDER BY jsp.user_id DESC;


