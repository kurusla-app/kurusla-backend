from fastapi import APIRouter, HTTPException
from app.schemas.users import UserRuleUpdate
from app.core.db import db

router = APIRouter()

@router.patch("/me/rules")
async def update_user_rules(rule_data: UserRuleUpdate):
    """
    Kullanıcının yuvarlama kuralını günceller.
    Şu an auth sistemi tam olmadığı için test amaçlı userId = 1 kullanıyoruz.
    """
    user_id = 1 # İleride JWT tokendan gelecek
    
    # Kullanıcının rule'u var mı kontrol et, yoksa oluştur, varsa güncelle (upsert)
    rule = await db.userrule.upsert(
        where={
            "userId": user_id
        },
        data={
            "create": {
                "userId": user_id,
                "roundUpStep": rule_data.roundUpStep
            },
            "update": {
                "roundUpStep": rule_data.roundUpStep
            }
        }
    )
    
    return {
        "status": "success",
        "message": "Yuvarlama katsayısı güncellendi.",
        "data": rule
    }
