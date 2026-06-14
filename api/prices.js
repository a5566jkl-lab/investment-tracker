export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const stocks = ['00919.TW', '00631L.TW'];
    const results = {};

    for (const symbol of stocks) {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const data = await resp.json();
      const quote = data?.chart?.result?.[0];
      if (!quote) continue;

      const code = symbol.replace('.TW', '');
      const close = quote.indicators?.quote?.[0]?.close?.[0];
      const date = new Date(quote.timestamp?.[0] * 1000).toLocaleDateString('zh-TW');

      if (close) {
        results[code] = { code, close: Math.round(close * 100) / 100, date };
      }
    }

    res.status(200).json({
      prices: results,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
