# 공고 관리 페이지 급여 타입 표시 수정

## ✅ 완료된 작업

### 프론트엔드 수정
- ✅ `JobManagement.tsx`에서 급여 타입을 `wage_type`에 따라 동적으로 표시하도록 수정
- ✅ 시급/주급/월급이 올바르게 표시됨

## 📋 데이터베이스 확인

### 기존 공고 데이터 확인

기존 공고에 `wage_type`이 제대로 저장되어 있는지 확인:

```sql
USE team2_db;

-- 공고의 wage_type 확인
SELECT id, title, wage, wage_type FROM jobs LIMIT 10;
```

### wage_type이 NULL이거나 없는 경우

기존 공고 데이터에 `wage_type`이 없거나 NULL인 경우 기본값 설정:

```sql
USE team2_db;

-- wage_type이 NULL이거나 빈 문자열인 경우 'hourly'로 설정
UPDATE jobs 
SET wage_type = 'hourly' 
WHERE wage_type IS NULL OR wage_type = '';
```

## 🔍 문제 해결

### 문제
공고 관리 페이지에서 항상 "시급"으로 표시됨

### 원인
- `JobManagement.tsx`에서 급여 타입이 하드코딩되어 있었음
- `wage_type` 필드를 사용하지 않음

### 해결
- `wage_type`에 따라 동적으로 "시급"/"주급"/"월급" 표시
- 기본값은 'hourly' (시급)

## 📊 데이터 필드

### `jobs` 테이블 필드

| 필드명 | 타입 | 설명 | 기본값 |
|--------|------|------|--------|
| `id` | VARCHAR(255) | 공고 ID (PK) | - |
| `wage` | INT | 급여 금액 | - |
| `wage_type` | VARCHAR(20) | 급여 타입 | 'hourly' |
| 기타 필드들... | - | - | - |

### `wage_type` 가능한 값

- `'hourly'` - 시급
- `'weekly'` - 주급
- `'monthly'` - 월급

## 🧪 테스트 방법

1. **새 공고 등록:**
   - 주급 또는 월급으로 공고 등록
   - 공고 관리 페이지에서 확인
   - 올바른 급여 타입이 표시되는지 확인

2. **기존 공고 확인:**
   - 공고 관리 페이지에서 기존 공고 확인
   - 시급/주급/월급이 올바르게 표시되는지 확인

## 📝 Posts API 정보

### GET /api/posts 엔드포인트

**이미 구현 완료:**
- 파일: `backend/app/routers/posts.py`
- 경로: `GET /api/posts`
- 응답 형식: `{ "posts": PostRead[] }`

### posts 테이블 CREATE 문

**이미 작성 완료:**
- 파일: `posts_table_create.sql`
- 필드: `id`, `user_id`, `title`, `body`, `created_at`

### React PostsPage

**이미 구현 완료:**
- 파일: `frontend/src/pages/PostsPage.tsx`
- `fetch`로 `GET /api/posts` 호출
- 게시글 목록 표시

## 🚀 다음 단계

1. **MySQL에서 확인:**
   ```sql
   USE team2_db;
   SELECT id, title, wage, wage_type FROM jobs LIMIT 10;
   ```

2. **필요시 업데이트:**
   ```sql
   UPDATE jobs 
   SET wage_type = 'hourly' 
   WHERE wage_type IS NULL OR wage_type = '';
   ```

3. **테스트:**
   - 새 공고 등록 (주급/월급)
   - 공고 관리 페이지에서 확인

모든 수정이 완료되었습니다! 🎉


