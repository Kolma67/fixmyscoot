export type DayConfig = {
  name: string;
  jsDay: number; // 0 = Sunday, 1 = Monday, ...
  open: boolean;
  hours?: string;
};

// ✏️  Szerkeszd itt a nyitvatartást: állítsd open: false értékre, ha zárva vagy
export const weeklySchedule: DayConfig[] = [
  { name: 'Hétfő',     jsDay: 1, open: true,  hours: '09:00–18:00' },
  { name: 'Kedd',      jsDay: 2, open: true,  hours: '09:00–18:00' },
  { name: 'Szerda',    jsDay: 3, open: true,  hours: '09:00–18:00' },
  { name: 'Csütörtök', jsDay: 4, open: true,  hours: '09:00–18:00' },
  { name: 'Péntek',    jsDay: 5, open: true,  hours: '09:00–18:00' },
  { name: 'Szombat',   jsDay: 6, open: true,  hours: '09:00–14:00' },
  { name: 'Vasárnap',  jsDay: 0, open: false },
];

// ✏️  Egyedi zárt napok (pl. ünnepek, szabadság) – ÉÉÉÉ-HH-NN formátum
export const closedDates: string[] = [
  // '2025-08-20', // Kitöltési példa: állami ünnep
  // '2025-08-19', // Kitöltési példa: szabadnap
];

export const openDayIndices = weeklySchedule
  .filter(d => d.open)
  .map(d => d.jsDay);

export const timeWindows = [
  '08:00–10:00',
  '10:00–12:00',
  '12:00–14:00',
  '14:00–16:00',
  '16:00–18:00',
];
