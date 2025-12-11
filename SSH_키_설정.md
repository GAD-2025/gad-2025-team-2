# SSH 키 설정으로 비밀번호 없이 접속하기

## 🎯 목표

Cursor 터미널에서 비밀번호 없이 바로 SSH 접속

---

## 🔑 방법 1: SSH 키 생성 및 등록

### 1단계: SSH 키 생성 (로컬)

```powershell
ssh-keygen -t ed25519 -C "workfair-deploy" -f $HOME\.ssh\workfair_deploy
```

비밀번호 없이 사용하려면 Enter만 누르세요 (passphrase 비워두기)

### 2단계: 공개 키를 배포 서버에 등록

생성된 공개 키를 배포 서버에 복사:

```powershell
type $HOME\.ssh\workfair_deploy.pub
```

이 내용을 복사한 후, 배포 서버에 접속하여:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "복사한_공개_키_내용" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3단계: SSH 설정 파일 생성

```powershell
# ~/.ssh/config 파일 생성 또는 수정
notepad $HOME\.ssh\config
```

다음 내용 추가:

```
Host workfair-deploy
    HostName route.nois.club
    User root
    IdentityFile ~/.ssh/workfair_deploy
    StrictHostKeyChecking no
```

### 4단계: 접속 테스트

```powershell
ssh workfair-deploy
```

비밀번호 없이 접속되면 성공!

---

## 🚀 방법 2: 자동 배포 스크립트 (비밀번호 포함)

SSH 키 설정이 복잡하면, 비밀번호를 스크립트에 포함하여 자동 접속:

