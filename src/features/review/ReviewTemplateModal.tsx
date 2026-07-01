import { useMemo, useState, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { StatusBadge } from "@/components/StatusBadge";
import { useLogicFlow } from "@/store/LogicFlowContext";
import { getEventsForDecision } from "@/lib/events";
import { DIRECTION_COLOR, EVENT_TYPE_LABEL } from "@/lib/format";
import type { CompleteReviewForm, LogicVerificationResult } from "@/types";

const STEPS = ["选择决策", "关联事件", "逻辑验证", "复盘备注"] as const;

const LOGIC_RESULTS: LogicVerificationResult[] = ["验证", "部分验证", "证伪"];

interface Props {
  onClose: () => void;
}

export function ReviewTemplateModal({ onClose }: Props) {
  const { decisions, closedDecisions, events, saveReview } = useLogicFlow();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CompleteReviewForm>({
    decisionId: "",
    logicResult: "部分验证",
    exitTimingNote: "",
    notes: "",
  });

  const reviewable = useMemo(
    () => [...closedDecisions, ...decisions.filter((d) => d.status === "持仓中")],
    [closedDecisions, decisions],
  );

  const selectedDecision = decisions.find((d) => d.id === form.decisionId);
  const relatedEvents = selectedDecision
    ? getEventsForDecision(selectedDecision, events)
    : [];

  const canNext =
    step === 0 ? !!form.decisionId :
    step === 2 ? true :
    step === 3 ? form.notes.trim().length > 0 :
    true;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.decisionId || !form.notes.trim()) return;
    saveReview(form);
    onClose();
  };

  return (
    <Modal title="复盘模板" onClose={onClose}>
      <div className="review-steps">
        {STEPS.map((label, i) => (
          <div key={label} className={`review-step ${i === step ? "active" : i < step ? "done" : ""}`}>
            <span className="review-step-num">{i + 1}</span>
            <span className="review-step-label">{label}</span>
          </div>
        ))}
      </div>

      <form className="stack-lg" onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
        {step === 0 && (
          <>
            <div className="callout callout-info">
              选择一张决策卡开始结构化复盘。已平仓决策优先展示。
            </div>
            <div className="stack" style={{ gap: 8 }}>
              {reviewable.length === 0 ? (
                <p style={{ color: "var(--text-tertiary)", fontSize: 14 }}>暂无决策卡可复盘</p>
              ) : (
                reviewable.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`review-decision-option ${form.decisionId === d.id ? "selected" : ""}`}
                    onClick={() => setForm((f) => ({ ...f, decisionId: d.id }))}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 600 }}>{d.name} <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>{d.ticker}</span></div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
                          {d.thesis}
                        </div>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {step === 1 && selectedDecision && (
          <>
            <div className="card" style={{ marginBottom: 4 }}>
              <div style={{ fontWeight: 600 }}>{selectedDecision.name}</div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "8px 0 0", lineHeight: 1.5 }}>
                {selectedDecision.thesis}
              </p>
            </div>
            <div className="section-title">自动拉取的关联归因事件 · {relatedEvents.length}</div>
            {relatedEvents.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <p>暂无关联归因事件，可在归因页补充后重新复盘</p>
              </div>
            ) : (
              <div className="stack" style={{ gap: 8 }}>
                {relatedEvents.map((ev) => (
                  <div key={ev.id} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{ev.title}</span>
                      <span style={{ fontSize: 12, color: DIRECTION_COLOR[ev.direction] }}>
                        {ev.priceChange > 0 ? "+" : ""}{ev.priceChange}%
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <span className="pill">{EVENT_TYPE_LABEL[ev.type]}</span>
                      <span className="pill">{ev.date}</span>
                    </div>
                    {ev.logicValidation && (
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "8px 0 0", lineHeight: 1.5 }}>
                        {ev.logicValidation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div className="section-title">原始逻辑是否被验证？</div>
            <div className="logic-result-group">
              {LOGIC_RESULTS.map((r) => (
                <label key={r} className={`logic-result-option ${form.logicResult === r ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="logicResult"
                    value={r}
                    checked={form.logicResult === r}
                    onChange={() => setForm((f) => ({ ...f, logicResult: r }))}
                  />
                  {r}
                </label>
              ))}
            </div>
            <div className="form-group">
              <label>退出时机评估（可选）</label>
              <textarea
                value={form.exitTimingNote}
                onChange={(e) => setForm((f) => ({ ...f, exitTimingNote: e.target.value }))}
                placeholder="退出时机是否合理？偏早/偏晚/合适？"
                rows={3}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {selectedDecision && (
              <div className="callout callout-info">
                复盘对象：{selectedDecision.name} · 逻辑验证结论：<strong>{form.logicResult}</strong>
              </div>
            )}
            <div className="form-group">
              <label>复盘备注（必填）</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="这次决策的核心收获、认知偏差、下次如何改进…"
                rows={5}
                required
              />
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {step > 0 && (
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
              onClick={() => setStep((s) => s - 1)}>
              上一步
            </button>
          )}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" style={{ flex: 1 }}
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}>
              下一步
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={!canNext}>
              保存复盘
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
