# Posts 엔드포인트 문제 해결 가이드

## 🔍 문제 진단

### 1. MySQL에서 테이블 확인
다음 SQL을 MySQL Workbench에서 실행하세요:

```sql
USE team2_db;

-- 1. 테이블 존재 확인
SHOW TABLES LIKE 'posts';

-- 2. 테이블 구조 확인
DESCRIBE posts;

-- 3. 테이블 생성 문 확인
SHOW CREATE TABLE posts;
```

### 2. 테이블이 없다면 생성
```sql
USE team2_db;

-- 기존 테이블 삭제 (주의: 데이터가 모두 삭제됩니다)
DROP TABLE IF EXISTS posts;

-- 테이블 생성
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

## 🔧 백엔드 확인

### 1. 백엔드 서버 재시작
백엔드 서버를 재시작하여 변경사항을 적용하세요.

### 2. API 직접 테스트
브라우저에서 다음 URL을 열어보세요:
```
http://localhost:8000/api/posts
```

또는 터미널에서:
```bash
curl http://localhost:8000/api/posts
```

**예상 응답**:
```json
{
  "posts": [
    {
      "id": "post-1",
      "user_id": "user-1",
      "title": "첫 번째 게시글",
      "body": "이것은 첫 번째 게시글입니다.",
      "created_at": "2025-01-08T12:00:00"
    }
  ]
}
```

### 3. 백엔드 로그 확인
백엔드 터미널에서 다음과 같은 로그를 확인하세요:
- `[DEBUG] Found X posts` - 정상 작동
- `[ERROR] Failed to fetch posts: ...` - 에러 발생

## 🎨 프론트엔드 확인

### 1. 프론트엔드에서 접속
```
http://localhost:5173/posts
```

### 2. 브라우저 콘솔 확인
- F12를 눌러 개발자 도구 열기
- Console 탭에서 에러 메시지 확인
- Network 탭에서 `/api/posts` 요청 확인

## 📝 가능한 문제들 및 해결 방법

### 문제 1: 테이블이 생성되지 않음
**증상**: MySQL에서 `SHOW TABLES LIKE 'posts';` 실행 시 결과가 없음

**해결**:
1. 위의 CREATE TABLE 문을 다시 실행
2. `USE team2_db;`를 먼저 실행했는지 확인
3. MySQL 사용자 권한 확인

### 문제 2: 테이블은 있지만 데이터가 없음
**증상**: API는 작동하지만 빈 배열 반환 `{"posts": []}`

**해결**:
1. 위의 INSERT 문으로 테스트 데이터 삽입
2. `SELECT * FROM posts;`로 데이터 확인

### 문제 3: 백엔드 500 에러
**증상**: 브라우저 콘솔에서 `500 Internal Server Error` 표시

**해결**:
1. 백엔드 터미널에서 에러 로그 확인
2. 백엔드 서버 재시작
3. MySQL 연결 확인 (`.env` 파일)

### 문제 4: CORS 에러
**증상**: 브라우저 콘솔에서 CORS 관련 에러

**해결**:
1. 백엔드 `main.py`의 CORS 설정 확인
2. 프론트엔드가 `localhost:5173`에서 실행 중인지 확인

## ✅ 체크리스트

- [ ] MySQL에서 `posts` 테이블이 존재하는지 확인
- [ ] 테이블 구조가 올바른지 확인 (`DESCRIBE posts`)
- [ ] 테스트 데이터가 삽입되었는지 확인 (`SELECT * FROM posts`)
- [ ] 백엔드 서버가 실행 중인지 확인
- [ ] `http://localhost:8000/api/posts`에서 직접 테스트
- [ ] 프론트엔드에서 `/posts` 접속하여 테스트
- [ ] 브라우저 콘솔에서 에러 확인
- [ ] 백엔드 터미널에서 로그 확인

## 🆘 여전히 작동하지 않는다면

1. **정확한 에러 메시지 확인**:
   - 브라우저 콘솔의 에러 메시지
   - 백엔드 터미널의 에러 메시지
   - MySQL Workbench의 에러 메시지

2. **에러 메시지를 알려주세요**:
   - 정확한 에러 메시지를 복사하여 알려주시면 더 정확한 해결책을 제공할 수 있습니다.

**백엔드 코드는 이미 수정되었습니다. MySQL에서 테이블을 확인하고 다시 테스트해보세요!** 🎉

