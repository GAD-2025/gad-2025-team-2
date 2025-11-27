-- =====================================================
-- 기존 회원 정보 업데이트 스크립트
-- =====================================================
-- 1. 비밀번호가 NULL인 모든 사용자에게 기본 비밀번호 '123456' 설정
-- 2. 기타 NULL 필드들을 기본값으로 채우기
-- =====================================================

USE workfair;

-- 비밀번호 해시값 계산 (123456 -> SHA256)
-- SHA256('123456') = 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92

-- Step 1: 비밀번호가 NULL인 모든 사용자 업데이트
UPDATE signup_users
SET password = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
WHERE password IS NULL OR password = '';

-- Step 2: 구직자(job_seeker)의 NULL 필드 채우기
UPDATE signup_users
SET 
    gender = COALESCE(gender, 'male'),
    nationality_code = COALESCE(nationality_code, 'KR'),
    terms_tos_required = COALESCE(terms_tos_required, true),
    terms_privacy_required = COALESCE(terms_privacy_required, true),
    terms_sms_optional = COALESCE(terms_sms_optional, false),
    terms_marketing_optional = COALESCE(terms_marketing_optional, false)
WHERE role = 'job_seeker';

-- Step 3: 고용주(employer)의 NULL 필드 채우기
UPDATE signup_users
SET 
    terms_tos_required = COALESCE(terms_tos_required, true),
    terms_privacy_required = COALESCE(terms_privacy_required, true),
    terms_sms_optional = COALESCE(terms_sms_optional, false),
    terms_marketing_optional = COALESCE(terms_marketing_optional, false)
WHERE role = 'employer';

-- Step 4: employer_profiles의 NULL 필드 채우기
UPDATE employer_profiles
SET 
    business_type = COALESCE(business_type, '음식점'),
    industry = COALESCE(industry, '외식업'),
    shop_name = COALESCE(shop_name, '미등록 매장'),
    address = COALESCE(address, '서울 종로구'),
    phone = COALESCE(phone, '010-0000-0000'),
    business_number = COALESCE(business_number, '000-00-00000'),
    representative_name = COALESCE(representative_name, '미등록')
WHERE business_type IS NULL OR industry IS NULL OR shop_name IS NULL;

-- Step 5: job_seeker_profiles의 NULL 필드 채우기
UPDATE job_seeker_profiles
SET 
    gender = COALESCE(gender, 'male'),
    birthdate = COALESCE(birthdate, '1990-01-01'),
    nationality = COALESCE(nationality, 'KR'),
    phone = COALESCE(phone, '010-0000-0000'),
    address = COALESCE(address, '서울시'),
    visa_type = COALESCE(visa_type, 'E-9'),
    korean_level = COALESCE(korean_level, 'Lv.2 초급')
WHERE gender IS NULL OR birthdate IS NULL OR nationality IS NULL;

-- 결과 확인
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN password IS NOT NULL THEN 1 ELSE 0 END) as users_with_password,
    SUM(CASE WHEN password IS NULL THEN 1 ELSE 0 END) as users_without_password
FROM signup_users;

SELECT 
    role,
    COUNT(*) as count,
    SUM(CASE WHEN password IS NOT NULL THEN 1 ELSE 0 END) as with_password
FROM signup_users
GROUP BY role;

-- 업데이트 완료 메시지
SELECT '✅ 모든 사용자 정보가 업데이트되었습니다!' as status;
SELECT '📌 기본 비밀번호: 123456' as info;
SELECT '🔐 해시값: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' as hash;

