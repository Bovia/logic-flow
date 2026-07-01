import { useState } from "react";
import { Fab } from "@/components/Fab";
import { useLogicFlow } from "@/store/LogicFlowContext";
import { CreateChainModal } from "@/features/chain/CreateChainModal";
import { ChainDetailModal } from "@/features/chain/ChainDetailModal";

export function ChainPage() {
  const { chains } = useLogicFlow();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      {chains.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 32 }}>⬡</div>
          <p>暂无产业链，点击 + 创建</p>
        </div>
      ) : (
        <div className="stack">
          {chains.map((chain) => (
            <div
              key={chain.id}
              className="card clickable"
              onClick={() => setSelectedId(chain.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelectedId(chain.id)}
            >
              <div style={{ fontWeight: 600, fontSize: 15 }}>{chain.name}</div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  margin: "8px 0",
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {chain.description}
              </p>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                {chain.nodes.length} 个节点
              </div>
            </div>
          ))}
        </div>
      )}

      <Fab onClick={() => setShowCreate(true)} label="创建产业链" />
      {showCreate && <CreateChainModal onClose={() => setShowCreate(false)} />}
      {selectedId && (
        <ChainDetailModal chainId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
