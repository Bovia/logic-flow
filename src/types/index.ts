/**
 * LogicFlow 数据模型 — 项目类型契约（单一事实来源）
 *
 * 与 Canvas 文档同步：
 * ~/.cursor/projects/Users-bovia-pwc-Desktop-logic-flow/canvases/logicflow-data-model.canvas.tsx
 *
 * 修改类型时请同步更新 Canvas，或让 AI「按 src/types 更新 data model canvas」。
 */

export type Exchange = "SH" | "SZ";

/** 4 个平仓状态，直接对应「平仓操作」下拉选项 */
export type DecisionStatus =
  | "持仓中"
  | "止盈平仓"
  | "止损平仓"
  | "逻辑失效";

export type EventType = "财报" | "宏观" | "行业" | "公司";
export type EventDirection = "正面" | "中性" | "负面";
export type ChainPosition = "upstream" | "midstream" | "downstream";
export type AppTab = "canvas" | "chain" | "attribution" | "archive";
export type ViewMode = "execute" | "analyze";

/** 已平仓状态（不含持仓中） */
export type ClosedDecisionStatus = Exclude<DecisionStatus, "持仓中">;

export interface ConfidenceEntry {
  date: string;
  value: number;
  note: string;
}

export interface DecisionCard {
  id: string;
  ticker: string;
  name: string;
  exchange: Exchange;
  fullCode: string;
  sector: string;
  hasST: boolean;
  thesis: string;
  targetPrice: number;
  stopLossPrice: number;
  entryPrice: number;
  confidence: number;
  confidenceLog?: ConfidenceEntry[];
  stopLossCondition?: string;
  status: DecisionStatus;
  thesisFailReason?: string;
  actualReturn?: number;
  relatedChainId?: string;
  createdAt: string;
  closedAt?: string;
}

export interface AttributionEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  priceChange: number;
  type: EventType;
  direction: EventDirection;
  relatedTickers: string[];
  relatedDecisionIds?: string[];
  logicValidation: string;
  source: string;
}

export interface IndustryChainNode {
  id: string;
  name: string;
  position: ChainPosition;
  relatedTickers: string[];
  description: string;
}

export interface IndustryChain {
  id: string;
  name: string;
  description: string;
  insight: string;
  nodes: IndustryChainNode[];
}

/** 档案统计 — 完全派生，不持久化存储 */
export interface ArchiveStats {
  logicWinRate: number;
  profitWinRate: number;
  totalTrades: number;
  logicConfidence: number;
  openPositions: number;
  thesisFailCount: number;
}

export interface CreateDecisionCardForm {
  ticker: string;
  name: string;
  exchange: Exchange;
  sector: string;
  hasST: boolean;
  thesis: string;
  targetPrice: string;
  stopLossPrice: string;
  entryPrice: string;
  confidence: number;
  stopLossCondition: string;
  relatedChainId: string | null;
}

export interface CloseDecisionForm {
  status: ClosedDecisionStatus;
  thesisFailReason: string;
  actualReturn: string;
}

export interface AddAttributionEventForm {
  title: string;
  description: string;
  date: string;
  priceChange: string;
  type: EventType;
  direction: EventDirection;
  relatedTickers: string;
  relatedDecisionIds: string[];
  logicValidation: string;
  source: string;
}

export interface CreateChainForm {
  name: string;
  description: string;
  insight: string;
}

export interface AddChainNodeForm {
  name: string;
  position: ChainPosition;
  relatedTickers: string;
  description: string;
}

export interface ReviewTemplateForm {
  selectedDecisionId: string | null;
}

export type LogicVerificationResult = "验证" | "部分验证" | "证伪";

/** 复盘记录 — 持久化 */
export interface ReviewRecord {
  id: string;
  decisionId: string;
  logicResult: LogicVerificationResult;
  exitTimingNote: string;
  notes: string;
  createdAt: string;
}

export interface CompleteReviewForm {
  decisionId: string;
  logicResult: LogicVerificationResult;
  exitTimingNote: string;
  notes: string;
}

export interface AppState {
  currentTab: AppTab;
  viewMode: ViewMode;
  searchQuery: string;
}
