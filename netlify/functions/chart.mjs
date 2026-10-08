// Chart data (open/high/low/close) from Yahoo Finance public endpoint.
const MAP = { '1d': '5m', '5d': '15m', '1mo': '1d', '1y': '1d' };

export async function handler(e) {
  const q = e.queryStringParameters || {};
  const symbol = /^[\^A-Za-z0-9=.\-]+$/.test(q.symbol || '') ? q.symbol : '^NSEI';
  const range = MAP[q.range] ? q.range : '1d';
  const headers = { 'content-type': 'application/json', 'cache-control': 'public, max-age=30' };
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${MAP[range]}&range=${range}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const res = (await r.json()).chart.result[0];
    const ts = res.timestamp || [];
    const k = res.indicators.quote[0];
    const points = [];
    ts.forEach((t, i) => {
      const c = k.close?.[i];
      if (c == null) return;
      const o = k.open?.[i] ?? c, h = k.high?.[i] ?? Math.max(o, c), l = k.low?.[i] ?? Math.min(o, c);
      points.push({ t: t * 1000, o, h, l, c });
    });
    const base = range === '1d' ? (res.meta.chartPreviousClose ?? res.meta.previousClose ?? points[0]?.o) : points[0]?.o;
    return { statusCode: 200, headers, body: JSON.stringify({ symbol, range, base, points }) };
  } catch {
    return { statusCode: 200, headers, body: JSON.stringify({ symbol, range, points: [] }) };
  }
}