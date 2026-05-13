from fastapi import APIRouter, HTTPException
from app.schemas.webhook import WebhookTransaction
from app.services import webhook_service

router = APIRouter()

@router.post("/transaction")
async def receive_transaction(data: WebhookTransaction):
    """
    Make.com veya diğer kaynaklardan gelen harcama verisini karşılar.
    """
    try:
        result = await webhook_service.process_webhook_transaction(data)
        return {
            "status": "success",
            "message": "Harcama ve birikim başarıyla işlendi.",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
