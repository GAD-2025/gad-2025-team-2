@echo off
echo ========================================
echo WorkFair 전체 실행 중...
echo ========================================
echo.

REM 백엔드 실행 (백그라운드)
echo [1/3] 백엔드 서버를 시작합니다...
start "WorkFair Backend" cmd /k "cd /d %~dp0gad-2025-team-2-main\backend && venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload"

REM 잠시 대기 (백엔드가 시작될 시간)
timeout /t 3 /nobreak >nul

REM 프론트엔드 실행 (백그라운드)
echo [2/3] 프론트엔드를 시작합니다...
start "WorkFair Frontend" cmd /k "cd /d %~dp0gad-2025-team-2-main\frontend && npm.cmd run dev"

REM 잠시 대기 (프론트엔드가 시작될 시간)
echo [3/3] 브라우저를 여는 중...
timeout /t 8 /nobreak >nul

REM 브라우저 열기
start http://localhost:5174/signup

echo.
echo ========================================
echo 실행 완료!
echo ========================================
echo.
echo 백엔드: http://localhost:8000
echo 프론트엔드: http://localhost:5174/signup
echo.
echo 브라우저가 자동으로 열립니다.
echo.
echo 서버를 종료하려면 각 cmd 창을 닫으세요.
echo.
pause


