// Live quote engine: public Yahoo Finance chart endpoint. No key, no database.
// Previous close is taken from daily candles (more reliable than chartPreviousClose).
export async function handler(e) {
  const syms = (e.queryStringParameters?.symbols || '').split(',').map((x) => x.trim()).filter(Boolean).slice(0, 40);
  const get = async (s) => {
    try {
      const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?interval=1d&range=5d`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const res = (await r.json()).chart.result[0];
      const m = res.meta, off = m.gmtoffset || 0;
      const ts = res.timestamp || [], cl = res.indicators.quote[0].close || [];
      const bars = [];
      ts.forEach((t, i) => { if (cl[i] != null) bars.push({ d: Math.floor((t + off) / 86400), c: cl[i] }); });
      const p = m.regularMarketPrice ?? bars[bars.length - 1]?.c;
      const today = Math.floor(((m.regularMarketTime || ts[ts.length - 1]) + off) / 86400);
      const last = bars[bars.length - 1];
      // If the newest candle is today's session, previous close is the candle before it.
      const prev = last && last.d === today ? bars[bars.length - 2] : last;
      const pc = prev?.c ?? m.chartPreviousClose ?? m.previousClose;
      return { symbol: s, price: p, change: p - pc, pct: ((p - pc) / pc) * 100 };
    } catch { return { symbol: s, error: 1 }; }
  };
  const data = await Promise.all(syms.map(get));
  return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=20' }, body: JSON.stringify(data) };
}