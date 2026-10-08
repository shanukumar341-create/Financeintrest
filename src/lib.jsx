import { createContext, useContext, useEffect, useState } from 'react';
import C from './data/content.json';

export const fmt = (n) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
export const fmtDate = (d) => { const x = new Date(d); return isNaN(x) ? d : x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); };
export const wa = (t) => `https://wa.me/${C.settings.whatsapp}?text=${encodeURIComponent(t)}`;
export const biasCls = (b) => (/bull|buy/i.test(b) ? 'bg-bull/15 up' : /bear|sell/i.test(b) ? 'bg-bear/15 dn' : 'bg-gold/15 text-gold');
export const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const publishedArticles = () => C.articles.filter((a) => a.published && a.slug).sort((a, b) => String(b.date).localeCompare(String(a.date)));
export const useTitle = (t) => useEffect(() => { document.title = (t ? t + ' | ' : '') + C.settings.brand; }, [t]);

// Cloudinary: auto format + quality + width for fast loading. Other URLs pass through unchanged.
export const img = (url, w = 800) =>
  url && url.includes('res.cloudinary.com') && url.includes('/upload/') ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`) : url;

export const LogoMark = ({ s = 34 }) => (
  <svg width={s} height={s} viewBox="0 0 32 32" aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="#111a2e" stroke="#1e2a44" />
    <g strokeWidth="2" strokeLinecap="round">
      <path d="M9 8v16" stroke="#19c37d" /><rect x="7" y="12" width="4" height="8" rx="1" fill="#19c37d" stroke="none" />
      <path d="M16 6v18" stroke="#f0454f" /><rect x="14" y="9" width="4" height="9" rx="1" fill="#f0454f" stroke="none" />
      <path d="M23 10v16" stroke="#e8b43a" /><rect x="21" y="13" width="4" height="9" rx="1" fill="#e8b43a" stroke="none" />
    </g>
  </svg>
);

// ---- live quotes (one shared poll for ticker + dashboard) ----
export const QuotesCtx = createContext({ ok: null, data: {} });
export const useQuotes = () => useContext(QuotesCtx);
export function QuotesProvider({ children }) {
  const [q, setQ] = useState({ ok: null, data: {} });
  useEffect(() => {
    let on = true;
    const run = async () => {
      try {
        const r = await fetch('/api/quotes?symbols=' + C.settings.ticker.map((t) => encodeURIComponent(t.s)).join(','));
        const a = await r.json(); if (!Array.isArray(a)) throw 0;
        const data = {}; a.forEach((x) => (data[x.symbol] = x));
        on && setQ({ ok: true, data });
      } catch { on && setQ((p) => ({ ...p, ok: false })); }
    };
    run(); const i = setInterval(run, 30000);
    return () => { on = false; clearInterval(i); };
  }, []);
  return <QuotesCtx.Provider value={q}>{children}</QuotesCtx.Provider>;
}
export function Quote({ t, big }) {
  const { data } = useQuotes(); const q = data[t.s]; const ok = q && !q.error;
  const cls = ok ? (q.change >= 0 ? 'up' : 'dn') : 'text-slate-400';
  const chg = ok ? `${q.change >= 0 ? '▲' : '▼'} ${fmt(Math.abs(q.change))} (${q.pct.toFixed(2)}%)` : '';
  return big ? (
    <div className="card p-4"><div className="text-sm text-slate-400">{t.n}</div>
      <div className="text-2xl font-head font-semibold">{ok ? fmt(q.price) : '--'}</div><div className={`text-sm ${cls}`}>{chg}</div></div>
  ) : (
    <div className="flex items-center gap-2 px-5 whitespace-nowrap"><span className="font-semibold text-slate-300">{t.n}</span><span>{ok ? fmt(q.price) : '--'}</span><span className={`text-sm ${cls}`}>{chg}</span></div>
  );
}

// ---- tiny safe markdown renderer ----
function inline(t, k) {
  const out = []; const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|!\[[^\]]*\]\(https?:\/\/[^)\s]+\)|\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)\s]+\))/g;
  let last = 0, m, i = 0;
  while ((m = re.exec(t))) {
    if (m.index > last) out.push(t.slice(last, m.index));
    const s = m[0], key = `${k}-${i++}`;
    if (s.startsWith('**')) out.push(<strong key={key}>{s.slice(2, -2)}</strong>);
    else if (s.startsWith('![')) { const [, alt, src] = s.match(/!\[([^\]]*)\]\(([^)]+)\)/); out.push(<img key={key} src={img(src, 1000)} alt={alt} className="rounded-lg my-3 max-w-full" loading="lazy" />); }
    else if (s.startsWith('[')) { const [, tx, href] = s.match(/\[([^\]]+)\]\(([^)]+)\)/); out.push(<a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-gold underline">{tx}</a>); }
    else if (s.startsWith('`')) out.push(<code key={key} className="bg-ink px-1 rounded">{s.slice(1, -1)}</code>);
    else out.push(<em key={key}>{s.slice(1, -1)}</em>);
    last = m.index + s.length;
  }
  if (last < t.length) out.push(t.slice(last));
  return out;
}
export function Md({ text }) {
  const blocks = String(text || '').replace(/\r/g, '').split(/\n{2,}/).filter((b) => b.trim());
  return (
    <div className="space-y-4 leading-relaxed text-slate-200">
      {blocks.map((b, i) => {
        if (/^### /.test(b)) return <h3 key={i} className="text-lg font-bold mt-4">{inline(b.slice(4), i)}</h3>;
        if (/^#{1,2} /.test(b)) return <h2 key={i} className="text-2xl font-bold mt-6">{inline(b.replace(/^#+ /, ''), i)}</h2>;
        if (/^(- |\* )/.test(b)) return <ul key={i} className="list-disc pl-6 space-y-1">{b.split('\n').map((l, j) => <li key={j}>{inline(l.replace(/^(- |\* )/, ''), `${i}-${j}`)}</li>)}</ul>;
        if (/^\d+\. /.test(b)) return <ol key={i} className="list-decimal pl-6 space-y-1">{b.split('\n').map((l, j) => <li key={j}>{inline(l.replace(/^\d+\. /, ''), `${i}-${j}`)}</li>)}</ol>;
        if (/^> /.test(b)) return <blockquote key={i} className="border-l-4 border-gold pl-4 text-slate-300">{inline(b.replace(/^> /gm, ''), i)}</blockquote>;
        return <p key={i}>{b.split('\n').map((l, j) => <span key={j}>{j > 0 && <br />}{inline(l, `${i}-${j}`)}</span>)}</p>;
      })}
    </div>
  );
}

// ---- layout helpers ----
export const Section = ({ title, children, id }) => (
  <section id={id} className="max-w-6xl mx-auto px-4 pt-14">
    <h2 className="flex items-center gap-3 text-2xl font-bold mb-6"><span className="w-1 h-6 rounded bg-gold" />{title}</h2>{children}
  </section>
);
export const Grid = ({ items, render, cols = 'md:grid-cols-2 lg:grid-cols-3' }) =>
  items.length ? <div className={`grid gap-5 ${cols}`}>{items.map(render)}</div> : <p className="text-slate-400">Abhi kuch post nahi hua.</p>;
export const Pic = ({ src, w = 700 }) => (src ? <img src={img(src, w)} alt="" loading="lazy" className="w-full h-44 object-cover" /> : null);
export const Card = ({ image, className = '', children }) => (
  <article className={`card overflow-hidden flex flex-col ${className}`}><Pic src={image} /><div className="p-5 flex flex-col flex-1">{children}</div></article>
);