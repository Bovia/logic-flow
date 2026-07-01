import { useMemo, useState } from "react";
import { Fab } from "@/components/Fab";
import { useLogicFlow } from "@/store/LogicFlowContext";
import { AddAttributionModal } from "@/features/attribution/AddAttributionModal";
import { AttributionEventItem } from "@/features/attribution/AttributionEventItem";
import { formatMonth } from "@/lib/format";
import type { AttributionEvent } from "@/types";

export function AttributionPage() {
  const { events, viewMode, setViewMode } = useLogicFlow();
  const [showAdd, setShowAdd] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, AttributionEvent[]>();
    for (const event of events) {
      const month = event.date.slice(0, 7);
      if (!map.has(month)) map.set(month, []);
      map.get(month)!.push(event);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [events]);

  const showValidationInline = viewMode === "analyze";

  return (
    <>
      <div className="mode-toggle">
        <button type="button" className={viewMode === "execute" ? "active" : ""} onClick={() => setViewMode("execute")}>
          执行模式
        </button>
        <button type="button" className={viewMode === "analyze" ? "active" : ""} onClick={() => setViewMode("analyze")}>
          分析模式
        </button>
      </div>

      <div className="callout callout-info" style={{ marginBottom: 16 }}>
        点击事件展开详情，可查看关联决策卡并跳转。
        {viewMode === "analyze" && " 分析模式展开后显示逻辑验证说明。"}
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 32 }}>◎</div>
          <p>暂无归因事件，点击 + 添加</p>
        </div>
      ) : (
        grouped.map(([month, monthEvents]) => (
          <div key={month}>
            <div className="timeline-month">{formatMonth(month + "-01")}</div>
            {monthEvents.map((event) => (
              <AttributionEventItem
                key={event.id}
                event={event}
                showValidationInline={showValidationInline}
              />
            ))}
          </div>
        ))
      )}

      <Fab onClick={() => setShowAdd(true)} label="添加归因事件" />
      {showAdd && <AddAttributionModal onClose={() => setShowAdd(false)} />}
    </>
  );
}
