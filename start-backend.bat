@echo off
echo ========================================
echo WorkFair 백엔드 서버 시작
echo ========================================
echo.

cd /d "%~dp0backend"

REM 가상환경 활성화
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo 가상환경이 없습니다. 생성 중...
    py -m venv venv
    call venv\Scripts\activate.bat
    echo 의존성 설치 중...
    pip install -r requirements.txt
)

echo.
echo 백엔드 서버 시작 중...
echo 서버 주소: http://localhost:8000
echo API 문서: http://localhost:8000/docs
echo.

REM venv의 python.exe 직접 사용
venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
