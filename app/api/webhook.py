import os
from fastapi import APIRouter, HTTPException, Header, Depends
from dotenv import load_dotenv
from app.schemas.webhook import WebhookTransaction
from app.services import webhook_service

load_dotenv()

router = APIRouter()

WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET_KEY")

async def verify_webhook_key(x_webhook_key: str = Header(default=None)):
    if not x_webhook_key or x_webhook_key != WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return x_webhook_key

@router.post("/transaction", dependencies=[Depends(verify_webhook_key)])
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
