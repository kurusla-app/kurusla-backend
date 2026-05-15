import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/ai/execute-action';

async function testAIActions() {
  console.log('🚀 AI Action API Testi Başlatılıyor...\n');

  try {
    // 1. UPDATE_STEP Testi (Normal işlem)
    console.log('--- Test 1: Step Güncelleme (Geçerli) ---');
    const res1 = await axios.post(BASE_URL, {
      userId: 1,
      actionName: 'UPDATE_STEP',
      parameters: { step: 50 }
    });
    console.log('Sonuç:', res1.data);

    // 2. ALLOCATE_FUNDS Testi (Onay Gerektirmeyen Tutar)
    console.log('\n--- Test 2: Fon Aktarımı (Düşük Tutar - Onay Gerektirmez) ---');
    const res2 = await axios.post(BASE_URL, {
      userId: 1,
      actionName: 'ALLOCATE_FUNDS',
      parameters: { amount: 25 }
    });
    console.log('Sonuç:', res2.data);

    // 3. ALLOCATE_FUNDS Testi (Onay Gerektiren Tutar)
    console.log('\n--- Test 3: Fon Aktarımı (Yüksek Tutar - Onay GEREKİR) ---');
    try {
      const res3 = await axios.post(BASE_URL, {
        userId: 1,
        actionName: 'ALLOCATE_FUNDS',
        parameters: { amount: 150 }
      });
      console.log('Sonuç (Beklenen 202):', res3.status, res3.data);
    } catch (err: any) {
      if (err.response && err.response.status === 202) {
        console.log('✅ Başarılı: Sistem 150 TL için onay istedi.');
      } else {
        throw err;
      }
    }

    // 4. Hatalı Parametre Testi (Zod Validasyonu)
    console.log('\n--- Test 4: Hatalı Parametre (Zod Validasyonu) ---');
    try {
      await axios.post(BASE_URL, {
        userId: 1,
        actionName: 'UPDATE_STEP',
        parameters: { step: -10 } // Geçersiz
      });
    } catch (err: any) {
      console.log('✅ Başarılı: Zod geçersiz değeri reddetti.');
      if (err.response) console.log('Hata Mesajı:', JSON.stringify(err.response.data.error));
    }

  } catch (error: any) {
    console.error('❌ Test sırasında hata:', error.message);
    if (error.response) console.error('Hata Detayı:', error.response.data);
  }
}

testAIActions();
