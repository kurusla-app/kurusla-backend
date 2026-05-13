from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.savings import router as savings_router
from app.api.groups import router as groups_router
from app.api.webhook import router as webhook_router
from app.core.db import connect_db, disconnect_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Uygulama başlarken DB'ye bağlan
    await connect_db()
    yield
    # Uygulama kapanırken DB bağlantısını kes
    await disconnect_db()

app = FastAPI(
    title="Kurusla Backend API",
    description="Mikro Birikim ve AI Destekli Tasarruf Platformu",
    version="2.0.0",
    lifespan=lifespan
)

# Rotaları dahil ediyoruz
app.include_router(savings_router, prefix="/api/savings", tags=["Savings"])
app.include_router(groups_router, prefix="/api/groups", tags=["Groups"])
app.include_router(webhook_router, prefix="/api/webhook", tags=["Webhook"])

@app.get("/")
def read_root():
    return {"status": "success", "message": "Kurusla Backend API is running with Layered Architecture!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
