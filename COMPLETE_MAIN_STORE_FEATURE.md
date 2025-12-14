# 기본가게 설정 기능 완전 구현 완료

## ✅ 완료된 작업

### 1. 마이페이지 수정
- **MyPage.tsx**: 
  - 매장 클릭 시 선택 상태 관리 (`selectedStoreId`)
  - 기본가게가 아닌 매장 클릭 시 "기본가게로 등록", "가게 정보 수정" 버튼 표시
  - 기본가게로 등록 버튼 클릭 시 API 호출 및 매장 목록 새로고침
  - 기본가게 태그 UI 표시

### 2. 백엔드 API 추가
- **employer.py**: 
  - `PATCH /employer/stores/{user_id}/{store_id}/set-main` - 기본가게 설정
  - `PATCH /employer/stores/{user_id}/{store_id}` - 매장 정보 수정
  - 기본가게 설정 시 다른 모든 매장의 `is_main`을 `False`로 변경
  - 선택한 매장의 `is_main`을 `True`로 설정

### 3. 공고 등록 페이지 수정
- **JobCreate.tsx**: 
  - 매장 목록을 가져올 때 기본가게가 가장 위로 오도록 정렬
  - 백엔드에서 이미 정렬되지만, 프론트엔드에서도 추가 정렬 적용

### 4. 가게 정보 수정 페이지 생성
- **StoreEdit.tsx**: 새로 생성
  - 기존 매장 정보 로드
  - 매장 정보 수정 기능
  - 백엔드 API와 연동

### 5. 프론트엔드 API 클라이언트 수정
- **endpoints.ts**: 
  - `updateStore` 함수 추가
  - 매장 수정 API 호출

### 6. 라우터 수정
- **router.tsx**: 
  - `/employer/store-edit/:storeId` 경로 추가

## 📋 데이터베이스 필드

### `stores` 테이블에 필요한 필드 (이미 존재)
- `is_main` BOOLEAN NOT NULL DEFAULT FALSE - 기본가게 여부
- `user_id` VARCHAR(255) NOT NULL - 고용주 사용자 ID
- `store_name` VARCHAR(255) NOT NULL - 매장명
- `address` VARCHAR(500) NOT NULL - 주소
- `address_detail` VARCHAR(500) NULL - 상세 주소
- `phone` VARCHAR(50) NULL - 전화번호
- `industry` VARCHAR(100) NULL - 업종
- `business_license` VARCHAR(255) NULL - 사업자 등록증
- `management_role` VARCHAR(50) NULL - 관리 역할
- `store_type` VARCHAR(50) NULL - 매장 유형
- `created_at` DATETIME NOT NULL - 생성일시
- `updated_at` DATETIME NOT NULL - 수정일시

### 데이터베이스 수정 필요 여부
**필요 없음** - 모든 필드가 이미 존재하며, 추가 수정이 필요하지 않습니다.

## 🧪 테스트 방법

### 1. 마이페이지에서 기본가게 설정
1. http://localhost:5173/mypage 접속
2. "나의 매장" 섹션에서 기본가게가 아닌 매장 클릭
3. "기본가게로 등록" 및 "가게 정보 수정" 버튼이 표시되는지 확인
4. "기본가게로 등록" 버튼 클릭
5. 해당 매장에 "기본가게" 태그가 붙는지 확인
6. 이전 기본가게의 "기본가게" 태그가 제거되는지 확인

### 2. 가게 정보 수정
1. 마이페이지에서 기본가게가 아닌 매장 클릭
2. "가게 정보 수정" 버튼 클릭
3. 가게 정보 수정 페이지에서 정보 수정
4. 수정 완료 후 마이페이지로 돌아가서 변경사항 확인

### 3. 공고 등록 페이지에서 기본가게 확인
1. http://localhost:5173/employer/job-create 접속
2. 매장 선택 드롭다운 확인
3. 기본가게가 가장 위에 표시되는지 확인
4. 기본가게가 자동으로 선택되어 있는지 확인

### 4. 기본가게 변경 후 공고 등록
1. 마이페이지에서 다른 매장을 기본가게로 설정
2. 공고 등록 페이지로 이동
3. 새로 설정한 기본가게가 가장 위에 표시되고 자동 선택되는지 확인

## 📝 참고사항

- 기본가게는 하나만 설정 가능합니다.
- 기본가게를 변경하면 이전 기본가게의 `is_main`이 자동으로 `False`로 변경됩니다.
- 백엔드에서 매장 목록을 가져올 때 `order_by(Store.is_main.desc(), Store.created_at)`로 정렬하여 기본가게가 항상 첫 번째로 옵니다.
- 가게 정보 수정 시 `is_main` 필드는 수정할 수 없으며, 별도의 "기본가게로 등록" API를 통해서만 변경 가능합니다.

## 🔗 관련 파일

- `frontend/src/pages/mypage/MyPage.tsx` - 마이페이지 매장 관리 UI
- `frontend/src/pages/employer/StoreEdit.tsx` - 가게 정보 수정 페이지 (새로 생성)
- `backend/app/routers/employer.py` - 기본가게 설정 및 매장 수정 API
- `frontend/src/pages/employer/JobCreate.tsx` - 공고 등록 페이지
- `frontend/src/api/endpoints.ts` - API 클라이언트

## 📋 GET /api/posts 엔드포인트

### ✅ 이미 구현 완료
- **백엔드**: `backend/app/routers/posts.py`
- **프론트엔드**: `frontend/src/pages/PostsPage.tsx`
- **테이블 CREATE 문**: `posts_table_final.sql`

자세한 내용은 `GET_API_POSTS_INFO.md` 파일을 참고하세요.

모든 수정이 완료되었습니다! 🎉

