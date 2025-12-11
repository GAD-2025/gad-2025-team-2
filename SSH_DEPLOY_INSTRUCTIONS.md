# 배포 서버 직접 접근 및 배포 가이드

## ✅ 확인 완료

SSH 포트(22번)가 열려있습니다! 배포 서버에 직접 접근할 수 있습니다.

---

## 🚀 SSH 접속 방법

### 1단계: SSH 접속 시도

PowerShell에서 다음 명령어 실행:

```powershell
ssh root@route.nois.club
```

또는 다른 사용자 이름을 사용하는 경우:

```powershell
ssh ubuntu@route.nois.club
# 또는
ssh admin@route.nois.club
# 또는
ssh deploy@route.nois.club
```

### 2단계: 비밀번호 입력

접속 시 비밀번호를 요청하면 입력하세요.

**비밀번호를 모르는 경우:**
- 교수님/서버 관리자에게 SSH 접속 정보 요청
- 또는 SSH 키를 사용하는 경우 키 파일 경로 확인

---

## 📋 접속 성공 후 배포 절차

SSH 접속이 성공하면 다음 명령어를 순서대로 실행:

```bash
# 1. 현재 위치 확인
pwd

# 2. 프로젝트 디렉토리 찾기 (일반적인 위치들)
cd /var/www/workfair
# 또는
cd /home/ubuntu/workfair
# 또는
cd /opt/workfair
# 또는
cd ~/workfair

# 3. Git 저장소 확인
git remote -v

# 4. 백엔드 디렉토리로 이동
cd backend

# 5. 최신 코드 가져오기
git pull origin main

# 6. 가상환경 활성화 (경로는 서버마다 다름)
source venv/bin/activate
# 또는
. venv/bin/activate

# 7. 의존성 업데이트 (필요한 경우)
pip install -r requirements.txt

# 8. 서버 재시작
# 방법은 서버 설정에 따라 다름:

# 방법 A: systemd 사용
sudo systemctl restart workfair
# 또는
sudo systemctl restart uvicorn

# 방법 B: pm2 사용
pm2 restart workfair

# 방법 C: supervisor 사용
sudo supervisorctl restart workfair

# 방법 D: 직접 실행 중인 경우
# 프로세스 찾기
ps aux | grep uvicorn
# 프로세스 종료 후 재시작
pkill -f uvicorn
cd /path/to/backend
source venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 3002 > /dev/null 2>&1 &
```

---

## 🔍 서버 구조 확인

접속 후 다음 명령어로 서버 구조 확인:

```bash
# 프로젝트 디렉토리 찾기
find / -name "main.py" -path "*/app/main.py" 2>/dev/null

# 또는
find /home -name "main.py" 2>/dev/null
find /var/www -name "main.py" 2>/dev/null
find /opt -name "main.py" 2>/dev/null

# 실행 중인 프로세스 확인
ps aux | grep uvicorn
ps aux | grep python

# 서비스 상태 확인
systemctl status workfair
# 또는
pm2 list
```

---

## ⚠️ 주의사항

1. **서버 재시작 전에 확인:**
   - 현재 실행 중인 서비스 확인
   - 데이터베이스 백업 (필요한 경우)

2. **권한 문제:**
   - `sudo` 권한이 필요할 수 있음
   - 파일 소유권 확인: `ls -la`

3. **환경 변수:**
   - `.env` 파일 확인
   - 데이터베이스 연결 정보 확인

---

## 🆘 문제 해결

### SSH 접속이 안 되는 경우

```powershell
# 연결 테스트
Test-NetConnection -ComputerName route.nois.club -Port 22

# 상세 정보 확인
ssh -v root@route.nois.club
```

### 비밀번호를 모르는 경우

- 교수님/서버 관리자에게 SSH 접속 정보 요청
- 또는 SSH 키 파일 사용 (`.pem`, `.ppk` 파일)

### Git pull이 안 되는 경우

```bash
# Git 상태 확인
git status

# 원격 저장소 확인
git remote -v

# 강제로 pull (주의: 로컬 변경사항 손실 가능)
git fetch origin
git reset --hard origin/main
```

---

## 📝 빠른 배포 스크립트

서버에 접속 후 다음 스크립트를 실행하면 자동으로 배포됩니다:

```bash
#!/bin/bash
# 배포 스크립트 (deploy.sh)

cd /path/to/backend  # 실제 경로로 변경
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
# 서버 재시작 (방법은 서버 설정에 따라 다름)
sudo systemctl restart workfair
```

---

## ✅ 배포 확인

배포 후 다음으로 확인:

1. **API 문서 확인:**
   ```
   https://route.nois.club:3002/docs
   ```

2. **엔드포인트 확인:**
   ```powershell
   curl https://route.nois.club:3002/api/posts
   curl https://route.nois.club:3002/employer/stores/employer-test-001
   ```

3. **서버 로그 확인:**
   ```bash
   # systemd 사용 시
   sudo journalctl -u workfair -f
   
   # pm2 사용 시
   pm2 logs workfair
   
   # 직접 실행 시
   tail -f /path/to/logfile.log
   ```

