export type DayConfig = {
  name: string;
  jsDay: number; // 0 = Sunday, 1 = Monday, ...
  open: boolean;
  hours?: string;
};

// ═══════════════════════════════════════════════════════════════
// ✏️ SZEZONÁLIS ZÁRÁS
// Tavasszal az újranyitáshoz elég az `active` értékét false-ra állítani –
// a lenti nyitvatartás megmarad, és minden oldal automatikusan visszaáll.
// ═══════════════════════════════════════════════════════════════
export const seasonalClosure = {
  active: true,
  // Felső sáv / foglalóoldal rövid szövege
  short: 'Tavaszig zárva tartok',
  // Hosszabb magyarázat a foglalóoldalon
  long: 'A szerviz a téli szezonban zárva tart, tavasszal nyitok újra. Időpontot jelenleg nem tudok fogadni, de ha kérdésed van, írj vagy hívj nyugodtan – és tavasszal szólok, amint újraindul a szerviz.',
};

// ✏️ Nyitvatartás (a szezonban érvényes – zárás alatt nem jelenik meg)
export const regularSchedule: DayConfig[] = [
  { name: 'Hétfő',     jsDay: 1, open: true,  hours: '16:00–18:00' },
  { name: 'Kedd',      jsDay: 2, open: true,  hours: '16:00–18:00' },
  { name: 'Szerda',    jsDay: 3, open: true,  hours: '16:00–18:00' },
  { name: 'Csütörtök', jsDay: 4, open: true,  hours: '16:00–18:00' },
  { name: 'Péntek',    jsDay: 5, open: true,  hours: '16:00–18:00' },
  { name: 'Szombat',   jsDay: 6, open: false },
  { name: 'Vasárnap',  jsDay: 0, open: false },
];

// Tényleges nyitvatartás: szezonális zárás alatt minden nap zárva.
// A Footer, a főoldal és a foglalóoldal is ezt használja.
export const weeklySchedule: DayConfig[] = seasonalClosure.active
  ? regularSchedule.map(d => ({ ...d, open: false, hours: undefined }))
  : regularSchedule;

// ✏️ Egyedi zárt napok (pl. ünnepek, szabadság)
export const closedDates: string[] = [
  // '2026-08-20',
];

// Nyitvatartási napok (zárás alatt üres tömb → a foglalónaptár minden napot elutasít)
export const openDayIndices = weeklySchedule
  .filter(d => d.open)
  .map(d => d.jsDay);

// Elérhető időablakok
export const timeWindows = [
  '16:00–18:00',
];
