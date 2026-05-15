import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''; // 32 chars
const IV_LENGTH = 16; // For AES, this is always 16

export class SecurityService {
  /**
   * Veriyi şifreler.
   * Format: iv:ciphertext
   */
  static encrypt(text: string): string {
    if (!text) return text;
    if (ENCRYPTION_KEY.length !== 32) {
      console.error('CRITICAL: ENCRYPTION_KEY 32 karakter olmalıdır!');
      return text;
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  /**
   * Şifrelenmiş veriyi çözer.
   */
  static decrypt(text: string): string {
    if (!text || !text.includes(':')) return text;

    try {
      const textParts = text.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString();
    } catch (error) {
      console.error('Decryption failed:', error);
      return text; // Çözülemezse orijinali dön (fail-safe)
    }
  }
}
