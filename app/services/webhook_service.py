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

    # Kullanıcının özel yuvarlama kuralını (Rule) veritabanından çek
    user_rule = await db.userrule.find_unique(
        where={
            "userId": data.userId
        }
    )
    
    # Kullanıcının kuralı yoksa varsayılan olarak 10.0 al
    round_up_step = user_rule.roundUpStep if user_rule else 10.0

    # 2. Math Engine'i Tetikle (Kullanıcının tercihine göre)
    saving_amount = calculate_round_up(data.amount, step=round_up_step)

    # 3. DB Kaydı (Transaction ve Saving tablolarına tek seferde kayıt)
    # Prisma'nın Nested Writes (İç içe yazma) özelliği sayesinde Transaction oluşurken, Saving de ona bağlanarak oluşur.
    
    transaction_data = {
        "amount": data.amount,
        "merchant": data.merchant,
        "category": final_category,
        "user": {
            "connect": {"id": data.userId}
        }
    }
    
    if saving_amount > 0:
        transaction_data["saving"] = {
            "create": {
                "amount": saving_amount,
                "user": {
                    "connect": {"id": data.userId}
                }
            }
        }

    new_transaction = await db.transaction.create(
        data=transaction_data,
        include={"saving": True} # Kayıttan sonra Saving sonucunu da bize döndürsün
    )
    
    return new_transaction
