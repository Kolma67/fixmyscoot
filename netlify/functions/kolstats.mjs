// Private storage for /kolstats. Every request must carry the password
// The built-in default is visible in this public repo (owner's choice); setting a
// KOLSTATS_PASSWORD environment variable in Netlify overrides it with a private one.
import { getStore } from '@netlify/blobs';
import { createHash, timingSafeEqual } from 'node:crypto';

const MAX_FAILS = 5;                 // wrong passwords allowed per IP...
const WINDOW_MS = 15 * 60 * 1000;    // ...within this window
const MAX_BYTES = 2_000_000;

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});
const sha = s => createHash('sha256').update(String(s)).digest();
const safeDecode = s => { try { return decodeURIComponent(s); } catch { return ''; } };

export async function handle(req, ip, store, password) {
  if (!password) return json(503, { error: 'not_configured' });

  const failKey = 'fail-' + sha(ip || 'unknown').toString('hex').slice(0, 32);
  const now = Date.now();
  const prev = await store.get(failKey, { type: 'json' });
  const fails = prev && now - prev.since < WINDOW_MS ? prev : null;
  if (fails && fails.count >= MAX_FAILS)
    return json(429, { error: 'locked', retryMin: Math.ceil((WINDOW_MS - (now - fails.since)) / 60000) });

  const given = safeDecode((req.headers.get('authorization') || '').replace(/^Bearer\s+/i, ''));
  if (!given || !timingSafeEqual(sha(given), sha(password))) {
    await store.setJSON(failKey, { count: (fails?.count || 0) + 1, since: fails?.since || now });
    return json(401, { error: 'wrong_password' });
  }
  if (fails) await store.delete(failKey);

  if (req.method === 'GET') {
    const doc = await store.get('state', { type: 'json' });
    return json(200, doc || { rev: 0, data: null });
  }
  if (req.method === 'PUT') {
    const text = await req.text();
    if (text.length > MAX_BYTES) return json(413, { error: 'too_large' });
    let body;
    try { body = JSON.parse(text); } catch { return json(400, { error: 'bad_json' }); }
    if (!body || typeof body.data !== 'object' || body.data === null) return json(400, { error: 'bad_data' });
    const cur = await store.get('state', { type: 'json' });
    // Someone (another device) saved since this client last loaded: hand back the newer copy.
    if (cur && !body.force && body.rev !== cur.rev) return json(409, cur);
    const doc = { rev: (cur?.rev || 0) + 1, updatedAt: now, data: body.data };
    await store.setJSON('state', doc);
    return json(200, { rev: doc.rev });
  }
  return json(405, { error: 'method_not_allowed' });
}

export default (req, context) =>
  handle(req, context.ip, getStore({ name: 'kolstats', consistency: 'strong' }), process.env.KOLSTATS_PASSWORD || 'kol');

export const config = { path: '/kolstats/api' };
