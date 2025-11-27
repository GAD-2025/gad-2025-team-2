-- 사용자 계정 확인 스크립트
USE workfair;

-- 1. 모든 고용주 계정 확인
SELECT 
    '=== 고용주 계정 ===' as info;
SELECT 
    id,
    role,
    name,
    email,
    phone,
    CASE WHEN password IS NULL THEN '❌ 없음' ELSE '✅ 있음' END as password_status,
    LEFT(password, 20) as password_preview,
    created_at
FROM signup_users 
WHERE role = 'employer';

-- 2. 모든 구직자 계정 확인
SELECT 
    '=== 구직자 계정 ===' as info;
SELECT 
    id,
    role,
    name,
    email,
    phone,
    CASE WHEN password IS NULL THEN '❌ 없음' ELSE '✅ 있음' END as password_status,
    LEFT(password, 20) as password_preview,
    created_at
FROM signup_users 
WHERE role = 'job_seeker'
LIMIT 10;

-- 3. 특정 이메일로 고용주 찾기
SELECT 
    '=== employer1@test.com 검색 ===' as info;
SELECT 
    id,
    role,
    name,
    email,
    password,
    created_at
FROM signup_users 
WHERE email = 'employer1@test.com' AND role = 'employer';

-- 4. 비밀번호 해시 확인 (123456의 SHA256)
SELECT 
    '=== 비밀번호 해시 비교 ===' as info;
SELECT 
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' as expected_hash,
    password as actual_hash,
    CASE 
        WHEN password = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' 
        THEN '✅ 일치' 
        ELSE '❌ 불일치' 
    END as match_status
FROM signup_users 
WHERE email = 'employer1@test.com';

-- 5. 통계
SELECT 
    '=== 통계 ===' as info;
SELECT 
    role,
    COUNT(*) as count,
    SUM(CASE WHEN password IS NOT NULL THEN 1 ELSE 0 END) as with_password,
    SUM(CASE WHEN password IS NULL THEN 1 ELSE 0 END) as without_password
FROM signup_users 
GROUP BY role;

