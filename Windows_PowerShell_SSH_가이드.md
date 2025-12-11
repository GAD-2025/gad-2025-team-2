# Windows PowerShell에서 SSH 접속하기

## 🖥️ Windows PowerShell 직접 열기

Cursor 터미널이 안 되면 **Windows PowerShell을 직접** 열어보세요:

### 1단계: PowerShell 열기

1. **Windows 키** 누르기
2. **"PowerShell"** 입력
3. **"Windows PowerShell"** 클릭
   - ⚠️ "관리자 권한으로 실행"은 선택하지 마세요!

### 2단계: SSH 접속

PowerShell 창이 열리면:

```powershell
ssh root@route.nois.club
```

**Enter** 누르기

### 3단계: 호스트 키 확인

```
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

**→ `yes` 입력하고 Enter**

### 4단계: 비밀번호 입력

```
root@route.nois.club's password:
```

**→ `team2pass` 입력 (화면에 표시 안 됨)**
**→ Enter 누르기**

### 5단계: 접속 성공 확인

프롬프트가 이렇게 바뀌면 성공:

```
root@route:~#
```

---

## 🚀 접속 후 배포

```bash
# 프로젝트 디렉토리 찾기
find / -name "main.py" -path "*/app/main.py" 2>/dev/null | head -1

# 찾은 경로로 이동
cd /var/www/workfair/backend
# 또는 찾은 경로로 변경

# 최신 코드 가져오기
git pull origin main

# 서버 재시작
sudo systemctl restart workfair
# 또는
pm2 restart workfair
```

