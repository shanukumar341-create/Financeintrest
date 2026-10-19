import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon, RefreshCw, Upload } from 'lucide-react';
import C from './data/content.json';
import { Md, img, slugify } from './lib.jsx';
import { HOURS, timeLeft } from './helpers.js';

const DEV = import.meta.env.DEV;
const SCH = {
  views: ['title', 'date', 'bias', 'body', 'image'],
  stocks: ['symbol', 'name', 'action', 'entry', 'target', 'sl', 'note', 'image'],
  topStocks: ['symbol', 'name', 'liveSymbol', 'action', 'entry', 'target', 'sl', 'note', 'image'],
  advice: ['title', 'body', 'image'],
  news: ['title', 'source', 'url', 'date', 'image'],
  courses: ['title', 'level', 'duration', 'price', 'desc', 'image'],
  calls: ['plan', 'price', 'period', 'features', 'image'],
  classes: ['title', 'when', 'mode', 'price', 'desc', 'image'],
  recordings: ['title', 'url', 'topic', 'date', 'desc'],
  plans: ['name', 'fee', 'desc', 'image'],
};
const LONG = ['body', 'desc', 'note', 'features'];
const HINT = { url: 'url (YouTube video ka link)', liveSymbol: 'liveSymbol (optional, sirf tab jab live price na aaye)' };
const today = () => new Date().toISOString().slice(0, 10);
const withDefaults = (d) => ({ ...d, recordings: d.recordings || [], topStocks: d.topStocks || [], articles: d.articles || [] });
const sha = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, '0')).join('');

// Live site par save ho chuka draft 15 minute baad hata dete hain (tab tak deploy ho chuka hota hai)
function loadDraft() {
  try {
    const c = localStorage.tm_clean;
    if (c && Date.now() - Number(c) > 15 * 60e3) { localStorage.removeItem('tm_draft'); localStorage.removeItem('tm_clean'); }
    const d = localStorage.tm_draft;
    if (d) return withDefaults(JSON.parse(d));
  } catch { /* ignore */ }
  return withDefaults(structuredClone(C));
}

async function uploadImage(file, s) {
  if (!s.cloudName || !s.uploadPreset) throw new Error('Pehle Settings tab me Cloudinary cloud name aur upload preset daalkar Save karein.');
  if (file.size > 8 * 1024 * 1024) throw new Error('Image 8MB se choti rakhein.');
  const f = new FormData(); f.append('file', file); f.append('upload_preset', s.uploadPreset);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: 'POST', body: f });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || 'Upload fail ho gaya.');
  return j.secure_url;
}

