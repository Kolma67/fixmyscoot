// ─────────────────────────────────────────────────────────────────────────
//  SZOLGÁLTATÁS-KATALÓGUS
//
//  Itt egy helyen van minden szolgáltatás-TÍPUS leírása, becsült időtartama
//  és ikonja. Az ÁRAK NEM itt vannak – azokat roller-típusonként a
//  src/content/scooters/*.md fájlokban állítod be.
//
//  Hogyan működik: amikor egy roller .md fájljában felveszel egy szolgáltatást
//  (pl. "Fékkar"), a rendszer ránézési alapon ideköti a leírást és időtartamot.
//  Ha új, eddig nem szereplő szolgáltatást írsz be, vegyél fel hozzá egy új
//  bejegyzést a CATALOG tömbbe (test: a névre illeszkedő kulcsszó).
//
//  ⚠️ A leírások és időtartamok egyelőre BECSLÉSEK – a rollermagus.hu alapján
//     finomítjuk őket. Bátran átírhatod bármelyiket.
// ─────────────────────────────────────────────────────────────────────────

export interface ServiceMeta {
  description: string;
  duration: string;
  icon: IconKey;
}

export type IconKey = 'tire' | 'brake' | 'electronics' | 'light' | 'shield' | 'wrench';

// A felismerési szabályok SORRENDBEN futnak – az első illeszkedő nyer.
// A "test" a szolgáltatás nevére illeszkedő kis-nagybetű-érzéketlen kulcsszó.
const CATALOG: { test: RegExp; meta: ServiceMeta }[] = [
  { test: /tömörgumi/i,            meta: { description: 'Defektmentes tömörgumira építjük át a kereket – nincs többé pumpálás, durrdefekt vagy belsőcsere.', duration: 'kb. 1–1,5 óra', icon: 'tire' } },
  { test: /külső.*belső|belső.*külső/i, meta: { description: 'A külső köpeny és a belső tömlő együttes cseréje – kopott vagy defektes abroncs teljes felújítása, alkatrésszel és munkadíjjal.', duration: 'kb. 45–60 perc', icon: 'tire' } },
  { test: /külső/i,                meta: { description: 'Kopott vagy sérült külső gumiköpeny cseréje.', duration: 'kb. 30–45 perc', icon: 'tire' } },
  { test: /belső/i,               meta: { description: 'Defekt utáni belső gumitömlő csere, gyors átfutással.', duration: 'kb. 30–45 perc', icon: 'tire' } },
  { test: /csapágy/i,             meta: { description: 'Zörgő vagy nehezen guruló kerék csapágyának cseréje – újra halk és könnyű lesz a gördülés.', duration: 'kb. 45–60 perc', icon: 'tire' } },

  { test: /légtelenítés/i,        meta: { description: 'Hidraulikus fék légtelenítése – visszaáll a határozott, jól adagolható fékhatás.', duration: 'kb. 30–45 perc', icon: 'brake' } },
  { test: /hidraulikus/i,         meta: { description: 'Mechanikus fék átépítése hidraulikus rendszerre – jóval erősebb és kiszámíthatóbb fékezés.', duration: 'kb. 1,5–2 óra', icon: 'brake' } },
  { test: /féktárcsa/i,           meta: { description: 'Elgörbült, kopott vagy zajos féktárcsa cseréje.', duration: 'kb. 30 perc', icon: 'brake' } },
  { test: /fékbetét/i,            meta: { description: 'Elhasználódott fékbetétek cseréje – visszaáll a biztonságos fékerő.', duration: 'kb. 20–30 perc', icon: 'brake' } },
  { test: /fékkar/i,              meta: { description: 'Törött vagy akadozó fékkar cseréje.', duration: 'kb. 30 perc', icon: 'brake' } },
  { test: /fékállítás/i,          meta: { description: 'A fék precíz beállítása: optimális fékpont, megfelelő holtjáték, nincs felesleges súrlódás.', duration: 'kb. 15–30 perc', icon: 'brake' } },

  { test: /vezérlő/i,             meta: { description: 'Hibás vezérlőelektronika (kontroller) cseréje – ez a roller „agya", ami a motort hajtja.', duration: 'kb. 1–1,5 óra', icon: 'electronics' } },
  { test: /kijelző/i,             meta: { description: 'Repedt vagy nem működő kijelző / műszerfal cseréje.', duration: 'kb. 30–45 perc', icon: 'electronics' } },
  { test: /motorkábel/i,          meta: { description: 'Sérült motorkábel cseréje – megszünteti a kihagyásokat, döcögést és a hibakódokat.', duration: 'kb. 45–60 perc', icon: 'electronics' } },
  { test: /kulcsos indító/i,      meta: { description: 'Kulcsos indító beszerelése a nagyobb biztonságért – kulcs nélkül nem indítható a roller.', duration: 'kb. 45 perc', icon: 'electronics' } },
  { test: /gázkar/i,              meta: { description: 'Akadozó, kopott vagy törött gázkar (menetszabályzó) cseréje.', duration: 'kb. 30–45 perc', icon: 'electronics' } },

  { test: /hátsó sárvédő/i,       meta: { description: 'A hátsó sárvédő, lámpa és merevítő együttes cseréje – komplett hátsó egység felújítása.', duration: 'kb. 45–60 perc', icon: 'shield' } },
  { test: /hátsó lámpa/i,         meta: { description: 'Hátsó lámpa cseréje a látható, biztonságos közlekedésért.', duration: 'kb. 20–30 perc', icon: 'light' } },
  { test: /sárvédő/i,             meta: { description: 'Sárvédő vagy sárvédő-merevítő cseréje.', duration: 'kb. 20–30 perc', icon: 'shield' } },
  { test: /szigetelés/i,          meta: { description: 'A rollert leszigeteljük, hogy megóvjuk a portól és a fröccsenő víztől – ajánlott a hosszabb élettartamhoz.', duration: 'kb. 1–1,5 óra', icon: 'shield' } },
  { test: /kitámaszt/i,           meta: { description: 'Törött vagy kilazult kitámasztó (oldaltámasz) cseréje.', duration: 'kb. 15–20 perc', icon: 'wrench' } },
];

const FALLBACK: ServiceMeta = {
  description: 'Szakszerű javítás eredeti vagy azzal egyenértékű alkatrésszel.',
  duration: 'egyeztetés szerint',
  icon: 'wrench',
};

export function getServiceMeta(name: string): ServiceMeta {
  for (const entry of CATALOG) {
    if (entry.test.test(name)) return entry.meta;
  }
  return FALLBACK;
}

// SVG ikonok (lucide stílus) – a kártyákon jelennek meg.
export const ICONS: Record<IconKey, string> = {
  tire: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>',
  brake: '<circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>',
  electronics: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
  light: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 1 5.4-5.4l-2.3 2.3-2-2 2.3-2.3z"/>',
};
