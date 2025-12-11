# 배포 서버 직접 접근 가이드

## 🔍 배포 서버 접근 방법

배포 서버 주소: `https://route.nois.club:3002`

이 주소는 **웹 서비스 주소**입니다. 서버에 직접 접근하려면 **SSH 접속**이 필요합니다.

---

## 📋 SSH 접속 정보 확인 필요

배포 서버에 SSH로 접속하려면 다음 정보가 필요합니다:

1. **SSH 호스트 주소** (예: `route.nois.club` 또는 다른 주소)
2. **SSH 포트** (일반적으로 22번)
3. **사용자 이름** (예: `root`, `ubuntu`, `admin` 등)
4. **비밀번호** 또는 **SSH 키**

---

## 🔧 SSH 접속 시도 방법

### Windows에서 SSH 접속

#### 방법 1: PowerShell 사용 (Windows 10/11 기본 제공)

```powershell
# SSH 접속 시도
ssh 사용자명@route.nois.club

# 또는 포트 지정
ssh -p 22 사용자명@route.nois.club
```

#### 방법 2: PuTTY 사용 (별도 설치 필요)

1. PuTTY 다운로드: https://www.putty.org/
2. Host Name: `route.nois.club`
3. Port: `22`
4. Connection type: `SSH`
5. Open 클릭

---

## ✅ 접속 성공 후 할 일

SSH 접속이 성공하면:

```bash
# 1. 프로젝트 디렉토리로 이동 (경로 확인 필요)
cd /path/to/backend  # 실제 경로는 서버마다 다름

# 2. Git 저장소 확인
git remote -v

# 3. 최신 코드 가져오기
git pull origin main

# 4. 의존성 업데이트 (필요한 경우)
pip install -r requirements.txt

# 5. 서버 재시작 (방법은 서버 설정에 따라 다름)
# 예: systemctl restart uvicorn
# 예: pm2 restart app
# 예: supervisorctl restart workfair
```

---

## ❓ 접속 정보 확인 방법

### 1. 교수님/서버 관리자에게 문의
- SSH 접속 정보 요청
- 서버 접근 권한 확인

### 2. GitHub Actions 확인
- `.github/workflows/` 폴더 확인
- 자동 배포 설정이 있는지 확인

### 3. 서버 설정 파일 확인
- 프로젝트 루트에 배포 관련 설정 파일이 있는지 확인

---

## 🚀 빠른 확인 방법

터미널에서 다음 명령어로 SSH 접속 가능 여부 확인:

```powershell
# SSH 포트 확인
Test-NetConnection -ComputerName route.nois.club -Port 22

# 또는
ssh -T git@route.nois.club
```

---

## 💡 대안: 자동 배포 확인

만약 SSH 접속이 안 되더라도, GitHub에 push하면 자동 배포가 설정되어 있을 수 있습니다.

확인 방법:
1. GitHub 저장소의 `.github/workflows/` 폴더 확인
2. Actions 탭에서 배포 상태 확인
3. 자동 배포가 설정되어 있다면 push 후 몇 분 기다리기

