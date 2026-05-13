from pydantic import BaseModel

class SavingRequest(BaseModel):
    amount: float
    ratio: float = 10.0  # Varsayılan %10
    step: float = 10.0   # Varsayılan 10'luk yuvarlama
