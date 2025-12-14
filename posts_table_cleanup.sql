-- Posts 테이블 정리 및 재생성

USE team2_db;

-- 1. 기존 테이블 삭제 (주의: 모든 데이터가 삭제됩니다)
DROP TABLE IF EXISTS posts;

-- 2. 테이블 재생성
CREATE TABLE posts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 테스트 데이터 삽입
INSERT INTO posts (id, user_id, title, body, created_at) VALUES
('post-001', 'employer-test-001', '첫 번째 게시글', '이것은 첫 번째 게시글의 내용입니다.', NOW()),
('post-002', 'employer-test-001', '두 번째 게시글', '이것은 두 번째 게시글의 내용입니다.', NOW()),
('post-003', 'employer-test-002', '세 번째 게시글', '이것은 세 번째 게시글의 내용입니다.', NOW());

-- 4. 데이터 확인
SELECT * FROM posts ORDER BY created_at DESC;

