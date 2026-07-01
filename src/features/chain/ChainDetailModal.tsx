import { useState, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { useLogicFlow } from "@/store/LogicFlowContext";
import { CHAIN_POSITION_LABEL } from "@/lib/format";
import type { AddChainNodeForm } from "@/types";

const EMPTY: AddChainNodeForm = {
  name: "",
  position: "midstream",
  relatedTickers: "",
  description: "",
};

interface Props {
  chainId: string;
  onClose: () => void;
}

export function ChainDetailModal({ chainId, onClose }: Props) {
  const { chains, addChainNode } = useLogicFlow();
  const chain = chains.find((c) => c.id === chainId);
  const [showAddNode, setShowAddNode] = useState(false);
  const [form, setForm] = useState(EMPTY);

  if (!chain) return null;

  const positions = ["upstream", "midstream", "downstream"] as const;

  const handleAddNode = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addChainNode(chain.id, form);
    setForm(EMPTY);
    setShowAddNode(false);
  };

  return (
    <Modal title={chain.name} onClose={onClose}>
      <div className="stack-lg">
        {chain.description && (
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{chain.description}</p>
        )}
        {chain.insight && (
          <div className="insight-block">{chain.insight}</div>
        )}

        {positions.map((pos) => {
          const nodes = chain.nodes.filter((n) => n.position === pos);
          if (nodes.length === 0) return null;
          return (
            <div key={pos} className="chain-node-group">
              <h4>{CHAIN_POSITION_LABEL[pos]}</h4>
              {nodes.map((node) => (
                <div key={node.id} className="node-card">
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{node.name}</div>
                  {node.description && (
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "6px 0 0" }}>{node.description}</p>
                  )}
                  {node.relatedTickers.length > 0 && (
                    <div className="ticker-pills">
                      {node.relatedTickers.map((t) => (
                        <span key={t} className="pill">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {chain.nodes.length === 0 && (
          <div className="empty-state" style={{ padding: 24 }}>
            <p>暂无节点，点击下方添加</p>
          </div>
        )}

        {!showAddNode ? (
          <button type="button" className="btn btn-secondary" onClick={() => setShowAddNode(true)}>
            + 添加节点
          </button>
        ) : (
          <form className="stack" onSubmit={handleAddNode}>
            <div className="form-group">
              <label>节点名称</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>产业链位置</label>
              <select value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value as AddChainNodeForm["position"] }))}>
                <option value="upstream">上游</option>
                <option value="midstream">中游</option>
                <option value="downstream">下游</option>
              </select>
            </div>
            <div className="form-group">
              <label>关联标的（逗号分隔）</label>
              <input value={form.relatedTickers} onChange={(e) => setForm((f) => ({ ...f, relatedTickers: e.target.value }))} placeholder="300750, 002594" />
            </div>
            <div className="form-group">
              <label>描述</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary">添加</button>
          </form>
        )}
      </div>
    </Modal>
  );
}
