import type { DecisionCard } from "@/types";
import { formatPrice, formatReturn } from "@/lib/format";
import { calcReturnPercent } from "@/lib/quote";
import { useLiveQuote } from "@/hooks/useLiveQuote";
import { StatusBadge } from "@/components/StatusBadge";

interface Props {
  card: DecisionCard;
  onClick: () => void;
}

function LivePriceLine({ card }: { card: DecisionCard }) {
  const { quote, loading, error } = useLiveQuote(
    card.ticker,
    card.exchange,
    card.status === "持仓中",
  );

  if (loading) {
    return <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>现价加载中…</span>;
  }
  if (error || !quote) return null;

  const ret = calcReturnPercent(card.entryPrice, quote.price);
  return (
    <>
      <span>现价 {formatPrice(quote.price)}</span>
      <span className={ret >= 0 ? "return-positive" : "return-negative"}>
        浮盈 {formatReturn(ret)}
      </span>
    </>
  );
}

export function DecisionCardItem({ card, onClick }: Props) {
  return (
    <div className="card clickable" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>
            {card.name}
            <span style={{ color: "var(--text-tertiary)", fontWeight: 400, marginLeft: 6, fontSize: 13 }}>
              {card.fullCode}
            </span>
            {card.hasST && (
              <span style={{ color: "var(--warning)", marginLeft: 6, fontSize: 12 }}>ST</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>{card.sector}</div>
        </div>
        <StatusBadge status={card.status} />
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "10px 0", lineHeight: 1.5,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {card.thesis}
      </p>
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-secondary)", flexWrap: "wrap" }}>
        <span>目标 {formatPrice(card.targetPrice)}</span>
        <span>止损 {formatPrice(card.stopLossPrice)}</span>
        <span>置信度 {card.confidence}%</span>
        {card.status === "持仓中" && <LivePriceLine card={card} />}
      </div>
    </div>
  );
}

export function ClosedDecisionItem({ card }: { card: DecisionCard }) {
  const ret = card.actualReturn;
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>
          {card.name}
          <span style={{ color: "var(--text-tertiary)", fontWeight: 400, marginLeft: 6, fontSize: 12 }}>
            {card.ticker}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {ret != null && (
            <span className={ret >= 0 ? "return-positive" : "return-negative"}>
              {ret >= 0 ? "+" : ""}{ret.toFixed(1)}%
            </span>
          )}
          <StatusBadge status={card.status} />
        </div>
      </div>
      {card.thesisFailReason && (
        <p style={{ fontSize: 12, color: "var(--purple)", margin: "8px 0 0", lineHeight: 1.5 }}>
          {card.thesisFailReason}
        </p>
      )}
    </div>
  );
}
