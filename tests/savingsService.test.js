const { calculatePercentageSaving, calculateRoundUp } = require('../src/services/savingsService');

console.log("\n🚀 --- KURUSLA MİKRO BİRİKİM TEST SONUÇLARI (TESTS KLASÖRÜ) ---\n");

const harcama = 49.99;
const oran = 10;
const hedef = 10;

const yüzdeBirikim = calculatePercentageSaving(harcama, oran);
console.log(`✅ Harcama: ${harcama} TL`);
console.log(`📈 %${oran} Oran ile Biriken: ${yüzdeBirikim} TL`);

const yuvarlamaBirikim = calculateRoundUp(harcama, hedef);
console.log(`🎯 10'a Yuvarlama ile Biriken: ${yuvarlamaBirikim} TL`);

console.log("\n--- DİĞER ÖRNEKLER ---");
console.log("👉 42.30 TL harcama, 10'a yuvarla:", calculateRoundUp(42.30, 10), "TL");
console.log("👉 150.00 TL harcama, %5 birikim:", calculatePercentageSaving(150, 5), "TL");

console.log("\n----------------------------------------------\n");
