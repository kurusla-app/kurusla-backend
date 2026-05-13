from pydantic import BaseModel
from typing import Optional

class WebhookTransaction(BaseModel):
    amount: float
    merchant: str
    userId: int
    category: Optional[str] = "Diğer" # Make.com kategori yollamazsa varsayılan "Diğer" olur
