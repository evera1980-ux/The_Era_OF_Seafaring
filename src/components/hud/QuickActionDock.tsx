import React from "react";
import { useGameStore } from "../../store";
import { ShoppingBag, Wrench, Radio, BookOpen, AlertTriangle, Navigation } from "lucide-react";
import { useTranslation } from "../../i18n";

export const QuickActionDock: React.FC = () => {
  const openModal = useGameStore((state) => state.openModal);
  const activeModal = useGameStore((state) => state.activeModal);
  const isGrounded = useGameStore((state) => state.activeVessel.grounded);
  const autopilotEnabled = useGameStore((state) => state.autopilotEnabled);
  const { t } = useTranslation();

  return (
    <div className="bg-bridge-panel/90 backdrop-blur border border-bridge-border rounded-xl p-2 shadow-2xl flex items-center space-x-2 select-none font-mono">
      {/* 航线规划 */}
      <button
        onClick={() => openModal("ROUTE_PLANNER")}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
          activeModal === "ROUTE_PLANNER" || autopilotEnabled
            ? "bg-bridge-highlight text-bridge-bg border-white font-bold shadow-[0_0_12px_#56D9E8]"
            : "bg-bridge-accent/20 text-bridge-highlight border-bridge-accent/50 hover:bg-bridge-accent/30"
        }`}
      >
        <Navigation size={14} className={autopilotEnabled ? "animate-spin" : ""} />
        <span>{autopilotEnabled ? t.dock.autopilotEngaged : t.dock.routePlan}</span>
      </button>

      {/* 港口贸易 */}
      <button
        onClick={() => openModal("PORT_TRADE", { portId: "CNSHA" })}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
          activeModal === "PORT_TRADE"
            ? "bg-bridge-accent text-bridge-bg border-white font-bold"
            : "bg-bridge-panelLight/70 text-bridge-text border-bridge-border hover:border-bridge-highlight"
        }`}
      >
        <ShoppingBag size={14} />
        <span>{t.dock.portTrade}</span>
      </button>

      {/* 船厂与改装 */}
      <button
        onClick={() => openModal("SHIPYARD")}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
          activeModal === "SHIPYARD"
            ? "bg-bridge-accent text-bridge-bg border-white font-bold"
            : "bg-bridge-panelLight/70 text-bridge-text border-bridge-border hover:border-bridge-highlight"
        }`}
      >
        <Wrench size={14} />
        <span>{t.dock.shipyard}</span>
      </button>

      {/* AIS 动态 */}
      <button
        onClick={() => openModal("AIS_DETAIL")}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
          activeModal === "AIS_DETAIL"
            ? "bg-bridge-accent text-bridge-bg border-white font-bold"
            : "bg-bridge-panelLight/70 text-bridge-text border-bridge-border hover:border-bridge-highlight"
        }`}
      >
        <Radio size={14} />
        <span>{t.dock.aisFleet}</span>
      </button>

      {/* 日志 */}
      <button
        onClick={() => openModal("JOURNAL")}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
          activeModal === "JOURNAL"
            ? "bg-bridge-accent text-bridge-bg border-white font-bold"
            : "bg-bridge-panelLight/70 text-bridge-text border-bridge-border hover:border-bridge-highlight"
        }`}
      >
        <BookOpen size={14} />
        <span>{t.dock.journal}</span>
      </button>

      {/* Mayday 求援 */}
      <button
        onClick={() => openModal("MAYDAY")}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
          isGrounded
            ? "bg-bridge-danger text-white border-white animate-bounce font-bold shadow-[0_0_15px_#FF5A5F]"
            : "bg-bridge-panelLight/70 text-bridge-danger border-bridge-danger/50 hover:bg-bridge-danger/20"
        }`}
      >
        <AlertTriangle size={14} />
        <span>{t.dock.mayday}</span>
      </button>
    </div>
  );
};
