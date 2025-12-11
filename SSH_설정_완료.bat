@echo off
chcp 65001 >nul
echo ========================================
echo SSH 키 설정 완료
echo ========================================
echo.

echo [1/3] 공개 키 확인...
type "%USERPROFILE%\.ssh\workfair_deploy.pub"
echo.

echo [2/3] 배포 서버에 SSH 키 등록...
echo 비밀번호: team2pass
echo.

ssh root@route.nois.club "mkdir -p ~/.ssh; chmod 700 ~/.ssh; cat >> ~/.ssh/authorized_keys" < "%USERPROFILE%\.ssh\workfair_deploy.pub"

echo.
echo [3/3] SSH 설정 파일 생성...
if not exist "%USERPROFILE%\.ssh\config" (
    echo Host workfair-deploy > "%USERPROFILE%\.ssh\config"
    echo     HostName route.nois.club >> "%USERPROFILE%\.ssh\config"
    echo     User root >> "%USERPROFILE%\.ssh\config"
    echo     IdentityFile ~/.ssh/workfair_deploy >> "%USERPROFILE%\.ssh\config"
    echo     StrictHostKeyChecking no >> "%USERPROFILE%\.ssh\config"
    echo ✅ SSH 설정 파일 생성 완료!
) else (
    echo SSH 설정 파일이 이미 존재합니다.
)

echo.
echo ========================================
echo ✅ 설정 완료!
echo ========================================
echo.
echo 이제 비밀번호 없이 접속할 수 있습니다:
echo   ssh workfair-deploy
echo.
pause

