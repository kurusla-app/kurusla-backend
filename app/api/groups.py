from fastapi import APIRouter, HTTPException
from app.schemas.groups import GroupCreate, GroupJoin, GroupOut
from app.services import group_service

router = APIRouter()

@router.post("/", response_model=GroupOut)
async def api_create_group(data: GroupCreate):
    """Yeni bir grup oluşturur ve 6 haneli davet kodu döner."""
    try:
        group = await group_service.create_group(data.name)
        return group
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/join", response_model=GroupOut)
async def api_join_group(data: GroupJoin):
    """Davet kodu ile bir gruba dahil olur."""
    group = await group_service.join_group(data.inviteCode, data.userId)
    return group
