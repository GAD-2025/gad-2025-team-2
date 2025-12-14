-- 구직자 로그인 문제 진단 SQL
-- MySQL Workbench에서 실행

USE team2_db;

-- 1. 모든 구직자 계정 확인
SELECT 
    id,
    role,
    name,
    phone,
    email,
    password IS NOT NULL as has_password,
    LENGTH(password) as password_length,
    SUBSTRING(password, 1, 20) as password_preview,
    created_at
FROM signup_users
WHERE role = 'job_seeker'
ORDER BY created_at DESC
LIMIT 20;

-- 2. 특정 전화번호로 계정 찾기 (하이픈 포함/미포함 모두 확인)
-- 예: 010-1234-5678 또는 01012345678
SELECT 
    id,
    role,
    name,
    phone,
    LENGTH(phone) as phone_length,
    password IS NOT NULL as has_password,
    created_at
FROM signup_users
WHERE role = 'job_seeker'
  AND (
    phone = '01012345678' 
    OR phone = '010-1234-5678'
    OR phone LIKE '01012345678%'
    OR phone LIKE '010-1234-5678%'
  );

-- 3. 최근 가입한 구직자 계정 확인
SELECT 
    id,
    role,
    name,
    phone,
    password IS NOT NULL as has_password,
    created_at
FROM signup_users
WHERE role = 'job_seeker'
ORDER BY created_at DESC
LIMIT 5;

-- 4. 비밀번호가 없는 계정 확인
SELECT 
    id,
    role,
    name,
    phone,
    created_at
FROM signup_users
WHERE role = 'job_seeker'
  AND (password IS NULL OR password = '');

