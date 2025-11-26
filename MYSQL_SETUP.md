# MySQL 설정 가이드

## 1️⃣ MySQL 설치 확인

```bash
mysql --version
```

MySQL이 없다면 설치:
- **macOS**: `brew install mysql`
- **Windows**: [MySQL Installer](https://dev.mysql.com/downloads/installer/)
- **Linux**: `sudo apt install mysql-server`

## 2️⃣ MySQL 시작

```bash
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql

# Windows
MySQL은 자동으로 실행됩니다
```

## 3️⃣ 데이터베이스 생성

```bash
# MySQL 접속 (비밀번호 입력 필요)
mysql -u root -p

# 또는 한 줄로
mysql -u root -p -e "CREATE DATABASE workfair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
```

MySQL 콘솔에서:
```sql
CREATE DATABASE workfair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

## 4️⃣ 스키마 Import

```bash
cd /Users/A/gad-2025-team-2
mysql -u root -p workfair < schema.sql
```

성공 시 31개 국가 데이터가 삽입되고 12개 테이블이 생성됩니다.

## 5️⃣ .env 파일 생성

`backend/.env` 파일을 수동으로 생성:

```bash
cd backend
cat > .env << 'EOF'
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/workfair?charset=utf8mb4
JWT_SECRET=devsecret
EOF
```

**중요**: `YOUR_PASSWORD`를 실제 MySQL root 비밀번호로 변경하세요!

비밀번호가 없다면:
```
DATABASE_URL=mysql+pymysql://root:@localhost:3306/workfair?charset=utf8mb4
```

## 6️⃣ Python 패키지 설치

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

## 7️⃣ 서버 실행 및 확인

```bash
uvicorn app.main:app --reload
```

로그에서 확인:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
CREATE TABLE IF NOT EXISTS nationalities...
```

## 🔧 문제 해결

### MySQL 연결 오류
```
sqlalchemy.exc.OperationalError: (pymysql.err.OperationalError) (2002, "Can't connect to local MySQL server")
```

**해결:**
1. MySQL 실행 확인: `mysql -u root -p`
2. 비밀번호 확인
3. 포트 확인: `3306` (기본값)

### 문자 인코딩 오류
```
Warning: (1300, "Invalid utf8mb4 character string")
```

**해결:** 데이터베이스를 utf8mb4로 재생성

```bash
mysql -u root -p -e "DROP DATABASE workfair; CREATE DATABASE workfair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -u root -p workfair < schema.sql
```

## 👥 팀원 협업

### 다른 팀원이 설정할 때:

1. Git pull
```bash
git pull origin main
```

2. MySQL 설정 (위 1-6단계 동일)

3. 스키마 업데이트가 있을 때:
```bash
git pull origin main
mysql -u root -p workfair < schema.sql
```

## 📊 데이터 확인

```bash
mysql -u root -p workfair -e "SHOW TABLES;"
mysql -u root -p workfair -e "SELECT * FROM nationalities LIMIT 5;"
```

## 🔄 SQLite로 되돌리기

`.env` 파일 수정:
```
DATABASE_URL=sqlite:///./workfair.db
```

