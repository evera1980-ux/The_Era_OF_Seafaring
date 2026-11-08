import React, { useState } from "react";
import { useGameStore } from "../../store";
import { EngineTelegraph } from "../../types";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "../../i18n";
import { VESSELS } from "../../config/vessels";
import { SeaWindowWidget } from "./SeaWindowWidget";
import { calculateApparentWindAngle } from "../../core/physics/sail";
import {
  selectHourlyFuelBurnKgH,
  selectMaxRangeNM,
} from "../../store/selectors/shipSelectors";
import { portService } from "../../services/ports/portService";
import { GameAsset } from "../common/GameAsset";

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

  // Helper to render a circular SVG progress ring gauge for supplies & hull
  const renderSupplyRing = (opts: {
    key: string;
    assetKey: string;
    label: string;
    pct: number;
    strokeColor: string;
    textColor: string;
    onClick: () => void;
  }) => {
    const radius = 21;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, opts.pct));
    const dashOffset = circumference - (clamped / 100) * circumference;

    return (
      <button
        key={opts.key}
        type="button"
        onClick={opts.onClick}
        title={`${opts.label}: ${clamped}%`}
        className="group relative w-13 h-13 sm:w-14 sm:h-14 flex flex-col items-center justify-center rounded-full active:scale-90 transition-transform cursor-pointer"
      >
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 [filter:drop-shadow(0_3px_8px_rgba(0,0,0,0.92))]"
          viewBox="0 0 52 52"
        >
          {/* 环形半透明底槽 */}
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="rgba(6, 14, 28, 0.68)"
            stroke="rgba(148, 163, 184, 0.22)"
            strokeWidth="3.5"
          />
          {/* 动态进度弧 */}
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke={clamped < 25 ? "#F43F5E" : opts.strokeColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-300"
          />
        </svg>

        <GameAsset
          assetKey={opts.assetKey}
          width={18}
          height={18}
          className="relative z-10 w-4 h-4 object-contain group-hover:scale-110 transition-transform [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.95))]"
        />
        <span
          className={`relative z-10 text-[9px] font-extrabold leading-none mt-0.5 tabular-nums [text-shadow:0_1px_3px_#000] ${
            clamped < 25 ? "text-rose-400" : opts.textColor
          }`}
        >
          {clamped}%
        </span>
        <span className="text-[8px] text-slate-300 font-bold leading-none mt-0.5 [text-shadow:0_1px_3px_#000,0_0_6px_#000]">
          {opts.label}
        </span>
      </button>
    );
  };

  // Active telegraph index (0..5) for circular arc visualization
  const activeTelegraphIdx = Math.max(0, TELEGRAPHS.indexOf(activeVessel.engineTelegraph));
  const telegraphArcRadius = 78;
  const telegraphArcCircumference = Math.PI * telegraphArcRadius; // 180 deg upper semicircle
  const telegraphArcFill =
    (activeTelegraphIdx / (TELEGRAPHS.length - 1)) * telegraphArcCircumference;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between font-mono z-10 select-none">
      {/* 顶部悬浮海况遥测（去除胶丸线框，采用紧凑高对比度文字，防止与左上角经纬度重叠或溢出） */}
      <div className="px-2.5 pt-2 flex justify-end items-start">
        <div className="pointer-events-auto flex flex-col items-end space-y-1 max-w-[52vw] sm:max-w-none">
          <button
            type="button"
            onClick={() => setShowMetDetail(!showMetDetail)}
            className="flex items-center space-x-1 sm:space-x-1.5 text-[10px] sm:text-[11px] tabular-nums cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap [text-shadow:0_1px_4px_rgba(0,0,0,0.98),0_0_10px_rgba(0,0,0,0.9)]"
          >
            <GameAsset
              assetKey="hud_waves"
              width={16}
              height={16}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 object-contain [filter:drop-shadow(0_1px_4px_rgba(0,0,0,0.95))]"
            />
            <span className="text-white font-extrabold">
              Hs {weather.significantWaveHeightM.toFixed(1)}m
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-200 font-semibold">BF{weather.beaufortScale}</span>
            <span className="text-slate-400">·</span>
            <span
              className={`font-extrabold ${
                isInNoGoZone
                  ? "text-rose-400"
                  : isOptimalTrim
                  ? "text-emerald-300"
                  : "text-sky-300"
              }`}
            >
              <span className="hidden sm:inline">{t.hud.awa} </span>
              {awaDeg}°
            </span>
            <ChevronDown
              size={12}
              className={`text-slate-300 shrink-0 transition-transform [filter:drop-shadow(0_1px_3px_#000)] ${
                showMetDetail ? "rotate-180" : ""
              }`}
            />
          </button>

          {isInNoGoZone && (
            <div className="text-[10px] text-rose-400 font-extrabold [text-shadow:0_1px_4px_#000,0_0_8px_#000]">
              ⚠️ {t.hud.noGoZone} ({awaDeg}°)
            </div>
          )}
          {!isInNoGoZone && isOptimalTrim && (
            <div className="text-[10px] text-emerald-300 font-extrabold [text-shadow:0_1px_4px_#000,0_0_8px_#000]">
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

      {/* 屏幕中部: 异常报警提示 */}
      {systemLogs.length > 0 && systemLogs[0].type !== "INFO" && (
        <div className="self-center pointer-events-auto bg-[#071120]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] text-amber-300 flex items-center space-x-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.85)] mx-4 max-w-[92vw]">
          <GameAsset
            assetKey="hazard_shallow"
            width={16}
            height={16}
            className="w-4 h-4 shrink-0 object-contain"
          />
          <span className="font-bold shrink-0">{t.hud.alertTitle}:</span>
          <span className="truncate">{systemLogs[0].text}</span>
        </div>
      )}

      {/* 底部圆形/环形集成驾驶台 + 无背景无边框底部功能导航 */}
      <div className="pointer-events-auto w-full max-w-2xl mx-auto px-2 pb-safe flex flex-col items-center space-y-1">
        {/* 环形车钟弧形档位选择器 (Radial Telegraph Crown) */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-0.5">
          {TELEGRAPHS.map((gear) => {
            const isActive = activeVessel.engineTelegraph === gear;
            const isDanger = gear === "FLANK";
            const isStop = gear === "STOP";

            let activeTone =
              "bg-cyan-400 text-slate-950 font-black shadow-[0_0_14px_rgba(53,198,216,0.9)] scale-105";
            if (isDanger) {
              activeTone =
                "bg-rose-500 text-white font-black shadow-[0_0_14px_rgba(244,63,94,0.9)] scale-105";
            } else if (isStop) {
              activeTone =
                "bg-slate-600 text-white font-extrabold shadow-[0_0_10px_rgba(148,163,184,0.6)] scale-105";
            }

            return (
              <button
                key={gear}
                type="button"
                onClick={() => setTelegraph(gear)}
                className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? activeTone
                    : "bg-[#060E1C]/65 text-slate-300 hover:text-white [text-shadow:0_1px_3px_#000] shadow-[0_2px_8px_rgba(0,0,0,0.75)]"
                }`}
              >
                {gear}
              </button>
            );
          })}
        </div>

        {/* 核心圆型/环形集成组合表 (左翼环形补给 + 中央罗经航速车钟集成圆盘 + 右翼环形补给) */}
        <div className="w-full flex items-center justify-center gap-1.5 sm:gap-3">
          {/* 左翼卫星环形表：船体 · 燃油 · 淡水 */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {renderSupplyRing({
              key: "hull",
              assetKey: "hud_hull",
              label: language === "zh" ? "船体" : "HULL",
              pct: hpPct,
              strokeColor: "#34D399",
              textColor: "text-emerald-300",
              onClick: () => handleOpenNearestPortTrade("REPAIR"),
            })}
            {renderSupplyRing({
              key: "fuel",
              assetKey: "hud_fuel",
              label: language === "zh" ? "燃油" : "FUEL",
              pct: fuelPct,
              strokeColor: "#FBBF24",
              textColor: "text-amber-300",
              onClick: () => handleOpenNearestPortTrade("SUPPLIES"),
            })}
            {renderSupplyRing({
              key: "water",
              assetKey: "hud_water",
              label: language === "zh" ? "淡水" : "H2O",
              pct: waterPct,
              strokeColor: "#38BDF8",
              textColor: "text-sky-300",
              onClick: () => handleOpenNearestPortTrade("SUPPLIES"),
            })}
          </div>

          {/* 中央圆型罗经·航向·航速·车钟功率弧集成主表盘 */}
          <div className="relative w-40 h-40 sm:w-44 sm:h-44 shrink-0 flex items-center justify-center">
            <svg
              className="absolute inset-0 w-full h-full [filter:drop-shadow(0_6px_20px_rgba(0,0,0,0.92))]"
              viewBox="0 0 180 180"
            >
              <defs>
                <radialGradient id="bridgeDialCore" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0B192E" stopOpacity="0.88" />
                  <stop offset="75%" stopColor="#060E1C" stopOpacity="0.84" />
                  <stop offset="100%" stopColor="#030710" stopOpacity="0.92" />
                </radialGradient>
              </defs>

              {/* 主圆盘半透明深海玻璃底盘 */}
              <circle cx="90" cy="90" r="84" fill="url(#bridgeDialCore)" />

              {/* 外圈车钟推力能量环（上半圆弧 180°） */}
              <path
                d="M 12 90 A 78 78 0 0 1 168 90"
                fill="none"
                stroke="rgba(148, 163, 184, 0.18)"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <path
                d="M 12 90 A 78 78 0 0 1 168 90"
                fill="none"
                stroke={
                  activeVessel.engineTelegraph === "FLANK"
                    ? "#F43F5E"
                    : activeVessel.engineTelegraph === "STOP"
                    ? "#64748B"
                    : "#35C6D8"
                }
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={telegraphArcCircumference}
                strokeDashoffset={telegraphArcCircumference - telegraphArcFill}
                className="transition-all duration-300"
              />

              {/* 下半圆续航状态弧 */}
              <path
                d="M 168 90 A 78 78 0 0 1 12 90"
                fill="none"
                stroke="rgba(52, 211, 153, 0.25)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* 动态旋转 360° 罗经刻度内环 */}
              <g
                style={{
                  transform: `rotate(${-activeVessel.headingDeg}deg)`,
                  transformOrigin: "90px 90px",
                  transition: "transform 300ms ease-out",
                }}
              >
                <circle
                  cx="90"
                  cy="90"
                  r="64"
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.22)"
                  strokeWidth="1.2"
                  strokeDasharray="2 6"
                />
                <text
                  x="90"
                  y="32"
                  textAnchor="middle"
                  fill="#F43F5E"
                  fontSize="9"
                  fontWeight="bold"
                >
                  N
                </text>
                <text
                  x="151"
                  y="93"
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="8"
                >
                  E
                </text>
                <text
                  x="90"
                  y="153"
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="8"
                >
                  S
                </text>
                <text
                  x="29"
                  y="93"
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="8"
                >
                  W
                </text>
              </g>

              {/* 视风向指针 (AWA Pointer) */}
              <g
                style={{
                  transform: `rotate(${weather.windDirectionDeg - activeVessel.headingDeg}deg)`,
                  transformOrigin: "90px 90px",
                  transition: "transform 300ms ease-out",
                }}
              >
                <polygon points="90,15 86,25 94,25" fill="#38BDF8" />
              </g>

              {/* 船首向基准顶点三角 */}
              <polygon points="90,6 86,14 94,14" fill="#FBBF24" />
            </svg>

            {/* 左弦微调舵角弧形按钮 (-10° / -1°) */}
            <div className="absolute left-1.5 inset-y-0 flex flex-col justify-center space-y-1 z-20">
              <button
                type="button"
                onClick={() => changeHeading(-10)}
                className="w-8 h-7 rounded-full bg-white/8 hover:bg-cyan-400/25 active:scale-90 text-[10px] font-extrabold text-cyan-200 flex items-center justify-center transition-all cursor-pointer [text-shadow:0_1px_2px_#000]"
                title="-10°"
              >
                -10°
              </button>
              <button
                type="button"
                onClick={() => changeHeading(-1)}
                className="w-8 h-7 rounded-full bg-white/8 hover:bg-cyan-400/25 active:scale-90 text-[10px] font-bold text-slate-200 flex items-center justify-center transition-all cursor-pointer [text-shadow:0_1px_2px_#000]"
                title="-1°"
              >
                -1°
              </button>
            </div>

            {/* 中央核心数字仪表读数：航向 HDG + 航速 SOG + 车钟/油耗 */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center pointer-events-none px-6">
              <div className="text-[10px] text-cyan-300 font-bold tracking-wider leading-none">
                HDG <span className="text-white font-black text-xs tabular-nums">{Math.round(activeVessel.headingDeg)}°</span>
              </div>

              <div className="my-1 flex items-baseline space-x-0.5 tabular-nums">
                <span className="text-2xl sm:text-[26px] font-black text-emerald-300 leading-none tracking-tight [text-shadow:0_0_12px_rgba(52,211,153,0.45)]">
                  {activeVessel.sogKn.toFixed(1)}
                </span>
                <span className="text-[10px] text-emerald-200/80 font-bold">
                  {t.common.knots}
                </span>
              </div>

              <div className="text-[9px] text-amber-300/95 font-bold tabular-nums leading-tight">
                {hourlyFuelKgH}kg/h
              </div>
              <div className="text-[8px] text-slate-400 font-semibold tabular-nums leading-tight mt-0.5">
                {activeVessel.engineTelegraph} · {maxRangeNM}NM
              </div>
            </div>

            {/* 右弦微调舵角弧形按钮 (+10° / +1°) */}
            <div className="absolute right-1.5 inset-y-0 flex flex-col justify-center space-y-1 z-20">
              <button
                type="button"
                onClick={() => changeHeading(10)}
                className="w-8 h-7 rounded-full bg-white/8 hover:bg-cyan-400/25 active:scale-90 text-[10px] font-extrabold text-cyan-200 flex items-center justify-center transition-all cursor-pointer [text-shadow:0_1px_2px_#000]"
                title="+10°"
              >
                +10°
              </button>
              <button
                type="button"
                onClick={() => changeHeading(1)}
                className="w-8 h-7 rounded-full bg-white/8 hover:bg-cyan-400/25 active:scale-90 text-[10px] font-bold text-slate-200 flex items-center justify-center transition-all cursor-pointer [text-shadow:0_1px_2px_#000]"
                title="+1°"
              >
                +1°
              </button>
            </div>
          </div>

          {/* 右翼卫星环形表：口粮 · 备件 · 快捷补给/RO */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {renderSupplyRing({
              key: "ration",
              assetKey: "hud_food",
              label: language === "zh" ? "口粮" : "FOOD",
              pct: rationPct,
              strokeColor: "#10B981",
              textColor: "text-emerald-300",
              onClick: () => handleOpenNearestPortTrade("SUPPLIES"),
            })}
            {renderSupplyRing({
              key: "parts",
              assetKey: "hud_parts",
              label: language === "zh" ? "备件" : "PART",
              pct: partsPct,
              strokeColor: "#A78BFA",
              textColor: "text-violet-300",
              onClick: () => handleOpenNearestPortTrade("SUPPLIES"),
            })}

            {/* 一键补给 / 损管环形触发器 */}
            <div className="flex flex-col items-center space-y-1">
              <button
                type="button"
                onClick={() => handleOpenNearestPortTrade("SUPPLIES")}
                className="w-12 h-12 rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 active:scale-90 flex flex-col items-center justify-center transition-all cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.85)]"
                title={language === "zh" ? "前往最近港口补给" : "Open Port Supplies"}
              >
                <GameAsset
                  assetKey="hud_fuel"
                  width={18}
                  height={18}
                  className="w-4 h-4 object-contain [filter:drop-shadow(0_1px_3px_#000)]"
                />
                <span className="text-[9px] font-extrabold text-emerald-300 leading-none mt-0.5 [text-shadow:0_1px_3px_#000]">
                  {language === "zh" ? "补给" : "SUPP"}
                </span>
              </button>

              {hasRoUpgrade && (
                <button
                  type="button"
                  onClick={toggleWaterMaker}
                  className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold transition-all cursor-pointer [text-shadow:0_1px_2px_#000] ${
                    roWaterMakerEnabled
                      ? "bg-sky-400/30 text-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                      : "bg-slate-900/70 text-slate-400"
                  }`}
                >
                  RO {roWaterMakerEnabled ? "ON" : "OFF"}
                </button>
              )}

              {hpPct < 100 && activeVessel.supplies.sparePartsT >= 0.1 && (
                <button
                  type="button"
                  onClick={handleEmergencySeaRepair}
                  className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 text-[8px] font-extrabold cursor-pointer [text-shadow:0_1px_2px_#000]"
                >
                  {t.hud.seaRepair}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 底部 5 键核心海事功能导航（去掉深色背景和边框，保留独立高对比度按钮，图标放大 50%） */}
        <nav className="w-full pt-1 pb-1.5 flex items-center justify-around gap-2">
          {/* 1. 大圆航线规划 / 引航 */}
          <button
            type="button"
            onClick={() => openModal("ROUTE_PLANNER")}
            className="flex-1 min-w-0 min-h-[64px] py-1 px-1 flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer group"
          >
            <GameAsset
              assetKey="hud_route_nav"
              width={42}
              height={42}
              className={`w-[42px] h-[42px] object-contain group-hover:scale-110 transition-transform [filter:drop-shadow(0_3px_6px_rgba(0,0,0,0.95))_drop-shadow(0_0_10px_rgba(53,198,216,0.45))] ${
                autopilotEnabled ? "animate-spin" : ""
              }`}
            />
            <span
              className={`mt-1 text-[11px] font-extrabold truncate w-full text-center [text-shadow:0_1px_4px_#000,0_0_8px_#000] ${
                autopilotEnabled ? "text-cyan-300" : "text-slate-100 group-hover:text-cyan-300"
              }`}
            >
              {autopilotEnabled ? t.dock.autopilotEngaged : t.dock.routePlan}
            </span>
          </button>

          {/* 2. 港口贸易 */}
          <button
            type="button"
            onClick={() => handleOpenNearestPortTrade("COMMODITIES")}
            className="flex-1 min-w-0 min-h-[64px] py-1 px-1 flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer group"
          >
            <GameAsset
              assetKey="hud_port_trade"
              width={42}
              height={42}
              className="w-[42px] h-[42px] object-contain group-hover:scale-110 transition-transform [filter:drop-shadow(0_3px_6px_rgba(0,0,0,0.95))_drop-shadow(0_0_10px_rgba(245,158,11,0.35))]"
            />
            <span className="mt-1 text-[11px] font-extrabold text-slate-100 group-hover:text-amber-300 truncate w-full text-center [text-shadow:0_1px_4px_#000,0_0_8px_#000]">
              {t.dock.portTrade}
            </span>
          </button>

          {/* 3. 船厂与改装 */}
          <button
            type="button"
            onClick={() => openModal("SHIPYARD")}
            className="flex-1 min-w-0 min-h-[64px] py-1 px-1 flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer group"
          >
            <GameAsset
              assetKey="hud_shipyard"
              width={42}
              height={42}
              className="w-[42px] h-[42px] object-contain group-hover:scale-110 transition-transform [filter:drop-shadow(0_3px_6px_rgba(0,0,0,0.95))_drop-shadow(0_0_10px_rgba(56,189,248,0.35))]"
            />
            <span className="mt-1 text-[11px] font-extrabold text-slate-100 group-hover:text-sky-300 truncate w-full text-center [text-shadow:0_1px_4px_#000,0_0_8px_#000]">
              {t.dock.shipyard}
            </span>
          </button>

          {/* 4. AIS 船队雷达 */}
          <button
            type="button"
            onClick={() => openModal("AIS_DETAIL")}
            className="flex-1 min-w-0 min-h-[64px] py-1 px-1 flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer group"
          >
            <GameAsset
              assetKey="hud_ais_radar"
              width={42}
              height={42}
              className="w-[42px] h-[42px] object-contain group-hover:scale-110 transition-transform [filter:drop-shadow(0_3px_6px_rgba(0,0,0,0.95))_drop-shadow(0_0_10px_rgba(16,185,129,0.4))]"
            />
            <span className="mt-1 text-[11px] font-extrabold text-slate-100 group-hover:text-emerald-300 truncate w-full text-center [text-shadow:0_1px_4px_#000,0_0_8px_#000]">
              {t.dock.aisFleet}
            </span>
          </button>

          {/* 5. 更多功能 (日志 / 损管 / Mayday) */}
          <div className="flex-1 min-w-0 relative flex justify-center">
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="w-full min-h-[64px] py-1 px-1 flex flex-col items-center justify-center active:scale-90 transition-transform cursor-pointer group"
            >
              <GameAsset
                assetKey="hud_journal"
                width={42}
                height={42}
                className="w-[42px] h-[42px] object-contain group-hover:scale-110 transition-transform [filter:drop-shadow(0_3px_6px_rgba(0,0,0,0.95))_drop-shadow(0_0_10px_rgba(56,189,248,0.35))]"
              />
              <span className="mt-1 text-[11px] font-extrabold text-slate-100 group-hover:text-cyan-300 truncate w-full text-center [text-shadow:0_1px_4px_#000,0_0_8px_#000]">
                {t.hud.menuMobile}
              </span>
            </button>

            {showMoreMenu && (
              <div
                className="absolute bottom-full mb-2 right-0 bg-[#071120]/95 backdrop-blur-xl rounded-2xl p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.9)] z-50 flex flex-col space-y-1 min-w-[156px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    openModal("JOURNAL");
                    setShowMoreMenu(false);
                  }}
                  className="px-3 py-2 text-left text-xs rounded-xl hover:bg-white/10 flex items-center space-x-2.5 text-white font-bold cursor-pointer"
                >
                  <GameAsset
                    assetKey="hud_journal"
                    width={24}
                    height={24}
                    className="w-6 h-6 shrink-0 object-contain"
                  />
                  <span>{t.dock.journal}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleEmergencySeaRepair();
                    setShowMoreMenu(false);
                  }}
                  className="px-3 py-2 text-left text-xs rounded-xl hover:bg-white/10 flex items-center space-x-2.5 text-amber-300 font-bold cursor-pointer"
                >
                  <GameAsset
                    assetKey="hud_parts"
                    width={24}
                    height={24}
                    className="w-6 h-6 shrink-0 object-contain"
                  />
                  <span>{t.hud.seaRepair}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal("MAYDAY");
                    setShowMoreMenu(false);
                  }}
                  className="px-3 py-2 text-left text-xs rounded-xl hover:bg-rose-500/20 flex items-center space-x-2.5 text-rose-400 font-extrabold cursor-pointer"
                >
                  <GameAsset
                    assetKey="hazard_mayday"
                    width={24}
                    height={24}
                    className="w-6 h-6 shrink-0 object-contain"
                  />
                  <span>{t.dock.mayday}</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};
