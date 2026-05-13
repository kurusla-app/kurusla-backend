import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    
    # test@test.com emaili ile bir kullanıcı oluştur (eğer yoksa)
    user = await db.user.upsert(
        where={"email": "test@test.com"},
        data={
            "create": {
                "email": "test@test.com",
                "password": "dummy_password",
                "balance": 0.0
            },
            "update": {}
        }
    )
    
    print(f"Test kullanıcısı ID'si: {user.id}")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
