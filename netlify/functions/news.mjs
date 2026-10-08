// Live headlines from Google News RSS (public).
export async function handler() {
  try {
    const r = await fetch('https://news.google.com/rss/search?q=Indian+stock+market+Nifty+when:2d&hl=en-IN&gl=IN&ceid=IN:en');
    const x = await r.text();
    const clean = (t) => t.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
    const items = [...x.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 12).map((m) => {
      const g = (t) => (m[1].match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [, ''])[1];
      return { title: clean(g('title')), url: clean(g('link')), date: clean(g('pubDate')), source: clean(g('source')) };
    });
    return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' }, body: JSON.stringify(items) };
  } catch { return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: '[]' }; }
}
