/**
 * Kurusla - Savings Service (Mikro Birikim Motoru)
 * Bu servis, kullanıcının harcamalarından yapılacak birikim tutarlarını hesaplar.
 */

/**
 * Harcama tutarının belirli bir yüzdesini hesaplayarak birikim tutarını döner.
 * @param {number} amount - Harcama tutarı
 * @param {number} ratio - Birikim oranı (0-100 arası, örn: 10)
 * @returns {number} - Birikim tutarı
 */
const calculatePercentageSaving = (amount, ratio) => {
  if (!amount || amount <= 0 || !ratio || ratio <= 0) return 0;

  const rawSaving = amount * (ratio / 100);
  return parseFloat(rawSaving.toFixed(2));
};

/**
 * Klasik Yuvarlama Mantığı (Round-up)
 * @param {number} amount - Harcama tutarı
 * @param {number} step - Yuvarlama hedefi (10, 50, 100 vb.)
 * @returns {number} - Birikim tutarı
 */
const calculateRoundUp = (amount, step) => {
  if (!amount || amount <= 0 || !step || step <= 0) return 0;

  const target = Math.ceil(amount / step) * step;
  const savings = target - amount;
  return parseFloat(savings.toFixed(2));
};

module.exports = {
  calculatePercentageSaving,
  calculateRoundUp
};
