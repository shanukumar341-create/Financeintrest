import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import C from './data/content.json';
import { LogoMark, Quote, QuotesProvider, useQuotes } from './lib.jsx';
import { ArticleView, Articles, Calls, Contact, Courses, NotFound, Portfolio } from './pages.jsx';
import About from './About.jsx';
import Home from './Home.jsx';
import LiveClasses from './LiveClasses.jsx';
import ViewDetail, { ViewsList } from './ViewDetail.jsx';
import Admin from './Admin.jsx';

const NAV = [['/', 'Home'], ['/about', 'About'], ['/articles', 'Articles'], ['/courses', 'Courses'], ['/calls', 'Paid Calls'], ['/live-classes', 'Live Classes'], ['/portfolio', 'Portfolio'], ['/contact', 'Contact']];

function TickerBar() {
  const { ok } = useQuotes(); const h = C.settings.ticker.map((t) => <Quote key={t.s} t={t} />);
  const dot = ok ? 'bg-bull' : ok === false ? 'bg-bear' : 'bg-slate-500';
  return (<div className="bg-black border-b border-line text-sm flex items-center">
    <span className="flex items-center gap-2 px-3 shrink-0 text-xs font-semibold text-slate-300">
      <span className={`w-2 h-2 rounded-full ${dot} ${ok ? 'motion-safe:animate-pulse' : ''}`} />{ok ? 'LIVE' : ok === false ? 'OFFLINE' : '...'}</span>
    <div id="ticker" className="overflow-hidden flex-1 py-2"><div className="marquee"><div className="flex">{h}</div><div className="flex" aria-hidden="true">{h}</div></div></div></div>);
}

const Brand = () => {
  const b = C.settings.brand.split(' ');
  return (<Link to="/" className="flex items-center gap-2.5"><LogoMark />
    <span className="font-head font-bold text-lg tracking-tight text-white">{b[0]} <span className="text-gold">{b.slice(1).join(' ')}</span></span></Link>);
};

function Layout() {
  const [open, setOpen] = useState(false); const { pathname } = useLocation();
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  return (<>
    <TickerBar />
    <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-line"><div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
      <Brand />
      <button className="lg:hidden p-2 rounded-lg border border-line" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      <nav className={open ? 'flex flex-col gap-3 absolute top-16 left-0 right-0 bg-ink p-4 border-b border-line text-sm' : 'hidden lg:flex gap-6 text-sm'}>
        {NAV.map(([to, n]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `py-1 border-b-2 ${isActive ? 'border-gold text-gold' : 'border-transparent text-slate-300 hover:text-white'}`}>{n}</NavLink>)}</nav></div></header>
    <main className="min-h-[60vh]"><Outlet /></main>
    <footer className="border-t border-line mt-20 pattern"><div className="max-w-6xl mx-auto px-4 py-10 text-sm text-slate-400 space-y-4">
      <Brand />
      <div className="flex flex-wrap gap-5">{NAV.map(([to, n]) => <Link key={to} className="hover:text-gold" to={to}>{n}</Link>)}</div>
      <p>{C.settings.email} · {C.settings.phone}</p>
      <p className="text-xs max-w-3xl">Disclaimer: Content education ke liye hai, investment advice nahi. Market me risk hota hai aur aap capital kho sakte hain. Invest karne se pehle SEBI-registered advisor se salah lein. Market data public feeds se hai aur indicative hai.</p>
      <p>© {new Date().getFullYear()} {C.settings.brand}</p></div></footer></>);
}

export default function App() {
  return (<QuotesProvider><Routes>
    <Route path="/admin" element={<Admin />} />
    <Route element={<Layout />}>
      <Route index element={<Home />} /><Route path="about" element={<About />} />
      <Route path="views" element={<ViewsList />} /><Route path="views/:slug" element={<ViewDetail />} />
      <Route path="articles" element={<Articles />} /><Route path="articles/:slug" element={<ArticleView />} />
      <Route path="courses" element={<Courses />} /><Route path="calls" element={<Calls />} />
      <Route path="live-classes" element={<LiveClasses />} /><Route path="portfolio" element={<Portfolio />} />
      <Route path="contact" element={<Contact />} /><Route path="*" element={<NotFound />} />
    </Route></Routes></QuotesProvider>);
}