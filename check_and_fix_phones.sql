-- 전화번호 확인 및 수정 스크립트
USE workfair;

-- 1. 현재 전화번호 상태 확인
SELECT '=== 현재 전화번호 상태 ===' as info;
SELECT 
    id,
    name,
    phone,
    CASE WHEN phone LIKE '%-%' THEN '❌ 하이픈 있음' ELSE '✅ 정상' END as status
FROM signup_users
WHERE role = 'job_seeker' AND phone IS NOT NULL AND phone != ''
ORDER BY created_at DESC;

-- 2. 하이픈 제거
UPDATE signup_users SET phone = REPLACE(phone, '-', '') WHERE phone LIKE '%-%';
UPDATE jobseekers SET phone = REPLACE(phone, '-', '') WHERE phone LIKE '%-%';

-- 3. 수정 후 확인
SELECT '=== 수정 후 전화번호 ===' as info;
SELECT 
    id,
    name,
    phone,
    email,
    CASE WHEN password IS NOT NULL THEN '✅' ELSE '❌' END as has_pwd
FROM signup_users
WHERE role = 'job_seeker'
ORDER BY created_at DESC
LIMIT 10;

-- 4. 특정 전화번호로 검색 (테스트)
SELECT '=== 01055556666 검색 ===' as info;
SELECT id, name, phone, email, LEFT(password, 20) as pwd_preview
FROM signup_users
WHERE phone = '01055556666';

SELECT '=== 0105555666 검색 ===' as info;
SELECT id, name, phone, email, LEFT(password, 20) as pwd_preview
FROM signup_users
WHERE phone = '0105555666';

SELECT '✅ 완료!' as status;

