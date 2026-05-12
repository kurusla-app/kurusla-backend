from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.services.savings_service import calculate_percentage_saving, calculate_round_up

app = FastAPI(
    title="Kurusla Backend API",
    description="Mikro Birikim ve AI Destekli Tasarruf Platformu",
    version="2.0.0"
)

# İstek (Request) modellerini tanımlıyoruz
class SavingRequest(BaseModel):
    amount: float
    ratio: float = 10.0  # Varsayılan %10
    step: float = 10.0   # Varsayılan 10'luk yuvarlama

@app.get("/")
def read_root():
    return {"status": "success", "message": "Kurusla Backend API (Python) is running!"}

@app.post("/api/savings/calculate")
def calculate_savings(data: SavingRequest):
    """
    Hem yüzde hem de yuvarlama bazlı birikim tutarlarını hesaplar.
    """
    try:
        percentage_result = calculate_percentage_saving(data.amount, data.ratio)
        round_up_result = calculate_round_up(data.amount, data.step)
        
        return {
            "amount": data.amount,
            "percentage_savings": {
                "ratio": data.ratio,
                "saving": percentage_result
            },
            "round_up_savings": {
                "step": data.step,
                "saving": round_up_result
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
