@echo off
echo ========================================
echo WorkFair 백엔드 시드 데이터 생성 중...
echo ========================================
cd gad-2025-team-2-main\backend
call venv\Scripts\activate.bat
echo.
echo 데이터베이스에 시드 데이터를 추가합니다...
python -m app.seed
echo.
echo 완료되었습니다!
pause




