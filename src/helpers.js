import { useEffect, useState } from 'react';
import { slugify } from './lib.jsx';

export const HOURS = 24; // top stocks kitne ghante dikhenge

// YouTube link se video ID nikalta hai (watch, youtu.be, embed, shorts, live)
export function ytId(u) {
  if (!u) return '';
  const s = String(u).trim();
  const m = s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(s) ? s : '';
}

export const viewSlug = (v) => slugify(`${v.date || ''}-${v.title || ''}`);

// markdown hatakar plain text (card ke preview ke liye)
export const plain = (t) =>
  String(t || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// Sirf wahi top stocks jo 24 ghante ke andar post hue hain
export function topStocksActive(list, now = Date.now()) {
  return (list || [])
    .filter((s) => s.symbol && s.postedAt)
    .map((s) => ({ ...s, left: new Date(s.postedAt).getTime() + HOURS * 3600e3 - now }))
    .filter((s) => s.left > 0)
    .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
}

export function timeLeft(ms) {
  const m = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

// Yahoo symbol: RELIANCE -> RELIANCE.NS. Agar admin ne liveSymbol diya hai to wahi use hoga.
// Jis symbol me . ^ ya = hai (RELIANCE.BO, ^NSEI, GC=F) use waisa hi rehne dete hain.
export const liveSym = (s) => {
  const v = String(s.liveSymbol || s.symbol || '').trim().toUpperCase().replace(/\s+/g, '');
  return /[.^=]/.test(v) ? v : v + '.NS';
};
export const currency = (sym) => (/\.(NS|BO)$/.test(sym) ? '₹' : '');

// Top stocks ke live prices (har 30 second me refresh)
export function useStockQuotes(list) {
  const key = list.map(liveSym).join(',');
  const [q, setQ] = useState({});
  useEffect(() => {
    if (!key) return undefined;
    let on = true;
    const run = async () => {
      try {
        const r = await fetch('/api/quotes?symbols=' + encodeURIComponent(key));
        const a = await r.json();
        if (!Array.isArray(a)) return;
        const m = {};
        a.forEach((x) => { m[x.symbol] = x; });
        if (on) setQ(m);
      } catch { /* purane prices dikhte rahenge */ }
    };
    run();
    const i = setInterval(run, 30000);
    return () => { on = false; clearInterval(i); };
  }, [key]);
  return q;
}