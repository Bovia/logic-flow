import type { DecisionStatus, Exchange } from "@/types";

export function formatFullCode(ticker: string, exchange: Exchange): string {
  return `${ticker}.${exchange}`;
}

export function formatPrice(value: number): string {
  return `¥${value.toFixed(2)}`;
}

export function formatReturn(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatMonth(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  return `${year}年${Number(month)}月`;
}

export function statusBadgeClass(status: DecisionStatus): string {
  switch (status) {
    case "持仓中":
      return "badge badge-active";
    case "止盈平仓":
      return "badge badge-profit";
    case "止损平仓":
      return "badge badge-loss";
    case "逻辑失效":
      return "badge badge-thesis-fail";
  }
}

export const CHAIN_POSITION_LABEL: Record<string, string> = {
  upstream: "上游",
  midstream: "中游",
  downstream: "下游",
};

export const EVENT_TYPE_LABEL: Record<string, string> = {
  财报: "财报",
  宏观: "宏观",
  行业: "行业",
  公司: "公司",
};

export const DIRECTION_COLOR: Record<string, string> = {
  正面: "var(--success)",
  中性: "var(--text-secondary)",
  负面: "var(--danger)",
};

export function parseTickers(input: string): string[] {
  return input
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
