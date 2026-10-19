// Admin "Save" ko GitHub me commit karta hai; Netlify us commit par apne aap deploy kar deta hai.
// Token aur password sirf Netlify ke environment variables me rehte hain, browser me kabhi nahi.
import { timingSafeEqual } from 'node:crypto';

const PATH = 'src/data/content.json';
const LISTS = ['articles', 'views', 'stocks', 'topStocks', 'advice', 'news', 'courses', 'calls', 'classes', 'recordings', 'plans'];
const json = (code, obj) => ({ statusCode: code, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify(obj) });
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };

export async function handler(e) {
  if (e.httpMethod !== 'POST') return json(405, { error: 'POST only' });
  const { ADMIN_PASSWORD, GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH = 'main' } = process.env;
  if (!ADMIN_PASSWORD || !GITHUB_TOKEN || !GITHUB_REPO)
    return json(500, { error: 'Server setup adhura hai: Netlify me ADMIN_PASSWORD, GITHUB_TOKEN aur GITHUB_REPO environment variables daalein.' });

  let b;
  try { b = JSON.parse(e.isBase64Encoded ? Buffer.from(e.body || '', 'base64').toString() : e.body || '{}'); }
  catch { return json(400, { error: 'Bad request' }); }

  if (!same(b.password || '', ADMIN_PASSWORD)) {
    await new Promise((r) => setTimeout(r, 800)); // brute-force ko slow karta hai
    return json(401, { error: 'Galat password.' });
  }
  if (b.action === 'check') return json(200, { ok: true });

  // Galat data se site build kharab na ho, isliye shape check
  const c = b.content;
  if (!c || typeof c !== 'object' || !c.settings || !Array.isArray(c.settings.ticker) || !c.settings.ticker.length)
    return json(400, { error: 'Content ka format galat hai (settings ya ticker missing).' });
  for (const k of LISTS) if (c[k] !== undefined && !Array.isArray(c[k])) return json(400, { error: `"${k}" list honi chahiye.` });
  c.settings.adminHash = ''; // purana password hash public file me nahi rakhna

  const api = `https://api.github.com/repos/${GITHUB_REPO}/contents/${PATH}`;
  const h = { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'admin-panel', 'X-GitHub-Api-Version': '2022-11-28' };
  const content = Buffer.from(JSON.stringify(c, null, 1) + '\n').toString('base64');

  for (let t = 0; t < 2; t++) {
    const g = await fetch(`${api}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, { headers: h });
    if (!g.ok) return json(502, { error: `GitHub se content.json nahi mili (${g.status}). GITHUB_REPO, branch aur token ki permission check karein.` });
    const { sha } = await g.json();
    const p = await fetch(api, { method: 'PUT', headers: { ...h, 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'Content update from admin panel', content, sha, branch: GITHUB_BRANCH }) });
    if (p.ok) return json(200, { ok: true });
    if (p.status !== 409) return json(502, { error: `GitHub save fail hua (${p.status}). Token me "Contents: Read and write" permission honi chahiye.` });
  }
  return json(409, { error: 'Conflict aaya, ek baar aur Save dabayein.' });
}