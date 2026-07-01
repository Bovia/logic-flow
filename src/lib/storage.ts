import type {
  AttributionEvent,
  DecisionCard,
  IndustryChain,
  ReviewRecord,
} from "@/types";

const KEYS = {
  decisions: "logicflow:decisions",
  events: "logicflow:events",
  chains: "logicflow:chains",
  reviews: "logicflow:reviews",
  seeded: "logicflow:seeded",
  seedVersion: "logicflow:seed-version",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getDecisions(): DecisionCard[] {
    return read(KEYS.decisions, []);
  },
  setDecisions(decisions: DecisionCard[]): void {
    write(KEYS.decisions, decisions);
  },
  getEvents(): AttributionEvent[] {
    return read(KEYS.events, []);
  },
  setEvents(events: AttributionEvent[]): void {
    write(KEYS.events, events);
  },
  getChains(): IndustryChain[] {
    return read(KEYS.chains, []);
  },
  setChains(chains: IndustryChain[]): void {
    write(KEYS.chains, chains);
  },
  getReviews(): ReviewRecord[] {
    return read(KEYS.reviews, []);
  },
  setReviews(reviews: ReviewRecord[]): void {
    write(KEYS.reviews, reviews);
  },
  isSeeded(): boolean {
    return localStorage.getItem(KEYS.seeded) === "1";
  },
  markSeeded(): void {
    localStorage.setItem(KEYS.seeded, "1");
  },
  getSeedVersion(): number {
    return Number(localStorage.getItem(KEYS.seedVersion) ?? "0");
  },
  setSeedVersion(version: number): void {
    localStorage.setItem(KEYS.seedVersion, String(version));
  },
};
