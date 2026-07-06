// Mérés/hirdetés azonosítók. Ezeket a Netlify-on állítod be környezeti
// változóként (Site configuration → Environment variables), NEM ide írjuk be.
// Amíg üresek, semmilyen mérőkód nem töltődik be (nincs mérés, de hiba sincs).
//
//   PUBLIC_GA4_ID            – Google Analytics 4 azonosító, pl. "G-XXXXXXXXXX"
//   PUBLIC_GOOGLE_ADS_ID     – Google Ads azonosító, pl. "AW-XXXXXXXXXX"
//   PUBLIC_META_PIXEL_ID     – Meta (Facebook) Pixel azonosító, pl. "123456789012345"
//   PUBLIC_GSC_VERIFICATION  – Google Search Console meta-verifikáció tartalma
export const ANALYTICS = {
  ga4Id: import.meta.env.PUBLIC_GA4_ID ?? '',
  googleAdsId: import.meta.env.PUBLIC_GOOGLE_ADS_ID ?? '',
  metaPixelId: import.meta.env.PUBLIC_META_PIXEL_ID ?? '',
  gscVerification: import.meta.env.PUBLIC_GSC_VERIFICATION ?? '',
} as const;
