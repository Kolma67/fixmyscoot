import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// A Sveltia CMS az üres szám-mezőket `null`-ként menti. A Zod `number()` a
// null-t elutasítaná (és megállna a build/deploy), ezért a null-t undefined-ra
// alakítjuk, mielőtt a sémát alkalmazzuk.
const optionalNumber = () =>
  z.preprocess((v) => (v == null || v === '' ? undefined : v), z.number().optional());
const orderNumber = () =>
  z.preprocess((v) => (v == null || v === '' ? undefined : v), z.number().optional().default(99));

// Roller-típusonként egy fájl: src/content/scooters/<modell>.md
// Az árakat itt állítod (roller-típusonként). A leírás/időtartam a
// src/config/serviceCatalog.ts-ből jön a szolgáltatás neve alapján.
const scooters = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/scooters' }),
  schema: z.object({
    model: z.string(),                       // pl. "Ninebot G30/G2 MAX"
    brand: z.string(),                       // pl. "Ninebot", "Kukirin", "Egyéb"
    order: orderNumber(),                    // megjelenési sorrend
    image: z.string().optional(),            // /images/scooters/...
    services: z.array(z.object({
      name: z.string(),                      // szolgáltatás neve, pl. "Fékkar"
      price: z.number(),                     // ár forintban, pl. 14500
      note: z.string().optional(),           // pl. "-tól"
      description: z.string().optional(),    // egyedi leírás (felülírja a katalógust)
      duration: z.string().optional(),       // egyedi időtartam (felülírja a katalógust)
      image: z.string().optional(),          // egyedi kép ehhez a szolgáltatáshoz (felülírja a modell képét)
    })).default([]),
  }),
});

// Tuning / fejlesztés szolgáltatások: src/content/tuning/<szolgaltatas>.md
const tuning = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tuning' }),
  schema: z.object({
    title: z.string(),                       // pl. "Akkumulátorépítés"
    description: z.string(),                  // rövid leírás
    price: optionalNumber(),                 // fix "-tól" ár (ha van), pl. 10000
    priceText: z.string().optional(),        // ha nincs fix ár, pl. "egyedi ajánlat"
    note: z.string().optional(),             // pl. "-tól"
    image: z.string().optional(),            // kép a szolgáltatáshoz
    order: orderNumber(),
    options: z.array(z.string()).default([]),// választható opciók listája
  }),
});

export const collections = { scooters, tuning };
