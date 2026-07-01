export const SITE = {
  name: 'Fix My Scoot',
  tagline: 'Elektromos roller szerviz – Ninebot, Kukirin és Xiaomi-kompatibilis specialista',
  description: 'Budapest egyedi elektromos roller szervize. Ninebot, Kukirin és Xiaomi-kompatibilis rollerek javítása, karbantartása és fejlesztése. Gyors, megbízható, személyes kiszolgálás.',
  url: 'https://fixmyscoot.hu',
  phone: '+36304703778',
  phoneDisplay: '+36 30 470 3778',
  email: 'info@fixmyscoot.hu', // TODO: add real email
  address: {
    street: 'Frigyes utca 10.',
    city: 'Budapest',
    zip: '1039',
    country: 'HU',
    full: '1039 Budapest, Frigyes utca 10.',
    googleMapsQuery: '1039+Budapest+Frigyes+utca+10',
  },
  geo: {
    latitude: 47.5588, // TODO: replace with exact coordinates
    longitude: 19.0397,
  },
  priceRange: '$$',
  socialViber: 'viber://chat?number=%2B36304703778',
  brands: ['Ninebot', 'Kukirin', 'Xiaomi-kompatibilis'],
  founded: '2025',
  // Google Maps beágyazás (nem kell API kulcs)
  mapEmbedUrl: 'https://www.google.com/maps?q=1039+Budapest+Frigyes+utca+10&output=embed',
} as const;
