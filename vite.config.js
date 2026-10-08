import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import { handler as quotes } from './netlify/functions/quotes.mjs';
import { handler as news } from './netlify/functions/news.mjs';
import { handler as chart } from './netlify/functions/chart.mjs';

// Dev-only helpers: serve /api/* with the same code Netlify runs, and let the admin panel
// write src/data/content.json directly while testing locally.
const FN = { '/api/quotes': quotes, '/api/news': news, '/api/chart': chart };

const devApi = () => ({
  name: 'dev-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const u = new URL(req.url, 'http://localhost');
      const fn = FN[u.pathname];
      if (fn) {
        const r = await fn({ queryStringParameters: Object.fromEntries(u.searchParams) });
        res.writeHead(r.statusCode, r.headers);
        return res.end(r.body);
      }
      if (u.pathname === '/__save' && req.method === 'POST') {
        let b = '';
        req.on('data', (c) => (b += c));
        req.on('end', () => {
          try { JSON.parse(b); fs.writeFileSync('src/data/content.json', b); res.end('ok'); }
          catch { res.statusCode = 400; res.end('bad json'); }
        });
        return;
      }
      next();
    });
  },
});

export default defineConfig({ plugins: [react(), devApi()] });