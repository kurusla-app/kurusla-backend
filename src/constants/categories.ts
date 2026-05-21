/**
 * İşlem kategorileri — rozet, webhook, ekstre ve admin analytics aynı isimleri kullanır.
 * MOBILE_API_GUIDE ve synthetic data klasörleriyle uyumlu.
 */
export const TransactionCategories = {
  FOOD_DRINK: 'Food & Drink',
  GROCERY: 'Grocery',
  DIGITAL_SUBSCRIPTIONS: 'Digital Subscriptions',
  TRANSPORTATION: 'Transportation',
  CLOTHING_FASHION: 'Clothing & Fashion',
  HEALTH_PERSONAL_CARE: 'Health & Personal Care',
  GAMING_ENTERTAINMENT: 'Gaming & Entertainment',
  EDUCATION: 'Education',
  /** Tanımlanamayan SMS / işyeri */
  OTHER: 'Other',
  /** Ekstre satırı eşleşmedi (sadece parse fallback) */
  STATEMENT_UNKNOWN: 'Ekstre',
} as const;

export type TransactionCategory =
  (typeof TransactionCategories)[keyof typeof TransactionCategories];
