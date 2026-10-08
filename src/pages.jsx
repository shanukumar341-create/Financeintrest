import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, Mail, MapPin, MessageCircle, Phone, Radio } from 'lucide-react';
import C from './data/content.json';
import LiveChart from './LiveChart.jsx';
import { Card, Grid, Md, Pic, Quote, Section, biasCls, fmtDate, img, publishedArticles, useQuotes, useTitle, wa } from './lib.jsx';

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
  const all = [...C.news, ...n].slice(0, 14);
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

export function Home() {
  useTitle('Home'); const { ok } = useQuotes();
  return (<>
    <section className="pattern relative overflow-hidden border-b border-line">
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

    <Section title="Market view" id="views"><Grid items={C.views} render={(v, i) => (
      <Card key={i} image={v.image}>
        <div><span className={`text-xs px-2 py-1 rounded ${biasCls(v.bias)}`}>{v.bias}</span><span className="text-xs text-slate-400 ml-2">{v.date}</span></div>
        <h3 className="font-semibold mt-3">{v.title}</h3><p className="text-slate-300 text-sm mt-2">{v.body}</p>
      </Card>)} /></Section>

    <Section title="Best stocks to watch"><div className="card overflow-x-auto"><table className="w-full text-sm min-w-[680px]">
      <thead className="text-slate-400 text-left"><tr><th className="p-3">Stock</th><th>Action</th><th>Entry</th><th>Target</th><th>Stop-loss</th><th>Note</th></tr></thead>
      <tbody>{C.stocks.map((s, i) => (
        <tr key={i} className="border-t border-line align-top">
          <td className="p-3"><div className="flex items-center gap-3">
            {s.image && <img src={img(s.image, 160)} alt="" loading="lazy" className="w-12 h-12 rounded-lg object-cover" />}
            <div><div className="font-semibold">{s.symbol}</div><div className="text-xs text-slate-400">{s.name}</div></div></div></td>
          <td className="pt-4"><span className={`px-2 py-1 rounded text-xs ${biasCls(s.action)}`}>{s.action}</span></td>
          <td className="pt-4">{s.entry}</td><td className="pt-4 up">{s.target}</td><td className="pt-4 dn">{s.sl}</td><td className="pt-4 text-slate-300 pr-3">{s.note}</td>
        </tr>))}</tbody></table></div></Section>

    <Section title="Latest articles">
      <Grid items={publishedArticles().slice(0, 3)} render={(a) => <ArticleCard key={a.slug} a={a} />} />
      <Link to="/articles" className="inline-flex items-center gap-1 mt-5 text-gold">Saare articles dekhein <ArrowRight size={16} /></Link>
    </Section>

    <Section title="Investment advice"><Grid items={C.advice} render={(a, i) => (
      <Card key={i} image={a.image} className="border-l-4 border-l-gold"><h3 className="font-semibold">{a.title}</h3><p className="text-sm text-slate-300 mt-2">{a.body}</p></Card>)} /></Section>

    <Section title="Market news"><News /></Section>
  </>);
}

export function About() {
  useTitle('About');
  return (<section className="max-w-4xl mx-auto px-4 pt-14"><h1 className="text-4xl font-extrabold">About</h1>
    <p className="mt-5 text-slate-300 leading-relaxed">Creating this website is a continuation of my journey in financial markets, built on years of hands-on experience in trading and market analysis. Over time, I have developed a deep understanding of price action, candlestick patterns, market psychology, and risk management through real market exposure rather than just theory. This platform is designed to share practical knowledge that can help traders and investors make better decisions.</p>
    <div className="grid sm:grid-cols-3 gap-4 mt-8">{[['10+ years', 'In the stock market'], ['Price action', 'Candlesticks and market structure'], ['Risk first', 'Capital protection before profit']].map(([a, b]) => (
      <div key={a} className="card p-5"><div className="text-2xl font-head font-bold text-gold">{a}</div><div className="text-sm text-slate-300 mt-1">{b}</div></div>))}</div>
    <Link className="btn mt-8" to="/contact">Talk to me</Link></section>);
}

