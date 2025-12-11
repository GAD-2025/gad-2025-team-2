-- Posts 테이블 생성 SQL (team2_db 데이터베이스용)
-- 배포 서버 MySQL Workbench에서 실행하세요

-- ⚠️ 중요: 먼저 team2_db 데이터베이스를 선택하세요!
-- 방법 1: 왼쪽 Schemas 패널에서 team2_db를 더블클릭 (굵게 표시되면 선택됨)
-- 방법 2: 아래 USE 문 사용

USE team2_db;

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테스트 데이터 삽입 (선택사항)
INSERT INTO posts (user_id, title, body) VALUES
('employer-test-001', '첫 번째 게시글', '이것은 첫 번째 게시글의 내용입니다.'),
('employer-test-001', '두 번째 게시글', '이것은 두 번째 게시글의 내용입니다.'),
('employer-test-002', '세 번째 게시글', '이것은 세 번째 게시글의 내용입니다.');

-- 테이블 생성 확인
SELECT * FROM posts;

