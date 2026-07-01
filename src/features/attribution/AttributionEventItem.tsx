import { useState } from "react";
import { useLogicFlow } from "@/store/LogicFlowContext";
import { DIRECTION_COLOR, EVENT_TYPE_LABEL } from "@/lib/format";
import type { AttributionEvent } from "@/types";

interface Props {
  event: AttributionEvent;
  showValidationInline: boolean;
}

export function AttributionEventItem({ event, showValidationInline }: Props) {
  const { decisions, navigateToDecision } = useLogicFlow();
  const [expanded, setExpanded] = useState(false);

  const relatedDecisions = decisions.filter(
    (d) =>
      event.relatedDecisionIds?.includes(d.id) ||
      event.relatedTickers.includes(d.ticker),
  );

  return (
    <div className={`timeline-item event-item ${expanded ? "expanded" : ""}`}>
      <button
        type="button"
        className="event-item-header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{event.title}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: DIRECTION_COLOR[event.direction], flexShrink: 0 }}>
              {event.priceChange > 0 ? "+" : ""}{event.priceChange}%
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <span className="pill">{EVENT_TYPE_LABEL[event.type]}</span>
            <span className="pill" style={{ color: DIRECTION_COLOR[event.direction] }}>{event.direction}</span>
            <span className="pill">{event.date}</span>
          </div>
        </div>
        <span className="event-chevron" aria-hidden>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="event-item-body">
          {event.description && (
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 10px", lineHeight: 1.6 }}>
              {event.description}
            </p>
          )}

          {(showValidationInline || event.logicValidation) && event.logicValidation && (
            <div className="event-validation-block">
              <div className="section-title" style={{ marginBottom: 6 }}>逻辑验证</div>
              {event.logicValidation}
            </div>
          )}

          {event.relatedTickers.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div className="section-title" style={{ marginBottom: 6 }}>关联标的</div>
              <div className="ticker-pills">
                {event.relatedTickers.map((t) => (
                  <span key={t} className="pill">{t}</span>
                ))}
              </div>
            </div>
          )}

          {relatedDecisions.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div className="section-title" style={{ marginBottom: 6 }}>关联决策卡</div>
              <div className="stack" style={{ gap: 6 }}>
                {relatedDecisions.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="linked-decision-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToDecision(d.id);
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{d.name}</span>
                    <span style={{ color: "var(--text-tertiary)", marginLeft: 6, fontSize: 12 }}>{d.fullCode}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--accent)" }}>查看 →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {event.source && (
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 12 }}>
              来源：{event.source}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
