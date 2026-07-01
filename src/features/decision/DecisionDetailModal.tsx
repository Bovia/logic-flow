import { useState, useEffect, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { StatusBadge } from "@/components/StatusBadge";
import { useLogicFlow } from "@/store/LogicFlowContext";
import { useLiveQuote } from "@/hooks/useLiveQuote";
import { formatPrice, formatReturn } from "@/lib/format";
import { calcReturnPercent, fetchStockQuote } from "@/lib/quote";
import type { CloseDecisionForm } from "@/types";

interface Props {
  cardId: string;
  onClose: () => void;
}

export function DecisionDetailModal({ cardId, onClose }: Props) {
  const { decisions, closeDecision, updateConfidence } = useLogicFlow();
  const card = decisions.find((d) => d.id === cardId);

  const [closeForm, setCloseForm] = useState<CloseDecisionForm>({
    status: "止盈平仓",
    thesisFailReason: "",
    actualReturn: "",
  });
  const [showClose, setShowClose] = useState(false);
  const [confValue, setConfValue] = useState(60);
  const [confNote, setConfNote] = useState("");
  const [showConfUpdate, setShowConfUpdate] = useState(false);
  const [closeQuoteHint, setCloseQuoteHint] = useState<string | null>(null);

  const isOpenPosition = card?.status === "持仓中";
  const liveQuote = useLiveQuote(card?.ticker ?? "", card?.exchange ?? "SH", !!isOpenPosition);

  useEffect(() => {
    if (card) setConfValue(card.confidence);
  }, [card?.confidence]);

  useEffect(() => {
    if (!showClose || !card) return;
    setCloseQuoteHint(null);
    fetchStockQuote(card.ticker, card.exchange)
      .then((q) => {
        const ret = calcReturnPercent(card.entryPrice, q.price);
        setCloseForm((f) => ({ ...f, actualReturn: ret.toFixed(1) }));
        setCloseQuoteHint(`已按现价 ¥${q.price.toFixed(2)} 估算浮盈 ${formatReturn(ret)}，可手动修改`);
      })
      .catch(() => setCloseQuoteHint("行情暂不可用，请手动填写涨跌幅"));
  }, [showClose, card?.id, card?.ticker, card?.exchange, card?.entryPrice]);

  if (!card) return null;

  const isOpen = card.status === "持仓中";

  const handleClose = (e: FormEvent) => {
    e.preventDefault();
    if (closeForm.status === "逻辑失效" && !closeForm.thesisFailReason.trim()) return;
    closeDecision(card.id, closeForm);
    onClose();
  };

  const handleConfUpdate = (e: FormEvent) => {
    e.preventDefault();
    updateConfidence(card.id, confValue, confNote);
    setShowConfUpdate(false);
    setConfNote("");
  };

  return (
    <Modal title={`${card.name} · 决策详情`} onClose={onClose}>
      <div className="stack-lg">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{card.fullCode}</div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{card.sector}</div>
          </div>
          <StatusBadge status={card.status} />
        </div>

        {card.hasST && (
          <div className="callout callout-warning">
            高风险警告：该标的含 ST 标签，波动性和退市风险较高。
          </div>
        )}

        <div>
          <div className="section-title">决策推理</div>
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: "var(--text-secondary)" }}>{card.thesis}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { label: "入场价", value: formatPrice(card.entryPrice) },
            { label: "目标价", value: formatPrice(card.targetPrice) },
            { label: "止损价", value: formatPrice(card.stopLossPrice) },
          ].map((item) => (
            <div key={item.label} className="stat-card">
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{item.label}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {isOpen && liveQuote.quote && (
          <div className="callout callout-info">
            现价 {formatPrice(liveQuote.quote.price)} · 今日 {formatReturn(liveQuote.quote.changePercent)} ·
            浮盈 {formatReturn(calcReturnPercent(card.entryPrice, liveQuote.quote.price))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>逻辑置信度 <strong>{card.confidence}%</strong></span>
          {isOpen && (
            <button type="button" className="btn btn-secondary" onClick={() => setShowConfUpdate(!showConfUpdate)}>
              更新置信度
            </button>
          )}
        </div>

        {showConfUpdate && isOpen && (
          <form className="stack" onSubmit={handleConfUpdate}>
            <div className="form-group">
              <label>新置信度：{confValue}%</label>
              <input type="range" min={0} max={100} value={confValue} onChange={(e) => setConfValue(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>调整原因</label>
              <input value={confNote} onChange={(e) => setConfNote(e.target.value)} placeholder="如：订单公告后上调" />
            </div>
            <button type="submit" className="btn btn-primary">保存</button>
          </form>
        )}

        {card.confidenceLog && card.confidenceLog.length > 0 && (
          <div>
            <div className="section-title">置信度历史</div>
            <div className="stack">
              {card.confidenceLog.map((entry, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {entry.date} · {entry.value}% — {entry.note}
                </div>
              ))}
            </div>
          </div>
        )}

        {card.stopLossCondition && (
          <div>
            <div className="section-title">止损条件</div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{card.stopLossCondition}</p>
          </div>
        )}

        {!isOpen && card.thesisFailReason && (
          <div className="callout callout-danger">
            <strong>逻辑失效原因</strong>
            <p style={{ margin: "6px 0 0" }}>{card.thesisFailReason}</p>
          </div>
        )}

        {!isOpen && card.actualReturn != null && (
          <div style={{ textAlign: "center", fontSize: 20, fontWeight: 700 }}
            className={card.actualReturn >= 0 ? "return-positive" : "return-negative"}>
            实际涨跌 {card.actualReturn >= 0 ? "+" : ""}{card.actualReturn.toFixed(1)}%
          </div>
        )}

        {isOpen && (
          <>
            {!showClose ? (
              <button type="button" className="btn btn-primary" onClick={() => setShowClose(true)}>
                平仓操作
              </button>
            ) : (
              <form className="stack" onSubmit={handleClose}>
                <div className="form-group">
                  <label>平仓状态</label>
                  <select value={closeForm.status}
                    onChange={(e) => setCloseForm((f) => ({ ...f, status: e.target.value as CloseDecisionForm["status"] }))}>
                    <option value="持仓中" disabled>持仓中（当前）</option>
                    <option value="止盈平仓">止盈平仓</option>
                    <option value="止损平仓">止损平仓</option>
                    <option value="逻辑失效">逻辑失效</option>
                  </select>
                </div>
                {closeForm.status === "逻辑失效" && (
                  <div className="form-group">
                    <label>逻辑失效原因（必填）</label>
                    <textarea value={closeForm.thesisFailReason}
                      onChange={(e) => setCloseForm((f) => ({ ...f, thesisFailReason: e.target.value }))}
                      placeholder="原始逻辑是什么？哪个事件/数据证伪了它？" required />
                  </div>
                )}
                <div className="form-group">
                  <label>实际涨跌幅 %</label>
                  <input type="number" step="0.1" value={closeForm.actualReturn}
                    onChange={(e) => setCloseForm((f) => ({ ...f, actualReturn: e.target.value }))}
                    placeholder="如 12.4 或 -3.2" />
                  {closeQuoteHint && (
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{closeQuoteHint}</span>
                  )}
                </div>
                <button type="submit" className="btn btn-primary">确认平仓</button>
              </form>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
