@echo off
echo ========================================
echo WorkFair 프론트엔드 개발 서버 시작 중...
echo ========================================
cd /d %~dp0frontend
echo 현재 디렉토리: %CD%
echo.
echo npm 개발 서버를 시작합니다...
echo 브라우저에서 http://localhost:5173 접속하세요
echo.
call npm.cmd run dev
pause



