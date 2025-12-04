# Windows 환경 설정 가이드

Windows에서 프로젝트를 실행할 때 발생할 수 있는 문제와 해결 방법입니다.

## 1. Git 설정

### 한글 인코딩 문제 해결
Windows에서 Git 설정을 올바르게 해야 한글이 깨지지 않습니다.

```bash
# Git Bash 또는 PowerShell에서 실행
git config --global core.quotepath false
git config --global gui.encoding utf-8
git config --global i18n.commitEncoding utf-8
git config --global i18n.logOutputEncoding utf-8
```

### 줄바꿈 설정
```bash
git config --global core.autocrlf true
```

### 프로젝트 다시 받기
위 설정 후 프로젝트를 다시 clone하거나, 기존 프로젝트에서:

```bash
git rm --cached -r .
git reset --hard
```

## 2. Vite 모듈 해결 오류 (Module Resolution Error)

`Failed to resolve import` 에러가 발생하는 경우:

### 해결 방법 1: 캐시 삭제
```bash
cd frontend

# node_modules와 캐시 삭제
rmdir /s /q node_modules
rmdir /s /q .vite
del package-lock.json

# 재설치
npm install
```

### 해결 방법 2: Vite 서버 완전히 재시작
```bash
# Ctrl+C로 서버 중지 후
npm run dev -- --force
```

### 해결 방법 3: Windows Defender 제외 설정
Windows Defender가 node_modules를 스캔하면서 느려질 수 있습니다.

1. Windows 설정 > 업데이트 및 보안 > Windows 보안 > 바이러스 및 위협 방지
2. "바이러스 및 위협 방지 설정 관리" 클릭
3. "제외 추가 또는 제거" 클릭
4. 프로젝트의 `node_modules` 폴더 추가

## 3. 백엔드 설정

### Python 가상환경 생성 (Windows)
```bash
cd backend

# 가상환경 생성
python -m venv venv

# 가상환경 활성화 (PowerShell)
.\venv\Scripts\Activate.ps1

# 또는 CMD에서
.\venv\Scripts\activate.bat

# 패키지 설치
pip install -r requirements.txt
```

### PowerShell 실행 정책 오류
`Activate.ps1`을 실행할 수 없다는 오류가 나오면:

```powershell
# PowerShell을 관리자 권한으로 실행 후
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 4. 배치 파일 실행

프로젝트 루트에 있는 `.bat` 파일들을 사용할 수 있습니다:

```bash
# 백엔드 실행
start-backend.bat

# 프론트엔드 실행
start-frontend.bat

# 전체 실행
start-all.bat
```

## 5. 데이터베이스 설정

### SQLite 경로 문제
Windows에서는 백슬래시(`\`)를 사용하지만, Python 코드에서는 슬래시(`/`)를 사용하거나 raw string을 사용해야 합니다.

`backend/app/db.py` 파일에서:
```python
SQLALCHEMY_DATABASE_URL = "sqlite:///./workfair.db"
```

## 6. 포트 충돌 해결

포트가 이미 사용 중이라는 오류가 나오면:

```bash
# PowerShell에서 포트 사용 프로세스 확인
netstat -ano | findstr :5173  # 프론트엔드
netstat -ano | findstr :8000  # 백엔드

# 프로세스 종료 (PID는 위 명령어 결과에서 확인)
taskkill /PID <프로세스ID> /F
```

## 7. 일반적인 문제 해결

### npm ERR! code ENOENT
```bash
cd frontend
npm cache clean --force
npm install
```

### CORS 오류
백엔드의 CORS 설정이 올바른지 확인:
- `backend/app/main.py`에서 `allow_origins` 확인

### 한글 경로 문제
프로젝트 경로에 한글이 포함되어 있으면 문제가 발생할 수 있습니다.
가능하면 영문 경로에 프로젝트를 clone하세요.

예: `C:\Users\사용자\Documents` → `C:\Users\username\Documents`

## 8. IDE 설정

### VS Code에서 한글 인코딩
VS Code 설정 (`settings.json`):
```json
{
  "files.encoding": "utf8",
  "files.autoGuessEncoding": true
}
```

## 9. 확인 사항

모든 설정 후 확인:
```bash
# Node.js 버전 확인
node --version  # v18 이상 권장

# Python 버전 확인
python --version  # 3.8 이상 필요

# npm 버전 확인
npm --version

# Git 설정 확인
git config --list | findstr encoding
```

## 문제가 계속되면?

1. 모든 터미널 창을 닫고 컴퓨터를 재시작
2. 프로젝트를 새로운 폴더에 다시 clone
3. GitHub Issues에 문제 보고

## 참고 자료
- [Node.js 공식 다운로드](https://nodejs.org/)
- [Python 공식 다운로드](https://www.python.org/downloads/)
- [Git for Windows](https://git-scm.com/download/win)


