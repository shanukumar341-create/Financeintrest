import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Clock, GraduationCap, Rocket, Search, ShieldCheck, TrendingUp } from 'lucide-react';
import { useTitle } from './lib.jsx';

const STATS = [
  [Clock, '10+ Years', 'Professional Trading Experience'],
  [TrendingUp, 'Options & Technical Analysis', 'Price Action • Derivatives • Market Structure'],
  [ShieldCheck, 'Risk First', 'Capital Protection • Discipline • Risk Management'],
];

const CREDENTIALS = ['NISM Research Analyst', 'NISM Equity Derivatives', 'B.Tech, Mechanical Engineering'];

const FOCUS = ['Index & Stock Options', 'Option Selling', 'Swing Trading', 'Technical Analysis', 'Price Action', 'Market Structure', 'Risk Management', 'Equity Research'];

// Edit these stages freely. Add a `when` field (like "2016") and show it in the card if you want years.
const JOURNEY = [
  [GraduationCap, 'Engineering foundation', 'B.Tech in Mechanical Engineering: a structured, analytical way of approaching problems.'],
  [Search, 'Equity research', 'Company analysis, financial statements, valuation, sector research and investment ideas.'],
  [BadgeCheck, 'NISM certifications', 'NISM Research Analyst and NISM Equity Derivatives, backing practical skills with formal knowledge.'],
  [TrendingUp, 'Live market experience', 'Index and stock options, option selling and swing trading. Price action and market structure learned through real market exposure.'],
  [Rocket, 'This platform', 'Sharing practical, data-driven insights, strategies, education and risk-management principles.', true],
];

export default function About() {
  useTitle('About');
  return (<>
    <section className="pattern relative overflow-hidden border-b border-line">
      <div className="split absolute inset-0 pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20">
        <p className="text-sm text-gold font-semibold">Trader · Market analyst · Financial markets educator</p>
        <h1 className="text-4xl md:text-5xl font-extrabold mt-3 max-w-3xl leading-tight">Hands-on experience across Indian equity and derivatives markets</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {CREDENTIALS.map((c) => (
            <span key={c} className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border border-line bg-panel text-slate-200">
              <BadgeCheck size={16} className="text-gold" />{c}</span>))}
        </div>
      </div>
    </section>

    <section className="max-w-6xl mx-auto px-4 pt-12">
      <div className="grid md:grid-cols-3 gap-5">
        {STATS.map(([Icon, title, sub]) => (
          <div key={title} className="card p-6">
            <span className="w-11 h-11 rounded-lg grid place-items-center bg-gold/10 text-gold"><Icon size={22} /></span>
            <div className="text-xl font-head font-bold mt-4">{title}</div>
            <div className="text-sm text-slate-300 mt-1.5">{sub}</div>
          </div>))}
      </div>
    </section>

    <section className="max-w-6xl mx-auto px-4 pt-14 grid lg:grid-cols-[1.4fr_1fr] gap-10">
      <div className="space-y-5 text-slate-300 leading-relaxed">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-white"><span className="w-1 h-6 rounded bg-gold" />My story</h2>
        <p>I am a professional trader, market analyst, and financial markets educator with extensive hands-on experience across Indian equity and derivatives markets. My core expertise lies in options trading, technical analysis, price action, market structure, and risk management.</p>
        <p>Over the years, I have developed a practical approach to trading through real market exposure, not just theoretical knowledge. I specialize in index and stock options, option selling, swing trading, and market analysis, with a strong emphasis on managing risk and protecting capital.</p>
        <p>My professional background also includes experience in equity research, where I have worked on company analysis, financial statements, valuation, sector research, and investment ideas. I hold NISM Research Analyst and NISM Equity Derivatives certifications and have a B.Tech in Mechanical Engineering.</p>
        <p>Through this platform, my goal is to share practical, data-driven market insights, trading strategies, educational content, and risk-management principles that can help traders and investors make more informed decisions.</p>
      </div>
      <aside className="card p-6 h-fit">
        <h3 className="font-head font-bold">Areas of focus</h3>
        <div className="flex flex-wrap gap-2 mt-4">
          {FOCUS.map((f) => <span key={f} className="text-xs px-2.5 py-1.5 rounded-md bg-ink border border-line text-slate-200">{f}</span>)}
        </div>
      </aside>
    </section>

    <section className="max-w-4xl mx-auto px-4 pt-16">
      <h2 className="flex items-center gap-3 text-2xl font-bold mb-8"><span className="w-1 h-6 rounded bg-gold" />The journey</h2>
      <ol className="relative border-l border-line ml-5 space-y-8">
        {JOURNEY.map(([Icon, title, text, now]) => (
          <li key={title} className="pl-8 relative">
            <span className={`absolute -left-5 top-0 w-10 h-10 rounded-full grid place-items-center border ${now ? 'bg-gold text-ink border-gold' : 'bg-panel text-gold border-line'}`}><Icon size={18} /></span>
            <div className="card p-5">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-semibold text-lg">{title}</h3>
                {now && <span className="text-xs px-2 py-0.5 rounded-full bg-bull/15 up">Now</span>}
              </div>
              <p className="text-sm text-slate-300 mt-2">{text}</p>
            </div>
          </li>))}
      </ol>
    </section>

    <section className="max-w-4xl mx-auto px-4 pt-16">
      <blockquote className="card border-l-4 border-l-gold p-6 md:p-8">
        <p className="text-xl md:text-2xl font-head font-bold leading-snug">Understand the market, define your risk, and trade with discipline.</p>
        <footer className="text-sm text-slate-400 mt-3">My philosophy</footer>
      </blockquote>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="btn" to="/contact">Talk to me</Link>
        <Link className="btn btn2" to="/articles">Read my articles <ArrowRight size={16} /></Link>
      </div>
    </section>
  </>);
}