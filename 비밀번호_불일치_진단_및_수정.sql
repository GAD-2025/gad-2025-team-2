-- 비밀번호 불일치 문제 진단 및 수정 스크립트
USE team2_db;

-- 1. 최근 가입한 구직자 계정의 비밀번호 상태 확인
SELECT 
    id,
    role,
    name,
    phone,
    password IS NOT NULL as has_password,
    LENGTH(password) as password_length,
    SUBSTRING(password, 1, 20) as password_preview,
    -- SHA256 해시는 항상 64자리여야 함
    CASE 
        WHEN LENGTH(password) = 64 THEN '정상 (64자리)'
        WHEN LENGTH(password) < 64 THEN '비정상 (짧음)'
        WHEN LENGTH(password) > 64 THEN '비정상 (김)'
        ELSE 'NULL'
    END as password_status,
    created_at
FROM signup_users
WHERE role = 'job_seeker'
ORDER BY created_at DESC
LIMIT 10;

-- 2. 특정 전화번호로 계정 찾기 및 비밀번호 확인
-- 아래 전화번호를 본인이 가입한 전화번호로 변경하세요
SET @target_phone = '01012345678';  -- 여기를 변경하세요

SELECT 
    id,
    role,
    name,
    phone,
    LENGTH(password) as password_length,
    password as full_password_hash,
    created_at
FROM signup_users
WHERE role = 'job_seeker'
  AND phone = @target_phone;

-- 3. 비밀번호 재설정 (특정 계정의 비밀번호를 'password123'으로 설정)
-- 주의: 아래 전화번호를 본인이 가입한 전화번호로 변경하세요
-- 주의: 이 스크립트는 비밀번호를 'password123'으로 재설정합니다
SET @reset_phone = '01012345678';  -- 여기를 변경하세요
SET @new_password_hash = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f';  -- password123의 SHA256 해시

-- 비밀번호 업데이트 (실행 전 확인 필요!)
-- UPDATE signup_users
-- SET password = @new_password_hash
-- WHERE role = 'job_seeker'
--   AND phone = @reset_phone;

-- 4. 비밀번호 해시 검증 (Python에서 생성한 해시와 비교)
-- 'password123'의 올바른 SHA256 해시: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
-- 다른 비밀번호의 해시를 생성하려면 Python에서:
-- import hashlib
-- print(hashlib.sha256('your_password'.encode('utf-8')).hexdigest())

-- 5. 모든 구직자 계정의 비밀번호 길이 통계
SELECT 
    LENGTH(password) as hash_length,
    COUNT(*) as count
FROM signup_users
WHERE role = 'job_seeker'
  AND password IS NOT NULL
GROUP BY LENGTH(password)
ORDER BY hash_length;

