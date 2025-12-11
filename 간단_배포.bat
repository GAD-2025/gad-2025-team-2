@echo off
chcp 65001 >nul
echo 🚀 배포 시작...
echo.

cd /d "C:\Users\peach\Downloads\gad-2025-team-2-main\gad-2025-team-2-main"

echo 📋 Git 상태 확인...
git status
echo.

echo ⚠️ 변경사항이 있으면 먼저 커밋 및 푸시를 해주세요.
echo.
pause

echo 🔐 배포 서버에 접속 중...
echo 비밀번호: team2pass
echo.

ssh root@route.nois.club "cd /var/www/workfair/backend 2>/dev/null || cd /home/ubuntu/workfair/backend 2>/dev/null || find / -name 'main.py' -path '*/app/main.py' 2>/dev/null | head -1 | xargs dirname | xargs dirname; git pull origin main; sudo systemctl restart workfair 2>/dev/null || pm2 restart workfair 2>/dev/null || echo '서버 재시작 방법을 확인해주세요'"

echo.
echo ✅ 배포 완료!
pause

