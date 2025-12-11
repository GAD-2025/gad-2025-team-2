# SSH 키 등록 가이드 (터미널 입력 안 될 때)

## 🔧 해결 방법

Cursor 터미널에서 입력이 안 되면, **Windows PowerShell을 직접** 열어서 실행하세요.

---

## 📋 단계별 가이드

### 1단계: Windows PowerShell 열기

1. **Windows 키** 누르기
2. **"PowerShell"** 입력
3. **"Windows PowerShell"** 클릭
   - ⚠️ "관리자 권한으로 실행"은 선택하지 마세요!

---

### 2단계: 프로젝트 디렉토리로 이동

PowerShell 창에서:

```powershell
cd "C:\Users\peach\Downloads\gad-2025-team-2-main\gad-2025-team-2-main"
```

---

### 3단계: 공개 키 확인

```powershell
type $HOME\.ssh\workfair_deploy.pub
```

출력 예시:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJHUiPxWaRAjHWzXL6/TxVsIpuUiivf/KbKEzHeKi9En workfair-deploy
```

**이 전체 내용을 복사하세요!**

---

### 4단계: SSH 접속

```powershell
ssh root@route.nois.club
```

**비밀번호 입력:** `team2pass` (화면에 표시 안 됨, 그냥 입력하고 Enter)

---

### 5단계: 서버에서 키 등록

서버에 접속되면 (프롬프트가 `root@route:~#` 형태로 바뀜):

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

그 다음, **3단계에서 복사한 공개 키 전체**를 붙여넣기:

```bash
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJHUiPxWaRAjHWzXL6/TxVsIpuUiivf/KbKEzHeKi9En workfair-deploy' >> ~/.ssh/authorized_keys
```

```bash
chmod 600 ~/.ssh/authorized_keys
echo '✅ SSH 키 등록 완료!'
exit
```

---

### 6단계: 확인

PowerShell로 돌아온 후:

```powershell
ssh root@route.nois.club "echo '✅ 비밀번호 없이 접속 성공!'"
```

**비밀번호를 요청하지 않으면** 성공!

---

## ✅ 이후 사용

이제 Cursor 터미널에서:

```powershell
.\최종_배포_스크립트.ps1
```

**비밀번호 없이** 자동으로 배포됩니다!

---

## 🆘 문제 해결

### 여전히 비밀번호를 요청하는 경우

1. 공개 키가 제대로 등록되었는지 확인:
   ```powershell
   ssh root@route.nois.club "cat ~/.ssh/authorized_keys"
   ```

2. SSH 키 파일 권한 확인:
   ```powershell
   icacls $HOME\.ssh\workfair_deploy
   ```

3. SSH 설정 파일 확인:
   ```powershell
   type $HOME\.ssh\config
   ```

