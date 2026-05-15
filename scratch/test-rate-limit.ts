import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/auth/login'; // Test edilecek bir endpoint

async function testRateLimiter() {
  console.log('🚀 Rate Limiter Testi Başlatılıyor (Sınır: 100 istek)...\n');

  let successCount = 0;
  let failCount = 0;

  // 110 istek göndererek sınırı zorlayalım
  for (let i = 1; i <= 110; i++) {
    try {
      await axios.post(BASE_URL, { email: 'test@test.com', password: '123' });
      successCount++;
    } catch (error: any) {
      if (error.response && error.response.status === 429) {
        console.log(`🛑 ${i}. istekte sınıra takıldı: 429 Too Many Requests`);
        failCount++;
        break; 
      } else {
        // 401 Unauthorized vb. hatalar Gateway'den GEÇTİĞİ anlamına gelir
        successCount++;
      }
    }

    if (i % 20 === 0) console.log(`${i} istek gönderildi...`);
  }

  console.log(`\n📊 Sonuç: ${successCount} başarılı, ${failCount} sınıra takılan.`);
  if (failCount > 0) {
    console.log('✨ TEST BAŞARILI: Gateway koruması aktif!');
  } else {
    console.error('❌ TEST HATASI: Sınır tetiklenmedi.');
  }
}

testRateLimiter();
