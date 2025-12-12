-- jobs 테이블에 매장 정보 필드 추가 (없는 경우)
USE team2_db;

-- shop_name 필드 추가 (없는 경우)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS shop_name VARCHAR(255) NULL 
COMMENT '선택한 매장명';

-- shop_address 필드 추가 (없는 경우)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS shop_address VARCHAR(500) NULL 
COMMENT '선택한 매장 주소';

-- shop_address_detail 필드 추가 (없는 경우)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS shop_address_detail VARCHAR(500) NULL 
COMMENT '선택한 매장 상세 주소';

-- shop_phone 필드 추가 (없는 경우)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS shop_phone VARCHAR(50) NULL 
COMMENT '선택한 매장 전화번호';

-- store_id 필드 추가 (없는 경우)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS store_id VARCHAR(255) NULL 
COMMENT '선택한 매장 ID (stores.id 참조)';

-- 필드 추가 확인
DESCRIBE jobs;
