import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SEED_CHAINS, SEED_DECISIONS, SEED_EVENTS, SEED_REVIEWS, SEED_VERSION } from "@/data/seed";
import { createId } from "@/lib/id";
import { computeArchiveStats } from "@/lib/stats";
import { storage } from "@/lib/storage";
import { formatFullCode, parseTickers } from "@/lib/format";
import type {
  AddAttributionEventForm,
  AddChainNodeForm,
  AppTab,
  AttributionEvent,
  CloseDecisionForm,
  CompleteReviewForm,
  CreateChainForm,
  CreateDecisionCardForm,
  DecisionCard,
  IndustryChain,
  ReviewRecord,
  ViewMode,
} from "@/types";

interface LogicFlowState {
  decisions: DecisionCard[];
  events: AttributionEvent[];
  chains: IndustryChain[];
  reviews: ReviewRecord[];
  currentTab: AppTab;
  viewMode: ViewMode;
  searchQuery: string;
  pendingDecisionId: string | null;
  stats: ReturnType<typeof computeArchiveStats>;
  activeDecisions: DecisionCard[];
  closedDecisions: DecisionCard[];
  setTab: (tab: AppTab) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (q: string) => void;
  navigateToDecision: (id: string) => void;
  clearPendingDecision: () => void;
  createDecision: (form: CreateDecisionCardForm) => void;
  closeDecision: (id: string, form: CloseDecisionForm) => void;
  updateConfidence: (id: string, value: number, note: string) => void;
  addEvent: (form: AddAttributionEventForm) => void;
  createChain: (form: CreateChainForm) => void;
  addChainNode: (chainId: string, form: AddChainNodeForm) => void;
  saveReview: (form: CompleteReviewForm) => void;
}

const LogicFlowContext = createContext<LogicFlowState | null>(null);

function loadInitial() {
  const needsSeed =
    !storage.isSeeded() || storage.getSeedVersion() < SEED_VERSION;

  if (needsSeed) {
    storage.setDecisions(SEED_DECISIONS);
    storage.setEvents(SEED_EVENTS);
    storage.setChains(SEED_CHAINS);
    storage.setReviews(SEED_REVIEWS);
    storage.setSeedVersion(SEED_VERSION);
    storage.markSeeded();
  }
  return {
    decisions: storage.getDecisions(),
    events: storage.getEvents(),
    chains: storage.getChains(),
    reviews: storage.getReviews(),
  };
}

