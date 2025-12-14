# 면접/채용 플로우 구현에 필요한 데이터베이스 필드

## applications 테이블에 추가해야 할 필드

### 1. interviewData (TEXT, NULL)
- **타입**: TEXT
- **NULL 허용**: YES
- **설명**: 면접 제안 정보를 JSON 형식으로 저장
- **JSON 구조**:
```json
{
  "selectedDates": ["2025-01-15", "2025-01-16"],
  "time": "14:00",
  "duration": 30,
  "message": "면접 안내 메시지",
  "allDatesSame": true,
  "allDatesTimeSlots": [{"time": "14:00", "duration": 30}],
  "dateSpecificTimes": {},
  "isConfirmed": false,
  "confirmedAt": "2025-01-10T10:00:00Z"
}
```

### 2. acceptanceData (TEXT, NULL)
- **타입**: TEXT
- **NULL 허용**: YES
- **설명**: 합격 안내 정보를 JSON 형식으로 저장
- **JSON 구조**:
```json
{
  "documents": ["통장 사본", "주민등록 사본"],
  "workAttire": ["검정색 바지", "셔츠"],
  "workNotes": ["위 근무복장 외 착용불가"],
  "firstWorkDate": "2025-01-20",
  "firstWorkTime": "09:00",
  "coordinationMessage": "조율 메시지",
  "createdAt": "2025-01-10T10:00:00Z"
}
```

### 3. coordinationMessages (TEXT, NULL)
- **타입**: TEXT
- **NULL 허용**: YES
- **설명**: 조율 메시지 목록을 JSON 배열 형식으로 저장
- **JSON 구조**:
```json
[
  {
    "message": "출근 시간 조율 가능한가요?",
    "sentAt": "2025-01-10T10:00:00Z",
    "from": "jobseeker",
    "type": "date_modification_request"
  },
  {
    "message": "네, 가능합니다. 언제가 편하신가요?",
    "sentAt": "2025-01-10T11:00:00Z",
    "from": "employer"
  }
]
```

### 4. firstWorkDateConfirmed (VARCHAR(50), NULL)
- **타입**: VARCHAR(50)
- **NULL 허용**: YES
- **설명**: 채용 확정된 첫 출근 날짜 (YYYY-MM-DD 형식)
- **예시**: "2025-01-20"

## MySQL 워크벤치에서 실행할 SQL

```sql
-- applications 테이블에 필드 추가
ALTER TABLE applications 
ADD COLUMN interviewData TEXT NULL COMMENT '면접 제안 정보 (JSON)',
ADD COLUMN acceptanceData TEXT NULL COMMENT '합격 안내 정보 (JSON)',
ADD COLUMN coordinationMessages TEXT NULL COMMENT '조율 메시지 목록 (JSON 배열)',
ADD COLUMN firstWorkDateConfirmed VARCHAR(50) NULL COMMENT '채용 확정된 첫 출근 날짜 (YYYY-MM-DD)';
```

## 기존 필드 확인

applications 테이블에는 이미 다음 필드들이 있습니다:
- applicationId (VARCHAR, PRIMARY KEY)
- seekerId (VARCHAR)
- jobId (VARCHAR)
- status (VARCHAR) - 'applied', 'reviewed', 'accepted', 'rejected', 'hold', 'hired'
- appliedAt (VARCHAR)
- updatedAt (VARCHAR)
- hiredAt (VARCHAR, NULL)
