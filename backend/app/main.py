from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db import create_db_and_tables
from app.routers import auth, jobs, applications, users, conversations, messages, translate, learning, meta
from app.ws import websocket_endpoint
from app.services.translation import initialize_translation_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_db_and_tables()
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
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(meta.router)
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