export function LogicFlowProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => loadInitial(), []);
  const [decisions, setDecisions] = useState(initial.decisions);
  const [events, setEvents] = useState(initial.events);
  const [chains, setChains] = useState(initial.chains);
  const [reviews, setReviews] = useState(initial.reviews);
  const [currentTab, setTab] = useState<AppTab>("canvas");
  const [viewMode, setViewMode] = useState<ViewMode>("execute");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDecisionId, setPendingDecisionId] = useState<string | null>(null);

  const persistDecisions = useCallback((next: DecisionCard[]) => {
    setDecisions(next);
    storage.setDecisions(next);
  }, []);

  const persistEvents = useCallback((next: AttributionEvent[]) => {
    setEvents(next);
    storage.setEvents(next);
  }, []);

  const persistChains = useCallback((next: IndustryChain[]) => {
    setChains(next);
    storage.setChains(next);
  }, []);

  const persistReviews = useCallback((next: ReviewRecord[]) => {
    setReviews(next);
    storage.setReviews(next);
  }, []);

  const navigateToDecision = useCallback((id: string) => {
    setPendingDecisionId(id);
    setTab("canvas");
  }, []);

  const clearPendingDecision = useCallback(() => {
    setPendingDecisionId(null);
  }, []);

  const stats = useMemo(
    () => computeArchiveStats(decisions, events),
    [decisions, events],
  );

  const filteredActive = useMemo(() => {
    const active = decisions.filter((d) => d.status === "持仓中");
    const q = searchQuery.trim().toLowerCase();
    if (!q) return active;
    return active.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.ticker.includes(q) ||
        d.thesis.toLowerCase().includes(q),
    );
  }, [decisions, searchQuery]);

  const closedDecisions = useMemo(
    () =>
      [...decisions.filter((d) => d.status !== "持仓中")].sort(
        (a, b) =>
          new Date(b.closedAt ?? b.createdAt).getTime() -
          new Date(a.closedAt ?? a.createdAt).getTime(),
      ),
    [decisions],
  );

  const createDecision = useCallback(
    (form: CreateDecisionCardForm) => {
      const card: DecisionCard = {
        id: createId(),
        ticker: form.ticker.trim(),
        name: form.name.trim(),
        exchange: form.exchange,
        fullCode: formatFullCode(form.ticker.trim(), form.exchange),
        sector: form.sector.trim(),
        hasST: form.hasST,
        thesis: form.thesis.trim(),
        targetPrice: Number(form.targetPrice),
        stopLossPrice: Number(form.stopLossPrice),
        entryPrice: Number(form.entryPrice),
        confidence: form.confidence,
        stopLossCondition: form.stopLossCondition.trim() || undefined,
        status: "持仓中",
        relatedChainId: form.relatedChainId ?? undefined,
        createdAt: new Date().toISOString(),
        confidenceLog: [
          {
            date: new Date().toISOString().slice(0, 10),
            value: form.confidence,
            note: "创建决策",
          },
        ],
      };
      persistDecisions([card, ...decisions]);
    },
    [decisions, persistDecisions],
  );

  const closeDecision = useCallback(
    (id: string, form: CloseDecisionForm) => {
      persistDecisions(
        decisions.map((d) => {
          if (d.id !== id) return d;
          return {
            ...d,
            status: form.status,
            thesisFailReason:
              form.status === "逻辑失效"
                ? form.thesisFailReason.trim()
                : undefined,
            actualReturn: form.actualReturn
              ? Number(form.actualReturn)
              : undefined,
            closedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [decisions, persistDecisions],
  );

  const updateConfidence = useCallback(
    (id: string, value: number, note: string) => {
      persistDecisions(
        decisions.map((d) => {
          if (d.id !== id) return d;
          const entry = {
            date: new Date().toISOString().slice(0, 10),
            value,
            note: note.trim() || "更新置信度",
          };
          return {
            ...d,
            confidence: value,
            confidenceLog: [...(d.confidenceLog ?? []), entry],
          };
        }),
      );
    },
    [decisions, persistDecisions],
  );

  const addEvent = useCallback(
    (form: AddAttributionEventForm) => {
      const event: AttributionEvent = {
        id: createId(),
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        priceChange: Number(form.priceChange),
        type: form.type,
        direction: form.direction,
        relatedTickers: parseTickers(form.relatedTickers),
        relatedDecisionIds:
          form.relatedDecisionIds.length > 0
            ? form.relatedDecisionIds
            : undefined,
        logicValidation: form.logicValidation.trim(),
        source: form.source.trim(),
      };
      persistEvents(
        [...events, event].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      );
    },
    [events, persistEvents],
  );

  const createChain = useCallback(
    (form: CreateChainForm) => {
      const chain: IndustryChain = {
        id: createId(),
        name: form.name.trim(),
        description: form.description.trim(),
        insight: form.insight.trim(),
        nodes: [],
      };
      persistChains([chain, ...chains]);
    },
    [chains, persistChains],
  );

  const addChainNode = useCallback(
    (chainId: string, form: AddChainNodeForm) => {
      persistChains(
        chains.map((c) => {
          if (c.id !== chainId) return c;
          return {
            ...c,
            nodes: [
              ...c.nodes,
              {
                id: createId(),
                name: form.name.trim(),
                position: form.position,
                relatedTickers: parseTickers(form.relatedTickers),
                description: form.description.trim(),
              },
            ],
          };
        }),
      );
    },
    [chains, persistChains],
  );

  const saveReview = useCallback(
    (form: CompleteReviewForm) => {
      const record: ReviewRecord = {
        id: createId(),
        decisionId: form.decisionId,
        logicResult: form.logicResult,
        exitTimingNote: form.exitTimingNote.trim(),
        notes: form.notes.trim(),
        createdAt: new Date().toISOString(),
      };
      persistReviews(
        [record, ...reviews].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    },
    [reviews, persistReviews],
  );

  const value: LogicFlowState = {
    decisions,
    events,
    chains,
    reviews,
    currentTab,
    viewMode,
    searchQuery,
    pendingDecisionId,
    stats,
    activeDecisions: filteredActive,
    closedDecisions,
    setTab,
    setViewMode,
    setSearchQuery,
    navigateToDecision,
    clearPendingDecision,
    createDecision,
    closeDecision,
    updateConfidence,
    addEvent,
    createChain,
    addChainNode,
    saveReview,
  };

  return (
    <LogicFlowContext.Provider value={value}>{children}</LogicFlowContext.Provider>
  );
}

export function useLogicFlow(): LogicFlowState {
  const ctx = useContext(LogicFlowContext);
  if (!ctx) throw new Error("useLogicFlow must be used within LogicFlowProvider");
  return ctx;
}
