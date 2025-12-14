-- posts 테이블 CREATE 문
-- id, user_id, title, body, created_at 필드 포함

USE team2_db;

-- posts 테이블이 이미 있는지 확인하고 없으면 생성
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL COMMENT '작성자 ID (signup_users.id 또는 users.id)',
    title VARCHAR(500) NOT NULL COMMENT '게시글 제목',
    body TEXT NOT NULL COMMENT '게시글 본문 내용',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='게시글 테이블';

-- 테이블 구조 확인
DESCRIBE posts;

