-- employer_profiles에 연결된 employers 레코드가 없는 경우 자동 생성

USE team2_db;

-- ============================================
-- 1단계: 연결이 안 된 employer_profiles 확인
-- ============================================
SELECT 
    ep.user_id as 고용주_user_id,
    ep.id as profile_id,
    ep.company_name as 회사명,
    e.id as employer_id
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
WHERE e.id IS NULL;  -- employers 테이블에 연결이 안 된 것들

-- ============================================
-- 2단계: employers 레코드 자동 생성
-- ============================================
-- 주의: 이 쿼리는 기본값으로 employers 레코드를 생성합니다
-- 실제 데이터는 employer_profiles와 signup_users에서 가져옵니다

INSERT INTO employers (
    id,
    businessNo,
    shopName,
    industry,
    address,
    openHours,
    contact,
    minLanguageLevel,
    baseWage,
    schedule
)
SELECT 
    CONCAT('emp-', SUBSTRING(MD5(CONCAT(ep.id, ep.user_id)), 1, 8)) as id,
    ep.id as businessNo,
    ep.company_name as shopName,
    '기타' as industry,
    ep.address,
    '09:00-18:00' as openHours,
    COALESCE(su.email, '') as contact,
    '중급' as minLanguageLevel,
    10000 as baseWage,
    '주5일' as schedule
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN signup_users su ON su.id = ep.user_id
WHERE e.id IS NULL;  -- employers 테이블에 연결이 안 된 것들만 생성

-- ============================================
-- 3단계: 생성 결과 확인
-- ============================================
SELECT 
    ep.user_id as 고용주_user_id,
    ep.id as profile_id,
    ep.company_name as 회사명,
    e.id as employer_id,
    e.businessNo as 사업자번호,
    CASE 
        WHEN e.id IS NULL THEN '❌ 연결 안됨'
        ELSE '✅ 연결됨'
    END as 연결상태
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
ORDER BY 연결상태, ep.user_id;

