from fastapi import APIRouter, HTTPException
from app.schemas.savings import SavingRequest
from app.services.savings_service import calculate_percentage_saving, calculate_round_up

router = APIRouter()

@router.post("/calculate")
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
