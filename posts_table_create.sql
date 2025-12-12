-- Posts 테이블 CREATE 문
-- MySQL Workbench에서 실행

CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(255) PRIMARY KEY COMMENT '게시글 ID',
    user_id VARCHAR(255) NOT NULL COMMENT '작성자 ID (signup_users.id 또는 users.id)',
    title VARCHAR(500) NOT NULL COMMENT '제목',
    body TEXT NOT NULL COMMENT '본문 내용',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='게시글 테이블';
