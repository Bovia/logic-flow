import { useLogicFlow } from "@/store/LogicFlowContext";
import type { ReviewRecord } from "@/types";

const RESULT_COLOR: Record<ReviewRecord["logicResult"], string> = {
  验证: "var(--success)",
  部分验证: "var(--warning)",
  证伪: "var(--danger)",
};

export function ReviewRecordItem({ review }: { review: ReviewRecord }) {
  const { decisions } = useLogicFlow();
  const decision = decisions.find((d) => d.id === review.decisionId);

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            {decision?.name ?? "未知决策"}
            <span style={{ color: "var(--text-tertiary)", fontWeight: 400, marginLeft: 6, fontSize: 12 }}>
              {decision?.ticker}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>
            {new Date(review.createdAt).toLocaleDateString("zh-CN")}
          </div>
        </div>
        <span className="badge" style={{
          background: `${RESULT_COLOR[review.logicResult]}22`,
          color: RESULT_COLOR[review.logicResult],
          border: `1px solid ${RESULT_COLOR[review.logicResult]}44`,
        }}>
          {review.logicResult}
        </span>
      </div>
      {review.exitTimingNote && (
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "10px 0 0" }}>
          退出时机：{review.exitTimingNote}
        </p>
      )}
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "8px 0 0", lineHeight: 1.5 }}>
        {review.notes}
      </p>
    </div>
  );
}
