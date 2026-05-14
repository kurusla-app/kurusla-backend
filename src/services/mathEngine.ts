/**
 * Matematik Motoru - Yuvarlama işlemini yapar.
 * Örneğin: amount=42.5, step=10 ise -> 50'ye yuvarlar. Birikim: 7.5
 */
export function calculateRoundUp(amount: number, step: number = 10): number {
  if (amount <= 0 || step <= 0) return 0;
  
  const remainder = amount % step;
  if (remainder === 0) return 0; // Zaten tam katı
  
  const saving = step - remainder;
  
  // Kayan nokta hatalarını önlemek için 2 basamağa yuvarla (Örn: 7.50)
  return Math.round(saving * 100) / 100;
}
