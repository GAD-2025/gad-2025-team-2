-- =====================================================
-- 전화번호 정규화 스크립트
-- =====================================================
-- 기존 데이터베이스의 모든 전화번호에서 하이픈(-) 제거
-- =====================================================

USE workfair;

-- signup_users 테이블의 전화번호 정규화
UPDATE signup_users
SET phone = REPLACE(phone, '-', '')
WHERE phone LIKE '%-%';

-- employer_profiles 테이블의 전화번호 정규화 (존재하는 경우)
UPDATE employer_profiles
SET phone = REPLACE(phone, '-', '')
WHERE phone LIKE '%-%';

-- job_seeker_profiles 테이블의 전화번호 정규화 (존재하는 경우)
UPDATE job_seeker_profiles
SET phone = REPLACE(phone, '-', '')
WHERE phone LIKE '%-%';

-- jobseekers 테이블의 전화번호 정규화 (레거시)
UPDATE jobseekers
SET phone = REPLACE(phone, '-', '')
WHERE phone LIKE '%-%';

-- employers 테이블의 연락처 정규화 (레거시)
UPDATE employers
SET contact = REPLACE(contact, '-', '')
WHERE contact LIKE '%-%';

-- 결과 확인
SELECT '✅ 전화번호 정규화 완료!' as status;

SELECT 
    'signup_users' as table_name,
    COUNT(*) as total,
    SUM(CASE WHEN phone LIKE '%-%' THEN 1 ELSE 0 END) as with_hyphen,
    SUM(CASE WHEN phone NOT LIKE '%-%' AND phone != '' THEN 1 ELSE 0 END) as without_hyphen
FROM signup_users
WHERE phone IS NOT NULL

UNION ALL

SELECT 
    'jobseekers' as table_name,
    COUNT(*) as total,
    SUM(CASE WHEN phone LIKE '%-%' THEN 1 ELSE 0 END) as with_hyphen,
    SUM(CASE WHEN phone NOT LIKE '%-%' AND phone != '' THEN 1 ELSE 0 END) as without_hyphen
FROM jobseekers
WHERE phone IS NOT NULL;

SELECT '📌 모든 전화번호는 이제 숫자만 포함합니다 (하이픈 없음)' as info;

