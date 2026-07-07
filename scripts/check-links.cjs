// Törött belső linkek keresése a dist-ben
const fs = require('fs'), path = require('path');
const pages = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) pages.push(p);
  }
})('dist');
const exists = new Set(pages.map(p => '/' + path.relative('dist', p).split(path.sep).join('/').replace(/index\.html$/, '').replace(/\.html$/, '')));
const bad = new Set();
for (const p of pages) {
  const html = fs.readFileSync(p, 'utf8');
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const u = m[1];
    if (/\.(css|js|xml|svg|png|jpg|jpeg|webp|avif|ico|txt|json)$/.test(u)) {
      if (!fs.existsSync(path.join('dist', decodeURIComponent(u)))) bad.add(u);
      continue;
    }
    const norm = u.endsWith('/') ? u : u + '/';
    if (!exists.has(norm) && !exists.has(u)) bad.add(u);
  }
}
console.log(bad.size ? [...bad].join('\n') : 'nincs törött link');
