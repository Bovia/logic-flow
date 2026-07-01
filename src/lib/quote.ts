import { detectExchange, hasSTFlag, normalizeTicker, toEastMoneySecId } from "@/lib/ticker";
import type { Exchange } from "@/types";

export interface StockQuote {
  ticker: string;
  name: string;
  exchange: Exchange;
  price: number;
  prevClose: number;
  changePercent: number;
  sector: string;
  hasST: boolean;
  fetchedAt: number;
}

interface EastMoneyResponse {
  rc: number;
  data?: {
    f57?: string;
    f58?: string;
    f43?: number;
    f60?: number;
    f170?: number;
    f127?: string;
  };
}

const cache = new Map<string, { quote: StockQuote; expires: number }>();
const CACHE_MS = 60_000;

function quoteUrl(secid: string): string {
  const fields = "f57,f58,f43,f60,f170,f127";
  const qs = `secid=${secid}&fields=${fields}&invt=2&fltt=2`;
  // 开发：Vite 代理；生产：Vercel Serverless api/quote.js
  return `/api/quote?${qs}`;
}

function parseEastMoney(json: EastMoneyResponse, fallbackTicker: string): StockQuote | null {
  if (json.rc !== 0 || !json.data?.f58) return null;
  const d = json.data;
  const ticker = normalizeTicker(d.f57 ?? fallbackTicker);
  const exchange = detectExchange(ticker);
  const price = (d.f43 ?? 0) / 100;
  const prevClose = (d.f60 ?? 0) / 100;
  const name = (d.f58 ?? "").trim();
  if (!name) return null;

  return {
    ticker,
    name,
    exchange,
    price,
    prevClose,
    changePercent: (d.f170 ?? 0) / 100,
    sector: (d.f127 ?? "").trim(),
    hasST: hasSTFlag(name),
    fetchedAt: Date.now(),
  };
}

/** 从东方财富拉取 A 股实时行情（开发模式走 Vite 代理） */
export async function fetchStockQuote(
  ticker: string,
  exchange?: Exchange,
): Promise<StockQuote> {
  const code = normalizeTicker(ticker);
  if (!/^\d{6}$/.test(code)) {
    throw new Error("请输入 6 位 A 股代码");
  }

  const secid = toEastMoneySecId(code, exchange);
  const cached = cache.get(secid);
  if (cached && cached.expires > Date.now()) {
    return cached.quote;
  }

  const res = await fetch(quoteUrl(secid));
  if (!res.ok) throw new Error(`行情请求失败 (${res.status})`);

  const json = (await res.json()) as EastMoneyResponse;
  const quote = parseEastMoney(json, code);
  if (!quote) throw new Error("未找到该股票，请检查代码");

  cache.set(secid, { quote, expires: Date.now() + CACHE_MS });
  return quote;
}

/** 根据入场价计算浮动盈亏 % */
export function calcReturnPercent(entryPrice: number, currentPrice: number): number {
  if (!entryPrice) return 0;
  return ((currentPrice - entryPrice) / entryPrice) * 100;
}
