// Szebb kivágás: flood-fill a szélektől (csak a valódi hátteret törli),
// perem-erózió (fehér halo ellen) + lágyítás. Kimenet: átlátszó PNG + kék előnézet.
const sharp = require('sharp');
const IN = 'public/images/uploads/hero-roller.jpg';
const OUT = 'public/images/uploads/hero-roller.png';
const PREVIEW = 'scripts/_cutout-preview.jpg';

(async () => {
  const { data, info } = await sharp(IN).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;
  const at = (x, y) => (y * W + x) * C;

  const near = (i, minCh) => {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
    return mn >= minCh && (mx - mn) <= 24;
  };

  // 1) Flood-fill a szélektől: csak a háttérrel összefüggő világos pixelek
  const bg = new Uint8Array(W * H); // 1 = háttér
  const stack = [];
  const tryPush = (x, y) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const p = y * W + x;
    if (!bg[p] && near(at(x, y), 214)) { bg[p] = 1; stack.push(p); }
  };
  for (let x = 0; x < W; x++) { tryPush(x, 0); tryPush(x, H - 1); }
  for (let y = 0; y < H; y++) { tryPush(0, y); tryPush(W - 1, y); }
  while (stack.length) {
    const p = stack.pop(), x = p % W, y = (p / W) | 0;
    tryPush(x + 1, y); tryPush(x - 1, y); tryPush(x, y + 1); tryPush(x, y - 1);
  }
  // 2) Bezárt fehér zsebek (amit a flood nem ért el) tiszta fehérnél
  for (let p = 0; p < W * H; p++) if (!bg[p] && near(p * C, 247)) bg[p] = 1;

  // 3) Előtér-erózió 1px: a peremen maradt világos halo eltüntetése
  const fg = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) fg[p] = bg[p] ? 0 : 1;
  const eroded = Uint8Array.from(fg);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x;
    if (fg[p] && (
      (x > 0 && !fg[p - 1]) || (x < W - 1 && !fg[p + 1]) ||
      (y > 0 && !fg[p - W]) || (y < H - 1 && !fg[p + W])
    )) eroded[p] = 0;
  }

  // 4) Alfa lágyítás (3x3 átlag)
  const aIn = new Float32Array(W * H);
  for (let p = 0; p < W * H; p++) aIn[p] = eroded[p] ? 255 : 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < W && ny >= 0 && ny < H) { s += aIn[ny * W + nx]; n++; }
    }
    data[at(x, y) + 3] = Math.round(s / n);
  }

  await sharp(data, { raw: { width: W, height: H, channels: C } }).png({ compressionLevel: 9 }).toFile(OUT);
  // Kék hátterű előnézet, hogy lássuk a peremet
  await sharp({ create: { width: W, height: H, channels: 3, background: { r: 18, g: 58, b: 134 } } })
    .composite([{ input: OUT }]).jpeg({ quality: 80 }).toFile(PREVIEW);
  console.log('OK', W + 'x' + H);
})().catch(e => { console.error(e); process.exit(1); });
