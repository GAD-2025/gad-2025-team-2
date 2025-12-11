# 필요한 데이터 필드 리스트

## 1. 기본 매장 (Store) - 이미 구현됨

### Store 테이블 필드
- `id`: 매장 ID (PK)
- `user_id`: 고용주 사용자 ID (FK → signup_users.id)
- `is_main`: 기본 매장 여부 (boolean, default: false)
- `store_name`: 가게 이름 (회사 이름)
- `address`: 주소
- `address_detail`: 상세 주소 (optional)
- `phone`: 전화번호
- `industry`: 업종
- `business_license`: 사업자등록증 파일명/URL (optional)
- `management_role`: 관리 역할 ('본사 관리자' | '지점 관리자')
- `store_type`: 매장 유형 ('직영점' | '가맹점' | '개인·독립 매장')
- `created_at`: 생성일시
- `updated_at`: 수정일시

### 고용주 온보딩에서 기본 매장 생성 시 사용되는 필드
- `company_name` → `store_name`
- `address` → `address`
- `address_detail` → `address_detail`
- `is_main` = `true` (기본 매장으로 설정)

## 2. Posts 테이블 (새로 생성 필요)

### Posts 테이블 필드
- `id`: 게시글 ID (PK, AUTO_INCREMENT)
- `user_id`: 작성자 ID (FK → signup_users.id 또는 users.id)
- `title`: 제목 (VARCHAR)
- `body`: 본문 내용 (TEXT)
- `created_at`: 생성일시 (DATETIME, default: CURRENT_TIMESTAMP)

### Posts API 엔드포인트
- `GET /api/posts`: 모든 게시글 목록 조회
  - Response: `{ posts: Post[] }`
  - Post: `{ id: number, user_id: string, title: string, body: string, created_at: string }`

## 3. UI 표시용 필드

### 마이페이지 기본 매장 표시
- `store_name`: 가게 이름 (위에 표시)
- `address`: 가게 위치 (아래에 표시)
- `is_main`: "기본 매장" 태그 표시 여부

### 공고 등록 페이지 매장 선택
- 매장 목록: `Store[]` (마이페이지에 등록된 모든 매장)
- 선택된 매장: `selectedStore: Store | null`
- 매장 정보 자동 입력:
  - `shopName` ← `store.store_name`
  - `shopAddress` ← `store.address`
  - `shopAddressDetail` ← `store.address_detail`
  - `shopPhone` ← `store.phone`
  - `industry` ← `store.industry`

## 4. 데이터 흐름

### 고용주 온보딩 → 기본 매장 생성
1. 사용자가 온보딩에서 회사 이름, 주소 입력
2. `/auth/signup/employer` API 호출
3. 백엔드에서 `EmployerProfile` 생성
4. 백엔드에서 `Store` 생성 (is_main=true)
5. 마이페이지에서 기본 매장 표시

### 공고 등록 → 매장 선택
1. 공고 등록 페이지 진입
2. `/employer/stores/{user_id}` API 호출하여 매장 목록 가져오기
3. 매장 목록을 UI 카드 형태로 표시
4. 사용자가 매장 선택
5. 선택된 매장 정보를 폼에 자동 입력

