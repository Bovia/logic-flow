import type { DecisionStatus } from "@/types";
import { statusBadgeClass } from "@/lib/format";

export function StatusBadge({ status }: { status: DecisionStatus }) {
  return <span className={statusBadgeClass(status)}>{status}</span>;
}
