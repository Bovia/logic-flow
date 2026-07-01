import { useState, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { useLogicFlow } from "@/store/LogicFlowContext";
import { fetchStockQuote } from "@/lib/quote";
import { normalizeTicker } from "@/lib/ticker";
import type { CreateDecisionCardForm } from "@/types";

const EMPTY: CreateDecisionCardForm = {
  ticker: "",
  name: "",
  exchange: "SH",
  sector: "",
  hasST: false,
  thesis: "",
  targetPrice: "",
  stopLossPrice: "",
  entryPrice: "",
  confidence: 60,
  stopLossCondition: "",
  relatedChainId: null,
};

interface Props {
  onClose: () => void;
}

export function CreateDecisionModal({ onClose }: Props) {
  const { createDecision, chains } = useLogicFlow();
  const [form, setForm] = useState<CreateDecisionCardForm>(EMPTY);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteHint, setQuoteHint] = useState<string | null>(null);

  const set = <K extends keyof CreateDecisionCardForm>(key: K, value: CreateDecisionCardForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const pullQuote = async () => {
    const code = normalizeTicker(form.ticker);
    if (!/^\d{6}$/.test(code)) {
      setQuoteError("请先输入 6 位 A 股代码");
      return;
    }
    setQuoteLoading(true);
    setQuoteError(null);
    setQuoteHint(null);
    try {
      const q = await fetchStockQuote(code, form.exchange);
      setForm((f) => ({
        ...f,
        ticker: q.ticker,
        name: q.name,
        exchange: q.exchange,
        sector: q.sector || f.sector,
        hasST: q.hasST,
        entryPrice: q.price > 0 ? String(q.price) : f.entryPrice,
      }));
      const sign = q.changePercent >= 0 ? "+" : "";
      setQuoteHint(
        `已拉取行情：现价 ¥${q.price.toFixed(2)}（${sign}${q.changePercent.toFixed(2)}%）· 来源：东方财富`,
      );
    } catch (err) {
      setQuoteError(err instanceof Error ? err.message : "行情拉取失败");
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.ticker || !form.name || !form.thesis) return;
    createDecision(form);
    onClose();
  };

  return (
    <Modal title="创建决策卡" onClose={onClose}>
      <form className="stack-lg" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>标的代码</label>
            <input
              value={form.ticker}
              onChange={(e) => set("ticker", e.target.value)}
              onBlur={() => {
                if (form.ticker.replace(/\D/g, "").length >= 6) void pullQuote();
              }}
              placeholder="600519"
              required
            />
          </div>
          <div className="form-group">
            <label>股票名称</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="自动拉取或手填" required />
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => void pullQuote()}
          disabled={quoteLoading}
        >
          {quoteLoading ? "拉取中…" : "拉取实时行情"}
        </button>

        {quoteHint && <div className="callout callout-info">{quoteHint}</div>}
        {quoteError && <div className="callout callout-danger">{quoteError}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>交易所</label>
            <select value={form.exchange} onChange={(e) => set("exchange", e.target.value as "SH" | "SZ")}>
              <option value="SH">上交所 SH</option>
              <option value="SZ">深交所 SZ</option>
            </select>
          </div>
          <div className="form-group">
            <label>行业板块</label>
            <input value={form.sector} onChange={(e) => set("sector", e.target.value)} placeholder="自动拉取或手填" />
          </div>
        </div>
        <div className="form-group">
          <label>
            <input type="checkbox" checked={form.hasST} onChange={(e) => set("hasST", e.target.checked)} style={{ marginRight: 8 }} />
            含 ST 标签（高风险）
          </label>
        </div>
        <div className="form-group">
          <label>决策推理</label>
          <textarea value={form.thesis} onChange={(e) => set("thesis", e.target.value)} placeholder="写下你的投资逻辑…" required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>目标价 ¥</label>
            <input type="number" step="0.01" value={form.targetPrice} onChange={(e) => set("targetPrice", e.target.value)} required />
          </div>
          <div className="form-group">
            <label>止损价 ¥</label>
            <input type="number" step="0.01" value={form.stopLossPrice} onChange={(e) => set("stopLossPrice", e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label>入场价 ¥</label>
          <input type="number" step="0.01" value={form.entryPrice} onChange={(e) => set("entryPrice", e.target.value)} required />
        </div>
        <div className="form-group">
          <label>止损条件（非价格，可选）</label>
          <textarea value={form.stopLossCondition} onChange={(e) => set("stopLossCondition", e.target.value)}
            placeholder="如：季报营收低于 X 亿则逻辑失效" />
        </div>
        <div className="form-group">
          <label>逻辑置信度：{form.confidence}%</label>
          <input type="range" min={0} max={100} value={form.confidence}
            onChange={(e) => set("confidence", Number(e.target.value))} style={{ width: "100%" }} />
        </div>
        {chains.length > 0 && (
          <div className="form-group">
            <label>关联产业链</label>
            <select value={form.relatedChainId ?? ""} onChange={(e) => set("relatedChainId", e.target.value || null)}>
              <option value="">不关联</option>
              {chains.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
        <button type="submit" className="btn btn-primary">创建决策卡</button>
      </form>
    </Modal>
  );
}
