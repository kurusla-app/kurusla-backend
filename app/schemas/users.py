from pydantic import BaseModel
from typing import Optional

class UserRuleUpdate(BaseModel):
    roundUpStep: float
