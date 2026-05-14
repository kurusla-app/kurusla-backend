import prisma from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Kullanıcı Kayıt (Register) Servisi
export async function registerUser(email: string, passwordRaw: string) {
  // 1. Email kullanımda mı kontrol et
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Bu e-posta adresi zaten kullanımda.');
  }

  // 2. Şifreyi Hashle (Tuzlama/Salt ile)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(passwordRaw, salt);

  // 3. Veritabanına kaydet
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  // 4. Şifreyi geri döndürmemek için objeden çıkarıyoruz
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

// Kullanıcı Giriş (Login) Servisi
export async function loginUser(email: string, passwordRaw: string) {
  // 1. Kullanıcıyı bul
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Geçersiz e-posta veya şifre.');
  }

  // 2. Şifreyi doğrula
  const isPasswordValid = await bcrypt.compare(passwordRaw, user.password);
  if (!isPasswordValid) {
    throw new Error('Geçersiz e-posta veya şifre.');
  }

  // 3. JWT Üret
  const secret = process.env.JWT_SECRET_KEY || 'default_gizli_anahtar';
  const token = jwt.sign(
    { id: user.id, email: user.email }, 
    secret, 
    { expiresIn: '1d' } // 1 gün ömürlü token
  );

  // 4. Şifreyi çıkart ve token ile birlikte dön
  const { password, ...userWithoutPassword } = user;
  
  return {
    token,
    user: userWithoutPassword
  };
}
