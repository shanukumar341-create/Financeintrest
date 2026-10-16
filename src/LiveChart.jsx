import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { fmt } from './lib.jsx';

const SYMS = [['^NSEI', 'NIFTY 50'], ['^BSESN', 'SENSEX'], ['^NSEBANK', 'BANK NIFTY']];
const RANGES = [['1d', '1D'], ['5d', '5D'], ['1mo', '1M'], ['1y', '1Y']];
const TYPES = [['candle', 'Candles'], ['line', 'Line'], ['bar', 'Bars']];
const W = 560, H = 260, PL = 8, PR = 62, PT = 12, PB = 26;
const UP = '#19c37d', DN = '#f0454f', MIN_VIS = 8;
const ib = 'p-2 rounded-md bg-ink text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300';

export default function LiveChart() {
  const [sym, setSym] = useState(SYMS[0][0]);
  const [rg, setRg] = useState('1d');
  const [type, setType] = useState('candle');
  const [d, setD] = useState(null);
  const [err, setErr] = useState(false);
  const [hv, setHv] = useState(null);
  const [zoom, setZoom] = useState(null); // dikhne wali candles ki ginti, null = sab
  const [off, setOff] = useState(0);      // right side se kitni candles chhupi hain

  useEffect(() => {
    let on = true; setD(null); setErr(false); setHv(null); setZoom(null); setOff(0);
    const run = async () => {
      try {
        const r = await fetch(`/api/chart?symbol=${encodeURIComponent(sym)}&range=${rg}`);
        const j = await r.json(); if (!j.points?.length) throw 0;
        on && (setD(j), setErr(false));
      } catch { on && setErr(true); }
    };
    run(); const i = setInterval(run, 60000);
    return () => { on = false; clearInterval(i); };
  }, [sym, rg]);

  const all = d?.points || [];
  const N = all.length;
  const vis = zoom ? Math.min(zoom, N) : N;
  const maxOff = Math.max(0, N - vis);
  const o = Math.min(off, maxOff);
  const pts = all.slice(Math.max(0, N - o - vis), N - o);
  const n = pts.length;
  const zoomed = vis < N;

  const base = d?.base ?? all[0]?.o;
  const extra = zoomed || d?.base == null ? [] : [d.base];
  const lo = Math.min(...pts.map((p) => p.l), ...extra);
  const hi = Math.max(...pts.map((p) => p.h), ...extra);
  const pad = (hi - lo) * 0.08 || 1, min = lo - pad, max = hi + pad;
  const step = (W - PL - PR) / Math.max(n, 1);
  const x = (i) => PL + (i + 0.5) * step;
  const y = (v) => PT + (1 - (v - min) / (max - min)) * (H - PT - PB);
  const bw = Math.max(1, Math.min(step * 0.7, 14));

  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.c).toFixed(1)}`).join('');
  const area = n ? `${line}L${x(n - 1)},${H - PB}L${x(0)},${H - PB}Z` : '';

  const cur = hv != null && pts[hv] ? pts[hv] : all[N - 1];
  const chg = cur && base != null ? cur.c - base : 0, pct = cur && base ? (chg / base) * 100 : 0;
  const upc = chg >= 0, col = upc ? UP : DN;
  const tf = (t) => new Date(t).toLocaleString('en-IN', rg === '1d'
    ? { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }
    : { day: 'numeric', month: 'short', year: rg === '1y' ? '2-digit' : undefined });
  const ticks = [0, 1, 2, 3].map((k) => min + ((max - min) * k) / 3);

  const zin = () => { const v = Math.max(MIN_VIS, Math.round(vis * 0.6)); setZoom(v); setOff((x0) => Math.min(x0, Math.max(0, N - v))); };
  const zout = () => { const v = Math.round(vis * 1.6); if (v >= N) { setZoom(null); setOff(0); } else { setZoom(v); setOff((x0) => Math.min(x0, N - v)); } };
  const pan = (dir) => setOff(Math.max(0, Math.min(maxOff, o + dir * Math.max(1, Math.round(vis / 3)))));
  const reset = () => { setZoom(null); setOff(0); };

  const move = (e) => {
    if (!n) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHv(Math.max(0, Math.min(n - 1, Math.floor((px - PL) / step))));
  };
  const btn = (on) => `px-3 py-1 rounded-md text-xs font-semibold ${on ? 'bg-gold text-ink' : 'text-slate-300 hover:text-white'}`;

  return (
    <div className="card p-4 md:p-5 w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 bg-ink rounded-lg p-1">
          {SYMS.map(([s, nm]) => <button key={s} onClick={() => setSym(s)} className={btn(s === sym)}>{nm}</button>)}
        </div>
        <div className="flex gap-1">
          {RANGES.map(([r, nm]) => (
            <button key={r} onClick={() => setRg(r)} className={`px-2.5 py-1 rounded-md text-xs ${r === rg ? 'bg-line text-white' : 'text-slate-400 hover:text-white'}`}>{nm}</button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 bg-ink rounded-lg p-1" role="group" aria-label="Chart type">
          {TYPES.map(([t, nm]) => <button key={t} onClick={() => setType(t)} aria-pressed={t === type} className={btn(t === type)}>{nm}</button>)}
        </div>
        <div className="flex items-center gap-1" role="group" aria-label="Zoom">
          {zoomed && <>
            <button aria-label="Pehle ki candles" onClick={() => pan(1)} disabled={o >= maxOff} className={ib}><ChevronLeft size={16} /></button>
            <button aria-label="Aage ki candles" onClick={() => pan(-1)} disabled={o <= 0} className={ib}><ChevronRight size={16} /></button>
          </>}
          <button aria-label="Zoom out" onClick={zout} disabled={!zoomed} className={ib}><ZoomOut size={16} /></button>
          <button aria-label="Zoom in" onClick={zin} disabled={vis <= MIN_VIS} className={ib}><ZoomIn size={16} /></button>
          <button aria-label="Reset zoom" onClick={reset} disabled={!zoomed} className={ib}><RotateCcw size={15} /></button>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="text-3xl font-head font-semibold">{cur ? fmt(cur.c) : '--'}</div>
          <div className="text-sm" style={{ color: col }}>{cur ? `${upc ? '▲' : '▼'} ${fmt(Math.abs(chg))} (${pct.toFixed(2)}%)` : ''}</div>
        </div>
        <div className="text-right text-xs text-slate-400">
          <div>{cur ? tf(cur.t) : ''}{zoomed ? ` · ${n}/${N} candles` : ''}</div>
          {cur && type !== 'line' && <div className="mt-1 tabular-nums">O {fmt(cur.o)} · H {fmt(cur.h)} · L {fmt(cur.l)} · C {fmt(cur.c)}</div>}
        </div>
      </div>

      <div className="mt-3 h-[260px] flex items-center justify-center">
        {err && !d ? <p className="text-sm text-slate-400 text-center">Chart data abhi available nahi hai.<br />Thodi der me dobara try karein.</p>
          : !d ? <p className="text-sm text-slate-400">Chart load ho raha hai...</p> : (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full touch-pan-y" onPointerMove={move} onPointerLeave={() => setHv(null)} role="img" aria-label={`${type} price chart`}>
            <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} stopOpacity=".28" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient></defs>
            {ticks.map((t, k) => (
              <g key={k}><line x1={PL} x2={W - PR} y1={y(t)} y2={y(t)} stroke="#1e2a44" strokeWidth="1" />
                <text x={W - PR + 6} y={y(t) + 4} fontSize="11" fill="#94a3b8">{fmt(t)}</text></g>
            ))}
            {rg === '1d' && d.base != null && d.base >= min && d.base <= max && <line x1={PL} x2={W - PR} y1={y(d.base)} y2={y(d.base)} stroke="#64748b" strokeDasharray="4 4" strokeWidth="1" />}

            {type === 'line' && (<>
              <path d={area} fill="url(#g)" />
              <path d={line} fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round" />
            </>)}

            {type === 'candle' && pts.map((p, i) => {
              const c = p.c >= p.o ? UP : DN;
              const top = y(Math.max(p.o, p.c)), h = Math.max(1, Math.abs(y(p.o) - y(p.c)));
              return (<g key={i}>
                <line x1={x(i)} x2={x(i)} y1={y(p.h)} y2={y(p.l)} stroke={c} strokeWidth="1" />
                <rect x={x(i) - bw / 2} y={top} width={bw} height={h} fill={c} />
              </g>);
            })}

            {type === 'bar' && pts.map((p, i) => {
              const c = p.c >= p.o ? UP : DN, t = Math.max(1, bw / 2);
              return (<g key={i} stroke={c} strokeWidth={bw > 3 ? 1.5 : 1}>
                <line x1={x(i)} x2={x(i)} y1={y(p.h)} y2={y(p.l)} />
                <line x1={x(i) - t} x2={x(i)} y1={y(p.o)} y2={y(p.o)} />
                <line x1={x(i)} x2={x(i) + t} y1={y(p.c)} y2={y(p.c)} />
              </g>);
            })}

            {n > 0 && <>
              <text x={PL} y={H - 6} fontSize="11" fill="#94a3b8">{tf(pts[0].t)}</text>
              <text x={W - PR} y={H - 6} fontSize="11" fill="#94a3b8" textAnchor="end">{tf(pts[n - 1].t)}</text>
            </>}
            {hv != null && pts[hv] && <g>
              <line x1={x(hv)} x2={x(hv)} y1={PT} y2={H - PB} stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
              {type === 'line' && <circle cx={x(hv)} cy={y(pts[hv].c)} r="4" fill={col} />}
            </g>}
          </svg>
        )}
      </div>
      <p className="text-[11px] text-slate-500 mt-2">Source: public market feed, delayed/indicative. Refreshes every minute.</p>
    </div>
  );
}