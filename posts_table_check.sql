-- Posts 테이블 확인 및 테스트 데이터 삽입

USE team2_db;

-- 1. 테이블 구조 확인
DESCRIBE posts;

-- 2. 테이블에 데이터가 있는지 확인
SELECT * FROM posts;

-- 3. 테이블이 비어있으면 테스트 데이터 삽입
INSERT INTO posts (id, user_id, title, body, created_at) VALUES
('post-001', 'employer-test-001', '첫 번째 게시글', '이것은 첫 번째 게시글의 내용입니다.', NOW()),
('post-002', 'employer-test-001', '두 번째 게시글', '이것은 두 번째 게시글의 내용입니다.', NOW()),
('post-003', 'employer-test-002', '세 번째 게시글', '이것은 세 번째 게시글의 내용입니다.', NOW())
ON DUPLICATE KEY UPDATE title=title;

-- 4. 삽입 후 데이터 확인
SELECT * FROM posts ORDER BY created_at DESC;

