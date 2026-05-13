import random
import string
from app.core.db import db
from fastapi import HTTPException

def generate_invite_code(length=6):
    """6 haneli, büyük harf ve rakamlardan oluşan rastgele kod üretir."""
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=length))

async def create_group(name: str):
    # Benzersiz bir davet kodu üretilene kadar dene
    while True:
        code = generate_invite_code()
        existing = await db.group.find_unique(where={"inviteCode": code})
        if not existing:
            break
    
    # Grubu veritabanına kaydet
    new_group = await db.group.create(
        data={
            "name": name,
            "inviteCode": code
        }
    )
    return new_group

async def join_group(invite_code: str, user_id: int):
    # Grubu davet koduyla bul
    group = await db.group.find_unique(where={"inviteCode": invite_code})
    
    if not group:
        # Geçersiz kod hatası (404)
        raise HTTPException(status_code=404, detail="Geçersiz Kod - Grup bulunamadı.")
    
    # Kullanıcıyı güncelle ve gruba dahil et
    updated_user = await db.user.update(
        where={"id": user_id},
        data={"groupId": group.id}
    )
    
    return group
