import type { Exchange } from "@/types";

/** 归一化为 6 位 A 股代码 */
export function normalizeTicker(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 6) return digits.padStart(6, "0");
  return digits.slice(0, 6);
}

/** 根据代码推断交易所 */
export function detectExchange(ticker: string): Exchange {
  const code = normalizeTicker(ticker);
  if (code.startsWith("6") || code.startsWith("9")) return "SH";
  return "SZ";
}

/** 东方财富 secid：沪市 1.xxxxxx，深市 0.xxxxxx */
export function toEastMoneySecId(ticker: string, exchange?: Exchange): string {
  const code = normalizeTicker(ticker);
  const ex = exchange ?? detectExchange(code);
  return `${ex === "SH" ? "1" : "0"}.${code}`;
}

export function hasSTFlag(name: string): boolean {
  return /ST/i.test(name);
}
