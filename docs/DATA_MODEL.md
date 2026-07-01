# LogicFlow 数据模型

本项目的 TypeScript 类型定义位于 [`src/types/index.ts`](../src/types/index.ts)，作为**单一事实来源**。

## 交互式文档（Canvas）

完整的数据模型分析、字段分类、数据流向图和产品建议，在 Cursor Canvas 中维护：

[logicflow-data-model.canvas.tsx](/Users/bovia-pwc/.cursor/projects/Users-bovia-pwc-Desktop-logic-flow/canvases/logicflow-data-model.canvas.tsx)

在 Cursor 中点击上方链接，可在聊天旁打开交互式面板。

## 同步规则

| 变更场景 | 做法 |
|---------|------|
| 改业务类型 | 先改 `src/types/index.ts`，再让 AI 更新 Canvas |
| 改 Canvas 分析结论 | 把结论同步回 `src/types` 和本文档 |
| 开始写 UI | 组件、store、localStorage 层直接 `import` from `@/types` |

## 实体概览

- **持久化实体**：`DecisionCard`、`AttributionEvent`、`IndustryChain`（含 `IndustryChainNode`）
- **派生统计**：`ArchiveStats`（从 DecisionCard 聚合，不存储）
- **瞬态表单**：`CreateDecisionCardForm`、`CloseDecisionForm` 等
- **应用状态**：`AppState`（tab、viewMode、searchQuery）
