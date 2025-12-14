# 문제 해결 가이드

## 🔐 로그인 문제 해결

### 1. 백엔드 서버 확인
백엔드 서버가 실행 중인지 확인하세요:

1. **백엔드 서버 실행 확인:**
   - `start-backend.bat` 파일을 더블클릭하여 실행
   - 또는 터미널에서:
     ```bash
     cd backend
     venv\Scripts\activate
     uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
     ```

2. **서버 상태 확인:**
   - 브라우저에서 http://localhost:8000/docs 접속
   - API 문서가 보이면 서버가 정상 실행 중입니다

3. **로그인 API 테스트:**
   - http://localhost:8000/docs 접속
   - `/auth/signin/new` 엔드포인트 찾기
   - "Try it out" 클릭하여 테스트

### 2. 프론트엔드에서 확인
브라우저 개발자 도구(F12)를 열고:

1. **Console 탭 확인:**
   - 로그인 시도 시 에러 메시지 확인
   - `🔐 로그인 시도:` 로그 확인
   - `❌ 로그인 실패:` 에러 확인

2. **Network 탭 확인:**
   - 로그인 버튼 클릭 시 `/auth/signin/new` 요청 확인
   - 요청이 실패하면 상태 코드 확인 (401, 500 등)

### 3. 일반적인 로그인 오류

**"계정을 찾을 수 없습니다" (401):**
- 이메일/전화번호가 정확한지 확인
- 구직자는 전화번호, 고용주는 이메일 사용

**"비밀번호가 일치하지 않습니다" (401):**
- 비밀번호 확인
- 대소문자 구분 확인

**"CORS 오류":**
- 백엔드 서버가 실행 중인지 확인
- 프론트엔드 `.env` 파일에 `VITE_API_BASE_URL=http://localhost:8000` 확인

## 💰 주급/월급 표시 문제 해결

### 1. 데이터베이스 확인
기존 공고 데이터에 `wage_type`이 없는 경우:

```sql
USE team2_db;

-- 기존 공고에 wage_type이 없는지 확인
SELECT id, title, wage, wage_type FROM jobs LIMIT 10;

-- wage_type이 NULL이거나 없는 경우 기본값 설정
UPDATE jobs 
SET wage_type = 'hourly' 
WHERE wage_type IS NULL OR wage_type = '';
```

### 2. 백엔드 서버 재시작
데이터베이스 수정 후 백엔드 서버를 재시작하세요:

1. 백엔드 서버 종료 (Ctrl+C)
2. `start-backend.bat` 다시 실행

### 3. 새 공고 등록 테스트
1. 고용주로 로그인
2. 공고 등록 페이지 접속
3. 주급 또는 월급 선택
4. 공고 등록
5. 구직자 화면에서 확인

### 4. 브라우저 캐시 삭제
변경사항이 반영되지 않으면:

1. 브라우저 개발자 도구 열기 (F12)
2. Network 탭에서 "Disable cache" 체크
3. 페이지 새로고침 (Ctrl+Shift+R)

## 🔧 빠른 확인 체크리스트

- [ ] 백엔드 서버 실행 중인가? (http://localhost:8000/docs 접속 확인)
- [ ] 프론트엔드 서버 실행 중인가? (http://localhost:5173 접속 확인)
- [ ] `.env` 파일이 올바르게 설정되었는가?
- [ ] 데이터베이스에 `wage_type` 컬럼이 추가되었는가?
- [ ] 기존 공고 데이터에 `wage_type` 값이 설정되었는가?
- [ ] 브라우저 콘솔에 에러가 없는가?

## 📞 추가 도움이 필요한 경우

문제가 계속되면 다음 정보를 확인하세요:

1. 브라우저 콘솔 에러 메시지
2. Network 탭의 실패한 요청 상태 코드
3. 백엔드 서버 로그 메시지


