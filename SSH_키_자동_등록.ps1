# SSH 키를 자동으로 등록하는 스크립트
# plink를 사용하여 비밀번호 자동 입력

$ErrorActionPreference = "Stop"

Write-Host "🔑 SSH 키를 배포 서버에 자동 등록합니다..." -ForegroundColor Green

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

# plink 경로 확인
$plinkPaths = @(
    "C:\Program Files\PuTTY\plink.exe",
    "C:\Program Files (x86)\PuTTY\plink.exe",
    "$env:ProgramFiles\PuTTY\plink.exe",
    "$env:ProgramFiles(x86)\PuTTY\plink.exe"
)

$plinkPath = $null
foreach ($path in $plinkPaths) {
    if (Test-Path $path) {
        $plinkPath = $path
        break
    }
}

if ($plinkPath) {
    Write-Host "`n✅ PuTTY plink를 사용합니다..." -ForegroundColor Green
    
    # SSH 키 등록 명령어
    $registerCommand = @"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo '$publicKey' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo '✅ SSH 키 등록 완료!'
"@
    
    # plink로 실행 (비밀번호 자동 입력)
    & $plinkPath -ssh root@route.nois.club -pw "team2pass" $registerCommand
    
    Write-Host "`n✅ SSH 키 등록 완료!" -ForegroundColor Green
    Write-Host "`n이제 비밀번호 없이 접속할 수 있습니다!" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️ PuTTY plink를 찾을 수 없습니다." -ForegroundColor Yellow
    Write-Host "`n다음 중 하나를 선택하세요:" -ForegroundColor Yellow
    Write-Host "1. PuTTY 설치: https://www.putty.org/" -ForegroundColor Cyan
    Write-Host "2. Windows PowerShell을 직접 열어서 실행" -ForegroundColor Cyan
    Write-Host "`nWindows PowerShell에서 다음 명령어 실행:" -ForegroundColor Yellow
    Write-Host "ssh root@route.nois.club" -ForegroundColor White
    Write-Host "비밀번호: team2pass" -ForegroundColor White
    Write-Host "그 다음 서버에서:" -ForegroundColor Yellow
    Write-Host "mkdir -p ~/.ssh" -ForegroundColor White
    Write-Host "chmod 700 ~/.ssh" -ForegroundColor White
    Write-Host "echo '$publicKey' >> ~/.ssh/authorized_keys" -ForegroundColor White
    Write-Host "chmod 600 ~/.ssh/authorized_keys" -ForegroundColor White
    Write-Host "exit" -ForegroundColor White
}

