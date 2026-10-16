import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import C from './data/content.json';
import { Card, Grid, Md, Section, biasCls, fmtDate, img, useTitle } from './lib.jsx';
import { plain, viewSlug } from './helpers.js';

export const sortedViews = () =>
  [...(C.views || [])].filter((v) => v.title).sort((a, b) => String(b.date).localeCompare(String(a.date)));

export const ViewCard = ({ v }) => (
  <Link to={`/views/${viewSlug(v)}`} className="block h-full hover:[&>article]:border-gold">
    <Card image={v.image} className="h-full">
      <div>
        <span className={`text-xs px-2 py-1 rounded ${biasCls(v.bias)}`}>{v.bias}</span>
        <span className="text-xs text-slate-400 ml-2">{fmtDate(v.date)}</span>
      </div>
      <h3 className="font-semibold mt-3">{v.title}</h3>
      <p className="text-slate-300 text-sm mt-2 line-clamp-4 flex-1">{plain(v.body)}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm text-gold">Poora view padhein <ArrowRight size={14} /></span>
    </Card>
  </Link>
);

export function ViewsList() {
  useTitle('Market views');
  return (
    <Section title="Market views">
      <Grid items={sortedViews()} render={(v) => <ViewCard key={viewSlug(v)} v={v} />} />
    </Section>
  );
}

export default function ViewDetail() {
  const { slug } = useParams();
  const v = (C.views || []).find((x) => x.title && viewSlug(x) === slug);
  useTitle(v?.title || 'Market view');
  if (!v) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">View nahi mila</h1>
      <Link className="btn mt-6" to="/views">Saare views</Link>
    </div>
  );
  return (
    <article className="max-w-4xl mx-auto px-4 pt-12">
      <Link to="/views" className="inline-flex items-center gap-1 text-sm text-gold"><ArrowLeft size={14} /> Market views</Link>
      <div className="mt-4">
        <span className={`text-xs px-2 py-1 rounded ${biasCls(v.bias)}`}>{v.bias}</span>
        <span className="text-xs text-slate-400 ml-2">{fmtDate(v.date)}</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold mt-3">{v.title}</h1>
      {v.image && <img src={img(v.image, 1400)} alt="" className="rounded-xl border border-line w-full mt-6" />}
      <div className="mt-6"><Md text={v.body} /></div>
      <p className="text-xs text-slate-400 mt-10 border-t border-line pt-4">Yeh view sirf education ke liye hai, investment advice nahi.</p>
    </article>
  );
}