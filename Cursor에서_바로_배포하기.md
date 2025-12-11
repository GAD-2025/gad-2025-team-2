# Cursor에서 바로 배포 서버에 반영하기

## 🎯 목표

Cursor에서 코드 수정 → 배포 서버에 바로 반영

---

## 🚀 방법 1: 배포 스크립트 사용 (가장 쉬움!)

### `빠른_배포.bat` 파일 사용

1. **파일 더블클릭** 또는
2. **Cursor 터미널에서 실행:**
   ```powershell
   .\빠른_배포.bat
   ```

**작동 방식:**
1. Git 상태 확인
2. 변경사항이 있으면 커밋/푸시 안내
3. 배포 서버에 SSH 접속
4. `git pull origin main` 실행
5. 서버 재시작

---

## 🔧 방법 2: Cursor 터미널에서 직접 실행

### 터미널이 정상 작동하는 경우:

```powershell
# 1. 프로젝트 디렉토리로 이동
cd "C:\Users\peach\Downloads\gad-2025-team-2-main\gad-2025-team-2-main"

# 2. 변경사항 커밋 및 푸시 (필요한 경우)
git add .
git commit -m "변경사항 설명"
git push origin main

# 3. 배포 서버에 접속하여 배포
ssh root@route.nois.club
# 비밀번호: team2pass

# 서버에서:
cd /var/www/workfair/backend  # 또는 찾은 경로
git pull origin main
sudo systemctl restart workfair
```

---

## 🔄 방법 3: 자동 배포 설정 (최고!)

배포 서버에 자동 배포를 설정하면:
- Cursor에서 코드 수정
- Git commit & push
- **자동으로 배포 서버에 반영!**

### 자동 배포 설정 방법:

배포 서버에서 cron job 설정:
```bash
# 매 5분마다 자동으로 pull
*/5 * * * * cd /var/www/workfair/backend && git pull origin main && systemctl restart workfair
```

또는 GitHub Actions 사용:
- `.github/workflows/deploy.yml` 파일 생성
- GitHub에 push하면 자동 배포

---

## ⚠️ Cursor 터미널 문제 해결

### 터미널이 입력을 받지 못하는 경우:

1. **터미널 재시작:**
   - 터미널 탭 옆 **휴지통 아이콘** 클릭
   - **"+" 버튼** 클릭 (새 터미널)

2. **터미널 타입 변경:**
   - 터미널 탭 옆 **"v" 버튼** 클릭
   - **"Select Default Profile"** 선택
   - **"PowerShell"** 또는 **"Command Prompt"** 선택

3. **배포 스크립트 사용:**
   - 터미널이 안 되면 `빠른_배포.bat` 파일 사용

---

## 📋 작업 흐름

### 일반적인 작업 흐름:

1. **Cursor에서 코드 수정**
2. **변경사항 확인:**
   ```powershell
   git status
   ```
3. **커밋 및 푸시:**
   ```powershell
   git add .
   git commit -m "변경사항 설명"
   git push origin main
   ```
4. **배포 서버에 반영:**
   - 방법 A: `빠른_배포.bat` 실행
   - 방법 B: SSH 접속하여 `git pull`
   - 방법 C: 자동 배포 대기 (설정된 경우)

---

## ✅ 확인 방법

배포 후 확인:

```powershell
# PowerShell에서
curl https://route.nois.club:3002/docs
curl https://route.nois.club:3002/api/posts
```

브라우저에서:
- https://route.nois.club:3002/docs
- `/api/posts` 엔드포인트 확인
- `/employer/stores/{user_id}` 엔드포인트 확인

