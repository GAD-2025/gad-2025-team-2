# Cursor에서 바로 배포하기

## ✅ 완료된 설정

1. ✅ SSH 키 생성 완료
2. ✅ SSH 설정 파일 생성 완료
3. ⚠️ 배포 서버에 SSH 키 등록 필요 (한 번만)

---

## 🚀 사용 방법

### 1단계: SSH 키 등록 (한 번만!)

터미널에서 다음 명령어 실행:

```powershell
ssh root@route.nois.club "mkdir -p ~/.ssh; chmod 700 ~/.ssh; echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJHUiPxWaRAjHWzXL6/TxVsIpuUiivf/KbKEzHeKi9En workfair-deploy' >> ~/.ssh/authorized_keys; chmod 600 ~/.ssh/authorized_keys; echo '✅ SSH 키 등록 완료!'"
```

**비밀번호 입력:** `team2pass`

이 작업은 **한 번만** 하면 됩니다!

---

### 2단계: 배포 실행

이후부터는 Cursor 터미널에서:

```powershell
.\최종_배포_스크립트.ps1
```

또는

```powershell
.\바로_배포.ps1
```

**비밀번호 없이** 자동으로 배포됩니다!

---

## 📋 배포 스크립트 기능

1. **Git 상태 확인**
2. **변경사항이 있으면 커밋/푸시 안내**
3. **배포 서버에 SSH 접속**
4. **`git pull origin main` 실행**
5. **서버 재시작**

---

## 🔧 문제 해결

### SSH 키 등록이 안 되는 경우

터미널에서 직접 입력:

```powershell
ssh root@route.nois.club
# 비밀번호: team2pass

# 서버에서:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJHUiPxWaRAjHWzXL6/TxVsIpuUiivf/KbKEzHeKi9En workfair-deploy' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

### 여전히 비밀번호를 요청하는 경우

SSH 키가 제대로 등록되었는지 확인:

```powershell
ssh -i $HOME\.ssh\workfair_deploy root@route.nois.club "echo 'SSH 키 작동 확인!'"
```

---

## ✅ 확인

배포 후 확인:

```powershell
curl https://route.nois.club:3002/docs
curl https://route.nois.club:3002/api/posts
```

브라우저에서:
- https://route.nois.club:3002/docs

