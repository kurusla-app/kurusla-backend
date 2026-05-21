import { parseTurkishAmount } from '../utils/amountParser';

export interface ParsedTransaction {
  merchant: string;
  amount: number;
}

export function parseBankMessage(text: string): ParsedTransaction | null {
  // Banka spesifik veya genel regex modelleri
  const patterns = [
    // Garanti SMS: "Garanti BBVA: STARBUCKS isyerinde 45,50 TL harcama..."
    {
      regex: /(?:Garanti\s+)?(?:BBVA:\s*)?(.+?)\s+(?:isyerinde|işyerinde)\s+([0-9,.]+)\s*TL/i,
      merchantIdx: 1,
      amountIdx: 2,
    },
    // Genel: "Starbucks isyerinde 45.50 TL"
    {
      regex: /(.+?)\s+(?:isyerinde|işyerinde)\s+([0-9,.]+)\s*TL/i,
      merchantIdx: 1,
      amountIdx: 2,
    },
    // Alternatif: "Starbucks firmasindan 120,50 TL"
    {
      regex: /(.+?)\s+(?:firmasindan|firmasından)\s+([0-9,.]+)\s*TL/i,
      merchantIdx: 1,
      amountIdx: 2,
    },
    // Basit Format: "Harcama: Starbucks Tutar: 15.50TL"
    {
      regex: /Harcama:\s*(.*?)\s*Tutar:\s*([0-9,.]+)\s*TL/i,
      merchantIdx: 1,
      amountIdx: 2
    }
  ];

  for (const p of patterns) {
    const match = text.match(p.regex);
    if (match) {
      let merchant = match[p.merchantIdx].trim();
      const amount = parseTurkishAmount(match[p.amountIdx]);

      if (amount) {
        // Gereksiz kelimeleri temizle (Banka ismi vb. başta kalmışsa)
        merchant = merchant
          .replace(/^Garanti\s+BBVA:\s*/i, '')
          .replace(/.*?(?:kartınızla|BBVA|A\.Ş\.|ile|Bankası)/gi, '')
          .trim();
        
        return { merchant, amount };
      }
    }
  }

  return null;
}
