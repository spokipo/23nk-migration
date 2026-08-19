import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Country } from 'country-state-city';

// Повний список країн доставки Nova Poshta Global (ISO Alpha-2 коди)
const NOVA_POSHTA_COUNTRIES = [
  // Європа
  'AT', 'AL', 'AD', 'BE', 'BG', 'BA', 'VA', 'GB', 'GR', 'GI', 'DK', 'EE', 'IE', 'IS', 'ES', 'IT', 'CY', 'LV', 'LT', 'LI', 'LU', 'MT', 'MD', 'MC', 'NL', 'DE', 'NO', 'MK', 'PL', 'PT', 'RO', 'SM', 'RS', 'SK', 'SI', 'TR', 'CZ', 'ME', 'HU', 'FI', 'FR', 'HR', 'CH', 'SE',
  // Північна Америка, Китай та Гонконг
  'US', 'CA', 'CN', 'HK',
  // Інший світ
  'AU', 'AZ', 'DZ', 'AS', 'AO', 'AI', 'AG', 'AR', 'AW', 'AF', 'BS', 'BD', 'BB', 'BH', 'BZ', 'BJ', 'BM', 'BO', 'BQ', 'BW', 'BR', 'VG', 'BN', 'BF', 'BI', 'BT', 'VN', 'VU', 'VI', 'VE', 'AM', 'GA', 'HT', 'GM', 'GH', 'GN', 'GW', 'HN', 'GE', 'GY', 'GP', 'GT', 'GD', 'GL', 'GU', 'DJ', 'DM', 'DO', 'EC', 'ER', 'SZ', 'ET', 'EG', 'ZM', 'ZW', 'IL', 'IN', 'ID', 'IQ', 'JO', 'CV', 'KZ', 'KY', 'KH', 'CM', 'QA', 'KE', 'NE', 'KG', 'CO', 'KM', 'CG', 'CR', 'CI', 'KW', 'CK', 'CW', 'LA', 'LS', 'LR', 'LB', 'MU', 'MR', 'MG', 'YT', 'MO', 'MW', 'MY', 'ML', 'MV', 'MA', 'MQ', 'MH', 'MX', 'MZ', 'MN', 'NA', 'NP', 'NG', 'NI', 'NZ', 'NC', 'AE', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'ZA', 'MP', 'PR', 'KR', 'RE', 'RW', 'SV', 'WS', 'SA', 'SC', 'BL', 'SN', 'MF', 'SX', 'VC', 'KN', 'LC', 'SG', 'SB', 'TL', 'SL', 'TH', 'PF', 'TW', 'TZ', 'TC', 'TG', 'TO', 'TT', 'TN', 'UG', 'UZ', 'UY', 'FO', 'FJ', 'PH', 'GF', 'TD', 'CL', 'LK', 'JM', 'FM', 'JP'
];

interface CountrySelectProps {
  value: string;
  onChange: (countryCode: string, countryName: string) => void;
  required?: boolean;
  id?: string;
  className?: string;
}

export function CountrySelect({ value, onChange, required, id, className }: CountrySelectProps) {
  return (
    <Select
      required={required}
      value={value}
      onValueChange={(code) => {
        const countryName = Country.getCountryByCode(code)?.name || '';
        onChange(code, countryName);
      }}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder="Select Country..." />
      </SelectTrigger>
      <SelectContent className="z-[110] max-h-60">
        {Country.getAllCountries()
          .filter((c) => NOVA_POSHTA_COUNTRIES.includes(c.isoCode))
          .map((c) => (
            <SelectItem key={c.isoCode} value={c.isoCode}>
              {c.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}