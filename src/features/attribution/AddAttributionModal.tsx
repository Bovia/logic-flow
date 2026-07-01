import { useState, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { useLogicFlow } from "@/store/LogicFlowContext";
import type { AddAttributionEventForm, EventDirection, EventType } from "@/types";

const EMPTY: AddAttributionEventForm = {
  title: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  priceChange: "",
  type: "宏观",
  direction: "中性",
  relatedTickers: "",
  relatedDecisionIds: [],
  logicValidation: "",
  source: "",
};

export function AddAttributionModal({ onClose }: { onClose: () => void }) {
  const { addEvent, decisions } = useLogicFlow();
  const [form, setForm] = useState(EMPTY);
  const openDecisions = decisions.filter((d) => d.status === "持仓中");

  const toggleDecision = (id: string) => {
    setForm((f) => ({
      ...f,
      relatedDecisionIds: f.relatedDecisionIds.includes(id)
        ? f.relatedDecisionIds.filter((x) => x !== id)
        : [...f.relatedDecisionIds, id],
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addEvent(form);
    onClose();
  };

  return (
    <Modal title="添加归因事件" onClose={onClose}>
      <form className="stack-lg" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>事件标题</label>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>事件描述</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>日期</label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>涨跌幅 %</label>
            <input type="number" step="0.1" value={form.priceChange}
              onChange={(e) => setForm((f) => ({ ...f, priceChange: e.target.value }))} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>事件类型</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as EventType }))}>
              <option value="财报">财报</option>
              <option value="宏观">宏观</option>
              <option value="行业">行业</option>
              <option value="公司">公司</option>
            </select>
          </div>
          <div className="form-group">
            <label>影响方向</label>
            <select value={form.direction} onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value as EventDirection }))}>
              <option value="正面">正面</option>
              <option value="中性">中性</option>
              <option value="负面">负面</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>关联标的（逗号分隔）</label>
          <input value={form.relatedTickers} onChange={(e) => setForm((f) => ({ ...f, relatedTickers: e.target.value }))}
            placeholder="600520, 300750" />
        </div>
        {openDecisions.length > 0 && (
          <div className="form-group">
            <label>关联决策卡</label>
            <div className="stack" style={{ gap: 6 }}>
              {openDecisions.map((d) => (
                <label key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <input type="checkbox" checked={form.relatedDecisionIds.includes(d.id)} onChange={() => toggleDecision(d.id)} />
                  {d.name} ({d.ticker})
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="form-group">
          <label>逻辑验证说明</label>
          <textarea value={form.logicValidation} onChange={(e) => setForm((f) => ({ ...f, logicValidation: e.target.value }))}
            placeholder="这个事件如何验证或推翻了你的逻辑？" />
        </div>
        <div className="form-group">
          <label>信息来源</label>
          <input value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
            placeholder="如：上交所公告、国家统计局" />
        </div>
        <button type="submit" className="btn btn-primary">添加事件</button>
      </form>
    </Modal>
  );
}
