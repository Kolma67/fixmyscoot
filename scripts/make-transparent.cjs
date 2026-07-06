// Fehér hátteret átlátszóra cserél (chroma-key), lágy élekkel. Kimenet: PNG.
const sharp = require('sharp');
const IN = 'public/images/uploads/hero-roller.jpg';
const OUT = 'public/images/uploads/hero-roller.png';

sharp(IN).ensureAlpha().raw().toBuffer({ resolveWithObject: true }).then(({ data, info }) => {
  const { width, height, channels } = info;
  let cleared = 0;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mn = Math.min(r, g, b);
    const mx = Math.max(r, g, b);
    const sat = mx - mn;
    // Csak világos + alacsony telítettségű (fehér/szürkésfehér) pixelt bántunk
    if (sat <= 18) {
      if (mn >= 244) { data[i + 3] = 0; cleared++; }
      else if (mn >= 224) { data[i + 3] = Math.round(((244 - mn) / 20) * 255); }
    }
  }
  return sharp(data, { raw: { width, height, channels } })
    .png({ compressionLevel: 9 })
    .toFile(OUT)
    .then(() => console.log(`OK: ${OUT} (${width}x${height}), cleared ~${cleared} px`));
}).catch(e => { console.error(e); process.exit(1); });
