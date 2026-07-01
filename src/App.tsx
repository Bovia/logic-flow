import { LogicFlowProvider, useLogicFlow } from "@/store/LogicFlowContext";
import { isEmbedMode } from "@/lib/embed";
import { TabBar } from "@/components/TabBar";
import { CanvasPage } from "@/pages/CanvasPage";
import { ChainPage } from "@/pages/ChainPage";
import { AttributionPage } from "@/pages/AttributionPage";
import { ArchivePage } from "@/pages/ArchivePage";

const TAB_TITLES = {
  canvas: "画布",
  chain: "产业链",
  attribution: "归因",
  archive: "档案",
} as const;

function AppContent() {
  const { currentTab, setTab } = useLogicFlow();
  const embed = isEmbedMode();

  return (
    <div className={`app-shell${embed ? " embed-mode" : ""}`}>
      <header className="app-header">
        <h1>LogicFlow · {TAB_TITLES[currentTab]}</h1>
      </header>
      <main className="app-main">
        {currentTab === "canvas" && <CanvasPage />}
        {currentTab === "chain" && <ChainPage />}
        {currentTab === "attribution" && <AttributionPage />}
        {currentTab === "archive" && <ArchivePage />}
        <p className="disclaimer">个人投研档案，不构成任何投资建议</p>
      </main>
      <TabBar current={currentTab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <LogicFlowProvider>
      <AppContent />
    </LogicFlowProvider>
  );
}
