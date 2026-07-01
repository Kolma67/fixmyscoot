// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

// Dev módban a /admin/ (tartalomkezelő) kiszolgálása tiszta URL-en,
// hogy a Sveltia CMS ugyanúgy működjön, mint élesben.
function serveAdmin() {
  return {
    name: 'serve-admin-cms',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (url === '/admin' || url === '/admin/') {
          try {
            const html = fs.readFileSync('public/admin/index.html');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(html);
            return;
          } catch {
            // ha nincs meg, essen tovább a normál kezelésre
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  site: 'https://fixmyscoot.hu',
  vite: {
    plugins: [tailwindcss(), serveAdmin()]
  },
  integrations: [sitemap()],
});
