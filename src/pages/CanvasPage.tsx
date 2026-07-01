import { useEffect, useState } from "react";
import { Fab } from "@/components/Fab";
import { useLogicFlow } from "@/store/LogicFlowContext";
import { DecisionCardItem, ClosedDecisionItem } from "@/features/decision/DecisionCardItem";
import { CreateDecisionModal } from "@/features/decision/CreateDecisionModal";
import { DecisionDetailModal } from "@/features/decision/DecisionDetailModal";

export function CanvasPage() {
  const { activeDecisions, closedDecisions, searchQuery, setSearchQuery, pendingDecisionId, clearPendingDecision } = useLogicFlow();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (pendingDecisionId) {
      setSelectedId(pendingDecisionId);
      clearPendingDecision();
    }
  }, [pendingDecisionId, clearPendingDecision]);

  return (
    <>
      <div className="search-bar">
        <span style={{ color: "var(--text-tertiary)" }}>⌕</span>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索活跃决策（名称、代码、逻辑）"
        />
      </div>

      <p className="section-title">活跃决策 · {activeDecisions.length}</p>
      {activeDecisions.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 32 }}>◫</div>
          <p>{searchQuery ? "没有匹配的决策卡" : "暂无持仓，点击 + 创建决策"}</p>
        </div>
      ) : (
        <div className="stack">
          {activeDecisions.map((card) => (
            <DecisionCardItem key={card.id} card={card} onClick={() => setSelectedId(card.id)} />
          ))}
        </div>
      )}

      {closedDecisions.length > 0 && (
        <>
          <p className="section-title" style={{ marginTop: 24 }}>历史决策 · {closedDecisions.length}</p>
          <div className="stack">
            {closedDecisions.slice(0, 5).map((card) => (
              <div key={card.id} onClick={() => setSelectedId(card.id)} style={{ cursor: "pointer" }}>
                <ClosedDecisionItem card={card} />
              </div>
            ))}
          </div>
        </>
      )}

      <Fab onClick={() => setShowCreate(true)} label="创建决策卡" />
      {showCreate && <CreateDecisionModal onClose={() => setShowCreate(false)} />}
      {selectedId && (
        <DecisionDetailModal
          cardId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
