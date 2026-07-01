/** Vercel Serverless — 代理东方财富行情（生产环境替代 Vite dev proxy） */
export default async function handler(req, res) {
  const qs = req.url?.includes("?") ? req.url.split("?")[1] : "";
  try {
    const upstream = await fetch(
      `https://push2.eastmoney.com/api/qt/stock/get?${qs}`,
      {
        headers: {
          Referer: "https://quote.eastmoney.com/",
          "User-Agent": "Mozilla/5.0",
        },
      },
    );
    const data = await upstream.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json(data);
  } catch {
    res.status(502).json({ rc: -1, msg: "quote proxy error" });
  }
}
