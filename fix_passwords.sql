-- =====================================================
-- 비밀번호 수정 스크립트 (간단 버전)
-- =====================================================
-- 모든 사용자에게 기본 비밀번호 '123456' 설정
-- =====================================================

USE workfair;

-- SHA256('123456') = 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92

-- 비밀번호가 NULL이거나 빈 문자열인 모든 사용자 업데이트
UPDATE signup_users
SET password = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
WHERE password IS NULL OR password = '';

-- 결과 확인
SELECT '✅ 비밀번호 업데이트 완료!' as status;

SELECT 
    role,
    COUNT(*) as total,
    SUM(CASE WHEN password IS NOT NULL THEN 1 ELSE 0 END) as with_password,
    SUM(CASE WHEN password IS NULL THEN 1 ELSE 0 END) as without_password
FROM signup_users
GROUP BY role;

SELECT '📌 기본 비밀번호: 123456' as info;

