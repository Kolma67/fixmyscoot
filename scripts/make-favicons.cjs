// Favicon-készlet a public/favicon.svg-ből (Google keresési ikonhoz PNG/ICO kell).
const sharp = require('sharp');
const fs = require('fs');
const SVG = 'public/favicon.svg';

async function png(size, out, bg) {
  const opts = bg ? { background: bg } : {};
  let img = sharp(SVG, { density: 72 * (size / 32) }).resize(size, size);
  if (bg) img = img.flatten({ background: bg });
  await img.png().toFile(out);
  console.log(out);
}

// Minimális ICO-készítő: egyetlen 48px PNG-t csomagol ICO konténerbe
async function ico(out) {
  const buf = await sharp(SVG, { density: 108 }).resize(48, 48).png().toBuffer();
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = 48; entry[1] = 48; entry[2] = 0; entry[3] = 0;
  entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(buf.length, 8); entry.writeUInt32LE(22, 12);
  fs.writeFileSync(out, Buffer.concat([header, entry, buf]));
  console.log(out);
}

(async () => {
  await png(48,  'public/favicon-48.png');
  await png(96,  'public/favicon-96.png');
  await png(192, 'public/favicon-192.png');
  await png(512, 'public/favicon-512.png');
  await png(180, 'public/apple-touch-icon.png', '#ffffff');
  await ico('public/favicon.ico');
})().catch(e => { console.error(e); process.exit(1); });
