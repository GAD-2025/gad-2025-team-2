# WorkFair Backend API

FastAPI backend for the WorkFair job marketplace platform.

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Seed database
python -m app.seed

# Run server
uvicorn app.main:app --reload
```

API will be available at http://localhost:8000

Interactive docs: http://localhost:8000/docs

## 📊 Database Models

### Core Models

**JobSeeker**
- Profile information (name, nationality, phone)
- Language level & visa type
- Experience history
- Job preferences

**Employer**
- Business information
- Shop details
- Required language/visa levels
- Base wage & schedule

**Job**
- Job posting details
- Requirements (language, visa)
- Wage & schedule
- Deadline & positions

**Application**
- Links JobSeeker ↔ Job
- Status tracking (applied/hired/rejected)
- Timestamps

**Conversation & Message**
- Real-time messaging
- Translation support
- Read receipts

**LearningProgress**
- Track language learning
- Lesson completion
- Progress percentage

## 🔌 API Endpoints

### Authentication
```http
POST /auth/signin
POST /auth/signup
```

### Jobs
```http
GET /jobs?query=&location=&industry=&limit=20
GET /jobs/{id}
```

### Applications
```http
POST /applications
GET /applications?seekerId=&jobId=
PATCH /applications/{id}
```

### Users
```http
GET /jobseekers/{id}
GET /employers/{id}
```

### Messages
```http
GET /conversations/{userId}
GET /conversations/{id}/messages?cursor=&limit=50
POST /messages
POST /messages/read
```

### Translation
```http
POST /translate
```

### Learning
```http
GET /learning/summary?seekerId=
POST /leveltest
```

### Job Seeker Profile
```http
POST /job-seeker/profile
GET /job-seeker/profile/{user_id}
```

Creates or updates a job seeker profile with onboarding data:
- Basic info file name
- Preferred regions
- Preferred jobs
- Work schedule (available dates, start/end time, days of week)

### WebSocket
```
WS /ws/conversations/{id}
```

## 🔐 Authentication

Uses JWT tokens:
1. Sign in/up → receive token
2. Include in requests: `Authorization: Bearer <token>`
3. Token expires in 7 days

## 💾 Database

**Development**: SQLite (`workfair.db`)
**Production**: Can switch to PostgreSQL by changing `DATABASE_URL`

### Seeding Data

```bash
python -m app.seed
```

Creates:
- 2 job seekers
- 4 employers
- 4 job postings
- 2 user accounts (test login)
- 1 learning progress record

### Test Accounts
- Jobseeker: `seeker1@example.com` / `password123`
- Employer: `employer1@example.com` / `password123`

## 🔧 Configuration

Environment variables (`.env`):

```env
DATABASE_URL=sqlite:///./workfair.db
JWT_SECRET=devsecret
TRANSLATE_PROVIDER=mock  # or "gemini"
GEMINI_API_KEY=          # if using Gemini
```

## 🌐 WebSocket Chat

Connect to `/ws/conversations/{conversation_id}`:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/conversations/conv-123');

ws.onopen = () => {
  ws.send(JSON.stringify({
    senderId: 'seeker-1',
    text: 'Hello!',
    timestamp: new Date().toISOString()
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

## 🔄 Translation Service

Adapter pattern supports multiple providers:

- **Mock**: Returns `[번역: {text}]` for testing
- **Gemini**: Integrate with Google Gemini API

Switch via `TRANSLATE_PROVIDER` env var.

## 📝 Schemas

Pydantic models for request/response validation:
- `SignInRequest`, `SignUpRequest`, `SignupPayload`
- `ApplicationCreate`, `ApplicationUpdate`
- `MessageCreate`, `MessageRead`
- `TranslateRequest`, `TranslateResponse`
- `LevelTestSubmit`
- `JobSeekerProfileCreate`, `JobSeekerProfileResponse`, `WorkSchedulePayload`

## 🚦 Error Handling

Standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (e.g., duplicate application)
- `500` - Internal Server Error

## 📦 Dependencies

- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **sqlmodel** - ORM with Pydantic integration
- **python-jose** - JWT handling
- **passlib** - Password hashing
- **websockets** - WebSocket support
- **python-dotenv** - Environment variables

## 🧪 Testing

```bash
# Run with test database
DATABASE_URL=sqlite:///./test.db uvicorn app.main:app --reload

# Or use pytest (add tests)
pytest
```

## 📚 API Documentation

Auto-generated interactive docs:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens for stateless auth
- CORS configured for frontend origin
- SQL injection protection via SQLModel

## 🛠 Development

```bash
# Format code
black app/

# Type checking
mypy app/

# Linting
flake8 app/
```

## 📈 Scaling Considerations

For production:
1. Switch to PostgreSQL
2. Add Redis for session/cache
3. Implement rate limiting
4. Add logging & monitoring
5. Use proper secret management
6. Enable HTTPS
7. Add database migrations (Alembic)

---

For questions or issues, please open a GitHub issue.

