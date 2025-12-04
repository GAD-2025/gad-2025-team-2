# WorkFair - Job Marketplace Platform

A modern, mobile-first job marketplace connecting foreign job seekers with Korean employers. Built with React + TypeScript + FastAPI.

## 🚀 Features

- **Mobile-first responsive design** (375px → desktop)
- **4 core screens** matching pixel-perfect mockups
- **Real-time chat** with WebSocket support
- **i18n support** (Korean/English)
- **JWT authentication**
- **Application workflow** with duplicate prevention
- **Learning progress tracking**

## 📸 Screenshots

The application implements 4 core screens:
1. **Jobseeker Home** - Search, filters, job cards, application status
2. **Job Detail** - Full job information with employer message
3. **Jobseeker Home Extended** - Learning progress, quick menu, guides
4. **Talent Filter** - Multi-category filter selection

## 🛠 Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **TailwindCSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Axios** for HTTP requests
- **i18next** for internationalization
- **React Toastify** for notifications

### Backend
- **FastAPI** for REST API
- **SQLModel** + **SQLite** for database
- **JWT** for authentication
- **WebSocket** for real-time chat
- **Passlib** for password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
cp .env.example .env

# Start development server
npm run dev
```

The frontend will be available at http://localhost:5173

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Seed database with test data
python -m app.seed

# Start development server
uvicorn app.main:app --reload
```

The backend will be available at http://localhost:8000

API documentation: http://localhost:8000/docs

## 🧪 Test Accounts

After seeding the database:

- **Jobseeker**: `seeker1@example.com` / `password123`
- **Employer**: `employer1@example.com` / `password123`

## 📱 Mobile-First Design

The app is designed for 375px mobile width with perfect pixel matching to mockups:
- Base width: 375px
- Tablet: 480-1024px (single column, scaled spacing)
- Desktop: 360-420px content width, centered

## 🎨 Design Tokens

Colors extracted from screenshots:
- Primary: `#34D3B4` (Mint)
- Text Primary: `#1E1E1E`
- Text Secondary: `#667085`
- Border: `#E6F3EE`

See `src/theme/tokens.ts` for full design system.

## 🔑 Core Workflows

### 1. Job Application Flow
1. Browse jobs on home page
2. View job details
3. Click "Apply" → API creates application
4. Success toast → Navigate to confirmation

### 2. Employer Hiring Flow
1. View applicants
2. Review profiles
3. Update application status
4. Send message to hire

### 3. Learning Flow
1. View progress card
2. Take level test
3. Track completed lessons

## 📚 API Endpoints

### Auth
- `POST /auth/signin` - Sign in
- `POST /auth/signup` - Sign up

### Jobs
- `GET /jobs` - List jobs (with filters)
- `GET /jobs/{id}` - Get job detail

### Applications
- `POST /applications` - Apply to job
- `GET /applications` - List applications
- `PATCH /applications/{id}` - Update status

### Messages
- `GET /conversations/{userId}` - List conversations
- `GET /conversations/{id}/messages` - Get messages
- `POST /messages` - Send message
- `WS /ws/conversations/{id}` - WebSocket for real-time

### Learning
- `GET /learning/summary` - Get progress
- `POST /leveltest` - Submit test

See http://localhost:8000/docs for full API documentation.

## 🗂 Project Structure

```
.
├── frontend/
│   ├── src/
│   │   ├── components/     # Atomic design components
│   │   ├── pages/          # Route pages
│   │   ├── store/          # Zustand stores
│   │   ├── api/            # API client
│   │   ├── utils/          # Utilities (i18n, date)
│   │   ├── theme/          # Design tokens
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── vite.config.ts
│
└── backend/
    ├── app/
    │   ├── routers/        # API routes
    │   ├── models.py       # Database models
    │   ├── schemas.py      # Pydantic schemas
    │   ├── db.py           # Database config
    │   ├── ws.py           # WebSocket manager
    │   ├── main.py         # FastAPI app
    │   └── seed.py         # Seed script
    └── requirements.txt
```

## 🚧 Future Enhancements

- PWA support for app-like experience
- Capacitor integration for native mobile apps
- Google Maps integration for location-based search
- Real translation API (Gemini/GPT)
- Push notifications
- Advanced filtering and search
- Employer dashboard

## 📄 License

MIT

## 👥 Contributing

Contributions welcome! Please read the contributing guidelines first.

---

Built with ❤️ for foreign workers in Korea

Test commit by Hyunmin

