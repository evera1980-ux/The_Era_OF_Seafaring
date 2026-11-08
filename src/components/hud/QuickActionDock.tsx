import React from "react";
import { useGameStore } from "../../store";
import { useTranslation } from "../../i18n";
import { GameAsset } from "../common/GameAsset";

export const QuickActionDock: React.FC = () => {
  const openModal = useGameStore((state) => state.openModal);
  const activeModal = useGameStore((state) => state.activeModal);
  const isGrounded = useGameStore((state) => state.activeVessel.grounded);
  const autopilotEnabled = useGameStore((state) => state.autopilotEnabled);
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-4 select-none font-mono">
      {/* 航线规划 */}
      <button
        type="button"
        onClick={() => openModal("ROUTE_PLANNER")}
        className={`flex flex-col items-center justify-center px-2 py-1 text-xs transition-all cursor-pointer ${
          activeModal === "ROUTE_PLANNER" || autopilotEnabled
            ? "text-cyan-300 font-extrabold scale-105"
            : "text-slate-100 hover:text-cyan-300"
        }`}
      >
        <GameAsset
          assetKey="hud_route_nav"
          width={39}
          height={39}
          className={`w-[39px] h-[39px] object-contain [filter:drop-shadow(0_3px_6px_rgba(0,0,0,0.95))] ${
            autopilotEnabled ? "animate-spin" : ""
          }`}
        />
        <span className="mt-1 [text-shadow:0_1px_4px_#000,0_0_8px_#000]">
          {autopilotEnabled ? t.dock.autopilotEngaged : t.dock.routePlan}
        </span>
      </button>

      {/* 港口贸易 */}
      <button
        type="button"
        onClick={() => openModal("PORT_TRADE", { portId: "CNSHA" })}
        className={`flex flex-col items-center justify-center px-2 py-1 text-xs transition-all cursor-pointer ${
          activeModal === "PORT_TRADE"
            ? "text-amber-300 font-extrabold scale-105"
            : "text-slate-100 hover:text-amber-300"
        }`}
      >
        <GameAsset
          assetKey="hud_port_trade"
          width={39}
          height={39}
          className="w-[39px] h-[39px] object-contain [filter:drop-shadow(0_3px_6px_rgba(0,0,0,0.95))]"
        />
        <span className="mt-1 [text-shadow:0_1px_4px_#000,0_0_8px_#000]">
          {t.dock.portTrade}
        </span>
      </button>

      {/* 船厂与改装 */}
      <button
        type="button"
        onClick={() => openModal("SHIPYARD")}
        className={`flex flex-col items-center justify-center px-2 py-1 text-xs transition-all cursor-pointer ${
          activeModal === "SHIPYARD"
            ? "text-sky-300 font-extrabold scale-105"
            : "text-slate-100 hover:text-sky-300"
        }`}
      >
        <GameAsset
          assetKey="hud_shipyard"
          width={39}
          height={39}
          className="w-[39px] h-[39px] object-contain [filter:drop-shadow(0_3px_6px_rgba(0,0,0,0.95))]"
        />
        <span className="mt-1 [text-shadow:0_1px_4px_#000,0_0_8px_#000]">
          {t.dock.shipyard}
        </span>
      </button>

      {/* AIS 动态 */}
      <button
        type="button"
        onClick={() => openModal("AIS_DETAIL")}
        className={`flex flex-col items-center justify-center px-2 py-1 text-xs transition-all cursor-pointer ${
          activeModal === "AIS_DETAIL"
            ? "text-emerald-300 font-extrabold scale-105"
            : "text-slate-100 hover:text-emerald-300"
        }`}
      >
        <GameAsset
          assetKey="hud_ais_radar"
          width={39}
          height={39}
          className="w-[39px] h-[39px] object-contain [filter:drop-shadow(0_3px_6px_rgba(0,0,0,0.95))]"
        />
        <span className="mt-1 [text-shadow:0_1px_4px_#000,0_0_8px_#000]">
          {t.dock.aisFleet}
        </span>
      </button>

      {/* 日志 */}
      <button
        type="button"
        onClick={() => openModal("JOURNAL")}
        className={`flex flex-col items-center justify-center px-2 py-1 text-xs transition-all cursor-pointer ${
          activeModal === "JOURNAL"
            ? "text-cyan-300 font-extrabold scale-105"
            : "text-slate-100 hover:text-cyan-300"
        }`}
      >
        <GameAsset
          assetKey="hud_journal"
          width={39}
          height={39}
          className="w-[39px] h-[39px] object-contain [filter:drop-shadow(0_3px_6px_rgba(0,0,0,0.95))]"
        />
        <span className="mt-1 [text-shadow:0_1px_4px_#000,0_0_8px_#000]">
          {t.dock.journal}
        </span>
      </button>

      {/* Mayday 求援 */}
      <button
        type="button"
        onClick={() => openModal("MAYDAY")}
        className={`flex flex-col items-center justify-center px-2 py-1 text-xs transition-all cursor-pointer ${
          isGrounded
            ? "text-rose-400 animate-bounce font-extrabold"
            : "text-rose-400 hover:text-rose-300"
        }`}
      >
        <GameAsset
          assetKey="hazard_mayday"
          width={39}
          height={39}
          className="w-[39px] h-[39px] object-contain [filter:drop-shadow(0_3px_6px_rgba(0,0,0,0.95))]"
        />
        <span className="mt-1 [text-shadow:0_1px_4px_#000,0_0_8px_#000]">
          {t.dock.mayday}
        </span>
      </button>
    </div>
  );
};
