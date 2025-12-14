-- employer_profiles와 employers 연결 문제 진단

USE team2_db;

-- ============================================
-- 문제 확인: 연결이 안 된 고용주들
-- ============================================
SELECT 
    ep.user_id as 고용주_user_id,
    ep.id as profile_id,
    ep.company_name as 회사명,
    e.id as employer_id,
    e.businessNo as employers_사업자번호,
    CASE 
        WHEN e.id IS NULL THEN '❌ 연결 안됨 - employers 테이블에 데이터 없음'
        WHEN e.businessNo != ep.id THEN '⚠️ 연결 불일치 - businessNo가 다름'
        ELSE '✅ 연결됨'
    END as 연결상태
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
ORDER BY 연결상태, ep.user_id;

-- ============================================
-- employers 테이블에 있는 모든 데이터 확인
-- ============================================
SELECT 
    e.id as employer_id,
    e.businessNo as 사업자번호,
    e.shopName as 가게명,
    COUNT(j.id) as 공고수,
    COUNT(a.applicationId) as 지원수
FROM employers e
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
GROUP BY e.id, e.businessNo, e.shopName
ORDER BY 지원수 DESC, 공고수 DESC;

-- ============================================
-- 연결이 안 된 employer_profiles 상세 확인
-- ============================================
SELECT 
    ep.user_id as 고용주_user_id,
    ep.id as profile_id,
    ep.company_name as 회사명,
    ep.business_type as 사업자유형,
    ep.business_license as 사업자등록증
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
WHERE e.id IS NULL;  -- employers 테이블에 연결이 안 된 것들

-- ============================================
-- 연결이 안 된 employers 확인
-- ============================================
SELECT 
    e.id as employer_id,
    e.businessNo as 사업자번호,
    e.shopName as 가게명,
    e.industry as 업종
FROM employers e
LEFT JOIN employer_profiles ep ON ep.id = e.businessNo
WHERE ep.id IS NULL;  -- employer_profiles 테이블에 연결이 안 된 것들

