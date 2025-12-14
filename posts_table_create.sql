-- posts 테이블 CREATE 문
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(50) PRIMARY KEY COMMENT '게시글 ID',
    user_id VARCHAR(50) NOT NULL COMMENT '작성자 ID (signup_users.id 참조)',
    title VARCHAR(255) NOT NULL COMMENT '제목',
    body TEXT NOT NULL COMMENT '본문 내용',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES signup_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='게시글 테이블';
