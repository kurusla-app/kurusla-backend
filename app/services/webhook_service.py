from app.core.db import db
from app.services.savings_service import calculate_round_up

async def process_webhook_transaction(data):
    # 1. AI Ön-hazırlığı: Veritabanında (MerchantCategory) markayı ara
    # contains ve mode="insensitive" ile "starbucks" veya "STARBUCKS" fark etmez
    merchant_info = await db.merchantcategory.find_first(
        where={
            "name": {
                "contains": data.merchant,
                "mode": "insensitive"
            }
        }
    )
    
    # Eğer marka bizde kayıtlıysa onun kategorisini al, yoksa gelen veriyi/varsayılanı kullan
    final_category = merchant_info.category if merchant_info else data.category

    # 2. Math Engine'i Tetikle (Varsayılan 10 TL'lik yuvarlama)
    saving_amount = calculate_round_up(data.amount, step=10.0)

    # 3. DB Kaydı (Transaction ve Saving tablolarına tek seferde kayıt)
    # Prisma'nın Nested Writes (İç içe yazma) özelliği sayesinde Transaction oluşurken, Saving de ona bağlanarak oluşur.
    
    # Eğer yuvarlama sıfırsa (örn 20.00 TL harcandıysa) Saving kaydı atmıyoruz.
    saving_data = None
    if saving_amount > 0:
        saving_data = {
            "create": {
                "amount": saving_amount,
                "userId": data.userId
            }
        }

    new_transaction = await db.transaction.create(
        data={
            "amount": data.amount,
            "merchant": data.merchant,
            "category": final_category,
            "userId": data.userId,
            "saving": saving_data
        },
        include={"saving": True} # Kayıttan sonra Saving sonucunu da bize döndürsün
    )
    
    return new_transaction
