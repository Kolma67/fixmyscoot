// Márkás OG-kép generálása (1200x630) a közösségi megosztásokhoz.
const sharp = require('sharp');

const W = 1200, H = 630;

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0B2560"/>
      <stop offset="0.55" stop-color="#1848A0"/>
      <stop offset="1" stop-color="#1E5BBF"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.35" r="0.5">
      <stop offset="0" stop-color="#FF6B00" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#FF6B00" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <g font-family="Segoe UI, Arial, sans-serif">
    <text x="70" y="120" fill="#FFA060" font-size="26" font-weight="700" letter-spacing="4">FIX MY SCOOT</text>
    <text x="70" y="235" fill="#FFFFFF" font-size="72" font-weight="800">Elektromos roller</text>
    <text x="70" y="315" fill="#FF8A2B" font-size="72" font-weight="800">szerviz &amp; javítás</text>
    <text x="70" y="400" fill="#DCE6F7" font-size="32" font-weight="600">Budapest · Óbuda, III. kerület</text>
    <text x="70" y="452" fill="#AFC2E6" font-size="27" font-weight="500">Ninebot · Kukirin · Xiaomi-kompatibilis</text>
    <text x="70" y="556" fill="#FFFFFF" font-size="40" font-weight="800">+36 30 470 3778</text>
  </g>
</svg>`;

(async () => {
  const base = await sharp(Buffer.from(svg)).png().toBuffer();
  const scooter = await sharp('public/images/uploads/hero-roller.png')
    .resize({ height: 580, fit: 'inside' })
    .toBuffer();
  const meta = await sharp(scooter).metadata();
  const left = W - (meta.width || 460) - 40;
  const top = Math.round((H - (meta.height || 580)) / 2) + 10;
  await sharp(base)
    .composite([{ input: scooter, left: Math.max(left, 700), top }])
    .jpeg({ quality: 86 })
    .toFile('public/images/og-default.jpg');
  console.log('OG kész: public/images/og-default.jpg');
})().catch(e => { console.error(e); process.exit(1); });
