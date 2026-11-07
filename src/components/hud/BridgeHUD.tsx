import React, { useState } from "react";
import { useGameStore } from "../../store";
import { EngineTelegraph } from "../../types";
import {
  Compass,
  Navigation,
  ShoppingBag,
  Wrench,
  Radio,
  AlertTriangle,
  Waves,
  Shield,
  Fuel,
  Droplets,
  Utensils,
  ChevronUp,
  ChevronDown,
  Locate,
  BookOpen,
} from "lucide-react";
import { useTranslation } from "../../i18n";
import { VESSELS } from "../../config/vessels";
import { SeaWindowWidget } from "./SeaWindowWidget";

const TELEGRAPHS: EngineTelegraph[] = ["STOP", "SLOW", "HALF", "ECO", "FULL", "FLANK"];

export const BridgeHUD: React.FC = () => {
  const activeVessel = useGameStore((state) => state.activeVessel);
  const setTelegraph = useGameStore((state) => state.setEngineTelegraph);
  const setHeading = useGameStore((state) => state.setHeadingDeg);
  const autopilotEnabled = useGameStore((state) => state.autopilotEnabled);
  const openModal = useGameStore((state) => state.openModal);
  const systemLogs = useGameStore((state) => state.systemLogs);
  const weather = useGameStore((state) => state.currentWeather);
  const currentDepth = useGameStore((state) => state.currentDepthM);
  const { t } = useTranslation();

  // 是否展开大舷窗与详细仪表
  const [showMetDetail, setShowMetDetail] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const vesselSpec = VESSELS[activeVessel.vesselId];

  const changeHeading = (delta: number) => {
    setHeading((activeVessel.headingDeg + delta + 360) % 360);
  };

  const fuelPct = vesselSpec?.fuelCapacityT > 0
    ? Math.min(100, Math.round((activeVessel.supplies.fuelT / vesselSpec.fuelCapacityT) * 100))
    : 100;
  const waterPct = vesselSpec
    ? Math.min(100, Math.round((activeVessel.supplies.freshWaterT / vesselSpec.waterCapacityT) * 100))
    : 100;
  const rationPct = vesselSpec
    ? Math.min(100, Math.round((activeVessel.supplies.rationT / vesselSpec.rationCapacityT) * 100))
    : 100;
  const partsPct = vesselSpec
    ? Math.min(100, Math.round((activeVessel.supplies.sparePartsT / vesselSpec.sparePartsCapacityT) * 100))
    : 100;
  const hpPct = Math.round((activeVessel.hullHp / activeVessel.hullHpMax) * 100);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between font-mono z-10 select-none">
      {/* 顶部悬浮仪表: 海况微视窗与预警 */}
      <div className="p-3 pt-safe flex justify-between items-start">
        {/* 左侧空出，避免遮挡海图 */}
        <div />

        {/* 右侧海况小胶囊 (点击展开海况微视窗) */}
        <div className="pointer-events-auto flex flex-col items-end space-y-2">
          <div
            onClick={() => setShowMetDetail(!showMetDetail)}
            className="bg-bridge-panel/90 backdrop-blur border border-bridge-border px-3 py-1.5 rounded-full flex items-center space-x-2 text-[11px] shadow-lg cursor-pointer hover:border-bridge-highlight transition-all"
          >
            <Waves size={14} className="text-sky-400 animate-pulse" />
            <span className="text-white font-bold">Hs: {weather.significantWaveHeightM}m</span>
            <span className="text-bridge-border">|</span>
            <span className="text-bridge-textMuted">BF {weather.beaufortScale}</span>
            <ChevronDown size={12} className={`text-bridge-textMuted transition-transform ${showMetDetail ? "rotate-180" : ""}`} />
          </div>

          {showMetDetail && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <SeaWindowWidget />
            </div>
          )}
        </div>
      </div>

      {/* 屏幕中部: 异常报警横幅 */}
      {systemLogs.length > 0 && systemLogs[0].type !== "INFO" && (
        <div className="self-center pointer-events-auto bg-bridge-panel/95 border border-bridge-warning px-3 py-1.5 rounded-xl text-[11px] text-bridge-warning flex items-center space-x-1.5 shadow-2xl animate-pulse mx-4 max-w-[92vw]">
          <span className="font-bold shrink-0">⚠️ {t.hud.alertTitle}:</span>
          <span className="truncate">{systemLogs[0].text}</span>
        </div>
      )}

      {/* 底部全场景移动端海事驾驶台 (Mobile-First Marine Cockpit) */}
      <div className="pointer-events-auto w-full max-w-xl mx-auto px-2 pb-safe flex flex-col space-y-1.5">
        {/* 1. 拟物车钟档位选择横条 (Telegraph Selector Bar) */}
        <div className="bg-bridge-panel/95 backdrop-blur border border-bridge-border rounded-xl p-1.5 flex items-center justify-between shadow-xl">
          <span className="text-[10px] text-bridge-textMuted px-1 font-bold shrink-0">
            {t.hud.telegraph.substring(0, 2)}
          </span>
          <div className="flex-1 grid grid-cols-6 gap-1">
            {TELEGRAPHS.map((gear) => {
              const isActive = activeVessel.engineTelegraph === gear;
              const isDanger = gear === "FLANK";
              const isStop = gear === "STOP";

              let activeStyle = "bg-bridge-accent text-bridge-bg font-black shadow-[0_0_10px_#35C6D8]";
              if (isDanger) activeStyle = "bg-bridge-danger text-white font-black shadow-[0_0_10px_#FF5A5F]";
              if (isStop) activeStyle = "bg-zinc-600 text-white font-bold";

              return (
                <button
                  key={gear}
                  onClick={() => setTelegraph(gear)}
                  className={`py-1 rounded text-[10px] uppercase font-bold transition-all text-center border ${
                    isActive
                      ? `${activeStyle} border-white`
                      : "bg-bridge-panelLight/50 text-bridge-textMuted border-transparent hover:text-white"
                  }`}
                >
                  {gear}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. 罗盘操舵盘与航行数据条 (Helm & Speed Bar) */}
        <div className="bg-bridge-panel/95 backdrop-blur border border-bridge-border rounded-xl px-2.5 py-1.5 flex items-center justify-between shadow-xl">
          {/* 左舵大角度/小角度 */}
          <div className="flex space-x-1">
            <button
              onClick={() => changeHeading(-10)}
              className="px-2 py-1 bg-bridge-panelLight border border-bridge-border text-bridge-text rounded text-[11px] font-bold active:bg-bridge-accent active:text-bridge-bg"
            >
              -10°
            </button>
            <button
              onClick={() => changeHeading(-1)}
              className="px-2 py-1 bg-bridge-panelLight border border-bridge-border text-bridge-text rounded text-[11px] font-bold active:bg-bridge-accent active:text-bridge-bg"
            >
              -1°
            </button>
          </div>

          {/* 中央核心数据: 航向 HDG + 航速 SOG */}
          <div className="flex items-center space-x-3 text-center">
            <div>
              <div className="text-sm font-extrabold text-white leading-none">
                {Math.round(activeVessel.headingDeg)}°
              </div>
              <div className="text-[9px] text-bridge-highlight mt-0.5">{t.hud.heading}</div>
            </div>

            <div className="h-6 w-px bg-bridge-border" />

            <div>
              <div className="text-sm font-extrabold text-bridge-safe leading-none">
                {activeVessel.sogKn.toFixed(1)} <span className="text-[10px] font-normal">{t.common.knots}</span>
              </div>
              <div className="text-[9px] text-bridge-textMuted mt-0.5">{t.hud.sog}</div>
            </div>
          </div>

          {/* 右舵小角度/大角度 */}
          <div className="flex space-x-1">
            <button
              onClick={() => changeHeading(1)}
              className="px-2 py-1 bg-bridge-panelLight border border-bridge-border text-bridge-text rounded text-[11px] font-bold active:bg-bridge-accent active:text-bridge-bg"
            >
              +1°
            </button>
            <button
              onClick={() => changeHeading(10)}
              className="px-2 py-1 bg-bridge-panelLight border border-bridge-border text-bridge-text rounded text-[11px] font-bold active:bg-bridge-accent active:text-bridge-bg"
            >
              +10°
            </button>
          </div>
        </div>

        {/* 3. 四大补给品与耐久度微型指示条 (Mini Logistics Strip) */}
        <div className="bg-bridge-panel/90 backdrop-blur border border-bridge-border rounded-xl px-2.5 py-1 grid grid-cols-5 gap-1.5 text-[9px] items-center shadow-lg">
          {/* 船体 HP */}
          <div className="flex items-center space-x-1">
            <Shield size={11} className={hpPct > 50 ? "text-bridge-safe" : "text-bridge-danger"} />
            <div className="flex-1 h-1 bg-bridge-bg rounded-full overflow-hidden">
              <div className={`h-full ${hpPct > 50 ? "bg-bridge-safe" : "bg-bridge-danger"}`} style={{ width: `${hpPct}%` }} />
            </div>
          </div>

          {/* 燃油 */}
          <div className="flex items-center space-x-1">
            <Fuel size={11} className="text-amber-400" />
            <div className="flex-1 h-1 bg-bridge-bg rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${fuelPct}%` }} />
            </div>
          </div>

          {/* 淡水 */}
          <div className="flex items-center space-x-1">
            <Droplets size={11} className="text-sky-400" />
            <div className="flex-1 h-1 bg-bridge-bg rounded-full overflow-hidden">
              <div className="h-full bg-sky-400" style={{ width: `${waterPct}%` }} />
            </div>
          </div>

          {/* 口粮 */}
          <div className="flex items-center space-x-1">
            <Utensils size={11} className="text-emerald-400" />
            <div className="flex-1 h-1 bg-bridge-bg rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: `${rationPct}%` }} />
            </div>
          </div>

          {/* 备件 */}
          <div className="flex items-center space-x-1">
            <span className="text-[10px] text-purple-400">🔧</span>
            <div className="flex-1 h-1 bg-bridge-bg rounded-full overflow-hidden">
              <div className="h-full bg-purple-400" style={{ width: `${partsPct}%` }} />
            </div>
          </div>
        </div>

        {/* 4. 手机端 5 键核心海事功能 Dock 栏 */}
        <div className="bg-bridge-panel/95 backdrop-blur border border-bridge-border rounded-2xl p-1.5 flex items-center justify-between shadow-2xl">
          {/* 大圆航线规划 / 引航 */}
          <button
            onClick={() => openModal("ROUTE_PLANNER")}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-xl text-[10px] transition-all ${
              autopilotEnabled
                ? "bg-bridge-highlight text-bridge-bg font-bold shadow-[0_0_10px_#56D9E8]"
                : "text-bridge-highlight hover:bg-bridge-panelLight"
            }`}
          >
            <Navigation size={16} className={autopilotEnabled ? "animate-spin" : ""} />
            <span className="mt-0.5 truncate w-full text-center">
              {autopilotEnabled ? t.dock.autopilotEngaged.substring(0, 4) : t.routePlanner.destination}
            </span>
          </button>

          {/* 港口贸易 */}
          <button
            onClick={() => openModal("PORT_TRADE", { portId: "CNSHA" })}
            className="flex-1 py-1.5 flex flex-col items-center justify-center rounded-xl text-[10px] text-bridge-textMuted hover:text-white hover:bg-bridge-panelLight transition-all"
          >
            <ShoppingBag size={16} className="text-bridge-safe" />
            <span className="mt-0.5 truncate w-full text-center">{t.dock.portTrade.substring(0, 4)}</span>
          </button>

          {/* 船厂与改装 */}
          <button
            onClick={() => openModal("SHIPYARD")}
            className="flex-1 py-1.5 flex flex-col items-center justify-center rounded-xl text-[10px] text-bridge-textMuted hover:text-white hover:bg-bridge-panelLight transition-all"
          >
            <Wrench size={16} className="text-amber-400" />
            <span className="mt-0.5 truncate w-full text-center">{t.dock.shipyard.substring(0, 4)}</span>
          </button>

          {/* AIS 船队雷达 */}
          <button
            onClick={() => openModal("AIS_DETAIL")}
            className="flex-1 py-1.5 flex flex-col items-center justify-center rounded-xl text-[10px] text-bridge-textMuted hover:text-white hover:bg-bridge-panelLight transition-all"
          >
            <Radio size={16} className="text-sky-400" />
            <span className="mt-0.5 truncate w-full text-center">{t.dock.aisFleet.substring(0, 3)}</span>
          </button>

          {/* 更多功能 (日志 / Mayday) */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="flex-1 py-1.5 flex flex-col items-center justify-center rounded-xl text-[10px] text-bridge-textMuted hover:text-white hover:bg-bridge-panelLight transition-all relative"
          >
            <span className="text-base leading-none">⋯</span>
            <span className="mt-0.5">{t.hud.menuMobile.substring(0, 2)}</span>

            {/* 弹出菜单 */}
            {showMoreMenu && (
              <div
                className="absolute bottom-full mb-2 right-0 bg-bridge-panel border border-bridge-border rounded-xl p-1.5 shadow-2xl z-50 flex flex-col space-y-1 min-w-[120px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    openModal("JOURNAL");
                    setShowMoreMenu(false);
                  }}
                  className="px-2.5 py-1.5 text-left text-xs rounded hover:bg-bridge-panelLight flex items-center space-x-2 text-white"
                >
                  <BookOpen size={13} className="text-bridge-highlight" />
                  <span>{t.dock.journal}</span>
                </button>
                <button
                  onClick={() => {
                    openModal("MAYDAY");
                    setShowMoreMenu(false);
                  }}
                  className="px-2.5 py-1.5 text-left text-xs rounded hover:bg-red-500/20 flex items-center space-x-2 text-bridge-danger font-bold"
                >
                  <AlertTriangle size={13} />
                  <span>{t.dock.mayday}</span>
                </button>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
