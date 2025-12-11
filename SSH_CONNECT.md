# SSH 접속 및 배포 가이드

## ✅ 확인 완료

SSH 포트가 열려있고, 서버에 접속할 수 있습니다!

서버 주소: `route.nois.club (203.231.137.115)`

---

## 🚀 SSH 접속 방법

### 방법 1: PowerShell에서 직접 접속

PowerShell을 열고 다음 명령어 실행:

```powershell
ssh root@route.nois.club
```

**접속 과정:**
1. 첫 접속 시 호스트 키 확인 메시지가 나옵니다
   - `Are you sure you want to continue connecting (yes/no/[fingerprint])?`
   - **`yes`** 입력하고 Enter

2. 비밀번호 입력 요청
   - 비밀번호를 입력하세요 (화면에 표시되지 않음)
   - Enter 누르기

3. 접속 성공!
   - 프롬프트가 `root@route:~#` 또는 비슷하게 바뀌면 성공

---

## 📋 접속 후 배포 절차

SSH 접속이 성공하면 다음 명령어를 순서대로 실행:

```bash
# 1. 프로젝트 디렉토리 찾기
find / -name "main.py" -path "*/app/main.py" 2>/dev/null | head -1

# 또는 일반적인 위치 확인
ls -la /var/www/
ls -la /home/
ls -la /opt/

# 2. 프로젝트 디렉토리로 이동 (찾은 경로로)
cd /path/to/project/backend  # 실제 경로로 변경

# 3. Git 상태 확인
git status
git remote -v

# 4. 최신 코드 가져오기
git pull origin main

# 5. 가상환경 활성화
source venv/bin/activate

# 6. 의존성 업데이트 (필요한 경우)
pip install -r requirements.txt

# 7. 서버 재시작
# 방법 확인 필요:
ps aux | grep uvicorn
systemctl status workfair
pm2 list

# 재시작 (방법은 서버 설정에 따라 다름):
# A) systemd 사용
sudo systemctl restart workfair

# B) pm2 사용  
pm2 restart workfair

# C) 직접 실행 중인 경우
pkill -f uvicorn
nohup uvicorn app.main:app --host 0.0.0.0 --port 3002 > /dev/null 2>&1 &
```

---

## 🔍 빠른 확인 명령어

```bash
# 현재 실행 중인 프로세스 확인
ps aux | grep uvicorn
ps aux | grep python

# 서비스 상태 확인
systemctl status workfair
pm2 list

# 로그 확인
tail -f /var/log/workfair.log
# 또는
journalctl -u workfair -f
```

---

## ⚠️ 주의사항

1. **비밀번호를 모르는 경우:**
   - 교수님/서버 관리자에게 SSH 접속 정보 요청
   - 또는 SSH 키 파일 사용

2. **권한 문제:**
   - `sudo` 권한이 필요할 수 있음
   - 파일 소유권 확인: `ls -la`

3. **서버 재시작 전:**
   - 현재 실행 중인 서비스 확인
   - 데이터베이스 백업 (필요한 경우)

---

## ✅ 배포 확인

배포 후 다음으로 확인:

```powershell
# PowerShell에서
curl https://route.nois.club:3002/docs
curl https://route.nois.club:3002/api/posts
curl https://route.nois.club:3002/employer/stores/employer-test-001
```

브라우저에서:
- https://route.nois.club:3002/docs
- `/api/posts` 엔드포인트 확인
- `/employer/stores/{user_id}` 엔드포인트 확인

