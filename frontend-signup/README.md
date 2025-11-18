# WorkFair Signup Wizard

회원가입 4단계 플로우를 구현한 Next.js 프로젝트입니다.

## 시작하기

### 프론트엔드 실행

```bash
cd frontend-signup
npm install
npm run dev
```

브라우저에서 [http://localhost:3000/signup](http://localhost:3000/signup) 접속

### 백엔드 실행

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# 또는 source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python -m app.seed  # 데이터베이스 시드 (최초 1회)
python -m uvicorn app.main:app --reload
```

백엔드 API 문서: [http://localhost:8000/docs](http://localhost:8000/docs)

### 환경 변수

프론트엔드 `.env.local` 파일 생성:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

백엔드 `.env` 파일 생성:
```
DATABASE_URL=sqlite:///./workfair.db
JWT_SECRET=devsecret
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
