import type { AttributionEvent, DecisionCard } from "@/types";

export function getEventsForDecision(
  decision: DecisionCard,
  events: AttributionEvent[],
): AttributionEvent[] {
  return events
    .filter(
      (e) =>
        e.relatedDecisionIds?.includes(decision.id) ||
        e.relatedTickers.includes(decision.ticker),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
