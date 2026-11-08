import React, { useState } from "react";
import { useGameStore } from "../../store";
import { EngineTelegraph } from "../../types";
import {
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
  ChevronDown,
  BookOpen,
  Wind,
  Hammer,
} from "lucide-react";
import { useTranslation } from "../../i18n";
import { VESSELS } from "../../config/vessels";
import { SeaWindowWidget } from "./SeaWindowWidget";
import { calculateApparentWindAngle } from "../../core/physics/sail";
import {
  selectHourlyFuelBurnKgH,
  selectMaxRangeNM,
} from "../../store/selectors/shipSelectors";
import { portService } from "../../services/ports/portService";

const TELEGRAPHS: EngineTelegraph[] = ["STOP", "SLOW", "HALF", "ECO", "FULL", "FLANK"];

export const BridgeHUD: React.FC = () => {
  const activeVessel = useGameStore((state) => state.activeVessel);
  const unlockedPerkIds = useGameStore((state) => state.unlockedPerkIds);
  const roWaterMakerEnabled = useGameStore((state) => state.roWaterMakerEnabled);
  const toggleWaterMaker = useGameStore((state) => state.toggleWaterMaker);
  const performSeaRepair = useGameStore((state) => state.performSeaRepair);
  const discoverPort = useGameStore((state) => state.discoverPort);
  const setTelegraph = useGameStore((state) => state.setEngineTelegraph);
  const setHeading = useGameStore((state) => state.setHeadingDeg);
  const autopilotEnabled = useGameStore((state) => state.autopilotEnabled);
  const openModal = useGameStore((state) => state.openModal);
  const systemLogs = useGameStore((state) => state.systemLogs);
  const weather = useGameStore((state) => state.currentWeather);
  const addLog = useGameStore((state) => state.addLog);
  const { t, language } = useTranslation();

  const [showMetDetail, setShowMetDetail] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const vesselSpec = VESSELS[activeVessel.vesselId] ?? VESSELS.V001;

  const changeHeading = (delta: number) => {
    setHeading((activeVessel.headingDeg + delta + 360) % 360);
  };

  const awaDeg = Math.round(
    calculateApparentWindAngle(activeVessel.headingDeg, weather.windDirectionDeg)
  );
  const isSailOrHybrid =
    vesselSpec.propulsion === "Sail" || vesselSpec.propulsion === "Hybrid";
  const isInNoGoZone = isSailOrHybrid && awaDeg < 35;
  const isOptimalTrim = isSailOrHybrid && awaDeg >= 95 && awaDeg <= 145;

  const hourlyFuelKgH = selectHourlyFuelBurnKgH(
    activeVessel,
    unlockedPerkIds,
    roWaterMakerEnabled
  );
  const maxRangeNM = selectMaxRangeNM(
    activeVessel,
    unlockedPerkIds,
    roWaterMakerEnabled
  );

  const hasRoUpgrade = activeVessel.installedUpgrades.some(
    (u) => u.upgradeId === "U001" || u.upgradeId === "U002"
  );

  const fuelPct =
    vesselSpec.fuelCapacityT > 0
      ? Math.min(
          100,
          Math.round((activeVessel.supplies.fuelT / vesselSpec.fuelCapacityT) * 100)
        )
      : 100;
  const waterPct = Math.min(
    100,
    Math.round((activeVessel.supplies.freshWaterT / vesselSpec.waterCapacityT) * 100)
  );
  const rationPct = Math.min(
    100,
    Math.round((activeVessel.supplies.rationT / vesselSpec.rationCapacityT) * 100)
  );
  const partsPct = Math.min(
    100,
    Math.round(
      (activeVessel.supplies.sparePartsT / vesselSpec.sparePartsCapacityT) * 100
    )
  );
  const hpPct = Math.round((activeVessel.hullHp / activeVessel.hullHpMax) * 100);

  const handleOpenNearestPortTrade = (
    tab: "COMMODITIES" | "SUPPLIES" | "REPAIR" = "COMMODITIES"
  ) => {
    const nearest = portService.findNearestPort(activeVessel.position);
    const portId = nearest ? nearest.port.portId : "CNSHA";
    discoverPort(portId);
    openModal("PORT_TRADE", { portId, tab });
  };

  const handleEmergencySeaRepair = () => {
    const ok = performSeaRepair();
    if (ok) {
      addLog(
        language === "zh"
          ? "🔧 已消耗 0.1t 备件完成海上应急损管抢修，船体结构恢复 +15%！"
          : "🔧 Emergency hull repair completed using 0.1t Spare Parts (+15% Hull HP)!",
        "INFO"
      );
    } else {
      addLog(
        language === "zh"
          ? "船体完好或备件不足 (需 0.1t)，无法执行海上抢修。"
          : "Hull is full or insufficient Spare Parts (0.1t required).",
        "WARN"
      );
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between font-mono z-10 select-none">
      {/* 顶部悬浮仪表: 海况微视窗与预警 */}
      <div className="p-3 pt-safe flex justify-between items-start">
        <div />

        <div className="pointer-events-auto flex flex-col items-end space-y-2">
          <div
            onClick={() => setShowMetDetail(!showMetDetail)}
            className="bg-bridge-panel/90 backdrop-blur border border-bridge-border px-3 py-1.5 rounded-full flex items-center space-x-2 text-[11px] shadow-lg cursor-pointer hover:border-bridge-highlight transition-all"
          >
            <Waves size={14} className="text-sky-400 animate-pulse" />
            <span className="text-white font-bold">
              Hs: {weather.significantWaveHeightM.toFixed(1)}m
            </span>
            <span className="text-bridge-border">|</span>
            <span className="text-bridge-textMuted">BF {weather.beaufortScale}</span>
            <span className="text-bridge-border">|</span>
            <span
              className={`font-bold ${
                isInNoGoZone
                  ? "text-bridge-danger"
                  : isOptimalTrim
                  ? "text-bridge-safe"
                  : "text-sky-300"
              }`}
            >
              {t.hud.awa}: {awaDeg}°
            </span>
            <ChevronDown
              size={12}
              className={`text-bridge-textMuted transition-transform ${
                showMetDetail ? "rotate-180" : ""
              }`}
            />
          </div>

          {isInNoGoZone && (
            <div className="bg-red-950/90 border border-bridge-danger px-2.5 py-1 rounded-lg text-[10px] text-bridge-danger font-bold shadow-lg">
              ⚠️ {t.hud.noGoZone} ({awaDeg}°)
            </div>
          )}
          {!isInNoGoZone && isOptimalTrim && (
            <div className="bg-emerald-950/90 border border-bridge-safe px-2.5 py-1 rounded-lg text-[10px] text-bridge-safe font-bold shadow-lg">
              ⛵ {t.hud.optimalSail} ({awaDeg}°)
            </div>
          )}

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
            {t.hud.telegraph.substring(0, 3)}
          </span>
          <div className="flex-1 grid grid-cols-6 gap-1">
            {TELEGRAPHS.map((gear) => {
              const isActive = activeVessel.engineTelegraph === gear;
              const isDanger = gear === "FLANK";
              const isStop = gear === "STOP";

              let activeStyle =
                "bg-bridge-accent text-bridge-bg font-black shadow-[0_0_10px_#35C6D8]";
              if (isDanger)
                activeStyle =
                  "bg-bridge-danger text-white font-black shadow-[0_0_10px_#FF5A5F]";
              if (isStop) activeStyle = "bg-zinc-600 text-white font-bold";

              return (
                <button
                  key={gear}
                  onClick={() => setTelegraph(gear)}
                  className={`py-1.5 rounded text-[10px] uppercase font-bold transition-all text-center border ${
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
          <div className="flex space-x-1">
            <button
              onClick={() => changeHeading(-10)}
              className="min-w-[40px] min-h-[36px] px-2 py-1 bg-bridge-panelLight border border-bridge-border text-bridge-text rounded text-[11px] font-bold active:bg-bridge-accent active:text-bridge-bg"
            >
              -10°
            </button>
            <button
              onClick={() => changeHeading(-1)}
              className="min-w-[40px] min-h-[36px] px-2 py-1 bg-bridge-panelLight border border-bridge-border text-bridge-text rounded text-[11px] font-bold active:bg-bridge-accent active:text-bridge-bg"
            >
              -1°
            </button>
          </div>

          {/* 中央核心数据: 航向 HDG + 航速 SOG + 实时油耗/视风角 */}
          <div className="flex items-center space-x-2.5 text-center">
            <div>
              <div className="text-sm font-extrabold text-white leading-none">
                {Math.round(activeVessel.headingDeg)}°
              </div>
              <div className="text-[9px] text-bridge-highlight mt-0.5">
                {t.hud.heading}
              </div>
            </div>

            <div className="h-6 w-px bg-bridge-border" />

            <div>
              <div className="text-sm font-extrabold text-bridge-safe leading-none">
                {activeVessel.sogKn.toFixed(1)}{" "}
                <span className="text-[10px] font-normal">{t.common.knots}</span>
              </div>
              <div className="text-[9px] text-bridge-textMuted mt-0.5">
                {t.hud.sog}
              </div>
            </div>

            <div className="h-6 w-px bg-bridge-border hidden xs:block" />

            <div className="hidden xs:block">
              <div className="text-xs font-bold text-amber-400 leading-none">
                {hourlyFuelKgH} <span className="text-[9px] font-normal">kg/h</span>
              </div>
              <div className="text-[9px] text-bridge-textMuted mt-0.5">
                {maxRangeNM} NM
              </div>
            </div>
          </div>

          <div className="flex space-x-1">
            <button
              onClick={() => changeHeading(1)}
              className="min-w-[40px] min-h-[36px] px-2 py-1 bg-bridge-panelLight border border-bridge-border text-bridge-text rounded text-[11px] font-bold active:bg-bridge-accent active:text-bridge-bg"
            >
              +1°
            </button>
            <button
              onClick={() => changeHeading(10)}
              className="min-w-[40px] min-h-[36px] px-2 py-1 bg-bridge-panelLight border border-bridge-border text-bridge-text rounded text-[11px] font-bold active:bg-bridge-accent active:text-bridge-bg"
            >
              +10°
            </button>
          </div>
        </div>

        {/* 3. 四大补给品与快捷损管/造水机指示条 (Mini Logistics & Auxiliary Strip) */}
        <div className="bg-bridge-panel/90 backdrop-blur border border-bridge-border rounded-xl px-2.5 py-1 flex items-center justify-between gap-2 text-[9px] shadow-lg">
          <div className="flex-1 grid grid-cols-5 gap-1.5 items-center">
            {/* 船体 HP (点击打开船坞修理页) */}
            <button
              type="button"
              onClick={() => handleOpenNearestPortTrade("REPAIR")}
              className="flex items-center space-x-1 hover:bg-bridge-panelLight/60 px-1 py-0.5 rounded transition-colors cursor-pointer"
              title={`${t.hud.hull}: ${hpPct}%`}
            >
              <Shield
                size={11}
                className={hpPct > 50 ? "text-bridge-safe" : "text-bridge-danger"}
              />
              <div className="flex-1 h-1.5 bg-bridge-bg rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    hpPct > 50 ? "bg-bridge-safe" : "bg-bridge-danger"
                  }`}
                  style={{ width: `${hpPct}%` }}
                />
              </div>
            </button>

            {/* 燃油 (点击打开物资补给页) */}
            <button
              type="button"
              onClick={() => handleOpenNearestPortTrade("SUPPLIES")}
              className="flex items-center space-x-1 hover:bg-bridge-panelLight/60 px-1 py-0.5 rounded transition-colors cursor-pointer"
              title={`${t.hud.fuel}: ${fuelPct}%`}
            >
              <Fuel size={11} className="text-amber-400" />
              <div className="flex-1 h-1.5 bg-bridge-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${fuelPct}%` }}
                />
              </div>
            </button>

            {/* 淡水 (点击打开物资补给页) */}
            <button
              type="button"
              onClick={() => handleOpenNearestPortTrade("SUPPLIES")}
              className="flex items-center space-x-1 hover:bg-bridge-panelLight/60 px-1 py-0.5 rounded transition-colors cursor-pointer"
              title={`${t.hud.water}: ${waterPct}%`}
            >
              <Droplets size={11} className="text-sky-400" />
              <div className="flex-1 h-1.5 bg-bridge-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 transition-all duration-300"
                  style={{ width: `${waterPct}%` }}
                />
              </div>
            </button>

            {/* 口粮 (点击打开物资补给页) */}
            <button
              type="button"
              onClick={() => handleOpenNearestPortTrade("SUPPLIES")}
              className="flex items-center space-x-1 hover:bg-bridge-panelLight/60 px-1 py-0.5 rounded transition-colors cursor-pointer"
              title={`${t.hud.ration}: ${rationPct}%`}
            >
              <Utensils size={11} className="text-emerald-400" />
              <div className="flex-1 h-1.5 bg-bridge-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${rationPct}%` }}
                />
              </div>
            </button>

            {/* 备件 (点击打开物资补给页) */}
            <button
              type="button"
              onClick={() => handleOpenNearestPortTrade("SUPPLIES")}
              className="flex items-center space-x-1 hover:bg-bridge-panelLight/60 px-1 py-0.5 rounded transition-colors cursor-pointer"
              title={`${t.hud.parts}: ${partsPct}%`}
            >
              <Wrench size={10} className="text-purple-400" />
              <div className="flex-1 h-1.5 bg-bridge-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 transition-all duration-300"
                  style={{ width: `${partsPct}%` }}
                />
              </div>
            </button>
          </div>

          {/* 快捷补给 / 应急抢修 / RO 造水机按钮 */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenNearestPortTrade("SUPPLIES")}
              className="px-2 py-0.5 rounded bg-bridge-safe/20 hover:bg-bridge-safe hover:text-bridge-bg border border-bridge-safe/50 text-bridge-safe text-[9px] font-bold flex items-center space-x-1 transition-all cursor-pointer"
            >
              <Fuel size={10} />
              <span>{language === "zh" ? "补给" : "Supply"}</span>
            </button>

            {hasRoUpgrade && (
              <button
                onClick={toggleWaterMaker}
                className={`px-1.5 py-0.5 rounded border text-[9px] font-bold flex items-center space-x-1 ${
                  roWaterMakerEnabled
                    ? "bg-sky-500/30 border-sky-400 text-sky-300"
                    : "bg-bridge-panelLight border-bridge-border text-bridge-textMuted"
                }`}
              >
                <Droplets size={10} />
                <span>{t.hud.roMaker}</span>
              </button>
            )}

            {hpPct < 100 && activeVessel.supplies.sparePartsT >= 0.1 && (
              <button
                onClick={handleEmergencySeaRepair}
                className="px-1.5 py-0.5 rounded bg-amber-500/25 border border-amber-400 text-amber-300 text-[9px] font-bold flex items-center space-x-1"
              >
                <Hammer size={10} />
                <span>{t.hud.seaRepair}</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. 手机端 5 键核心海事功能 Dock 栏 */}
        <div className="bg-bridge-panel/95 backdrop-blur border border-bridge-border rounded-2xl p-1.5 flex items-center justify-between gap-1 shadow-2xl">
          {/* 大圆航线规划 / 引航 */}
          <button
            onClick={() => openModal("ROUTE_PLANNER")}
            className={`flex-1 min-w-0 min-h-[44px] py-1.5 px-1 flex flex-col items-center justify-center rounded-xl text-[10px] transition-all ${
              autopilotEnabled
                ? "bg-bridge-highlight text-bridge-bg font-bold shadow-[0_0_10px_#56D9E8]"
                : "text-bridge-highlight hover:bg-bridge-panelLight"
            }`}
          >
            <Navigation size={16} className={autopilotEnabled ? "animate-spin" : ""} />
            <span className="mt-0.5 truncate w-full text-center">
              {autopilotEnabled ? t.dock.autopilotEngaged : t.dock.routePlan}
            </span>
          </button>

          {/* 港口贸易 (自动定位最近港口) */}
          <button
            onClick={() => handleOpenNearestPortTrade("COMMODITIES")}
            className="flex-1 min-w-0 min-h-[44px] py-1.5 px-1 flex flex-col items-center justify-center rounded-xl text-[10px] text-bridge-textMuted hover:text-white hover:bg-bridge-panelLight transition-all"
          >
            <ShoppingBag size={16} className="text-bridge-safe" />
            <span className="mt-0.5 truncate w-full text-center">
              {t.dock.portTrade}
            </span>
          </button>

          {/* 船厂与改装 */}
          <button
            onClick={() => openModal("SHIPYARD")}
            className="flex-1 min-w-0 min-h-[44px] py-1.5 px-1 flex flex-col items-center justify-center rounded-xl text-[10px] text-bridge-textMuted hover:text-white hover:bg-bridge-panelLight transition-all"
          >
            <Wrench size={16} className="text-amber-400" />
            <span className="mt-0.5 truncate w-full text-center">
              {t.dock.shipyard}
            </span>
          </button>

          {/* AIS 船队雷达 */}
          <button
            onClick={() => openModal("AIS_DETAIL")}
            className="flex-1 min-w-0 min-h-[44px] py-1.5 px-1 flex flex-col items-center justify-center rounded-xl text-[10px] text-bridge-textMuted hover:text-white hover:bg-bridge-panelLight transition-all"
          >
            <Radio size={16} className="text-sky-400" />
            <span className="mt-0.5 truncate w-full text-center">
              {t.dock.aisFleet}
            </span>
          </button>

          {/* 更多功能 (日志 / 合约 / Mayday) */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="flex-1 min-w-0 min-h-[44px] py-1.5 px-1 flex flex-col items-center justify-center rounded-xl text-[10px] text-bridge-textMuted hover:text-white hover:bg-bridge-panelLight transition-all relative"
          >
            <span className="text-base leading-none">⋯</span>
            <span className="mt-0.5 truncate w-full text-center">
              {t.hud.menuMobile}
            </span>

            {showMoreMenu && (
              <div
                className="absolute bottom-full mb-2 right-0 bg-bridge-panel border border-bridge-border rounded-xl p-1.5 shadow-2xl z-50 flex flex-col space-y-1 min-w-[145px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    openModal("JOURNAL");
                    setShowMoreMenu(false);
                  }}
                  className="px-2.5 py-2 text-left text-xs rounded hover:bg-bridge-panelLight flex items-center space-x-2 text-white"
                >
                  <BookOpen size={13} className="text-bridge-highlight" />
                  <span>{t.dock.journal}</span>
                </button>
                <button
                  onClick={() => {
                    handleEmergencySeaRepair();
                    setShowMoreMenu(false);
                  }}
                  className="px-2.5 py-2 text-left text-xs rounded hover:bg-bridge-panelLight flex items-center space-x-2 text-amber-300"
                >
                  <Hammer size={13} />
                  <span>{t.hud.seaRepair}</span>
                </button>
                <button
                  onClick={() => {
                    openModal("MAYDAY");
                    setShowMoreMenu(false);
                  }}
                  className="px-2.5 py-2 text-left text-xs rounded hover:bg-red-500/20 flex items-center space-x-2 text-bridge-danger font-bold"
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
