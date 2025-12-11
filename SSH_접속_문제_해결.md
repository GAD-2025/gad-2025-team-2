# SSH 접속 "Permission denied" 오류 해결

## 🔍 문제

SSH 접속 시 "Permission denied" 오류가 발생하는 경우

---

## ✅ 해결 방법

### 방법 1: 비밀번호 확인

`team2pass`가 맞는지 확인:
- 대소문자 구분 확인
- 공백 없이 정확히 입력
- 다른 비밀번호일 수 있음

### 방법 2: 사용자 이름 확인

`root`가 아닐 수 있습니다. 다른 사용자 이름 시도:

```powershell
ssh ubuntu@route.nois.club
ssh admin@route.nois.club
ssh deploy@route.nois.club
```

### 방법 3: 교수님/서버 관리자에게 확인

SSH 접속 정보를 확인:
- 정확한 사용자 이름
- 정확한 비밀번호
- SSH 키 사용 가능 여부

---

## 🔑 대안: SSH 키 없이 배포하기

SSH 접속이 안 되더라도, **GitHub에 push하면 자동 배포**가 설정되어 있을 수 있습니다.

### 확인 방법:

1. **GitHub에 코드 push:**
   ```powershell
   git add .
   git commit -m "변경사항"
   git push origin main
   ```

2. **배포 서버 확인:**
   - 브라우저에서: https://route.nois.club:3002/docs
   - 5-10분 후 다시 확인

3. **자동 배포가 설정되어 있다면:**
   - GitHub에 push하면 자동으로 배포 서버에 반영됨

---

## 💡 권장 사항

1. **교수님/서버 관리자에게 SSH 접속 정보 요청**
2. **또는 GitHub push 후 자동 배포 확인**

