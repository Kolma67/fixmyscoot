import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Roller-típusonként egy fájl: src/content/scooters/<modell>.md
// Az árakat itt állítod (roller-típusonként). A leírás/időtartam a
// src/config/serviceCatalog.ts-ből jön a szolgáltatás neve alapján.
const scooters = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/scooters' }),
  schema: z.object({
    model: z.string(),                       // pl. "Ninebot G30/G2 MAX"
    brand: z.string(),                       // pl. "Ninebot", "Kukirin", "Egyéb"
    order: z.number().optional().default(99),// megjelenési sorrend
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

export const collections = { scooters };
