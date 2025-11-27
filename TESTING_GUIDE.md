# WorkFair 공고 등록 플로우 테스트 가이드

## 🎯 테스트 목표
고용주가 공고를 등록하면 데이터베이스에 저장되고, 구직자 페이지에 실시간으로 표시되는지 확인

---

## 📋 사전 준비

### 1. 데이터베이스 초기화

```bash
# MySQL에 접속
mysql -u root -p

# 스키마 생성
source schema.sql

# 테스트 데이터 생성
source test_data.sql
```

테스트 데이터가 생성되면 다음 계정들을 사용할 수 있습니다:
- **고용주 1**: `employer-test-001` (왕십리 스타벅스)
- **고용주 2**: `employer-test-002` (강남역 맛있는집)
- **구직자 1**: `seeker-test-001` (수정)
- **구직자 2**: `seeker-test-002` (알렉스)

### 2. 백엔드 서버 실행

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

서버가 실행되면 http://localhost:8000 에서 접근 가능합니다.

### 3. 프론트엔드 서버 실행

```bash
cd frontend
npm install  # 처음 한 번만 실행
npm run dev
```

프론트엔드가 실행되면 http://localhost:5173 에서 접근 가능합니다.

---

## ✅ 테스트 시나리오

### 시나리오 1: 고용주 - 공고 등록

1. **고용주 페이지 접속**
   - URL: http://localhost:5173/employer/home
   - 브라우저 개발자 도구(F12) 열기 → Console 탭 확인

2. **공고 관리 페이지로 이동**
   - 하단 네비게이션에서 "공고관리" 클릭
   - 또는 직접 이동: http://localhost:5173/employer/job-management

3. **새 공고 등록**
   - 우측 상단 "새 공고" 버튼 클릭
   - 공고 정보 입력:
     * 공고 제목: "테스트 카페 알바 구인"
     * 시급: 12000
     * 근무 요일: "주 2일"
     * 근무 시간: "6시간"
     * 근무 기간: "3개월 이상"
     * 업직종: "카페"
     * 언어 능력: "Lv.2 초급"
     * 근무 가능 비자: E-9, H-2 선택
     * 마감일: 미래 날짜 선택
     * 사장님 한마디: "친절하신 분 환영합니다"
   
4. **등록 버튼 클릭**
   - 성공 메시지 확인: "공고가 등록되었습니다"
   - Console에서 로그 확인: "공고 등록 성공"
   - 공고 관리 페이지로 자동 이동

5. **등록된 공고 확인**
   - 공고 관리 페이지에서 방금 등록한 공고가 목록에 표시되는지 확인
   - "전체 (N)" - 숫자가 증가했는지 확인
   - 공고 카드에 "모집중" 배지가 표시되는지 확인

### 시나리오 2: 구직자 - 등록된 공고 확인

1. **구직자 홈 페이지 접속**
   - URL: http://localhost:5173/jobseeker/home
   - 페이지 새로고침 (F5)

2. **AI 맞춤 공고 섹션 확인**
   - "수정님을 위한 AI 맞춤 공고" 섹션
   - 방금 등록한 공고가 카드 형태로 표시되는지 확인
   - 카드 정보 확인:
     * 공고 제목
     * 회사명
     * 위치
     * 시급
     * 언어 능력 태그
     * 비자 태그

3. **공고 목록 페이지 확인**
   - 하단 네비게이션에서 "공고" 탭 클릭
   - 또는 직접 이동: http://localhost:5173/jobs
   - 전체 공고 목록에서 새 공고 확인

4. **공고 상세 페이지 확인**
   - 공고 카드 클릭
   - 공고 상세 정보가 모두 표시되는지 확인:
     * 공고 제목
     * 시급
     * 근무 조건
     * 모집 조건
     * 사장님 한마디
     * 지원하기 버튼

---

## 🔍 검증 포인트

### 데이터베이스 레벨 검증

```sql
-- MySQL에서 확인
USE workfair;

-- 1. 새로 생성된 Job 확인
SELECT * FROM jobs ORDER BY createdAt DESC LIMIT 1;

-- 2. Job 상태 확인
SELECT id, title, status, views, applications FROM jobs 
WHERE status = 'active' 
ORDER BY createdAt DESC;

-- 3. Employer 정보 확인
SELECT e.*, ep.company_name 
FROM employers e
JOIN employer_profiles ep ON e.businessNo = ep.id
ORDER BY e.id DESC;
```

### API 레벨 검증

```bash
# 1. 공고 목록 조회
curl http://localhost:8000/jobs

# 2. 특정 공고 상세 조회 (job_id는 위에서 확인)
curl http://localhost:8000/jobs/{job_id}

# 3. 고용주 프로필 조회
curl http://localhost:8000/employer/profile/employer-test-001
```

### 프론트엔드 레벨 검증

브라우저 개발자 도구(F12) → Console 탭에서 확인:

```
✅ "공고 등록 성공"
✅ "Loaded employer profile"
✅ "Loaded N jobs from API"
✅ "Loaded job detail"
```

---

## 🐛 문제 해결

### 문제: "고용주 프로필을 찾을 수 없습니다"

**원인**: 테스트 데이터가 생성되지 않았거나 localStorage에 user_id가 없음

**해결**:
1. `test_data.sql` 다시 실행
2. 브라우저 Console에서 확인:
   ```javascript
   localStorage.getItem('signup_user_id')
   ```
3. 없으면 수동 설정:
   ```javascript
   localStorage.setItem('signup_user_id', 'employer-test-001')
   ```
4. 페이지 새로고침

### 문제: "데이터를 불러오는데 실패했습니다"

**원인**: 백엔드 서버가 실행되지 않았거나 데이터베이스 연결 실패

**해결**:
1. 백엔드 서버 로그 확인
2. MySQL 서버 실행 상태 확인
3. `backend/.env` 파일의 데이터베이스 설정 확인

### 문제: 공고가 표시되지 않음

**원인**: 데이터베이스에 공고가 없거나 status가 'active'가 아님

**해결**:
1. MySQL에서 확인:
   ```sql
   SELECT COUNT(*) FROM jobs WHERE status = 'active';
   ```
2. 공고가 없으면 고용주 페이지에서 새로 등록
3. API 응답 확인:
   ```bash
   curl http://localhost:8000/jobs
   ```

---

## 📊 성공 기준

✅ 고용주가 공고를 등록할 수 있다  
✅ 등록된 공고가 데이터베이스에 저장된다  
✅ 구직자 홈 페이지에 새 공고가 표시된다  
✅ 공고 목록 페이지에 새 공고가 표시된다  
✅ 공고 상세 페이지에서 모든 정보를 확인할 수 있다  
✅ 공고 관리 페이지에서 등록한 공고를 관리할 수 있다  

---

## 🎉 테스트 완료!

모든 검증 포인트를 통과했다면, 공고 등록 → DB 저장 → 구직자 페이지 표시 플로우가 정상 작동합니다!

---

## 📝 추가 테스트 시나리오

### 고급 시나리오 1: 여러 공고 등록
- 다양한 업종의 공고 3-5개 등록
- 구직자 페이지에서 모든 공고가 표시되는지 확인
- 필터 기능 테스트

### 고급 시나리오 2: 공고 상태 변경
- 공고 관리 페이지에서 "일시중지" 버튼 클릭
- 구직자 페이지에서 해당 공고가 사라지는지 확인
- 다시 활성화하면 표시되는지 확인

### 고급 시나리오 3: 공고 지원
- 구직자로 공고에 지원
- 고용주 페이지에서 지원자 수가 증가하는지 확인

