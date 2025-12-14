-- 전체 데이터 확인 (공고, 지원 내역, 고용주 연결)

USE team2_db;

-- ============================================
-- 1단계: 공고 데이터 확인
-- ============================================
SELECT 
    COUNT(*) as 전체_공고수,
    COUNT(DISTINCT employerId) as 고용주수
FROM jobs;

-- 공고 상세 확인
SELECT 
    j.id as 공고ID,
    j.title as 공고제목,
    j.employerId as 고용주_ID,
    j.status as 상태,
    j.createdAt as 생성일시
FROM jobs j
ORDER BY j.createdAt DESC
LIMIT 20;

-- ============================================
-- 2단계: 지원 내역 확인
-- ============================================
SELECT 
    COUNT(*) as 전체_지원수,
    COUNT(DISTINCT seekerId) as 구직자수,
    COUNT(DISTINCT jobId) as 공고수
FROM applications;

-- 지원 내역 상세 확인
SELECT 
    a.applicationId,
    a.seekerId as 구직자_user_id,
    a.jobId as 공고ID,
    a.status,
    a.appliedAt,
    j.title as 공고제목,
    j.employerId as 고용주_ID
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
ORDER BY a.appliedAt DESC
LIMIT 20;

-- ============================================
-- 3단계: 고용주 연결 확인
-- ============================================
SELECT 
    ep.user_id as 고용주_user_id,
    ep.id as profile_id,
    e.id as employer_id,
    e.businessNo as 사업자번호,
    COUNT(DISTINCT j.id) as 공고수,
    COUNT(a.applicationId) as 지원수
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
GROUP BY ep.user_id, ep.id, e.id, e.businessNo
ORDER BY 지원수 DESC, 공고수 DESC;

-- ============================================
-- 4단계: 구직자 정보 확인
-- ============================================
SELECT 
    COUNT(*) as 전체_구직자수
FROM jobseekers;

SELECT 
    js.id,
    js.name,
    js.nationality,
    COUNT(a.applicationId) as 지원수
FROM jobseekers js
LEFT JOIN applications a ON a.seekerId = js.id
GROUP BY js.id, js.name, js.nationality
ORDER BY 지원수 DESC
LIMIT 20;

-- ============================================
-- 5단계: 특정 고용주의 공고와 지원 내역 확인
-- ============================================
-- (user_id를 실제 고용주 user_id로 변경하세요)
SELECT 
    ep.user_id as 고용주_user_id,
    e.id as employer_id,
    j.id as 공고ID,
    j.title as 공고제목,
    j.status as 공고상태,
    j.createdAt as 공고생성일,
    COUNT(a.applicationId) as 지원수,
    GROUP_CONCAT(a.applicationId SEPARATOR ', ') as 지원서IDs
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
WHERE ep.user_id = '여기에_고용주_user_id_입력'
GROUP BY ep.user_id, e.id, j.id, j.title, j.status, j.createdAt
ORDER BY j.createdAt DESC;


