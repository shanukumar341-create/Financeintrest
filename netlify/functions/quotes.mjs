// Live quote engine: public Yahoo Finance chart endpoint. No key, no database.
export async function handler(e) {
  const syms = (e.queryStringParameters?.symbols || '').split(',').filter(Boolean).slice(0, 20);
  const get = async (s) => {
    try {
      const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?interval=1d&range=1d`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const m = (await r.json()).chart.result[0].meta;
      const p = m.regularMarketPrice, pc = m.chartPreviousClose ?? m.previousClose;
      return { symbol: s, price: p, change: p - pc, pct: ((p - pc) / pc) * 100 };
    } catch { return { symbol: s, error: 1 }; }
  };
  const data = await Promise.all(syms.map(get));
  return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=20' }, body: JSON.stringify(data) };
}
