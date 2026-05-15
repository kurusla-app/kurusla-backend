import 'dotenv/config';
import prisma from '../src/config/db';
import { SecurityService } from '../src/services/security.service';

async function testEncryption() {
  console.log('🚀 KVKK Şifreleme Testi Başlatılıyor...\n');

  // 1. Test verisi oluştur
  const testMerchant = 'Starbucks - ' + Math.random().toString(36).substring(7);
  console.log('📝 Orijinal Veri:', testMerchant);

  // 2. Veritabanına kaydet (Extension otomatik şifrelemeli)
  const newTx = await prisma.transaction.create({
    data: {
      amount: 100,
      merchant: testMerchant,
      category: 'Food',
      userId: 1 // Test kullanıcısı id: 1 varsayıyoruz
    }
  });

  console.log('✅ DB\'den Dönen (Extension ile Çözülmüş):', newTx.merchant);

  // 3. Veritabanındaki ham veriyi kontrol et (Extension'ı atlayarak veya ham sorgu ile)
  // Prisma extension "result" kısmında çalıştığı için ham veriyi görmek için doğrudan sorgu atalım
  const rawTx: any = await (prisma as any).$queryRaw`SELECT merchant FROM "Transaction" WHERE id = ${newTx.id}`;
  console.log('🔒 DB\'deki Ham (Şifreli) Hali:', rawTx[0].merchant);

  if (rawTx[0].merchant.includes(':')) {
    console.log('\n✨ TEST BAŞARILI: Veri DB\'de şifreli saklanıyor!');
  } else {
    console.error('\n❌ TEST HATASI: Veri DB\'de şifresiz görünüyor!');
  }
}

testEncryption()
  .catch(e => console.error(e))
  .finally(async () => await (prisma as any).$disconnect());
