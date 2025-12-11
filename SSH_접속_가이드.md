# SSH 접속 가이드 (초보자용)

## 🖥️ 터미널이란?

**터미널 = 검은색 창 (명령어를 입력하는 곳)**

Windows에서는:
- **PowerShell** (파란색/검은색 창)
- **명령 프롬프트 (cmd)** (검은색 창)

둘 다 터미널입니다!

---

## 📍 터미널 열기 방법

### 방법 1: Cursor 터미널 사용 (가장 쉬움!)

1. Cursor 하단에 **"터미널"** 또는 **"Terminal"** 탭 클릭
2. 이미 열려있으면 그대로 사용!

### 방법 2: Windows PowerShell 열기

1. **Windows 키** 누르기
2. **"PowerShell"** 입력
3. **"Windows PowerShell"** 클릭
4. 검은색/파란색 창이 열림

### 방법 3: 명령 프롬프트 (cmd) 열기

1. **Windows 키 + R** 누르기
2. **"cmd"** 입력하고 **Enter**
3. 검은색 창이 열림

---

## 🔐 SSH 접속하기

터미널이 열리면 아래 명령어를 **복사해서 붙여넣기**:

```powershell
ssh root@route.nois.club
```

**Enter** 누르기

---

## 📝 접속 과정

### 1단계: 호스트 키 확인

첫 접속 시 이런 메시지가 나옵니다:

```
The authenticity of host 'route.nois.club (203.231.137.115)' can't be established.
ED25519 key fingerprint is SHA256:ausyP1bRFmKM2QPSyzDYghWc053lz9azpvWcKEIOrOo.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

**→ `yes` 입력하고 Enter**

### 2단계: 비밀번호 입력

```
root@route.nois.club's password:
```

**→ 비밀번호 입력 (화면에 표시되지 않음, 그냥 입력하고 Enter)**

### 3단계: 접속 성공!

프롬프트가 이렇게 바뀌면 성공:

```
root@route:~#
```

또는

```
[root@route ~]#
```

---

## 🚀 접속 후 배포하기

접속이 성공하면 아래 명령어를 순서대로 실행:

```bash
# 1. 프로젝트 디렉토리 찾기
find / -name "main.py" -path "*/app/main.py" 2>/dev/null | head -1

# 2. 찾은 경로로 이동 (예: /var/www/workfair/backend)
cd /var/www/workfair/backend
# 또는 찾은 경로로 변경

# 3. Git 상태 확인
git status

# 4. 최신 코드 가져오기
git pull origin main

# 5. 가상환경 활성화
source venv/bin/activate

# 6. 서버 재시작
# 방법 A: systemd 사용
sudo systemctl restart workfair

# 방법 B: pm2 사용
pm2 restart workfair

# 방법 C: 직접 실행 중인 경우
ps aux | grep uvicorn
# 프로세스 ID 확인 후
kill [프로세스ID]
# 재시작
nohup uvicorn app.main:app --host 0.0.0.0 --port 3002 > /dev/null 2>&1 &
```

---

## ❓ 문제 해결

### "ssh: command not found" 에러

**해결:** Windows 10/11에는 기본적으로 SSH가 포함되어 있습니다.
- Windows 업데이트 확인
- 또는 Git Bash 사용: https://git-scm.com/downloads

### 비밀번호를 모르는 경우

- 교수님/서버 관리자에게 SSH 접속 정보 요청
- 또는 SSH 키 파일 사용 (`.pem`, `.ppk` 파일)

### 접속이 안 되는 경우

```powershell
# 연결 테스트
Test-NetConnection -ComputerName route.nois.club -Port 22
```

---

## ✅ 배포 확인

배포 후 PowerShell에서:

```powershell
curl https://route.nois.club:3002/docs
curl https://route.nois.club:3002/api/posts
```

브라우저에서:
- https://route.nois.club:3002/docs

