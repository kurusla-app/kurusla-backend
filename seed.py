import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()

    # Popüler markalar ve kategorileri
    merchants = [
        # Yeme-İçme (Food & Drink)
        {"name": "Starbucks", "category": "Yeme-İçme", "icon": "coffee"},
        {"name": "Kahve Dünyası", "category": "Yeme-İçme", "icon": "coffee"},
        {"name": "Espressolab", "category": "Yeme-İçme", "icon": "coffee"},
        {"name": "Burger King", "category": "Yeme-İçme", "icon": "fast-food"},
        {"name": "McDonald's", "category": "Yeme-İçme", "icon": "fast-food"},
        {"name": "Dominos", "category": "Yeme-İçme", "icon": "pizza"},
        {"name": "KFC", "category": "Yeme-İçme", "icon": "chicken"},
        {"name": "Popeyes", "category": "Yeme-İçme", "icon": "chicken"},
        {"name": "Big Chefs", "category": "Yeme-İçme", "icon": "restaurant"},
        {"name": "Midpoint", "category": "Yeme-İçme", "icon": "restaurant"},
        {"name": "Yemeksepeti", "category": "Yeme-İçme", "icon": "delivery"},
        {"name": "GetirYemek", "category": "Yeme-İçme", "icon": "delivery"},
        {"name": "Tıkla Gelsin", "category": "Yeme-İçme", "icon": "delivery"},
        {"name": "Simit Sarayı", "category": "Yeme-İçme", "icon": "bakery"},
        {"name": "Mado", "category": "Yeme-İçme", "icon": "ice-cream"},
        {"name": "Baydöner", "category": "Yeme-İçme", "icon": "meat"},
        {"name": "Köfteci Yusuf", "category": "Yeme-İçme", "icon": "meat"},
        {"name": "HD İskender", "category": "Yeme-İçme", "icon": "meat"},
        {"name": "Tavuk Dünyası", "category": "Yeme-İçme", "icon": "chicken"},

        # Alışveriş (Shopping)
        {"name": "Trendyol", "category": "Alışveriş", "icon": "shopping-bag"},
        {"name": "Hepsiburada", "category": "Alışveriş", "icon": "shopping-cart"},
        {"name": "Amazon", "category": "Alışveriş", "icon": "amazon"},
        {"name": "Zara", "category": "Alışveriş", "icon": "clothing"},
        {"name": "H&M", "category": "Alışveriş", "icon": "clothing"},
        {"name": "Nike", "category": "Alışveriş", "icon": "sports"},
        {"name": "Adidas", "category": "Alışveriş", "icon": "sports"},
        {"name": "LC Waikiki", "category": "Alışveriş", "icon": "clothing"},
        {"name": "DeFacto", "category": "Alışveriş", "icon": "clothing"},
        {"name": "Boyner", "category": "Alışveriş", "icon": "department-store"},
        {"name": "Decathlon", "category": "Alışveriş", "icon": "sports"},
        {"name": "IKEA", "category": "Alışveriş", "icon": "home"},
        {"name": "Apple", "category": "Elektronik", "icon": "apple"},
        {"name": "Samsung", "category": "Elektronik", "icon": "phone"},
        {"name": "Teknosa", "category": "Elektronik", "icon": "electronics"},
        {"name": "MediaMarkt", "category": "Elektronik", "icon": "electronics"},
        {"name": "Vatan Bilgisayar", "category": "Elektronik", "icon": "electronics"},
        {"name": "Mavi", "category": "Alışveriş", "icon": "clothing"},
        {"name": "Penti", "category": "Alışveriş", "icon": "clothing"},
        {"name": "Gratis", "category": "Kişisel Bakım", "icon": "beauty"},
        {"name": "Watsons", "category": "Kişisel Bakım", "icon": "beauty"},
        {"name": "Rossmann", "category": "Kişisel Bakım", "icon": "beauty"},
        {"name": "Sephora", "category": "Kişisel Bakım", "icon": "beauty"},

        # Market (Groceries)
        {"name": "Migros", "category": "Market", "icon": "grocery"},
        {"name": "Carrefour", "category": "Market", "icon": "grocery"},
        {"name": "Şok", "category": "Market", "icon": "grocery"},
        {"name": "A101", "category": "Market", "icon": "grocery"},
        {"name": "BİM", "category": "Market", "icon": "grocery"},
        {"name": "Macrocenter", "category": "Market", "icon": "grocery"},
        {"name": "Getir", "category": "Market", "icon": "delivery"},
        {"name": "Yemeksepeti Market", "category": "Market", "icon": "delivery"},
        {"name": "İstegelsin", "category": "Market", "icon": "delivery"},
        {"name": "Tarım Kredi", "category": "Market", "icon": "grocery"},

        # Eğlence (Entertainment)
        {"name": "Netflix", "category": "Eğlence", "icon": "video"},
        {"name": "Spotify", "category": "Eğlence", "icon": "music"},
        {"name": "YouTube", "category": "Eğlence", "icon": "video"},
        {"name": "Disney+", "category": "Eğlence", "icon": "video"},
        {"name": "Amazon Prime", "category": "Eğlence", "icon": "video"},
        {"name": "Steam", "category": "Eğlence", "icon": "game"},
        {"name": "PlayStation", "category": "Eğlence", "icon": "game"},
        {"name": "Xbox", "category": "Eğlence", "icon": "game"},
        {"name": "Twitch", "category": "Eğlence", "icon": "video"},
        {"name": "App Store", "category": "Eğlence", "icon": "apps"},
        {"name": "Google Play", "category": "Eğlence", "icon": "apps"},

        # Ulaşım (Transport)
        {"name": "Shell", "category": "Ulaşım", "icon": "gas-station"},
        {"name": "Opet", "category": "Ulaşım", "icon": "gas-station"},
        {"name": "Petrol Ofisi", "category": "Ulaşım", "icon": "gas-station"},
        {"name": "BP", "category": "Ulaşım", "icon": "gas-station"},
        {"name": "Total", "category": "Ulaşım", "icon": "gas-station"},
        {"name": "Uber", "category": "Ulaşım", "icon": "taxi"},
        {"name": "BiTaksi", "category": "Ulaşım", "icon": "taxi"},
        {"name": "Martı", "category": "Ulaşım", "icon": "scooter"},
        {"name": "BinBin", "category": "Ulaşım", "icon": "scooter"},
        {"name": "Hop", "category": "Ulaşım", "icon": "scooter"},
        {"name": "THY", "category": "Ulaşım", "icon": "plane"},
        {"name": "Pegasus", "category": "Ulaşım", "icon": "plane"},
        {"name": "Kamil Koç", "category": "Ulaşım", "icon": "bus"},
        {"name": "Metro Turizm", "category": "Ulaşım", "icon": "bus"},
        {"name": "TCDD", "category": "Ulaşım", "icon": "train"},

        # Faturalar & Hizmetler (Bills & Services)
        {"name": "Turkcell", "category": "Faturalar", "icon": "phone"},
        {"name": "Vodafone", "category": "Faturalar", "icon": "phone"},
        {"name": "Türk Telekom", "category": "Faturalar", "icon": "phone"},
        {"name": "Digiturk", "category": "Faturalar", "icon": "tv"},
        {"name": "D-Smart", "category": "Faturalar", "icon": "tv"},
        {"name": "Türksat", "category": "Faturalar", "icon": "internet"},
        {"name": "Superonline", "category": "Faturalar", "icon": "internet"},
        {"name": "EnerjiSA", "category": "Faturalar", "icon": "bolt"},
        {"name": "İSKİ", "category": "Faturalar", "icon": "water"},
        {"name": "İGDAŞ", "category": "Faturalar", "icon": "fire"},

        # Diğer Popüler Markalar
        {"name": "Papara", "category": "Finans", "icon": "wallet"},
        {"name": "Nays", "category": "Finans", "icon": "wallet"},
        {"name": "Eczane", "category": "Sağlık", "icon": "health"},
        {"name": "MACFit", "category": "Spor", "icon": "gym"},
        {"name": "Joker", "category": "Bebek", "icon": "baby"},
        {"name": "Civil", "category": "Bebek", "icon": "baby"},
        {"name": "English Home", "category": "Ev Yaşam", "icon": "home"},
        {"name": "Madame Coco", "category": "Ev Yaşam", "icon": "home"},
    ]

    print(f"Toplam {len(merchants)} marka yükleniyor...")

    for merchant in merchants:
        # Upsert kullanarak varsa güncelleme, yoksa ekleme yapıyoruz (Hata almamak için)
        await db.merchantcategory.upsert(
            where={'name': merchant['name']},
            data={
                'create': merchant,
                'update': merchant
            }
        )
    
    print("Veri yükleme işlemi başarıyla tamamlandı!")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
