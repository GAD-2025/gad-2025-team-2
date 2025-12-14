-- 고용주가 지원자를 볼 수 없는 문제 수정 SQL
USE team2_db;

-- Safe Update Mode 일시적으로 비활성화 (UPDATE 문 실행을 위해 필요)
SET SQL_SAFE_UPDATES = 0;

-- =============================================
-- 1. jobs.employerId가 NULL인 공고 수정
-- =============================================
-- store_id를 통해 employerId를 찾아서 업데이트
UPDATE jobs j
INNER JOIN stores s ON j.store_id = s.id
INNER JOIN employer_profiles ep ON ep.user_id = s.user_id
INNER JOIN employers e ON e.businessNo = ep.id
SET j.employerId = e.id
WHERE j.employerId IS NULL OR j.employerId = '';

-- 확인
SELECT 
    '수정된 공고' as check_type,
    COUNT(*) as count
FROM jobs j
INNER JOIN stores s ON j.store_id = s.id
INNER JOIN employer_profiles ep ON ep.user_id = s.user_id
INNER JOIN employers e ON e.businessNo = ep.id
WHERE j.employerId = e.id;

-- =============================================
-- 2. employers 테이블에 없는 고용주 레코드 생성
-- =============================================
-- employer_profiles는 있지만 employers 레코드가 없는 경우
INSERT INTO employers (id, businessNo, shopName, industry, address, openHours, contact, media, minLanguageLevel, needVisa, baseWage, schedule)
SELECT 
    CONCAT('employer-', SUBSTRING(ep.id, 1, 12)) as id,
    ep.id as businessNo,
    COALESCE(ep.company_name, '회사명 없음') as shopName,
    '기타' as industry,
    COALESCE(ep.address, '') as address,
    '09:00-18:00' as openHours,
    COALESCE((SELECT email FROM signup_users WHERE id = ep.user_id), '') as contact,
    '[]' as media,
    'TOPIK 1급' as minLanguageLevel,
    '[]' as needVisa,
    10000 as baseWage,
    '09:00-18:00' as schedule
FROM employer_profiles ep
WHERE NOT EXISTS (
    SELECT 1 FROM employers e WHERE e.businessNo = ep.id
);

-- 확인
SELECT 
    '생성된 employers 레코드' as check_type,
    COUNT(*) as count
FROM employers e
INNER JOIN employer_profiles ep ON e.businessNo = ep.id;

-- =============================================
-- 3. jobs.employerId를 store_id 기반으로 재설정
-- =============================================
-- store_id가 있는 공고의 employerId를 올바르게 설정
UPDATE jobs j
INNER JOIN stores s ON j.store_id = s.id
INNER JOIN employer_profiles ep ON ep.user_id = s.user_id
INNER JOIN employers e ON e.businessNo = ep.id
SET j.employerId = e.id
WHERE j.store_id IS NOT NULL
  AND (j.employerId IS NULL OR j.employerId = '' OR j.employerId != e.id);

-- 확인
SELECT 
    j.id as job_id,
    j.title,
    j.store_id,
    j.employerId,
    e.id as employer_exists,
    e.businessNo,
    ep.user_id as employer_user_id
FROM jobs j
LEFT JOIN stores s ON j.store_id = s.id
LEFT JOIN employer_profiles ep ON ep.user_id = s.user_id
LEFT JOIN employers e ON e.businessNo = ep.id
WHERE j.store_id IS NOT NULL
ORDER BY j.createdAt DESC
LIMIT 20;

-- =============================================
-- 4. 최종 확인: 고용주별 지원 내역 확인
-- =============================================
-- 특정 고용주의 지원 내역이 제대로 조회되는지 확인
SELECT 
    ep.user_id as employer_user_id,
    su.name as employer_name,
    ep.company_name,
    e.id as employer_id,
    COUNT(DISTINCT j.id) as job_count,
    COUNT(DISTINCT a.applicationId) as application_count,
    GROUP_CONCAT(DISTINCT j.title SEPARATOR ', ') as job_titles
FROM employer_profiles ep
INNER JOIN signup_users su ON su.id = ep.user_id
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
WHERE su.role = 'employer'
GROUP BY ep.user_id, su.name, ep.company_name, e.id
ORDER BY application_count DESC;

-- =============================================
-- 5. 지원 내역 상세 확인 (최근 10개)
-- =============================================
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title as job_title,
    j.employerId,
    e.businessNo,
    ep.user_id as employer_user_id,
    js.name as jobseeker_name,
    su.name as signup_user_name
FROM applications a
INNER JOIN jobs j ON a.jobId = j.id
LEFT JOIN employers e ON j.employerId = e.id
LEFT JOIN employer_profiles ep ON e.businessNo = ep.id
LEFT JOIN jobseekers js ON js.id = a.seekerId
LEFT JOIN signup_users su ON su.id = a.seekerId
ORDER BY a.appliedAt DESC
LIMIT 10;

-- Safe Update Mode 다시 활성화
SET SQL_SAFE_UPDATES = 1;

