@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 배포 서버에 코드 반영
echo ========================================
echo.

cd /d "C:\Users\peach\Downloads\gad-2025-team-2-main\gad-2025-team-2-main"

echo [1/3] Git 상태 확인...
git status
echo.

echo [2/3] 변경사항이 있으면 먼저 커밋 및 푸시를 해주세요.
echo       (변경사항이 없으면 Enter로 넘어가세요)
pause

echo.
echo [3/3] 배포 서버에 접속하여 코드 업데이트...
echo.
echo 비밀번호를 입력하세요: team2pass
echo.

REM SSH 접속 및 배포 명령어 실행
ssh root@route.nois.club "cd /var/www/workfair/backend 2>/dev/null || cd /home/ubuntu/workfair/backend 2>/dev/null || (find / -name 'main.py' -path '*/app/main.py' 2>/dev/null | head -1 | xargs dirname | xargs dirname); git pull origin main; sudo systemctl restart workfair 2>/dev/null || pm2 restart workfair 2>/dev/null || (pkill -f uvicorn; cd \$(find / -name 'main.py' -path '*/app/main.py' 2>/dev/null | head -1 | xargs dirname | xargs dirname); source venv/bin/activate; nohup uvicorn app.main:app --host 0.0.0.0 --port 3002 > /dev/null 2>&1 &); echo '✅ 배포 완료!'"

echo.
echo ========================================
echo ✅ 배포 완료!
echo ========================================
echo.
echo 배포 서버 확인: https://route.nois.club:3002/docs
echo.
pause

