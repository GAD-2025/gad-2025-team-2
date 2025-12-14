-- Posts 테이블 CREATE 문
-- MySQL Workbench에서 실행

-- 데이터베이스 선택
USE team2_db;

-- 테이블 생성
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테스트 데이터 삽입 (선택사항)
INSERT INTO posts (id, user_id, title, body, created_at) VALUES
('post-001', 'employer-test-001', '첫 번째 게시글', '이것은 첫 번째 게시글의 내용입니다.', NOW()),
('post-002', 'employer-test-001', '두 번째 게시글', '이것은 두 번째 게시글의 내용입니다.', NOW()),
('post-003', 'employer-test-002', '세 번째 게시글', '이것은 세 번째 게시글의 내용입니다.', NOW())
ON DUPLICATE KEY UPDATE title=title;