export function Articles() {
  useTitle('Articles'); const list = publishedArticles(); const [cat, setCat] = useState('All');
  const cats = ['All', ...new Set(list.map((a) => a.category).filter(Boolean))];
  return (<Section title="Articles">
    <div className="flex flex-wrap gap-2 mb-6">{cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`btn !py-1 text-sm ${c === cat ? '' : 'btn2'}`}>{c}</button>)}</div>
    <Grid items={list.filter((a) => cat === 'All' || a.category === cat)} render={(a) => <ArticleCard key={a.slug} a={a} />} /></Section>);
}

export function ArticleView() {
  const { slug } = useParams(); const a = publishedArticles().find((x) => x.slug === slug); useTitle(a?.title || 'Article');
  if (!a) return <div className="max-w-xl mx-auto px-4 py-24 text-center"><h1 className="text-3xl font-bold">Article nahi mila</h1><Link className="btn mt-6" to="/articles">Saare articles</Link></div>;
  return (<article className="max-w-3xl mx-auto px-4 pt-12">
    <Link to="/articles" className="text-sm text-gold">← Articles</Link>
    <div className="text-xs text-gold mt-4">{a.category} <span className="text-slate-400">· {fmtDate(a.date)}</span></div>
    <h1 className="text-3xl md:text-4xl font-extrabold mt-2">{a.title}</h1>
    {a.cover && <img src={img(a.cover, 1200)} alt="" className="rounded-xl mt-6 w-full" />}
    <div className="mt-6"><Md text={a.body} /></div>
    <p className="text-xs text-slate-400 mt-10 border-t border-line pt-4">Yeh article sirf education ke liye hai, investment advice nahi.</p></article>);
}

export function Courses() {
  useTitle('Courses');
  return (<Section title="Trading courses"><Grid items={C.courses} render={(c, i) => (
    <Card key={i} image={c.image}><h3 className="font-semibold text-lg">{c.title}</h3><p className="text-xs text-slate-400 mt-1">{c.level} · {c.duration}</p>
      <p className="text-sm text-slate-300 mt-3 flex-1">{c.desc}</p>
      <div className="flex items-center justify-between mt-5"><span className="text-xl font-head font-bold text-gold">{c.price}</span><a className="btn" target="_blank" rel="noopener noreferrer" href={wa('I want to enrol in: ' + c.title)}>Enrol</a></div></Card>)} /></Section>);
}

export function Calls() {
  useTitle('Paid Calls');
  return (<><Section title="Paid calls"><Grid items={C.calls} render={(c, i) => (
    <Card key={i} image={c.image}><h3 className="font-semibold text-lg">{c.plan}</h3>
      <div className="mt-2"><span className="text-3xl font-head font-bold text-gold">{c.price}</span> <span className="text-slate-400 text-sm">{c.period}</span></div>
      <ul className="mt-4 space-y-2 text-sm flex-1">{String(c.features).split(',').map((f, j) => <li key={j} className="flex gap-2"><Check size={16} className="text-bull mt-0.5 shrink-0" /> {f.trim()}</li>)}</ul>
      <a className="btn mt-5" target="_blank" rel="noopener noreferrer" href={wa('I want the paid calls plan: ' + c.plan)}>Subscribe on WhatsApp</a></Card>)} /></Section>
    <p className="max-w-6xl mx-auto px-4 mt-6 text-xs text-slate-400">Calls education ke liye trade ideas hain, guaranteed returns nahi. Apni risk limit me hi trade karein.</p></>);
}

export function LiveClasses() {
  useTitle('Live Classes');
  return (<Section title="Live classes"><Grid items={C.classes} render={(c, i) => (
    <Card key={i} image={c.image}><div><span className="text-xs px-2 py-1 rounded bg-bear/15 dn">{c.mode}</span></div>
      <h3 className="font-semibold text-lg mt-3">{c.title}</h3><p className="text-gold text-sm mt-1">{c.when}</p><p className="text-sm text-slate-300 mt-3 flex-1">{c.desc}</p>
      <div className="flex items-center justify-between mt-5"><b className="font-head text-xl">{c.price}</b><a className="btn" target="_blank" rel="noopener noreferrer" href={wa('Book live class: ' + c.title)}>Reserve seat</a></div></Card>)} /></Section>);
}

