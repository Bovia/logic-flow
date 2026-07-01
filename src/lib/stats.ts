import type { ArchiveStats, AttributionEvent, DecisionCard } from "@/types";

export function computeArchiveStats(
  decisions: DecisionCard[],
  events: AttributionEvent[],
): ArchiveStats {
  const closed = decisions.filter((d) => d.status !== "持仓中");
  const open = decisions.filter((d) => d.status === "持仓中");
  const thesisFail = closed.filter((d) => d.status === "逻辑失效");
  const profitable = closed.filter((d) => (d.actualReturn ?? 0) > 0);

  const decisionsWithAttribution = closed.filter((d) =>
    events.some(
      (e) =>
        e.relatedDecisionIds?.includes(d.id) ||
        e.relatedTickers.includes(d.ticker),
    ),
  );

  const verified = decisionsWithAttribution.filter((d) =>
    events.some(
      (e) =>
        (e.relatedDecisionIds?.includes(d.id) ||
          e.relatedTickers.includes(d.ticker)) &&
        e.direction === "正面",
    ),
  );

  const allConfidence = decisions.map((d) => d.confidence);
  const logicConfidence =
    allConfidence.length > 0
      ? Math.round(
          allConfidence.reduce((a, b) => a + b, 0) / allConfidence.length,
        )
      : 0;

  return {
    logicWinRate:
      decisionsWithAttribution.length > 0
        ? Math.round((verified.length / decisionsWithAttribution.length) * 100)
        : 0,
    profitWinRate:
      closed.length > 0
        ? Math.round((profitable.length / closed.length) * 100)
        : 0,
    totalTrades: closed.length,
    logicConfidence,
    openPositions: open.length,
    thesisFailCount: thesisFail.length,
  };
}
