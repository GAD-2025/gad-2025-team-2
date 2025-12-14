# 🚨 백엔드 서버가 실행되지 않음

## ❌ 문제 상황

**에러**: `net::ERR_CONNECTION_REFUSED`  
**원인**: 백엔드 서버가 포트 8000에서 실행되지 않고 있습니다.

## ✅ 이것은 데이터베이스 문제가 아닙니다!

`ERR_CONNECTION_REFUSED`는 **백엔드 서버가 실행되지 않아서** 발생하는 네트워크 연결 오류입니다.

- ❌ 데이터베이스 문제가 아닙니다
- ❌ MySQL 문제가 아닙니다
- ✅ 백엔드 서버가 실행되지 않아서 발생한 문제입니다

## 🔧 해결 방법

### 백엔드 서버 시작

백엔드 서버를 시작했습니다. 몇 초 후 다음을 확인하세요:

1. **서버 실행 확인**: http://localhost:8000/docs 접속
   - API 문서가 표시되면 서버가 정상 실행 중입니다
   - 접속이 안 되면 서버가 아직 시작 중일 수 있습니다 (10-20초 대기)

2. **Health Check**: http://localhost:8000/health 접속
   - `{"status": "healthy"}` 응답이 오면 정상입니다

3. **로그인 다시 시도**: 
   - 브라우저 하드 리프레시: `Ctrl+Shift+R`
   - http://localhost:5173/auth/signin 접속
   - 로그인 시도

## 📝 백엔드 서버 수동 시작 방법

만약 서버가 시작되지 않았다면, 터미널에서 직접 시작하세요:

```bash
cd c:\Users\Administrator\Desktop\gad-2025-team-2\backend
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

또는 가상환경이 없다면:

```bash
cd c:\Users\Administrator\Desktop\gad-2025-team-2\backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🔍 서버 실행 확인 방법

### 방법 1: 브라우저에서 확인
http://localhost:8000/docs 접속

### 방법 2: 터미널에서 확인
```bash
netstat -ano | findstr :8000
```
`LISTENING` 상태가 보이면 서버가 실행 중입니다.

### 방법 3: curl로 확인 (PowerShell)
```powershell
curl http://localhost:8000/health
```

## ⚠️ 중요 사항

1. **백엔드 서버는 항상 실행되어 있어야 합니다**
   - 프론트엔드가 API를 호출하려면 백엔드 서버가 실행 중이어야 합니다
   - 서버를 종료하면 (`Ctrl+C`) 모든 API 호출이 실패합니다

2. **서버 시작 시간**
   - 서버 시작에는 보통 5-10초가 걸립니다
   - 처음 시작 시 더 오래 걸릴 수 있습니다

3. **포트 충돌**
   - 다른 프로그램이 포트 8000을 사용 중이면 서버가 시작되지 않습니다
   - 에러 메시지를 확인하세요

## 🎯 다음 단계

1. **서버 시작 대기** (10-20초)
2. **http://localhost:8000/docs 접속하여 서버 확인**
3. **브라우저 하드 리프레시** (`Ctrl+Shift+R`)
4. **로그인 다시 시도**

**백엔드 서버가 시작되면 로그인이 정상적으로 작동할 것입니다!** 🚀

