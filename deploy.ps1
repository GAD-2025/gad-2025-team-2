# 배포 스크립트
# Cursor 터미널에서 실행: .\deploy.ps1

Write-Host "🚀 배포 시작..." -ForegroundColor Green

# 1. 현재 디렉토리 확인
$projectRoot = "C:\Users\peach\Downloads\gad-2025-team-2-main\gad-2025-team-2-main"
Set-Location $projectRoot

# 2. Git 상태 확인
Write-Host "`n📋 Git 상태 확인..." -ForegroundColor Yellow
git status

# 3. 변경사항이 있으면 커밋 및 푸시
$hasChanges = git diff --quiet
if (-not $hasChanges) {
    Write-Host "`n✅ 변경사항이 없습니다. 배포 서버에 최신 코드가 있는지 확인합니다." -ForegroundColor Green
} else {
    Write-Host "`n⚠️ 변경사항이 있습니다. 커밋 및 푸시를 진행하시겠습니까?" -ForegroundColor Yellow
    $response = Read-Host "커밋 메시지를 입력하세요 (또는 Enter로 스킵)"
    
    if ($response) {
        git add .
        git commit -m $response
        git push origin main
        Write-Host "✅ Git 푸시 완료!" -ForegroundColor Green
    }
}

# 4. 배포 서버에 SSH 접속하여 배포
Write-Host "`n🔐 배포 서버에 접속 중..." -ForegroundColor Yellow

# SSH 접속 및 배포 명령어 실행
$sshCommand = @"
cd /var/www/workfair/backend || cd /home/ubuntu/workfair/backend || cd /opt/workfair/backend || find / -name 'main.py' -path '*/app/main.py' 2>/dev/null | head -1 | xargs dirname | xargs dirname
git pull origin main
source venv/bin/activate
pip install -r requirements.txt 2>/dev/null
sudo systemctl restart workfair || pm2 restart workfair || pkill -f uvicorn; nohup uvicorn app.main:app --host 0.0.0.0 --port 3002 > /dev/null 2>&1 &
echo '✅ 배포 완료!'
"@

# SSH 접속 (비밀번호는 수동 입력 필요)
Write-Host "`n비밀번호를 입력하세요: team2pass" -ForegroundColor Cyan
ssh root@route.nois.club $sshCommand

Write-Host "`n✅ 배포 완료!" -ForegroundColor Green

