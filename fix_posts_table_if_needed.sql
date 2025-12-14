-- posts 테이블 구조 확인 및 수정 (필요한 경우)
USE team2_db;

-- 1. 먼저 현재 구조 확인
DESCRIBE posts;

-- 2. 만약 기존 테이블에 'content' 컬럼이 있고 'body'가 없다면:
-- ALTER TABLE posts CHANGE COLUMN content body TEXT NOT NULL;

-- 3. 만약 기존 테이블에 'author' 컬럼이 있고 'user_id'가 없다면:
-- ALTER TABLE posts CHANGE COLUMN author user_id VARCHAR(255) NOT NULL;

-- 4. 만약 'user_id' 컬럼이 없다면 추가:
-- ALTER TABLE posts ADD COLUMN user_id VARCHAR(255) NOT NULL AFTER id;

-- 5. 만약 'body' 컬럼이 없다면 추가:
-- ALTER TABLE posts ADD COLUMN body TEXT NOT NULL AFTER title;

-- 6. 인덱스 추가 (없는 경우):
-- CREATE INDEX idx_user_id ON posts(user_id);
-- CREATE INDEX idx_created_at ON posts(created_at);