function ImageField({ label = 'Image (optional)', value, onChange, settings }) {
  const [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const pick = async (e) => {
    const file = e.target.files[0]; e.target.value = ''; if (!file) return;
    setBusy(true); setErr('');
    try { onChange(await uploadImage(file, settings)); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (<div>
    <div className="text-xs text-slate-400 mb-1">{label}</div>
    <div className="flex flex-wrap items-center gap-3">
      {value ? <img src={img(value, 160)} alt="" className="w-20 h-20 object-cover rounded-lg border border-line" />
        : <div className="w-20 h-20 rounded-lg border border-dashed border-line grid place-items-center text-slate-500"><ImageIcon size={22} /></div>}
      <div className="flex-1 min-w-[220px] space-y-2">
        <input className="inp" placeholder="Image URL (ya Upload dabayein)" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        <div className="flex gap-2">
          <label className="btn btn2 !py-1 text-sm cursor-pointer"><Upload size={14} />{busy ? 'Uploading...' : 'Upload'}
            <input type="file" accept="image/*" hidden disabled={busy} onChange={pick} /></label>
          {value && <button type="button" className="btn btn2 !py-1 text-sm dn" onClick={() => onChange('')}>Remove</button>}
        </div>
        {err && <p className="dn text-xs">{err}</p>}
      </div></div></div>);
}

function ArticleEditor({ D, set }) {
  const [i, setI] = useState(0), [pv, setPv] = useState(false), [busy, setBusy] = useState(false); const a = D.articles[i];
  const up = (f, v) => set((d) => {
    const x = d.articles[i];
    if (f === 'title' && (!x.slug || x.slug === slugify(x.title))) x.slug = slugify(v);
    x[f] = v;
  });
  const add = () => { set((d) => { d.articles.unshift({ slug: '', title: '', category: 'Market Analysis', date: today(), summary: '', cover: '', body: '', published: true }); }); setI(0); };
  const del = () => { if (confirm('Is article ko delete karein?')) { set((d) => { d.articles.splice(i, 1); }); setI(0); } };
  const insertImg = async (e) => {
    const file = e.target.files[0]; e.target.value = ''; if (!file) return; setBusy(true);
    try { const url = await uploadImage(file, D.settings); up('body', (a.body ? a.body + '\n\n' : '') + `![](${url})`); } catch (x) { alert(x.message); } finally { setBusy(false); }
  };
  return (<div className="grid md:grid-cols-[250px_1fr] gap-4">
    <div className="space-y-2"><button className="btn w-full" onClick={add}>+ Naya article likhein</button>
      {D.articles.map((x, k) => <button key={k} onClick={() => setI(k)} className={`card p-3 w-full text-left text-sm ${k === i ? 'border-gold' : ''}`}>
        <div className="font-medium">{x.title || '(bina title)'}</div><div className="text-xs text-slate-400">{x.date} · {x.published ? 'Published' : 'Draft'}</div></button>)}</div>
    {a ? <div className="card p-4 space-y-3">
      <label className="block text-xs text-slate-400">Title<input className="inp mt-1" value={a.title} onChange={(e) => up('title', e.target.value)} /></label>
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="block text-xs text-slate-400">URL slug<input className="inp mt-1" value={a.slug} onChange={(e) => up('slug', slugify(e.target.value))} /></label>
        <label className="block text-xs text-slate-400">Category<input className="inp mt-1" value={a.category} onChange={(e) => up('category', e.target.value)} /></label>
        <label className="block text-xs text-slate-400">Date<input type="date" className="inp mt-1" value={a.date} onChange={(e) => up('date', e.target.value)} /></label></div>
      <label className="block text-xs text-slate-400">Short summary<input className="inp mt-1" value={a.summary} onChange={(e) => up('summary', e.target.value)} /></label>
      <ImageField label="Cover image (optional)" value={a.cover} settings={D.settings} onChange={(v) => up('cover', v)} />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs text-slate-400">Article (Markdown: ## heading, **bold**, - list, [link](https://..))</span>
        <div className="flex gap-2">
          <label className="btn btn2 !py-1 text-sm cursor-pointer"><Upload size={14} />{busy ? 'Uploading...' : 'Text me image'}<input type="file" accept="image/*" hidden disabled={busy} onChange={insertImg} /></label>
          <button className="btn btn2 !py-1 text-sm" onClick={() => setPv(!pv)}>{pv ? 'Edit' : 'Preview'}</button></div></div>
      {pv ? <div className="border border-line rounded-lg p-4"><h1 className="text-2xl font-bold mb-4">{a.title}</h1><Md text={a.body} /></div>
        : <textarea rows="16" className="inp font-mono text-sm" value={a.body} onChange={(e) => up('body', e.target.value)} />}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={!!a.published} onChange={(e) => up('published', e.target.checked)} /> Website par publish karein</label>
        <button className="btn btn2 !py-1 text-sm dn" onClick={del}>Delete</button></div>
    </div> : <p className="text-slate-400">Koi article nahi. "Naya article likhein" dabayein.</p>}</div>);
}

function ListEditor({ tab, D, set }) {
  const isTop = tab === 'topStocks';
  const blank = () => Object.fromEntries([
    ...SCH[tab].map((f) => [f, f === 'date' ? today() : '']),
    ...(isTop ? [['postedAt', new Date().toISOString()]] : []),
  ]);
  return (<div className="space-y-4">
    {isTop && <p className="text-xs text-slate-400">Top stocks website par post karne ke {HOURS} ghante baad apne aap hat jaate hain. Dobara dikhana ho to "Renew" dabayein.</p>}
    {D[tab].map((it, i) => {
      const left = isTop ? new Date(it.postedAt).getTime() + HOURS * 3600e3 - Date.now() : 0;
      return (
        <div key={i} className="card p-4 grid sm:grid-cols-2 gap-3">
          {isTop && (
            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className={left > 0 ? 'up' : 'dn'}>{left > 0 ? `Website par live: ${timeLeft(left)} baaki` : 'Expired (website par nahi dikh raha)'}</span>
              <button className="btn btn2 !py-1 text-sm" onClick={() => set((d) => { d[tab][i].postedAt = new Date().toISOString(); })}><RefreshCw size={14} /> Renew {HOURS}h</button>
            </div>
          )}
          {SCH[tab].map((f) => f === 'image' ? (
            <div key={f} className="sm:col-span-2"><ImageField value={it.image} settings={D.settings} onChange={(v) => set((d) => { d[tab][i].image = v; })} /></div>
          ) : (
            <label key={f} className={`text-xs text-slate-400 ${LONG.includes(f) ? 'sm:col-span-2' : ''}`}>{HINT[f] || f}
              {LONG.includes(f) ? <textarea rows="3" className="inp mt-1" value={it[f] ?? ''} onChange={(e) => set((d) => { d[tab][i][f] = e.target.value; })} />
                : <input className="inp mt-1" value={it[f] ?? ''} onChange={(e) => set((d) => { d[tab][i][f] = e.target.value; })} />}</label>))}
          <div className="sm:col-span-2 flex gap-2">
            <button className="btn btn2 !py-1 text-sm" onClick={() => i > 0 && set((d) => { [d[tab][i - 1], d[tab][i]] = [d[tab][i], d[tab][i - 1]]; })}>Upar</button>
            <button className="btn btn2 !py-1 text-sm dn" onClick={() => confirm('Delete karein?') && set((d) => { d[tab].splice(i, 1); })}>Delete</button></div>
        </div>);
    })}
    <button className="btn" onClick={() => set((d) => { d[tab].unshift(blank()); })}>+ Add</button></div>);
}

function Settings({ D, set }) {
  const s = D.settings; const [tk, setTk] = useState(s.ticker.map((t) => t.s + '|' + t.n).join('\n'));
  const F = [['brand', 'Brand name'], ['tagline', 'Tagline'], ['whatsapp', 'WhatsApp (country code ke saath, bina +)'], ['email', 'Email'], ['phone', 'Phone'], ['address', 'Address'], ['cloudName', 'Cloudinary cloud name'], ['uploadPreset', 'Cloudinary upload preset (Unsigned)']];
  const TRIM = ['cloudName', 'uploadPreset', 'whatsapp'];
  return (<div className="card p-4 grid sm:grid-cols-2 gap-3">
    {F.map(([f, l]) => (
      <label key={f} className="text-xs text-slate-400">{l}
        <input className="inp mt-1" value={s[f] ?? ''} onChange={(e) => { const v = e.target.value; set((d) => { d.settings[f] = TRIM.includes(f) ? v.trim() : v; }); }} /></label>))}
    <div className="sm:col-span-2"><ImageField label="Home page background image (optional, dark image behtar hai)" value={s.heroImage} settings={s} onChange={(v) => set((d) => { d.settings.heroImage = v; })} /></div>
    <label className="text-xs text-slate-400 sm:col-span-2">Live ticker: har line me SYMBOL|Label (Yahoo Finance symbols). Box se bahar click karne par apply hoga.
      <textarea rows="10" className="inp mt-1" value={tk} onChange={(e) => setTk(e.target.value)}
        onBlur={() => set((d) => { d.settings.ticker = tk.split('\n').filter((l) => l.includes('|')).map((l) => { const [a, ...b] = l.split('|'); return { s: a.trim(), n: b.join('|').trim() }; }); })} /></label>
    <p className="text-xs text-slate-400 sm:col-span-2">Admin password badalna ho to Netlify me Project configuration, Environment variables, <b>ADMIN_PASSWORD</b> badlein aur site dobara deploy karein.</p></div>);
}

export default function Admin() {
  const [ok, setOk] = useState(!!(sessionStorage.tm_pw || (DEV && sessionStorage.tm_auth))), [pw, setPw] = useState(''), [err, setErr] = useState('');
  const [D, setD] = useState(loadDraft);
  const [tab, setTab] = useState('articles'), [busy, setBusy] = useState(false), [msg, setMsg] = useState(null);
  const [dirty, setDirty] = useState(() => !!localStorage.tm_draft && !localStorage.tm_clean);
  useEffect(() => { if (dirty) localStorage.tm_draft = JSON.stringify(D); }, [D, dirty]);
  useEffect(() => { document.title = 'Admin'; }, []);
  const set = (fn) => { setD((d) => { const n = structuredClone(d); fn(n); return n; }); setDirty(true); localStorage.removeItem('tm_clean'); };
  const logout = () => { sessionStorage.removeItem('tm_pw'); sessionStorage.removeItem('tm_auth'); setOk(false); };

  const login = async () => {
    setErr('');
    try {
      if (DEV) {
        const h = C.settings.adminHash;
        if (h && (await sha(pw)) !== h) return setErr('Galat password.');
        sessionStorage.tm_auth = '1';
      } else {
        const r = await fetch('/api/save-content', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'check', password: pw }) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return setErr(j.error || 'Login fail ho gaya. Netlify me save-content function aur environment variables check karein.');
        sessionStorage.tm_pw = pw;
      }
      setOk(true);
    } catch { setErr('Server se connect nahi ho paya.'); }
  };

  const save = async () => {
    setBusy(true); setMsg(null);
    try {
      if (DEV) {
        const r = await fetch('/__save', { method: 'POST', body: JSON.stringify(D, null, 1) });
        if ((await r.text()) !== 'ok') throw new Error('Local save fail ho gaya.');
        localStorage.removeItem('tm_draft'); localStorage.removeItem('tm_clean'); setDirty(false);
        setMsg({ t: 'ok', s: 'Saved: src/data/content.json update ho gayi (local).' });
      } else {
        const r = await fetch('/api/save-content', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: sessionStorage.tm_pw, content: D }) });
        const j = await r.json().catch(() => ({}));
        if (r.status === 401) { logout(); return; }
        if (!r.ok) throw new Error(j.error || 'Save fail ho gaya.');
        localStorage.tm_clean = String(Date.now()); setDirty(false);
        setMsg({ t: 'ok', s: 'Saved! Website 1 se 2 minute me apne aap update ho jayegi (Netlify deploy chal raha hai).' });
      }
    } catch (x) { setMsg({ t: 'err', s: x.message }); } finally { setBusy(false); }
  };
  const reset = () => { if (confirm('Local changes hata kar published content wapas laayein?')) { localStorage.removeItem('tm_draft'); localStorage.removeItem('tm_clean'); setD(withDefaults(structuredClone(C))); setDirty(false); } };

  if (!ok) return (<div className="max-w-sm mx-auto mt-24 card p-6 space-y-3"><h1 className="text-xl font-bold">Admin login</h1>
    <input type="password" className="inp" placeholder="Password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && login()} />
    <button className="btn w-full" onClick={login}>Log in</button>{err && <p className="dn text-sm">{err}</p>}<Link to="/" className="text-sm text-gold">← Website</Link></div>);

  return (<div className="max-w-5xl mx-auto px-4 py-6">
    <div className="flex flex-wrap items-center gap-2 justify-between"><h1 className="text-xl font-bold">Admin panel {dirty && <span className="text-gold text-sm">● unsaved</span>}</h1>
      <div className="flex flex-wrap gap-2 text-sm"><button className="btn" onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save & Publish'}</button><button className="btn btn2" onClick={reset}>Reset</button>
        <Link className="btn btn2" to="/" target="_blank">Website</Link><button className="btn btn2" onClick={logout}>Logout</button></div></div>
    {msg && <p className={`text-sm mt-3 ${msg.t === 'ok' ? 'up' : 'dn'}`}>{msg.s}</p>}
    <p className="text-xs text-slate-400 mt-2">{DEV ? 'Local mode: Save src/data/content.json me likhta hai.' : 'Save & Publish seedha website ko update karta hai. Koi file download ya upload nahi karni.'}</p>
    <div className="flex flex-wrap gap-2 mt-5">{['articles', ...Object.keys(SCH), 'settings'].map((t) => <button key={t} onClick={() => setTab(t)} className={`btn !py-1 text-sm ${t === tab ? '' : 'btn2'}`}>{t}</button>)}</div>
    <div className="mt-5">{tab === 'articles' ? <ArticleEditor D={D} set={set} /> : tab === 'settings' ? <Settings D={D} set={set} /> : <ListEditor tab={tab} D={D} set={set} />}</div></div>);
}