from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.webhook import router as webhook_router
from app.routes.analytics import router as analytics_router
from app.auth.routes import router as auth_router
from app.dashboard.overview import router as dashboard_router
from app.dashboard.cashflow import router as cashflow_router
from app.dashboard.insights import router as insights_router
from app.dashboard.risk import router as risk_router

app = FastAPI(title="HustleIQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook_router)
app.include_router(analytics_router)
app.include_router(auth_router, prefix="/auth")
app.include_router(dashboard_router)
app.include_router(cashflow_router)
app.include_router(insights_router)
app.include_router(risk_router)

@app.get("/")
async def home():
    return {"message": "HustleIQ API is running"}