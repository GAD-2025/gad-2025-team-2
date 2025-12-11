@echo off
chcp 65001 >nul
echo ========================================
echo SSH 키 자동 등록
echo ========================================
echo.

REM plink 확인
where plink >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ plink를 사용합니다...
    echo.
    
    REM 공개 키를 서버에 등록
    type "%USERPROFILE%\.ssh\workfair_deploy.pub" | plink -ssh root@route.nois.club -pw team2pass "mkdir -p ~/.ssh; chmod 700 ~/.ssh; cat >> ~/.ssh/authorized_keys; chmod 600 ~/.ssh/authorized_keys; echo '✅ SSH 키 등록 완료!'"
    
    echo.
    echo ✅ SSH 키 등록 완료!
    echo.
    echo 이제 비밀번호 없이 접속할 수 있습니다!
) else (
    echo ⚠️ plink를 찾을 수 없습니다.
    echo.
    echo PuTTY를 설치하거나, Windows PowerShell을 직접 열어서 실행하세요.
    echo.
    echo Windows PowerShell에서:
    echo   ssh root@route.nois.club
    echo   비밀번호: team2pass
    echo.
    echo 서버에서:
    echo   mkdir -p ~/.ssh
    echo   chmod 700 ~/.ssh
    echo   type "%USERPROFILE%\.ssh\workfair_deploy.pub"
    echo   (위 내용을 복사하여)
    echo   echo '복사한_키_내용' ^>^> ~/.ssh/authorized_keys
    echo   chmod 600 ~/.ssh/authorized_keys
    echo   exit
)

pause

