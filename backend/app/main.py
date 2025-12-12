from fastapi import FastAPI, WebSocket, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.db import create_db_and_tables
from app.routers import (
    auth,
    jobs,
    applications,
    users,
    conversations,
    messages,
    translate,
    learning,
    meta,
    job_seeker,
    employer,
    posts,
)
from app.ws import websocket_endpoint

# Translation service는 선택적으로 import
try:
    from app.services.translation import initialize_translation_service
    TRANSLATION_AVAILABLE = True
except ImportError:
    TRANSLATION_AVAILABLE = False
    print("Warning: Translation service not available. Some features may not work.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()
    
    # Seed data
    from app.seed import seed_nationalities
    seed_nationalities()
    # Ensure DB schema columns are present according to models (non-destructive)
    try:
        # import here to avoid circular import at module load time
        from scripts.ensure_schema import ensure_columns as ensure_cols
        from app.db import get_engine

        engine = get_engine()
        created, skipped, errors = ensure_cols(engine)
        if errors:
            # Log but continue; global exception handler will surface errors for requests
            print("Schema ensure reported errors:", errors)
    except Exception as exc:
        print("Failed to run schema ensure on startup:", exc)

    if TRANSLATION_AVAILABLE:
        initialize_translation_service()
    yield
    # Shutdown
    pass


app = FastAPI(
    title="WorkFair API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS - 개발 환경용 설정 (미들웨어 순서 중요: CORS는 가장 먼저)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Global exception handler to ensure CORS headers are always present on errors
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """HTTPException 처리 시 CORS 헤더 추가"""
    origin = request.headers.get("origin", "*")
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]
    
    # 요청 origin이 허용된 목록에 있으면 사용, 없으면 *
    cors_origin = origin if origin in allowed_origins else "*"
    
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": cors_origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """모든 예외 처리 시 CORS 헤더 추가"""
    import traceback
    error_detail = f"Internal server error: {str(exc)}\n{traceback.format_exc()}"
    # Windows cp949 인코딩 문제 방지를 위해 안전하게 출력
    try:
        print(f"[ERROR] {str(exc)}")
    except:
        print("[ERROR] Internal server error (인코딩 오류)")
    
    origin = request.headers.get("origin", "*")
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]
    
    cors_origin = origin if origin in allowed_origins else "*"
    
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": cors_origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Include routers
app.include_router(auth.router)
app.include_router(meta.router)
app.include_router(job_seeker.router)
app.include_router(employer.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(users.router)
app.include_router(conversations.router)
app.include_router(messages.router)
app.include_router(translate.router)
app.include_router(learning.router)
app.include_router(posts.router)


# WebSocket endpoint
@app.websocket("/ws/conversations/{conversation_id}")
async def websocket_conversation(websocket: WebSocket, conversation_id: str):
    await websocket_endpoint(websocket, conversation_id)


@app.get("/")
async def root():
    return {"message": "WorkFair API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

# OPTIONS 요청을 명시적으로 처리 (CORS preflight)
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return {"message": "OK"}

