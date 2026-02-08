// Shared money formatting utilities for consistent currency display across the app

const CURRENCY_SYMBOLS: Record<string, string> = {
  IDR: 'Rp',
  USD: '$',
  SGD: 'S$',
  BRL: 'R$',
};

const CURRENCY_NAMES: Record<string, string> = {
  IDR: 'Indonesian Rupiah',
  USD: 'US Dollar',
  SGD: 'Singapore Dollar',
  BRL: 'Brazilian Real',
};

export const SUPPORTED_CURRENCIES = ['IDR', 'USD', 'SGD', 'BRL'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export function formatMoney(amount: bigint | number, currency?: string): string {
  const currencyCode = currency || 'IDR'; // Backward-compatible default
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
  const amountStr = typeof amount === 'bigint' ? amount.toString() : amount.toString();
  
  // Format with thousand separators for readability
  const formatted = Number(amountStr).toLocaleString('en-US');
  
  return `${symbol} ${formatted}`;
}

export function getCurrencyName(currency: string): string {
  return CURRENCY_NAMES[currency] || currency;
}

export function isSupportedCurrency(currency: string): currency is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency);
}
