# SSH 키를 배포 서버에 등록하는 스크립트
# 한 번만 실행하면 됩니다!

$ErrorActionPreference = "Stop"

Write-Host "🔑 SSH 키를 배포 서버에 등록합니다..." -ForegroundColor Green

# 공개 키 읽기
$publicKeyPath = "$HOME\.ssh\workfair_deploy.pub"
if (-not (Test-Path $publicKeyPath)) {
    Write-Host "❌ 공개 키 파일을 찾을 수 없습니다!" -ForegroundColor Red
    exit 1
}

$publicKey = Get-Content $publicKeyPath -Raw
$publicKey = $publicKey.Trim()

Write-Host "`n📋 공개 키:" -ForegroundColor Yellow
Write-Host $publicKey -ForegroundColor Cyan

Write-Host "`n🔐 배포 서버에 접속하여 키를 등록합니다..." -ForegroundColor Yellow
Write-Host "비밀번호: team2pass" -ForegroundColor Cyan

# SSH로 공개 키를 서버에 추가
$sshCommand = @"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo '$publicKey' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo '✅ SSH 키 등록 완료!'
"@

Write-Host "`n⚠️ 아래 명령어를 실행합니다:" -ForegroundColor Yellow
Write-Host $sshCommand -ForegroundColor White

$response = Read-Host "`n계속하시겠습니까? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "`nSSH 접속 중... (비밀번호: team2pass)" -ForegroundColor Cyan
    ssh root@route.nois.club $sshCommand
    
    Write-Host "`n✅ SSH 키 등록 완료!" -ForegroundColor Green
    Write-Host "`n이제 비밀번호 없이 접속할 수 있습니다!" -ForegroundColor Cyan
    Write-Host "테스트: ssh root@route.nois.club" -ForegroundColor Yellow
} else {
    Write-Host "취소되었습니다." -ForegroundColor Yellow
}

