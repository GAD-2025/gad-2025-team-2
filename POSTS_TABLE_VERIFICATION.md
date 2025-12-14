# Posts 테이블 검증 및 문제 해결

## ✅ 확인 사항

### 1. MySQL 테이블 생성 확인
다음 SQL을 실행하여 테이블이 제대로 생성되었는지 확인하세요:

```sql
USE team2_db;

-- 테이블 존재 확인
SHOW TABLES LIKE 'posts';

-- 테이블 구조 확인
DESCRIBE posts;

-- 또는
SHOW CREATE TABLE posts;
```

### 2. 테이블이 없다면 다시 생성
```sql
USE team2_db;

DROP TABLE IF EXISTS posts;

CREATE TABLE posts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. 테스트 데이터 삽입
```sql
USE team2_db;

INSERT INTO posts (id, user_id, title, body, created_at) VALUES
('post-1', 'user-1', '첫 번째 게시글', '이것은 첫 번째 게시글입니다.', NOW()),
('post-2', 'user-2', '두 번째 게시글', '이것은 두 번째 게시글입니다.', NOW());
```

### 4. 데이터 확인
```sql
USE team2_db;

SELECT * FROM posts;
```

## 🔧 백엔드 코드 수정 사항

### 1. 에러 핸들링 추가
- `get_all_posts` 함수에 try-catch 블록 추가
- 테이블이 없거나 에러가 발생해도 빈 배열 반환하여 500 에러 방지
- 상세한 에러 로깅 추가

### 2. 백엔드 서버 재시작
백엔드 서버를 재시작하여 변경사항을 적용하세요.

## 🧪 테스트 방법

1. **MySQL에서 테이블 확인**:
   ```sql
   USE team2_db;
   SHOW TABLES LIKE 'posts';
   DESCRIBE posts;
   ```

2. **백엔드 API 직접 테스트**:
   ```bash
   curl http://localhost:8000/api/posts
   ```
   
   또는 브라우저에서:
   ```
   http://localhost:8000/api/posts
   ```

3. **프론트엔드에서 테스트**:
   - `/posts` 경로로 접속
   - 브라우저 콘솔에서 에러 확인
   - 백엔드 터미널에서 로그 확인

## 📝 가능한 문제들

1. **테이블이 생성되지 않음**:
   - MySQL Workbench에서 `SHOW TABLES LIKE 'posts';` 실행
   - 테이블이 없다면 CREATE 문 다시 실행

2. **데이터베이스 연결 문제**:
   - 백엔드 `.env` 파일에서 데이터베이스 연결 정보 확인
   - MySQL 서버가 실행 중인지 확인

3. **필드 타입 불일치**:
   - MySQL의 `DATETIME`과 Python의 `datetime` 호환성 확인
   - 백엔드 모델의 `created_at` 필드 타입 확인

4. **권한 문제**:
   - MySQL 사용자에게 `team2_db` 데이터베이스 접근 권한이 있는지 확인

## ✅ 해결 방법

1. MySQL에서 테이블 생성 확인
2. 백엔드 서버 재시작
3. 프론트엔드에서 `/posts` 접속하여 테스트
4. 에러가 발생하면 백엔드 로그 확인

**백엔드 코드는 이미 수정되었습니다. MySQL에서 테이블을 확인하고 다시 테스트해보세요!** 🎉

