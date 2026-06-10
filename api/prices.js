const STOCKS = ['00919', '00631L'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const date = getTWSEDate();
    const results = {};

    for (const code of STOCKS) {
      const price = await fetchPrice(code, date);
      if (price) results[code] = price;
    }

    res.status(200).json({
      date,
      prices: results,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

function getTWSEDate() {
  const now = new Date();
  const tw = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const y = tw.getUTCFullYear();
  const m = String(tw.getUTCMonth() + 1).padStart(2, '0');
  const d = String(tw.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

async function fetchPrice(stockCode, date) {
  const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${date}&stockNo=${stockCode}`;
  const resp = await fetch(url);
  const data = await resp.json();

  if (!data.data || data.data.length === 0) return null;

  const last = data.data[data.data.length - 1];
  const closePrice = parseFloat(last[6].replace(/,/g, ''));
  const change = last[9] || '0';

  return {
    code: stockCode,
    close: closePrice,
    change: change.replace(/,/g, ''),
    date: last[0]
  };
}
