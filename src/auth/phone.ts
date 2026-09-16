import type { Country } from '@/constants/countries';

export function nationalDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function localNumber(value: string) {
  return nationalDigits(value).replace(/^0+/, '');
}

export function toE164(country: Country, national: string) {
  return `+${country.dial}${localNumber(national)}`;
}

export function isCompleteNumber(country: Country, national: string) {
  return localNumber(national).length === country.length;
}

export function formatInternational(country: Country, national: string) {
  const digits = localNumber(national);
  return `+${country.dial} ${groupNational(digits)}`.trim();
}

function groupNational(digits: string) {
  if (digits.length === 9) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  if (digits.length === 11) return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  if (digits.length > 4) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return digits;
}
