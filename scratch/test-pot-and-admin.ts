import prisma from '../src/config/db';
import { processNewTransaction } from '../src/services/transactionService';
import { PotService } from '../src/services/pot.service';

async function testNewFeatures() {
  console.log('🚀 Yeni Özellikler Test Ediliyor...\n');

  try {
    // 1. Kullanıcıyı ADMIN yap (Test için)
    await prisma.user.update({
      where: { id: 1 },
      data: { role: 'ADMIN' } as any
    });
    console.log('✅ Kullanıcı 1 ADMIN yapıldı.');

    // 2. Bir Grup ve Pot Oluştur
    const group = await prisma.group.upsert({
      where: { inviteCode: 'FAMILY123' },
      update: {},
      create: { name: 'Aile Kumbarası', inviteCode: 'FAMILY123' }
    });

    await prisma.user.update({
      where: { id: 1 },
      data: { groupId: group.id }
    });

    const pot = await PotService.createPot(group.id, 'Yeni Araba 🚗', 50000);
    console.log('✅ Ortak Pot Oluşturuldu:', pot.name);

    // 3. Harcama Yap ve Pota Akışını İzle
    console.log('\n📝 55.40 TL\'lik harcama yapılıyor (10 TL yuvarlama ile 4.60 TL birikim)...');
    await processNewTransaction(1, 55.40, 'Migros', 'Market');

    // 4. Pot Durumunu Kontrol Et
    const updatedPot = await (prisma as any).pot.findUnique({ where: { id: pot.id } });
    console.log(`✅ Pot Güncel Tutar: ${updatedPot?.currentAmount} TL`);

    if (updatedPot && updatedPot.currentAmount > 0) {
      console.log('\n✨ TEST BAŞARILI: Birikim başarıyla ortak pota yönlendirildi!');
    } else {
      console.error('\n❌ TEST HATASI: Birikim pota yansımadı.');
    }

  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewFeatures();
