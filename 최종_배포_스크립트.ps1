# Cursor 터미널에서 바로 실행하는 최종 배포 스크립트
# 사용법: .\최종_배포_스크립트.ps1

$ErrorActionPreference = "Continue"

Write-Host "🚀 배포 시작..." -ForegroundColor Green

# 프로젝트 디렉토리로 이동
$projectRoot = "C:\Users\peach\Downloads\gad-2025-team-2-main\gad-2025-team-2-main"
Set-Location $projectRoot

# Git 상태 확인
Write-Host "`n📋 Git 상태 확인..." -ForegroundColor Yellow
git status --short

# 변경사항이 있으면 커밋 및 푸시
$status = git status --porcelain
if ($status) {
    Write-Host "`n⚠️ 변경사항이 있습니다." -ForegroundColor Yellow
    $commit = Read-Host "커밋 메시지를 입력하세요 (또는 Enter로 스킵)"
    
    if ($commit) {
        git add .
        git commit -m $commit
        git push origin main
        Write-Host "✅ Git 푸시 완료!" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
}

# 배포 명령어
$deployCommands = @"
cd /var/www/workfair/backend 2>/dev/null || cd /home/ubuntu/workfair/backend 2>/dev/null || cd /opt/workfair/backend 2>/dev/null || (BACKEND_DIR=\$(find / -name 'main.py' -path '*/app/main.py' 2>/dev/null | head -1 | xargs dirname | xargs dirname); cd \$BACKEND_DIR)
echo '📂 현재 디렉토리:' 
pwd
echo '📥 최신 코드 가져오기...'
git pull origin main
echo '🔄 서버 재시작...'
sudo systemctl restart workfair 2>/dev/null || pm2 restart workfair 2>/dev/null || (pkill -f uvicorn; cd \$(find / -name 'main.py' -path '*/app/main.py' 2>/dev/null | head -1 | xargs dirname | xargs dirname); source venv/bin/activate 2>/dev/null; nohup uvicorn app.main:app --host 0.0.0.0 --port 3002 > /dev/null 2>&1 &)
echo '✅ 배포 완료!'
"@

Write-Host "`n🔐 배포 서버에 접속 중..." -ForegroundColor Yellow

# SSH 키로 접속 시도
$sshKeyPath = "$HOME\.ssh\workfair_deploy"
if (Test-Path $sshKeyPath) {
    Write-Host "SSH 키 사용 중..." -ForegroundColor Cyan
    ssh -i $sshKeyPath -o StrictHostKeyChecking=no root@route.nois.club $deployCommands
} else {
    # SSH 키가 없으면 비밀번호로 접속
    Write-Host "SSH 키가 없습니다. 비밀번호로 접속합니다..." -ForegroundColor Yellow
    Write-Host "비밀번호: team2pass" -ForegroundColor Cyan
    ssh -o StrictHostKeyChecking=no root@route.nois.club $deployCommands
}

Write-Host "`n✅ 배포 완료!" -ForegroundColor Green
Write-Host "`n배포 서버 확인: https://route.nois.club:3002/docs" -ForegroundColor Cyan

