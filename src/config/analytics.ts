// Mérés/hirdetés azonosítók.
//
// A publikus (kliensoldalon amúgy is látható) azonosítók alapból ki vannak
// töltve, hogy Netlify env-változó nélkül is működjön a mérés. Ha felül akarod
// írni, add meg a Netlify-on ugyanezen nevű env-változót (Site configuration →
// Environment variables) – az élvez elsőbbséget.
//
//   PUBLIC_GA4_ID                 – Google Analytics 4, pl. "G-XXXXXXXXXX"
//   PUBLIC_GOOGLE_ADS_ID          – Google Ads, pl. "AW-XXXXXXXXXX"
//   PUBLIC_GOOGLE_ADS_CONV_LABEL  – Ads konverziós címke (a send_to /-utáni része)
//   PUBLIC_META_PIXEL_ID          – Meta (Facebook) Pixel, pl. "123456789012345"
//   PUBLIC_GSC_VERIFICATION       – Search Console meta-verifikáció (opcionális)
export const ANALYTICS = {
  ga4Id: import.meta.env.PUBLIC_GA4_ID ?? 'G-L0MDQE2PXP',
  googleAdsId: import.meta.env.PUBLIC_GOOGLE_ADS_ID ?? 'AW-18303752221',
  googleAdsConversionLabel:
    import.meta.env.PUBLIC_GOOGLE_ADS_CONV_LABEL ?? 'QGFBCOSP-sscEJ2w9JdE',
  metaPixelId: import.meta.env.PUBLIC_META_PIXEL_ID ?? '2309343129837146',
  // A Search Console verifikációt HTML-fájllal oldjuk meg
  // (public/googlefcf40d3b7a76079c.html), ezért ez üres.
  gscVerification: import.meta.env.PUBLIC_GSC_VERIFICATION ?? '',
} as const;
