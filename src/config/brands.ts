// Márka → logó kép.
//
// A rendszer ELŐSZÖR a hivatalos logót keresi, és ha az nem tölthető be,
// automatikusan a tartalék ikont mutatja (*.svg).
//
// A hivatalos logók a public/images/brands/ mappában vannak. Ha lecserélnéd
// őket, ügyelj a fájlnévre és a kiterjesztésre (alább pontosan ez szerepel).

const PRIMARY: Record<string, string> = {
  'Ninebot': '/images/brands/ninebot.png',
  'Kukirin': '/images/brands/kukirin.png',
  'Egyéb': '/images/brands/xiaomi.webp',
};

const FALLBACK: Record<string, string> = {
  'Ninebot': '/images/brands/ninebot.svg',
  'Kukirin': '/images/brands/kukirin.svg',
  'Egyéb': '/images/brands/xiaomi.svg',
};

const DEFAULT_FALLBACK = '/images/brands/egyeb.svg';

export function getBrandLogo(brand: string): string {
  return PRIMARY[brand] ?? DEFAULT_FALLBACK;
}

export function getBrandLogoFallback(brand: string): string {
  return FALLBACK[brand] ?? DEFAULT_FALLBACK;
}
