@echo off
echo ========================================
echo WorkFair 프론트엔드 서버 시작
echo ========================================
echo.

REM Node.js PATH 자동 설정
set "PATH=C:\Program Files\nodejs;%PATH%"

cd /d "%~dp0frontend"

REM .env 파일 확인
if not exist ".env" (
    echo .env 파일이 없습니다. 생성 중...
    echo VITE_API_BASE_URL=http://localhost:8000 > .env
)

echo.
echo 프론트엔드 서버 시작 중...
echo 서버 주소: http://localhost:5173
echo.

REM 환경 변수 설정 후 npm 실행 (npm.cmd 사용으로 PowerShell 실행 정책 문제 우회)
set VITE_API_BASE_URL=http://localhost:8000
"C:\Program Files\nodejs\npm.cmd" run dev -- --host 127.0.0.1 --port 5173

pause
