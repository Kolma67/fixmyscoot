export type DayConfig = {
  name: string;
  jsDay: number; // 0 = Sunday, 1 = Monday, ...
  open: boolean;
  hours?: string;
};

// ✏️ Nyitvatartás
export const weeklySchedule: DayConfig[] = [
  { name: 'Hétfő',     jsDay: 1, open: true,  hours: '16:00–18:00' },
  { name: 'Kedd',      jsDay: 2, open: true,  hours: '16:00–18:00' },
  { name: 'Szerda',    jsDay: 3, open: true,  hours: '16:00–18:00' },
  { name: 'Csütörtök', jsDay: 4, open: true,  hours: '16:00–18:00' },
  { name: 'Péntek',    jsDay: 5, open: true,  hours: '16:00–18:00' },
  { name: 'Szombat',   jsDay: 6, open: false },
  { name: 'Vasárnap',  jsDay: 0, open: false },
];

// ✏️ Egyedi zárt napok (pl. ünnepek, szabadság)
export const closedDates: string[] = [
  // '2026-08-20',
];

// Nyitvatartási napok
export const openDayIndices = weeklySchedule
  .filter(d => d.open)
  .map(d => d.jsDay);

// Elérhető időablakok
export const timeWindows = [
  '16:00–18:00',
];
