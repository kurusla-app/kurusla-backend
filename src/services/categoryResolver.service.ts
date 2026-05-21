import prisma from '../config/db';
import { TransactionCategories } from '../constants/categories';

const CATEGORY_RULES: Array<{ pattern: RegExp; category: string }> = [
  {
    pattern: /starbucks|kahve|coffee|migros\s*cafe|gloria|espresso|burger|mcdonald|dominos|pizza|restoran|cafe|yemek|food/i,
    category: TransactionCategories.FOOD_DRINK,
  },
  {
    pattern: /migros|bim|a101|şok|sok|carrefour|market|grocery/i,
    category: TransactionCategories.GROCERY,
  },
  {
    pattern: /spotify|netflix|youtube|abonelik|digital|steam|playstation|xbox/i,
    category: TransactionCategories.DIGITAL_SUBSCRIPTIONS,
  },
  {
    pattern: /uber|taksi|metro|otobüs|otobus|shell|opet|bp|akaryakit|akaryakıt|parking|benzin/i,
    category: TransactionCategories.TRANSPORTATION,
  },
  {
    pattern: /zara|h&m|lcw|defacto|moda|giyim/i,
    category: TransactionCategories.CLOTHING_FASHION,
  },
  {
    pattern: /eczane|saglik|sağlık|hospital|medikal/i,
    category: TransactionCategories.HEALTH_PERSONAL_CARE,
  },
  {
    pattern: /steam|epic|oyun|game|gaming/i,
    category: TransactionCategories.GAMING_ENTERTAINMENT,
  },
  {
    pattern: /udemy|coursera|kitap|kurs|egitim|eğitim/i,
    category: TransactionCategories.EDUCATION,
  },
];

/**
 * İşyeri adından kategori tahmini (senkron).
 */
export function inferCategoryFromMerchant(merchant: string): string {
  const trimmed = merchant.trim();
  if (!trimmed) return TransactionCategories.OTHER;

  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(trimmed)) return rule.category;
  }
  return TransactionCategories.OTHER;
}

/**
 * Webhook, ekstre import ve transaction kaydı için kategori.
 * Önce kural tabanlı tahmin, sonra MerchantCategory tablosu.
 */
export async function resolveTransactionCategory(merchant: string): Promise<string> {
  const inferred = inferCategoryFromMerchant(merchant);
  if (inferred !== TransactionCategories.OTHER) {
    return inferred;
  }

  const normalized = merchant.trim();
  if (normalized.length < 2) {
    return TransactionCategories.OTHER;
  }

  const firstToken = normalized.split(/\s+/)[0];
  const known = await prisma.merchantCategory.findFirst({
    where: {
      OR: [
        { name: { equals: normalized, mode: 'insensitive' } },
        { name: { contains: normalized.slice(0, 24), mode: 'insensitive' } },
        ...(firstToken.length >= 3
          ? [{ name: { contains: firstToken, mode: 'insensitive' as const } }]
          : []),
      ],
    },
  });

  return known?.category ?? TransactionCategories.OTHER;
}
