# Cursor 터미널에서 바로 실행하는 배포 스크립트
# 사용법: .\배포_자동화.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 배포 시작..." -ForegroundColor Green

# 프로젝트 디렉토리로 이동
$projectRoot = "C:\Users\peach\Downloads\gad-2025-team-2-main\gad-2025-team-2-main"
Set-Location $projectRoot

# Git 상태 확인
Write-Host "`n📋 Git 상태 확인..." -ForegroundColor Yellow
git status

# 변경사항이 있으면 커밋 및 푸시
$hasUncommitted = (git diff --quiet) -eq $false
$hasUntracked = (git ls-files --others --exclude-standard) -ne $null

if ($hasUncommitted -or $hasUntracked) {
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

# SSH 접속 정보
$sshHost = "root@route.nois.club"
$sshPassword = "team2pass"

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

# plink를 사용한 자동 접속 (PuTTY 설치 필요)
$plinkPath = "C:\Program Files\PuTTY\plink.exe"
if (Test-Path $plinkPath) {
    Write-Host "PuTTY plink 사용..." -ForegroundColor Cyan
    $deployCommands | & $plinkPath -ssh $sshHost -pw $sshPassword
} else {
    # SSH 키 사용 또는 수동 입력
    Write-Host "SSH 접속 (비밀번호: team2pass)" -ForegroundColor Cyan
    
    # expect 스타일로 비밀번호 자동 입력 시도
    # Windows에서는 plink 또는 SSH 키 필요
    
    # 임시 해결책: 사용자에게 직접 입력 요청
    Write-Host "`n⚠️ 자동 비밀번호 입력을 위해 SSH 키를 설정하거나," -ForegroundColor Yellow
    Write-Host "   아래 명령어를 복사하여 실행하세요:" -ForegroundColor Yellow
    Write-Host "`nssh $sshHost" -ForegroundColor Cyan
    Write-Host "비밀번호: $sshPassword" -ForegroundColor Cyan
    Write-Host "`n접속 후 다음 명령어 실행:" -ForegroundColor Yellow
    Write-Host $deployCommands -ForegroundColor White
    
    # 또는 직접 실행 시도
    $response = Read-Host "`n지금 SSH 접속을 시도하시겠습니까? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "`nSSH 접속 중... (비밀번호: $sshPassword)" -ForegroundColor Cyan
        ssh $sshHost $deployCommands
    }
}

Write-Host "`n✅ 배포 프로세스 완료!" -ForegroundColor Green
Write-Host "`n배포 서버 확인: https://route.nois.club:3002/docs" -ForegroundColor Cyan

