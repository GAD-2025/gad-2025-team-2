-- 구직자 테스트 계정 생성 SQL
-- MySQL Workbench에서 실행

USE team2_db;

-- 비밀번호 해시 함수 (SHA256)
-- password123의 해시값: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f

-- 1. 테스트 구직자 계정 생성 (이미 있으면 업데이트)
INSERT INTO signup_users (id, role, name, phone, password, nationality_code, birthdate, gender, terms_tos_required, terms_privacy_required, created_at)
VALUES (
    'seeker-test-001',
    'job_seeker',
    '테스트 구직자',
    '01012345678',
    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',  -- password123 해시
    'KR',
    '2000-01-01',
    'male',
    TRUE,
    TRUE,
    NOW()
)
ON DUPLICATE KEY UPDATE
    phone = '01012345678',
    password = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
    name = '테스트 구직자';

-- 2. 구직자 프로필 생성 (없으면 생성)
INSERT INTO job_seeker_profiles (
    id,
    user_id,
    preferred_regions,
    preferred_jobs,
    work_available_dates,
    work_start_time,
    work_end_time,
    work_days_of_week,
    experience_sections,
    experience_skills,
    experience_introduction,
    visa_type,
    created_at,
    updated_at
)
SELECT 
    CONCAT('profile-', SUBSTRING(MD5(CONCAT('seeker-test-001', NOW())), 1, 8)),
    'seeker-test-001',
    '[]',
    '[]',
    '[]',
    '09:00',
    '18:00',
    '["월","화","수","목","금"]',
    '["skills","introduction"]',
    '{}',
    '테스트 구직자입니다.',
    'E-9',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM job_seeker_profiles WHERE user_id = 'seeker-test-001'
);

-- 3. 확인
SELECT 
    u.id,
    u.role,
    u.name,
    u.phone,
    u.password IS NOT NULL as has_password,
    p.id as profile_id
FROM signup_users u
LEFT JOIN job_seeker_profiles p ON u.id = p.user_id
WHERE u.phone = '01012345678' OR u.id = 'seeker-test-001';
