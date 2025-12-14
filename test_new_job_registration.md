# 새 공고 등록 테스트 가이드

## 🧪 테스트 절차

### 1. 브라우저 준비
1. http://localhost:5173/employer/job-create 접속
2. **개발자 도구 열기** (F12 또는 우클릭 → 검사)
3. **Console 탭** 선택

### 2. 매장 선택 (중요!)
1. 페이지에서 **매장 선택 드롭다운** 클릭
2. **기본 매장이 아닌 다른 매장 선택** (예: "가게 2", "가게 3" 등)
3. 선택한 매장 정보가 화면에 표시되는지 확인

### 3. 공고 정보 입력
1. 공고 제목 입력
2. 급여 정보 입력
3. 기타 필수 정보 입력

### 4. 공고 등록 및 로그 확인
1. **등록 버튼 클릭**
2. **콘솔에서 다음 로그 확인**:
   ```
   === 공고 등록 데이터 ===
   선택한 매장: {id: "...", store_name: "...", address: "..."}
   전송할 jobData: {
     shop_name: "...",
     shop_address: "...",
     store_id: "..."
   }
   ```

### 5. 백엔드 로그 확인
백엔드 서버 터미널에서 다음 로그 확인:
```
[DEBUG] create_job - 받은 매장 정보:
  shop_name: 매장명
  shop_address: 주소
  store_id: store-id
[DEBUG] create_job - 저장할 Job 객체:
  shop_name: 매장명
  shop_address: 주소
  store_id: store-id
```

### 6. 데이터베이스 확인
1. MySQL Workbench에서 다음 쿼리 실행:
   ```sql
   USE team2_db;
   
   SELECT 
       id,
       title,
       shop_name,
       shop_address,
       store_id,
       createdAt
   FROM jobs
   ORDER BY createdAt DESC
   LIMIT 1;
   ```
2. **가장 최근 공고**의 `shop_name`, `shop_address`, `store_id` 확인

## 📋 확인 체크리스트

- [ ] 브라우저 콘솔에 `=== 공고 등록 데이터 ===` 로그가 표시됨
- [ ] `선택한 매장:` 객체에 `store_name`, `address`, `id`가 있음
- [ ] `전송할 jobData:` 객체에 `shop_name`, `shop_address`, `store_id`가 있음
- [ ] 백엔드 로그에 `[DEBUG] create_job - 받은 매장 정보:` 로그가 표시됨
- [ ] 백엔드 로그에 `shop_name`, `shop_address`, `store_id` 값이 있음 (None이 아님)
- [ ] 데이터베이스에 새 공고의 `shop_name`, `shop_address`, `store_id`가 NULL이 아님

## 🔍 문제 진단

### 시나리오 1: 콘솔에 로그가 없음
**원인**: `console.log`가 실행되지 않음
**해결**: 페이지 새로고침 후 다시 시도

### 시나리오 2: `selectedStore`가 null
**원인**: 매장을 선택하지 않음
**해결**: 반드시 매장을 선택해야 함

### 시나리오 3: `jobData`에 `shop_name` 등이 없음
**원인**: `selectedStore`가 null이거나 필드가 없음
**해결**: 매장 선택 확인

### 시나리오 4: 백엔드 로그에 None이 표시됨
**원인**: 프론트엔드에서 데이터를 보내지 않음
**해결**: 콘솔 로그 확인, `jobData` 객체 확인

### 시나리오 5: 백엔드 로그에는 값이 있지만 DB에는 NULL
**원인**: 데이터베이스 저장 과정에서 문제
**해결**: `Job` 모델과 데이터베이스 테이블 구조 확인

## 📝 결과 공유

테스트 후 다음 정보를 알려주세요:
1. 브라우저 콘솔 로그 (특히 `jobData` 객체)
2. 백엔드 로그 (특히 `[DEBUG] create_job` 로그)
3. 데이터베이스 쿼리 결과 (새로 등록한 공고)

이 정보를 바탕으로 정확한 문제를 진단하겠습니다.

