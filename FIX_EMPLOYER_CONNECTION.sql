-- employer_profiles와 employers 연결 문제 해결

USE team2_db;

-- ============================================
-- 1단계: 연결 문제 확인
-- ============================================
-- employer_profiles는 있는데 employers와 연결이 안 된 경우 확인
SELECT 
    ep.user_id as 고용주_user_id,
    ep.id as profile_id,
    e.id as employer_id,
    e.businessNo as 사업자번호,
    CASE 
        WHEN e.id IS NULL THEN '❌ 연결 안됨'
        ELSE '✅ 연결됨'
    END as 연결상태
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
ORDER BY 연결상태, ep.user_id;

-- ============================================
-- 2단계: employers 테이블에 있는 데이터 확인
-- ============================================
SELECT 
    e.id as employer_id,
    e.businessNo as 사업자번호,
    e.shopName as 가게명,
    COUNT(j.id) as 공고수
FROM employers e
LEFT JOIN jobs j ON j.employerId = e.id
GROUP BY e.id, e.businessNo, e.shopName
ORDER BY 공고수 DESC;

-- ============================================
-- 3단계: 연결이 안 된 employer_profiles 확인
-- ============================================
SELECT 
    ep.user_id as 고용주_user_id,
    ep.id as profile_id,
    ep.company_name as 회사명,
    ep.business_license as 사업자등록증
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
WHERE e.id IS NULL;  -- employers 테이블에 연결이 안 된 것들

-- ============================================
-- 4단계: 연결이 안 된 employers 확인
-- ============================================
SELECT 
    e.id as employer_id,
    e.businessNo as 사업자번호,
    e.shopName as 가게명
FROM employers e
LEFT JOIN employer_profiles ep ON ep.id = e.businessNo
WHERE ep.id IS NULL;  -- employer_profiles 테이블에 연결이 안 된 것들

-- ============================================
-- 5단계: 수동 연결 방법 (필요시)
-- ============================================
-- 만약 employer_profiles.id와 employers.businessNo가 다르다면
-- 아래 쿼리로 확인하고 수동으로 연결해야 할 수 있습니다

-- 예시: employer_profiles.id를 employers.businessNo로 업데이트
-- (실제로는 데이터를 확인한 후에 결정해야 함)
-- UPDATE employers e
-- INNER JOIN employer_profiles ep ON ep.user_id = '고용주_user_id'
-- SET e.businessNo = ep.id
-- WHERE e.businessNo != ep.id;

