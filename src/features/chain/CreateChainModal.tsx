import { useState, type FormEvent } from "react";
import { Modal } from "@/components/Modal";
import { useLogicFlow } from "@/store/LogicFlowContext";
import type { CreateChainForm } from "@/types";

const EMPTY: CreateChainForm = { name: "", description: "", insight: "" };

export function CreateChainModal({ onClose }: { onClose: () => void }) {
  const { createChain } = useLogicFlow();
  const [form, setForm] = useState(EMPTY);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    createChain(form);
    onClose();
  };

  return (
    <Modal title="创建产业链" onClose={onClose}>
      <form className="stack-lg" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>产业链名称</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>描述</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>投资洞察</label>
          <textarea value={form.insight} onChange={(e) => setForm((f) => ({ ...f, insight: e.target.value }))}
            placeholder="当前阶段的核心观测指标…" />
        </div>
        <button type="submit" className="btn btn-primary">创建</button>
      </form>
    </Modal>
  );
}
