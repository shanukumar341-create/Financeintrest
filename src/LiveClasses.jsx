import { useState } from 'react';
import { Play } from 'lucide-react';
import C from './data/content.json';
import { Card, Grid, Section, fmtDate, useTitle, wa } from './lib.jsx';
import { ytId } from './helpers.js';

function Video({ r }) {
  const id = ytId(r.url);
  const [play, setPlay] = useState(false);
  if (!id) return null;
  return (
    <article className="card overflow-hidden flex flex-col">
      <div className="relative aspect-video bg-black">
        {play ? (
          <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={r.title}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        ) : (
          <button className="group absolute inset-0 w-full h-full" onClick={() => setPlay(true)} aria-label={`Play: ${r.title}`}>
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="w-full h-full object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-black/30 group-hover:bg-black/15 transition">
              <span className="w-14 h-14 rounded-full bg-gold text-ink grid place-items-center"><Play size={24} fill="currentColor" /></span>
            </span>
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs text-slate-400">{r.topic && <span className="text-gold">{r.topic}</span>}{r.topic && r.date ? ' · ' : ''}{r.date && fmtDate(r.date)}</div>
        <h3 className="font-semibold mt-1">{r.title}</h3>
        {r.desc && <p className="text-sm text-slate-300 mt-2">{r.desc}</p>}
      </div>
    </article>
  );
}

export default function LiveClasses() {
  useTitle('Live Classes');
  const [topic, setTopic] = useState('All');
  const classes = (C.classes || []).filter((c) => c.title);
  const recs = (C.recordings || []).filter((r) => ytId(r.url)).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const topics = ['All', ...new Set(recs.map((r) => r.topic).filter(Boolean))];

  return (<>
    <Section title="Live classes">
      <Grid items={classes} render={(c, i) => (
        <Card key={i} image={c.image}>
          <div><span className="text-xs px-2 py-1 rounded bg-bear/15 dn">{c.mode}</span></div>
          <h3 className="font-semibold text-lg mt-3">{c.title}</h3>
          <p className="text-gold text-sm mt-1">{c.when}</p>
          <p className="text-sm text-slate-300 mt-3 flex-1">{c.desc}</p>
          <div className="flex items-center justify-between mt-5"><b className="font-head text-xl">{c.price}</b>
            <a className="btn" target="_blank" rel="noopener noreferrer" href={wa('Book live class: ' + c.title)}>Reserve seat</a></div>
        </Card>)} />
    </Section>

    <Section title="Recorded classes" id="recordings">
      {topics.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {topics.map((t) => <button key={t} onClick={() => setTopic(t)} className={`btn !py-1 text-sm ${t === topic ? '' : 'btn2'}`}>{t}</button>)}
        </div>
      )}
      <Grid items={recs.filter((r) => topic === 'All' || r.topic === topic)} render={(r, i) => <Video key={i} r={r} />} />
    </Section>
  </>);
}