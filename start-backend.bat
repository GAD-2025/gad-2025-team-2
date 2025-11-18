@echo off
echo ========================================
echo WorkFair 백엔드 시작 중...
echo ========================================
cd gad-2025-team-2-main\backend
call venv\Scripts\activate.bat
echo.
echo 서버를 시작합니다...
python -m uvicorn app.main:app --reload
pause

