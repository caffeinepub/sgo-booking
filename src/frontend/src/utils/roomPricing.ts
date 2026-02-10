// Bigint-safe room pricing utilities for promo calculations

/**
 * Validates promo percent is within 0-100 range
 */
export function validatePromoPercent(promo: bigint | number): boolean {
  const promoNum = typeof promo === 'bigint' ? Number(promo) : promo;
  return promoNum >= 0 && promoNum <= 100;
}

/**
 * Computes discounted nightly price using integer math to avoid floating point errors
 * Formula: discountedPrice = basePrice - (basePrice * promoPercent / 100)
 */
export function computeDiscountedPrice(basePrice: bigint, promoPercent: bigint): bigint {
  if (promoPercent === BigInt(0)) {
    return basePrice;
  }
  
  // Use integer math: discount = (basePrice * promoPercent) / 100
  const discount = (basePrice * promoPercent) / BigInt(100);
  const discounted = basePrice - discount;
  
  // Ensure we never return negative or zero
  return discounted > BigInt(0) ? discounted : BigInt(1);
}

/**
 * Formats promo display text
 */
export function formatPromoDisplay(promoPercent: bigint | number): string {
  const promoNum = typeof promoPercent === 'bigint' ? Number(promoPercent) : promoPercent;
  return promoNum > 0 ? `${promoNum}% OFF` : 'No promo';
}
