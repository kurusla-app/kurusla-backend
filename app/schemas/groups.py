from pydantic import BaseModel
from typing import Optional, List

class GroupCreate(BaseModel):
    name: str

class GroupJoin(BaseModel):
    inviteCode: str
    userId: int  # Şimdilik auth olmadığı için userId'yi el ile alıyoruz

class GroupOut(BaseModel):
    id: int
    name: str
    inviteCode: str
    totalSavings: float

    class Config:
        from_attributes = True