const ALLOC = { Conservative: [['Equity', 30, 'bg-bull'], ['Debt', 50, 'bg-gold'], ['Gold', 15, 'bg-gold'], ['Cash', 5, 'bg-line']], Balanced: [['Equity', 55, 'bg-bull'], ['Debt', 25, 'bg-gold'], ['Gold', 15, 'bg-gold'], ['Cash', 5, 'bg-line']], Aggressive: [['Equity', 75, 'bg-bull'], ['Debt', 10, 'bg-gold'], ['Gold', 10, 'bg-gold'], ['Cash', 5, 'bg-line']] };
export function Portfolio() {
  useTitle('Portfolio Management'); const [r, setR] = useState('Balanced');
  return (<>
    <Section title="Portfolio management"><Grid cols="md:grid-cols-2" items={C.plans} render={(p, i) => (
      <Card key={i} image={p.image}><h3 className="font-semibold text-lg">{p.name}</h3><p className="text-sm text-slate-300 mt-2 flex-1">{p.desc}</p><p className="text-gold mt-3">Fee: {p.fee}</p>
        <a className="btn mt-4 self-start" target="_blank" rel="noopener noreferrer" href={wa('Portfolio management enquiry: ' + p.name)}>Enquire</a></Card>)} /></Section>
    <Section title="Sample allocation guide"><div className="card p-6">
      <label className="text-sm">Risk appetite <select value={r} onChange={(e) => setR(e.target.value)} className="inp !w-auto ml-2">{Object.keys(ALLOC).map((k) => <option key={k}>{k}</option>)}</select></label>
      <div className="mt-5 space-y-3">{ALLOC[r].map(([n, v, c]) => (<div key={n}><div className="flex justify-between text-sm"><span>{n}</span><span>{v}%</span></div><div className="h-2 rounded bg-line"><div className={`h-2 rounded ${c}`} style={{ width: v + '%' }} /></div></div>))}</div>
      <p className="text-xs text-slate-400 mt-3">Sirf example hai, personal advice nahi.</p></div></Section></>);
}

export function Contact() {
  useTitle('Contact'); const [st, setSt] = useState('');
  const submit = async (e) => {
    e.preventDefault(); const f = new FormData(e.target); setSt('sending');
    try {
      const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ 'form-name': 'contact', ...Object.fromEntries(f) }).toString() });
      if (!r.ok) throw 0; setSt('ok'); e.target.reset();
    } catch { setSt('err'); }
  };
  const row = (Icon, t) => <div className="flex items-center gap-3"><Icon size={18} className="text-gold" /><span>{t}</span></div>;
  return (<section className="max-w-5xl mx-auto px-4 pt-14 grid md:grid-cols-2 gap-10">
    <div><h1 className="text-4xl font-extrabold">Contact</h1><p className="mt-4 text-slate-300">Courses, calls ya portfolio management ke baare me puchhein.</p>
      <div className="mt-6 space-y-3">{row(Mail, C.settings.email)}{row(Phone, C.settings.phone)}{row(MapPin, C.settings.address)}</div>
      <a className="btn mt-6" target="_blank" rel="noopener noreferrer" href={wa('Hi, I have a question')}><MessageCircle size={18} /> Chat on WhatsApp</a></div>
    <form onSubmit={submit} className="card p-6 space-y-3">
      <p className="hidden"><input name="bot" tabIndex={-1} /></p>
      <label className="block text-sm">Name<input required name="name" className="inp mt-1" /></label>
      <label className="block text-sm">Email<input required type="email" name="email" className="inp mt-1" /></label>
      <label className="block text-sm">Message<textarea required name="message" rows="4" className="inp mt-1" /></label>
      <button className="btn w-full" disabled={st === 'sending'}>{st === 'sending' ? 'Sending...' : 'Send message'}</button>
      {st === 'ok' && <p className="up text-sm">Message bhej diya gaya. Thanks!</p>}
      {st === 'err' && <p className="dn text-sm">Form sirf Netlify par deploy hone ke baad kaam karta hai. Tab tak WhatsApp use karein.</p>}
    </form></section>);
}

export const NotFound = () => (<div className="max-w-xl mx-auto px-4 py-24 text-center"><h1 className="text-4xl font-bold">404</h1><p className="text-slate-300 mt-2">Yeh page nahi mila.</p><Link className="btn mt-6" to="/">Home</Link></div>);