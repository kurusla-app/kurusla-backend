from fastapi import FastAPI
from app.api.savings import router as savings_router

app = FastAPI(
    title="Kurusla Backend API",
    description="Mikro Birikim ve AI Destekli Tasarruf Platformu",
    version="2.0.0"
)

# Rotaları dahil ediyoruz (Prefix ekleyerek URL yapısını düzenliyoruz)
app.include_router(savings_router, prefix="/api/savings", tags=["Savings"])

@app.get("/")
def read_root():
    return {"status": "success", "message": "Kurusla Backend API is running with Layered Architecture!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
