-- 전화번호 01059146247 계정의 비밀번호 재설정
USE team2_db;

-- 현재 계정 상태 확인
SELECT 
    id,
    role,
    name,
    phone,
    LENGTH(password) as password_length,
    SUBSTRING(password, 1, 20) as password_preview,
    created_at
FROM signup_users
WHERE phone = '01059146247'
  AND role = 'job_seeker';

-- 비밀번호 재설정
-- 아래에서 원하는 비밀번호의 해시를 선택하세요:

-- 1. 'password123' (테스트용)
-- 해시: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
-- UPDATE signup_users
-- SET password = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'
-- WHERE phone = '01059146247' AND role = 'job_seeker';

-- 2. '123456' (6자리 비밀번호)
-- 해시: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
-- UPDATE signup_users
-- SET password = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
-- WHERE phone = '01059146247' AND role = 'job_seeker';

-- 3. 다른 비밀번호를 사용하려면:
--    비밀번호_해시_생성기.py를 실행하여 해시를 생성한 후
--    아래 UPDATE 쿼리의 해시 값을 변경하세요
-- UPDATE signup_users
-- SET password = '생성된_해시_값'
-- WHERE phone = '01059146247' AND role = 'job_seeker';

-- 재설정 후 확인
-- SELECT 
--     id,
--     phone,
--     LENGTH(password) as password_length,
--     SUBSTRING(password, 1, 20) as password_preview
-- FROM signup_users
-- WHERE phone = '01059146247'
--   AND role = 'job_seeker';

