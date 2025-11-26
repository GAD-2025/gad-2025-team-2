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

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Global exception handler to ensure CORS headers are always present on errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    # HTTPException은 FastAPI가 이미 처리하므로 제외 (re-raise)
    if isinstance(exc, HTTPException):
        # HTTPException에 CORS 헤더 추가
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers={
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Credentials": "true",
            }
        )
    
    error_detail = f"Internal server error: {str(exc)}\n{traceback.format_exc()}"
    print(error_detail)  # 로그 출력
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Credentials": "true",
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

