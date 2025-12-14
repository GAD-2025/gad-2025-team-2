@echo off
echo ========================================
echo WorkFair ?�체 ?�행 �?..
echo ========================================
echo.

REM 백엔???�행 (백그?�운??
echo [1/3] 백엔???�버�??�작?�니??..
start "WorkFair Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate.bat && venv\Scripts\python.exe -m uvicorn app.main:app --reload"

REM ?�시 ?��?(백엔?��? ?�작???�간)
timeout /t 3 /nobreak >nul

REM ?�론?�엔???�행 (백그?�운??
echo [2/3] ?�론?�엔?��? ?�작?�니??..
start "WorkFair Frontend" cmd /k "cd /d %~dp0frontend && set PATH=C:\Program Files\nodejs;%PATH% && "C:\Program Files\nodejs\npm.cmd" run dev"

REM ?�시 ?��?(?�론?�엔?��? ?�작???�간)
echo [3/3] 브라?��?�??�는 �?..
timeout /t 8 /nobreak >nul

REM 브라?��? ?�기
start http://localhost:5173/signup

echo.
echo ========================================
echo ?�행 ?�료!
echo ========================================
echo.
echo 백엔?? http://localhost:8000
echo ?�론?�엔?? http://localhost:5173/signup
echo.
echo 브라?��?가 ?�동?�로 ?�립?�다.
echo.
echo ?�버�?종료?�려�?�?cmd 창을 ?�으?�요.
echo.
pause




