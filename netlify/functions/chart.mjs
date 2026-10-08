// Chart data (open/high/low/close) from Yahoo Finance public endpoint.
const MAP = { '1d': '5m', '5d': '15m', '1mo': '1d', '1y': '1d' };
const UA = { headers: { 'User-Agent': 'Mozilla/5.0' } };
const url = (s, i, r) => `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?interval=${i}&range=${r}`;

// Previous session close from daily candles.
async function prevClose(symbol) {
  const res = (await (await fetch(url(symbol, '1d', '5d'), UA)).json()).chart.result[0];
  const m = res.meta, off = m.gmtoffset || 0;
  const ts = res.timestamp || [], cl = res.indicators.quote[0].close || [];
  const bars = [];
  ts.forEach((t, i) => { if (cl[i] != null) bars.push({ d: Math.floor((t + off) / 86400), c: cl[i] }); });
  const today = Math.floor(((m.regularMarketTime || ts[ts.length - 1]) + off) / 86400);
  const last = bars[bars.length - 1];
  const prev = last && last.d === today ? bars[bars.length - 2] : last;
  return prev?.c ?? m.chartPreviousClose ?? m.previousClose;
}

export async function handler(e) {
  const q = e.queryStringParameters || {};
  const symbol = /^[\^A-Za-z0-9=.\-]+$/.test(q.symbol || '') ? q.symbol : '^NSEI';
  const range = MAP[q.range] ? q.range : '1d';
  const headers = { 'content-type': 'application/json', 'cache-control': 'public, max-age=30' };
  try {
    const [r, pc] = await Promise.all([
      fetch(url(symbol, MAP[range], range), UA).then((x) => x.json()),
      range === '1d' ? prevClose(symbol).catch(() => null) : Promise.resolve(null),
    ]);
    const res = r.chart.result[0];
    const ts = res.timestamp || [];
    const k = res.indicators.quote[0];
    const points = [];
    ts.forEach((t, i) => {
      const c = k.close?.[i];
      if (c == null) return;
      const o = k.open?.[i] ?? c, h = k.high?.[i] ?? Math.max(o, c), l = k.low?.[i] ?? Math.min(o, c);
      points.push({ t: t * 1000, o, h, l, c });
    });
    const base = range === '1d' ? (pc ?? res.meta.chartPreviousClose ?? points[0]?.o) : points[0]?.o;
    return { statusCode: 200, headers, body: JSON.stringify({ symbol, range, base, points }) };
  } catch {
    return { statusCode: 200, headers, body: JSON.stringify({ symbol, range, points: [] }) };
  }
}