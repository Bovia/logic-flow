import type { AppTab } from "@/types";

const TABS: Array<{ id: AppTab; label: string; icon: string }> = [
  { id: "canvas", label: "画布", icon: "◫" },
  { id: "chain", label: "产业链", icon: "⬡" },
  { id: "attribution", label: "归因", icon: "◎" },
  { id: "archive", label: "档案", icon: "▣" },
];

interface TabBarProps {
  current: AppTab;
  onChange: (tab: AppTab) => void;
}

export function TabBar({ current, onChange }: TabBarProps) {
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={current === tab.id ? "active" : ""}
          onClick={() => onChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
