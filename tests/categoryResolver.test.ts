import { describe, it, expect } from 'vitest';
import { inferCategoryFromMerchant } from '../src/services/categoryResolver.service';
import { TransactionCategories } from '../src/constants/categories';

describe('inferCategoryFromMerchant', () => {
  it('Starbucks için Food and Drink', () => {
    expect(inferCategoryFromMerchant('STARBUCKS COFFEE TR')).toBe(
      TransactionCategories.FOOD_DRINK
    );
  });

  it('Shell için Transportation', () => {
    expect(inferCategoryFromMerchant('SHELL AKARYAKIT')).toBe(
      TransactionCategories.TRANSPORTATION
    );
  });

  it('bilinmeyen işyeri için Other', () => {
    expect(inferCategoryFromMerchant('RASTGELE ISYERI XYZ')).toBe(
      TransactionCategories.OTHER
    );
  });
});
