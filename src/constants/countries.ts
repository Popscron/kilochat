export type Country = {
  iso: string;
  name: string;
  dial: string;
  /** Digits after country code, not counting a leading 0. */
  length: number;
};

function flag(iso: string) {
  return [...iso.toUpperCase()]
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

export function countryFlag(country: Country) {
  return flag(country.iso);
}

export const COUNTRIES: Country[] = [
  { iso: 'GH', name: 'Ghana', dial: '233', length: 9 },
  { iso: 'NG', name: 'Nigeria', dial: '234', length: 10 },
  { iso: 'KE', name: 'Kenya', dial: '254', length: 9 },
  { iso: 'ZA', name: 'South Africa', dial: '27', length: 9 },
  { iso: 'CI', name: "Côte d'Ivoire", dial: '225', length: 10 },
  { iso: 'TG', name: 'Togo', dial: '228', length: 8 },
  { iso: 'BJ', name: 'Benin', dial: '229', length: 8 },
  { iso: 'BF', name: 'Burkina Faso', dial: '226', length: 8 },
  { iso: 'ML', name: 'Mali', dial: '223', length: 8 },
  { iso: 'SN', name: 'Senegal', dial: '221', length: 9 },
  { iso: 'CM', name: 'Cameroon', dial: '237', length: 9 },
  { iso: 'UG', name: 'Uganda', dial: '256', length: 9 },
  { iso: 'TZ', name: 'Tanzania', dial: '255', length: 9 },
  { iso: 'RW', name: 'Rwanda', dial: '250', length: 9 },
  { iso: 'ET', name: 'Ethiopia', dial: '251', length: 9 },
  { iso: 'EG', name: 'Egypt', dial: '20', length: 10 },
  { iso: 'MA', name: 'Morocco', dial: '212', length: 9 },
  { iso: 'GB', name: 'United Kingdom', dial: '44', length: 10 },
  { iso: 'US', name: 'United States', dial: '1', length: 10 },
  { iso: 'CA', name: 'Canada', dial: '1', length: 10 },
  { iso: 'IN', name: 'India', dial: '91', length: 10 },
  { iso: 'PK', name: 'Pakistan', dial: '92', length: 10 },
  { iso: 'BD', name: 'Bangladesh', dial: '880', length: 10 },
  { iso: 'CN', name: 'China', dial: '86', length: 11 },
  { iso: 'DE', name: 'Germany', dial: '49', length: 10 },
  { iso: 'FR', name: 'France', dial: '33', length: 9 },
  { iso: 'IT', name: 'Italy', dial: '39', length: 10 },
  { iso: 'ES', name: 'Spain', dial: '34', length: 9 },
  { iso: 'NL', name: 'Netherlands', dial: '31', length: 9 },
  { iso: 'BR', name: 'Brazil', dial: '55', length: 11 },
  { iso: 'MX', name: 'Mexico', dial: '52', length: 10 },
  { iso: 'AU', name: 'Australia', dial: '61', length: 9 },
  { iso: 'AE', name: 'United Arab Emirates', dial: '971', length: 9 },
  { iso: 'SA', name: 'Saudi Arabia', dial: '966', length: 9 },
  { iso: 'TR', name: 'Turkey', dial: '90', length: 10 },
  { iso: 'PH', name: 'Philippines', dial: '63', length: 10 },
  { iso: 'ID', name: 'Indonesia', dial: '62', length: 10 },
  { iso: 'MY', name: 'Malaysia', dial: '60', length: 9 },
  { iso: 'SG', name: 'Singapore', dial: '65', length: 8 },
  { iso: 'JP', name: 'Japan', dial: '81', length: 10 },
  { iso: 'KR', name: 'South Korea', dial: '82', length: 10 },
  { iso: 'ZW', name: 'Zimbabwe', dial: '263', length: 9 },
  { iso: 'ZM', name: 'Zambia', dial: '260', length: 9 },
  { iso: 'GM', name: 'Gambia', dial: '220', length: 7 },
  { iso: 'LR', name: 'Liberia', dial: '231', length: 9 },
  { iso: 'SL', name: 'Sierra Leone', dial: '232', length: 8 },
  { iso: 'GN', name: 'Guinea', dial: '224', length: 9 },
  { iso: 'NE', name: 'Niger', dial: '227', length: 8 },
  { iso: 'TD', name: 'Chad', dial: '235', length: 8 },
  { iso: 'GA', name: 'Gabon', dial: '241', length: 8 },
  { iso: 'CD', name: 'DR Congo', dial: '243', length: 9 },
  { iso: 'AO', name: 'Angola', dial: '244', length: 9 },
  { iso: 'MZ', name: 'Mozambique', dial: '258', length: 9 },
  { iso: 'NA', name: 'Namibia', dial: '264', length: 9 },
  { iso: 'BW', name: 'Botswana', dial: '267', length: 8 },
  { iso: 'MW', name: 'Malawi', dial: '265', length: 9 },
  { iso: 'JM', name: 'Jamaica', dial: '1876', length: 7 },
  { iso: 'TT', name: 'Trinidad and Tobago', dial: '1868', length: 7 },
  { iso: 'IE', name: 'Ireland', dial: '353', length: 9 },
  { iso: 'PT', name: 'Portugal', dial: '351', length: 9 },
  { iso: 'PL', name: 'Poland', dial: '48', length: 9 },
  { iso: 'RU', name: 'Russia', dial: '7', length: 10 },
  { iso: 'UA', name: 'Ukraine', dial: '380', length: 9 },
  { iso: 'IL', name: 'Israel', dial: '972', length: 9 },
  { iso: 'QA', name: 'Qatar', dial: '974', length: 8 },
  { iso: 'KW', name: 'Kuwait', dial: '965', length: 8 },
  { iso: 'NZ', name: 'New Zealand', dial: '64', length: 9 },
  { iso: 'AR', name: 'Argentina', dial: '54', length: 10 },
  { iso: 'CO', name: 'Colombia', dial: '57', length: 10 },
  { iso: 'CL', name: 'Chile', dial: '56', length: 9 },
  { iso: 'PE', name: 'Peru', dial: '51', length: 9 },
  { iso: 'VN', name: 'Vietnam', dial: '84', length: 9 },
  { iso: 'TH', name: 'Thailand', dial: '66', length: 9 },
  { iso: 'LK', name: 'Sri Lanka', dial: '94', length: 9 },
  { iso: 'NP', name: 'Nepal', dial: '977', length: 10 },
].sort((a, b) => a.name.localeCompare(b.name));

export const GHANA = COUNTRIES.find((country) => country.iso === 'GH')!;

export function findCountry(iso: string) {
  return COUNTRIES.find((country) => country.iso === iso) ?? GHANA;
}
