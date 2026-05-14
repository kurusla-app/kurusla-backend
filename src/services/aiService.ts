import axios from 'axios';

export interface AIAnalysisPayload {
  transactionId: number;
  amount: number;
  merchant: string;
  category: string;
}

/**
 * Yusuf'un yazacağı Python FastAPI AI servisine veri gönderen köprü (Connector).
 */
export async function analyzeTransaction(data: AIAnalysisPayload): Promise<void> {
  // .env'den URL'i al, yoksa varsayılan olarak localhost:8001 kullan
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
  
  try {
    console.log(`[AI Service] İşlem (ID: ${data.transactionId}) analize gönderiliyor...`);
    
    const response = await axios.post(`${aiServiceUrl}/analyze`, data);
    
    console.log(`[AI Service] Başarılı yanıt alındı:`, response.data);
  } catch (error: any) {
    // Mikroservis kuralları gereği: Bağımlı servis çökerse ana servisi koru!
    // Hata fırlatmıyoruz, sadece logluyoruz. (Fire-and-forget)
    console.error(`[AI Service Hata] Yusuf'un servisine ulaşılamadı:`, error.message);
  }
}
