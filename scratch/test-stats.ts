import prisma from '../src/config/db';
import { StatsService } from '../src/services/stats.service';

async function testStats() {
  console.log('🚀 İstatistik API Testi Başlatılıyor...\n');

  try {
    const userId = 1;

    // 1. Önce biraz geçmiş veri oluşturalım (Test için)
    console.log('📝 Test verileri oluşturuluyor...');
    const days = [1, 2, 3, 5, 7]; // Bugün, dün, evvelsi gün...
    
    for (const day of days) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      // Önce bir transaction
      const tx = await prisma.transaction.create({
        data: {
          userId,
          amount: 100 + day,
          merchant: 'Test Market',
          category: 'Market',
          createdAt: date
        }
      });

      // Sonra bir saving
      await prisma.saving.create({
        data: {
          userId,
          transactionId: tx.id,
          amount: 5.5 + day,
          status: 'SUCCESS',
          createdAt: date
        }
      });
    }

    // 2. Servisi çağır (Haftalık)
    console.log('\n📊 Haftalık istatistikler çekiliyor...');
    const weekStats = await StatsService.getSavingsHistory(userId, 'week');
    console.log('Haftalık Veri:', JSON.stringify(weekStats, null, 2));

    if (weekStats.length > 0) {
      console.log('\n✨ TEST BAŞARILI: Tarih bazlı istatistikler başarıyla üretildi!');
    } else {
      console.error('\n❌ TEST HATASI: Veri dönmedi.');
    }

  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStats();
