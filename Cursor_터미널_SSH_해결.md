# Cursor 터미널에서 SSH 접속 문제 해결

## 🔍 문제

Cursor 터미널에서 입력이 안 되거나 SSH 접속이 안 되는 경우

---

## ✅ 해결 방법

### 방법 1: 터미널 재시작

1. Cursor 하단 터미널 탭에서 **휴지통 아이콘** 클릭 (터미널 종료)
2. **"+" 버튼** 클릭 (새 터미널 열기)
3. 새 터미널에서 SSH 접속 시도

---

### 방법 2: 터미널 타입 변경

Cursor 터미널 설정에서:
1. 터미널 탭 옆 **"v" 버튼** 클릭
2. **"Select Default Profile"** 선택
3. **"PowerShell"** 또는 **"Command Prompt"** 선택

---

### 방법 3: 배포 스크립트 사용

터미널이 안 되면 **배포 스크립트**를 사용:

1. `간단_배포.bat` 파일 더블클릭
2. 또는 PowerShell에서:
   ```powershell
   .\deploy.ps1
   ```

---

### 방법 4: Git Push 후 자동 배포 확인

배포 서버에 자동 배포가 설정되어 있다면:

1. Cursor에서 코드 수정
2. Git commit & push
3. 배포 서버가 자동으로 반영

자동 배포 확인:
- GitHub Actions 설정 확인
- 배포 서버의 cron job 확인

