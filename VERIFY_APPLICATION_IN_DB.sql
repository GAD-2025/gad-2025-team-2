-- 지원서가 실제로 데이터베이스에 저장되었는지 확인

USE team2_db;

-- ============================================
-- 1단계: 최근 지원 내역 확인 (가장 중요!)
-- ============================================
SELECT 
    a.applicationId,
    a.seekerId as 구직자_user_id,
    a.jobId as 공고ID,
    a.status as 상태,
    a.appliedAt as 지원일시,
    j.title as 공고제목,
    j.employerId as 고용주_ID
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
ORDER BY a.appliedAt DESC
LIMIT 20;

-- ============================================
-- 2단계: 특정 공고에 대한 지원 내역 확인
-- ============================================
-- (jobId를 실제 공고 ID로 변경하세요)
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title,
    j.employerId
FROM applications a
INNER JOIN jobs j ON a.jobId = j.id
WHERE a.jobId = '여기에_공고_ID_입력'
ORDER BY a.appliedAt DESC;

-- ============================================
-- 3단계: 고용주별 지원 내역 확인
-- ============================================
-- (employerId를 실제 고용주 ID로 변경하세요)
SELECT 
    a.applicationId,
    a.seekerId,
    a.jobId,
    a.status,
    a.appliedAt,
    j.title,
    j.employerId
FROM applications a
INNER JOIN jobs j ON a.jobId = j.id
WHERE j.employerId = '여기에_고용주_ID_입력'
ORDER BY a.appliedAt DESC;

-- ============================================
-- 4단계: 고용주 user_id로 지원 내역 확인 (채용탭 조회 로직)
-- ============================================
-- (user_id를 실제 고용주 user_id로 변경하세요)
SELECT 
    ep.user_id as 고용주_user_id,
    e.id as employer_id,
    j.id as job_id,
    j.title as 공고제목,
    a.applicationId,
    a.seekerId as 구직자_user_id,
    a.status,
    a.appliedAt
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
WHERE ep.user_id = '여기에_고용주_user_id_입력'
ORDER BY a.appliedAt DESC;

-- ============================================
-- 5단계: 지원 내역 개수 확인
-- ============================================
SELECT 
    COUNT(*) as 전체_지원수,
    COUNT(DISTINCT seekerId) as 구직자수,
    COUNT(DISTINCT jobId) as 공고수
FROM applications;


