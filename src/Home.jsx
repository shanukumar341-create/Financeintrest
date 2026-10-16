import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Radio } from 'lucide-react';
import C from './data/content.json';
import LiveChart from './LiveChart.jsx';
import { Card, Grid, Quote, Section, biasCls, fmt, fmtDate, img, publishedArticles, useQuotes, useTitle } from './lib.jsx';
import { currency, liveSym, timeLeft, topStocksActive, useStockQuotes, viewSlug } from './helpers.js';
import { ViewCard, sortedViews } from './ViewDetail.jsx';

const ArticleCard = ({ a }) => (
  <Link to={`/articles/${a.slug}`} className="block h-full hover:[&>article]:border-gold">
    <Card image={a.cover} className="h-full">
      <div className="text-xs text-gold">{a.category} <span className="text-slate-400">· {fmtDate(a.date)}</span></div>
      <h3 className="font-semibold text-lg mt-2">{a.title}</h3>
      <p className="text-sm text-slate-300 mt-2">{a.summary}</p>
    </Card>
  </Link>
);

function News() {
  const [n, setN] = useState([]);
  useEffect(() => { fetch('/api/news').then((r) => r.json()).then((x) => Array.isArray(x) && setN(x)).catch(() => {}); }, []);
  const all = [...(C.news || []).filter((x) => x.title), ...n].slice(0, 14);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {all.map((x, i) => (
        <a key={i} href={x.url} target="_blank" rel="noopener noreferrer" className="card p-4 flex gap-4 hover:border-gold">
          {x.image && <img src={img(x.image, 200)} alt="" loading="lazy" className="w-20 h-20 rounded-lg object-cover shrink-0" />}
          <div><div className="font-medium">{x.title}</div><div className="text-xs text-slate-400 mt-1">{x.source} · {String(x.date).slice(0, 16)}</div></div>
        </a>
      ))}
    </div>
  );
}

export default function Home() {
  useTitle('Home');
  const { ok } = useQuotes();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(i); }, []);

  const bg = C.settings.heroImage;
  const views = sortedViews();
  const stocks = (C.stocks || []).filter((s) => s.symbol);
  const advice = (C.advice || []).filter((a) => a.title);
  const top = topStocksActive(C.topStocks, now);
  const sq = useStockQuotes(top);

  return (<>
    <section className="pattern relative overflow-hidden border-b border-line">
      {bg && <>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${img(bg, 1920)}")` }} />
        <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-ink/95 via-ink/80 to-ink/60" />
      </>}
      <div className="split absolute inset-0 pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-line bg-panel text-slate-300"><Radio size={14} className="text-bull" /> Live market data</span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mt-5">{C.settings.tagline}</h1>
          <p className="mt-4 text-slate-300 max-w-lg">Daily market views, best stock ideas, investment advice and live news from a trader with 10+ years in the stock market.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link className="btn" to="/calls">Get paid calls</Link><Link className="btn btn2" to="/courses">Explore courses</Link></div>
        </div>
        <LiveChart />
      </div>
    </section>

    <Section title={<>Market dashboard <span className="text-sm font-normal text-slate-400">{ok === false ? '(feed offline)' : 'auto-refresh 30s'}</span></>}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{C.settings.ticker.map((t) => <Quote key={t.s} t={t} big />)}</div>
    </Section>

    {top.length > 0 && (
      <Section title={<>Top stocks today <span className="text-sm font-normal text-slate-400">(24 ghante ke liye)</span></>} id="top-stocks">
        <Grid items={top} render={(s, i) => {
          const sym = liveSym(s), q = sq[sym], live = q && !q.error;
          const cls = live ? (q.change >= 0 ? 'up' : 'dn') : 'text-slate-400';
          return (
            <Card key={i} image={s.image}>
              <div className="flex items-start justify-between gap-3">
                <div><div className="font-head font-bold text-xl">{s.symbol}</div><div className="text-xs text-slate-400">{s.name}</div></div>
                <span className={`text-xs px-2 py-1 rounded ${biasCls(s.action)}`}>{s.action}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-3">
                <span className="text-2xl font-head font-semibold">{live ? currency(sym) + fmt(q.price) : '--'}</span>
                <span className={`text-sm ${cls}`}>{live ? `${q.change >= 0 ? '▲' : '▼'} ${fmt(Math.abs(q.change))} (${q.pct.toFixed(2)}%)` : 'live price load ho raha hai'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                <div><div className="text-xs text-slate-400">Entry</div>{s.entry}</div>
                <div><div className="text-xs text-slate-400">Target</div><span className="up">{s.target}</span></div>
                <div><div className="text-xs text-slate-400">Stop-loss</div><span className="dn">{s.sl}</span></div>
              </div>
              {s.note && <p className="text-sm text-slate-300 mt-3 flex-1">{s.note}</p>}
              <div className="mt-4 pt-3 border-t border-line text-xs text-gold flex items-center gap-1.5"><Clock size={14} /> {timeLeft(s.left)} baaki</div>
            </Card>
          );
        }} />
      </Section>
    )}

    <Section title="Market view" id="views">
      <Grid items={views.slice(0, 3)} render={(v) => <ViewCard key={viewSlug(v)} v={v} />} />
      {views.length > 3 && <Link to="/views" className="inline-flex items-center gap-1 mt-5 text-gold">Saare market views dekhein <ArrowRight size={16} /></Link>}
    </Section>

    <Section title="Best stocks to watch">
      <div className="card overflow-x-auto"><table className="w-full text-sm min-w-[680px]">
        <thead className="text-slate-400 text-left"><tr><th className="p-3">Stock</th><th>Action</th><th>Entry</th><th>Target</th><th>Stop-loss</th><th>Note</th></tr></thead>
        <tbody>{stocks.map((s, i) => (
          <tr key={i} className="border-t border-line align-top">
            <td className="p-3"><div className="flex items-center gap-3">
              {s.image && <img src={img(s.image, 160)} alt="" loading="lazy" className="w-12 h-12 rounded-lg object-cover" />}
              <div><div className="font-semibold">{s.symbol}</div><div className="text-xs text-slate-400">{s.name}</div></div></div></td>
            <td className="pt-4"><span className={`px-2 py-1 rounded text-xs ${biasCls(s.action)}`}>{s.action}</span></td>
            <td className="pt-4">{s.entry}</td><td className="pt-4 up">{s.target}</td><td className="pt-4 dn">{s.sl}</td><td className="pt-4 text-slate-300 pr-3">{s.note}</td>
          </tr>))}</tbody></table></div>
    </Section>

    <Section title="Latest articles">
      <Grid items={publishedArticles().slice(0, 3)} render={(a) => <ArticleCard key={a.slug} a={a} />} />
      <Link to="/articles" className="inline-flex items-center gap-1 mt-5 text-gold">Saare articles dekhein <ArrowRight size={16} /></Link>
    </Section>

    <Section title="Investment advice"><Grid items={advice} render={(a, i) => (
      <Card key={i} image={a.image} className="border-l-4 border-l-gold"><h3 className="font-semibold">{a.title}</h3><p className="text-sm text-slate-300 mt-2">{a.body}</p></Card>)} /></Section>

    <Section title="Market news"><News /></Section>
  </>);
}