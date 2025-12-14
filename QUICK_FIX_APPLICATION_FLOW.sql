-- 빠른 문제 진단 및 해결 (단계별 실행)

USE team2_db;

-- ============================================
-- STEP 1: 고용주 user_id 찾기
-- ============================================
-- 이 쿼리 결과의 '고용주_user_id' 컬럼 값을 복사하세요
SELECT 
    ep.user_id as 고용주_user_id,
    ep.id as profile_id,
    e.id as employer_id,
    e.businessNo as 사업자번호
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
ORDER BY ep.user_id;

-- ============================================
-- STEP 2: 위에서 찾은 user_id로 지원 내역 확인
-- ============================================
-- 예시: user_id가 'user-abc123'인 경우
-- '여기에_고용주_user_id_입력' 부분을 실제 user_id로 바꾸세요!
SELECT 
    ep.user_id as 고용주_user_id,
    e.id as employer_id,
    j.id as job_id,
    j.title as 공고제목,
    a.applicationId as 지원서ID,
    a.seekerId as 구직자_user_id,
    a.status as 상태,
    a.appliedAt as 지원일시
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
WHERE ep.user_id = '여기에_고용주_user_id_입력'  -- ← 여기를 실제 user_id로 변경!
ORDER BY a.appliedAt DESC;

-- ============================================
-- STEP 3: 모든 고용주의 지원 내역 요약 (한눈에 보기)
-- ============================================
-- 이 쿼리로 어떤 고용주에게 몇 개의 지원이 왔는지 확인
SELECT 
    ep.user_id as 고용주_user_id,
    e.id as employer_id,
    COUNT(DISTINCT j.id) as 공고수,
    COUNT(a.applicationId) as 지원수,
    GROUP_CONCAT(DISTINCT j.title SEPARATOR ' | ') as 공고목록
FROM employer_profiles ep
LEFT JOIN employers e ON e.businessNo = ep.id
LEFT JOIN jobs j ON j.employerId = e.id
LEFT JOIN applications a ON a.jobId = j.id
GROUP BY ep.user_id, e.id
HAVING 지원수 > 0  -- 지원이 있는 고용주만 표시
ORDER BY 지원수 DESC;

-- ============================================
-- STEP 4: 연결 문제 진단
-- ============================================
-- 각 단계별로 데이터가 있는지 확인
SELECT 'employer_profiles' as 테이블, COUNT(*) as 개수 FROM employer_profiles
UNION ALL
SELECT 'employers', COUNT(*) FROM employers
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'applications', COUNT(*) FROM applications;

-- 연결 확인
SELECT 
    '연결1: employer_profiles → employers' as 연결단계,
    COUNT(*) as 연결된_개수
FROM employer_profiles ep
INNER JOIN employers e ON e.businessNo = ep.id

UNION ALL

SELECT 
    '연결2: employers → jobs',
    COUNT(*)
FROM employers e
INNER JOIN jobs j ON j.employerId = e.id

UNION ALL

SELECT 
    '연결3: jobs → applications',
    COUNT(*)
FROM jobs j
INNER JOIN applications a ON a.jobId = j.id

UNION ALL

SELECT 
    '연결4: 전체 체인 (employer_profiles → applications)',
    COUNT(*)
FROM employer_profiles ep
INNER JOIN employers e ON e.businessNo = ep.id
INNER JOIN jobs j ON j.employerId = e.id
INNER JOIN applications a ON a.jobId = j.id;

