# SSH 접속 단계별 가이드

## 📍 현재 상황

- Vite 개발 서버가 실행 중인 터미널
- SSH 접속을 하려면 **새 터미널**이 필요합니다

---

## 🚀 SSH 접속 방법

### 1단계: 새 터미널 열기

**Cursor에서:**
1. 하단 터미널 탭 옆의 **"+" 버튼** 클릭
   - 또는 `Ctrl + Shift + `` (백틱 키)

**또는 Windows PowerShell 직접 열기:**
1. Windows 키 누르기
2. "PowerShell" 입력
3. "Windows PowerShell" 클릭

---

### 2단계: SSH 접속 명령어 입력

새 터미널이 열리면:

```powershell
ssh root@route.nois.club
```

**Enter** 누르기

---

### 3단계: 호스트 키 확인

다음 메시지가 나옵니다:

```
The authenticity of host 'route.nois.club (203.231.137.115)' can't be established.
ED25519 key fingerprint is SHA256:ausyP1bRFmKM2QPSyzDYghWc053lz9azpvWcKEIOrOo.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

**→ `yes` 입력하고 Enter**

---

### 4단계: 비밀번호 입력

다음 메시지가 나옵니다:

```
root@route.nois.club's password:
```

**→ 비밀번호 입력 (화면에 표시되지 않음)**
**→ Enter 누르기**

---

### 5단계: 접속 성공 확인

프롬프트가 이렇게 바뀌면 성공:

```
root@route:~#
```

또는

```
[root@route ~]#
```

---

## 🎯 접속 후 배포하기

접속이 성공하면 다음 명령어를 실행:

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

## ⚠️ 주의사항

1. **Vite 서버는 그대로 두기**
   - 프론트엔드 개발 서버는 계속 실행 중이어도 됩니다
   - SSH 접속은 **새 터미널**에서 하세요

2. **비밀번호를 모르는 경우**
   - 교수님/서버 관리자에게 SSH 접속 정보 요청
   - 또는 SSH 키 파일 사용

3. **접속이 안 되는 경우**
   - 네트워크 연결 확인
   - 방화벽 설정 확인

