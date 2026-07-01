import { useState } from "react";
import { useLogicFlow } from "@/store/LogicFlowContext";
import { ClosedDecisionItem } from "@/features/decision/DecisionCardItem";
import { ReviewTemplateModal } from "@/features/review/ReviewTemplateModal";
import { ReviewRecordItem } from "@/features/review/ReviewRecordItem";

function RingChart({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <div className="ring-progress">
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={60} cy={60} r={r} fill="none" stroke="var(--border)" strokeWidth={10} />
        <circle cx={60} cy={60} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
        <text x={60} y={58} textAnchor="middle" fill="var(--text)" fontSize={22} fontWeight={700}
          transform="rotate(90 60 60)">{value}%</text>
        <text x={60} y={74} textAnchor="middle" fill="var(--text-tertiary)" fontSize={10}
          transform="rotate(90 60 60)">{label}</text>
      </svg>
    </div>
  );
}

export function ArchivePage() {
  const { stats, closedDecisions, reviews } = useLogicFlow();
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="stack-lg">
      <button type="button" className="btn btn-primary" onClick={() => setShowReview(true)}>
        开始复盘
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <RingChart value={stats.logicWinRate} label="逻辑胜率" color="var(--accent)" />
        <RingChart value={stats.profitWinRate} label="盈利胜率" color="var(--success)" />
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{stats.totalTrades}</div>
          <div className="label">历史决策总数</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.openPositions}</div>
          <div className="label">当前持仓</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.logicConfidence}%</div>
          <div className="label">平均置信度</div>
        </div>
        <div className="stat-card">
          <div className="value" style={{ color: "var(--purple)" }}>{stats.thesisFailCount}</div>
          <div className="label">逻辑失效次数</div>
        </div>
      </div>

      <div className="callout callout-info">
        逻辑胜率 = 被归因事件验证的决策占比；盈利胜率 = 实际盈利决策占比。两者交叉对比可区分研究能力与运气。
      </div>

      <div>
        <p className="section-title">复盘记录 · {reviews.length}</p>
        {reviews.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <p>暂无复盘，点击「开始复盘」创建第一条</p>
          </div>
        ) : (
          <div className="stack">
            {reviews.map((r) => (
              <ReviewRecordItem key={r.id} review={r} />
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="section-title">历史决策 · {closedDecisions.length}</p>
        {closedDecisions.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <p>暂无已平仓决策</p>
          </div>
        ) : (
          <div className="stack">
            {closedDecisions.map((card) => (
              <ClosedDecisionItem key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>

      {showReview && <ReviewTemplateModal onClose={() => setShowReview(false)} />}
    </div>
  );
}
