import React, { useState } from "react";
import { useGameStore } from "../../store";
import { PORTS } from "../../config/ports";
import { VESSELS } from "../../config/vessels";
import { createPassagePlan } from "../../core/route/routePlanner";
import { validateRouteFeasibility } from "../../core/route/routeValidation";
import { calculateDistanceNM } from "../../core/physics/navigation";
import {
  X,
  Navigation,
  Compass,
  MapPin,
  Play,
  Clock,
  ShieldAlert,
  Fuel,
  AlertTriangle,
  CheckCircle2,
  Lock,
  CloudSun,
  Award,
} from "lucide-react";
import { RouteWaypoint, makeGameHours, makeNM } from "../../types";
import { useTranslation } from "../../i18n";
import { MARITIME_LICENSES } from "../../store/slices/worldSlice";
import { GameAsset } from "../common/GameAsset";

export const RoutePlannerModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const openModal = useGameStore((state) => state.openModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const activeVessel = useGameStore((state) => state.activeVessel);
  const playerCredits = useGameStore((state) => state.playerCredits);
  const deductCredits = useGameStore((state) => state.deductCredits);
  const licenseId = useGameStore((state) => state.licenseId);
  const commandCenterBuilt = useGameStore((state) => state.commandCenterBuilt);
  const weatherRoutingActive = useGameStore((state) => state.weatherRoutingActive);
  const setWeatherRouting = useGameStore((state) => state.setWeatherRouting);
  const canalVipPassActive = useGameStore((state) => state.canalVipPassActive);
  const canalVipOwned = useGameStore((state) => state.canalVipOwned);
  const setCanalVipPass = useGameStore((state) => state.setCanalVipPass);
  const setPlannedRoute = useGameStore((state) => state.setPlannedRoute);
  const setAutopilot = useGameStore((state) => state.setAutopilot);
  const setEngineTelegraph = useGameStore((state) => state.setEngineTelegraph);
  const addLog = useGameStore((state) => state.addLog);
  const { t, language } = useTranslation();

  const [selectedPortId, setSelectedPortId] = useState<string>("JPYOK");
  const [useWeatherRoutingForTrip, setUseWeatherRoutingForTrip] = useState<boolean>(
    weatherRoutingActive
  );
  const [useCanalVipForTrip, setUseCanalVipForTrip] = useState<boolean>(
    canalVipPassActive || canalVipOwned
  );

  const setHeadingDeg = useGameStore((state) => state.setHeadingDeg);
  const gameClock = useGameStore((state) => state.gameClock);
  const togglePause = useGameStore((state) => state.togglePause);
  const setTimeScale = useGameStore((state) => state.setTimeScale);

  if (activeModal !== "ROUTE_PLANNER") return null;

  const portsList = Object.values(PORTS);
  const targetPort = PORTS[selectedPortId] || portsList[0];
  const vesselSpec = VESSELS[activeVessel.vesselId] ?? VESSELS.V001;
  const currentLicense = MARITIME_LICENSES[licenseId] ?? MARITIME_LICENSES.CLASS_4;
  const maxAllowedScale = commandCenterBuilt ? 600 : currentLicense.maxTimeScale;
  const canUseWeatherRouting = currentLicense.order >= 2; // Class 2 远洋大副及以上

  const rawPlan = createPassagePlan(
    activeVessel.position,
    targetPort,
    activeVessel.sogKn > 1 ? activeVessel.sogKn : vesselSpec.ecoSpeedKn,
    vesselSpec
  );

  // 岸基气象路由缩短 25% 等效航程与耗时，运河 VIP 额外缩减 15% 耗时
  const distanceFactor = useWeatherRoutingForTrip ? 0.75 : 1.0;
  const durationFactor =
    (useWeatherRoutingForTrip ? 0.75 : 1.0) * (useCanalVipForTrip ? 0.85 : 1.0);

  const plan = {
    ...rawPlan,
    totalDistanceNM: makeNM(Math.round(rawPlan.totalDistanceNM * distanceFactor * 10) / 10),
    estimatedDurationGameHours: makeGameHours(
      Math.round(rawPlan.estimatedDurationGameHours * durationFactor * 10) / 10
    ),
    estimatedFuelT: Math.round(rawPlan.estimatedFuelT * distanceFactor * 100) / 100,
  };

  const feasibility = validateRouteFeasibility(
    activeVessel.currentDraftM,
    targetPort,
    plan.estimatedFuelT,
    vesselSpec
  );

  const handleStartVoyage = () => {
    // 结算岸基气象路由费用 (2,000 CR)
    if (useWeatherRoutingForTrip && !weatherRoutingActive) {
      if (deductCredits(2000)) {
        setWeatherRouting(true);
        addLog(
          language === "zh"
            ? "📡 已订购本航次【岸基气象导航路由】（-2,000 CR）：顺风顺流走廊已激活，航程缩短 25% 且免疫大浪失速！"
            : "📡 Subscribed to Shore Weather Routing (-2,000 CR): -25% voyage time & storm stall immunity active!"
        );
      } else {
        setWeatherRouting(false);
      }
    } else if (!useWeatherRoutingForTrip) {
      setWeatherRouting(false);
    }

    // 结算单次运河 VIP 绿色免检预约费用 (15,000 CR，若未持有永久运河股份)
    if (useCanalVipForTrip && !canalVipOwned && !canalVipPassActive) {
      if (deductCredits(15000)) {
        setCanalVipPass(true);
        addLog(
          language === "zh"
            ? "🚢 已激活本航次【运河 VIP 绿色免检预约】（-15,000 CR）：享受优先通航与 +20% 航道通行效率！"
            : "🚢 Canal VIP Priority Pass activated (-15,000 CR): +20% transit speed!"
        );
      }
    } else if (canalVipOwned) {
      setCanalVipPass(true);
    }

    setPlannedRoute(plan);
    setAutopilot(true);
    if (activeVessel.engineTelegraph === "STOP") {
      setEngineTelegraph("FULL");
    }
    if (plan.waypoints.length > 0) {
      const firstWp = plan.waypoints[0];
      const dLon =
        ((firstWp.position.longitude - activeVessel.position.longitude) * Math.PI) / 180;
      const lat1 = (activeVessel.position.latitude * Math.PI) / 180;
      const lat2 = (firstWp.position.latitude * Math.PI) / 180;
      const y = Math.sin(dLon) * Math.cos(lat2);
      const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
      const initialBearing = Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
      setHeadingDeg(initialBearing);
    }
    if (gameClock.paused) {
      togglePause();
    }
    const scaleDesc =
      gameClock.timeScale === 1
        ? language === "zh"
          ? "1× 真实世界 1:1 实时航速"
          : "1x Real-World 1:1 Speed"
        : `${gameClock.timeScale}×`;
    const logMsg =
      language === "zh"
        ? `🧭 海上航线已加载！目的港：${targetPort.name} (${Math.round(plan.totalDistanceNM)} NM)，当前时间倍率：${scaleDesc}。自动舵已接管航向！`
        : `🧭 Maritime route loaded! Destination: ${targetPort.name} (${Math.round(plan.totalDistanceNM)} NM) at ${scaleDesc}. Autopilot engaged!`;
    addLog(logMsg, "INFO");
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end md:items-center justify-center font-mono">
      <div className="bg-bridge-panel border-t md:border border-bridge-border rounded-t-2xl md:rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] pb-safe animate-in slide-in-from-bottom duration-200">
        {/* 头部 */}
        <div className="px-4 py-3 md:px-6 md:py-4 bg-bridge-panelLight/60 border-b border-bridge-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 text-bridge-highlight">
            <GameAsset
              assetKey="hud_route_nav"
              width={24}
              height={24}
              className="w-6 h-6 rounded-md object-contain"
            />
            <div>
              <div className="text-sm md:text-base font-bold text-white leading-tight">
                {t.routePlanner.title}
              </div>
              <div className="text-[10px] text-bridge-textMuted hidden sm:block">
                {t.routePlanner.subtitle}
              </div>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-bridge-textMuted hover:text-white bg-bridge-panel border border-bridge-border"
          >
            <X size={16} />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
          {/* 目的港选择 */}
          <div className="md:col-span-1 space-y-2 md:border-r md:border-bridge-border md:pr-4">
            <div className="text-xs text-bridge-textMuted font-bold">
              {t.routePlanner.selectTargetPort} ({portsList.length})
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5 max-h-[28vh] md:max-h-[54vh] overflow-y-auto pr-1">
              {portsList.map((port) => {
                const distance = calculateDistanceNM(
                  activeVessel.position,
                  port.position
                );
                const isSelected = selectedPortId === port.portId;

                return (
                  <div
                    key={port.portId}
                    onClick={() => setSelectedPortId(port.portId)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col space-y-0.5 ${
                      isSelected
                        ? "bg-bridge-accent/20 border-bridge-highlight shadow-sm"
                        : "bg-bridge-panelLight/40 border-bridge-border hover:border-bridge-highlight/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate mr-1">
                        {port.name.split(" ")[0]}
                      </span>
                      <span className="text-[10px] text-bridge-highlight font-bold shrink-0">
                        {Math.round(distance)} {t.common.nauticalMiles}
                      </span>
                    </div>
                    <div className="text-[9px] text-bridge-textMuted flex justify-between">
                      <span>{port.unlocode}</span>
                      <span>
                        {t.trade.maxDraft}: {Number(port.maxAllowedDraftM.toFixed(1))}
                        {t.common.meter}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 航线详情 */}
          <div className="md:col-span-2 flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="bg-bridge-panelLight/40 p-3 md:p-4 rounded-xl border border-bridge-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-sm md:text-base font-bold text-white flex items-center space-x-1.5 truncate">
                    <MapPin size={15} className="text-bridge-safe shrink-0" />
                    <span className="truncate">
                      {t.routePlanner.destination}: {targetPort.name}
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-bridge-panel border border-bridge-border text-bridge-safe shrink-0">
                    {targetPort.unlocode}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-1">
                  <div className="bg-bridge-panel p-2 rounded-lg border border-bridge-border flex flex-col">
                    <span className="text-bridge-textMuted text-[10px] flex items-center space-x-1">
                      <GameAsset
                        assetKey="hud_compass"
                        width={13}
                        height={13}
                        className="w-3.5 h-3.5 rounded-sm object-contain"
                      />
                      <span>{t.routePlanner.totalDistance}</span>
                    </span>
                    <span className="font-bold text-bridge-highlight mt-0.5 text-xs md:text-sm">
                      {Math.round(plan.totalDistanceNM)} {t.common.nauticalMiles}
                    </span>
                  </div>

                  <div className="bg-bridge-panel p-2 rounded-lg border border-bridge-border flex flex-col">
                    <span className="text-bridge-textMuted text-[10px] flex items-center space-x-1">
                      <Clock size={11} />
                      <span>{t.routePlanner.estimatedTime}</span>
                    </span>
                    <span className="font-bold text-amber-400 mt-0.5 text-xs md:text-sm">
                      ~{Math.round(plan.estimatedDurationGameHours)}{" "}
                      {t.common.hours}
                    </span>
                  </div>

                  <div className="bg-bridge-panel p-2 rounded-lg border border-bridge-border flex flex-col">
                    <span className="text-bridge-textMuted text-[10px] flex items-center space-x-1">
                      <GameAsset
                        assetKey="hud_fuel"
                        width={13}
                        height={13}
                        className="w-3.5 h-3.5 rounded-sm object-contain"
                      />
                      <span>{t.routePlanner.estimatedFuel}</span>
                    </span>
                    <span
                      className={`font-bold mt-0.5 text-xs md:text-sm ${
                        feasibility.hasSufficientFuelCapacity
                          ? "text-bridge-safe"
                          : "text-bridge-danger"
                      }`}
                    >
                      {plan.estimatedFuelT.toFixed(1)} {t.common.tons}
                    </span>
                  </div>

                  <div className="bg-bridge-panel p-2 rounded-lg border border-bridge-border flex flex-col">
                    <span className="text-bridge-textMuted text-[10px] flex items-center space-x-1">
                      <GameAsset
                        assetKey="hud_waves"
                        width={13}
                        height={13}
                        className="w-3.5 h-3.5 rounded-sm object-contain"
                      />
                      <span>{t.routePlanner.seaRisk}</span>
                    </span>
                    <span className="font-bold text-bridge-safe mt-0.5 text-xs md:text-sm">
                      {useWeatherRoutingForTrip
                        ? language === "zh"
                          ? "受保护 (免疫失速)"
                          : "Protected"
                        : plan.totalDistanceNM > 2000
                        ? t.routePlanner.mediumRisk
                        : t.routePlanner.lowRisk}
                    </span>
                  </div>
                </div>

                {/* 目的港吃水安全校验条 */}
                <div
                  className={`p-2 rounded-lg border text-xs flex items-center space-x-2 ${
                    feasibility.canEnterPort
                      ? "bg-emerald-950/30 border-bridge-safe/50 text-bridge-safe"
                      : "bg-red-950/40 border-bridge-danger text-bridge-danger"
                  }`}
                >
                  {feasibility.canEnterPort ? (
                    <CheckCircle2 size={14} className="shrink-0" />
                  ) : (
                    <AlertTriangle size={14} className="shrink-0" />
                  )}
                  <span>
                    {feasibility.canEnterPort
                      ? `${t.routePlanner.draftCheckSafe} (${activeVessel.currentDraftM.toFixed(1)}m / ${Number(targetPort.maxAllowedDraftM.toFixed(1))}m)`
                      : `${t.routePlanner.draftCheckDanger} (${activeVessel.currentDraftM.toFixed(1)}m > ${Number(targetPort.maxAllowedDraftM.toFixed(1))}m)`}
                  </span>
                </div>
              </div>

              {/* 航次金币特权服务：岸基气象导航路由 & 运河 VIP 绿色通道 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    useWeatherRoutingForTrip
                      ? "bg-sky-950/50 border-sky-400"
                      : "bg-bridge-panelLight/30 border-bridge-border"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-[11px] font-bold text-white flex items-center space-x-1">
                      <GameAsset
                        assetKey="PERK_WEATHER_READER"
                        width={16}
                        height={16}
                        className="w-4 h-4 rounded-sm shrink-0 object-contain"
                      />
                      <span className="truncate">
                        {language === "zh" ? "岸基气象导航路由" : "Shore Weather Routing"}
                      </span>
                    </div>
                    <div className="text-[9px] text-bridge-textMuted mt-0.5">
                      {language === "zh"
                        ? "航程缩短 25% · 免疫恶劣风浪失速 (2,000 CR/次)"
                        : "-25% Distance & Storm Stall Immunity (2,000 CR)"}
                    </div>
                  </div>
                  {canUseWeatherRouting ? (
                    <button
                      type="button"
                      onClick={() => setUseWeatherRoutingForTrip(!useWeatherRoutingForTrip)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer ${
                        useWeatherRoutingForTrip
                          ? "bg-sky-400 text-bridge-bg"
                          : "bg-bridge-panel border border-sky-400/50 text-sky-300"
                      }`}
                    >
                      {useWeatherRoutingForTrip
                        ? language === "zh"
                          ? "已启用"
                          : "Active"
                        : "2,000 CR"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openModal("JOURNAL", { journalTab: "LICENSES" })}
                      className="px-2 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[9px] font-bold shrink-0 flex items-center space-x-1 cursor-pointer"
                    >
                      <Lock size={10} />
                      <span>{language === "zh" ? "需大副资质" : "Class 2 Req"}</span>
                    </button>
                  )}
                </div>

                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    useCanalVipForTrip
                      ? "bg-amber-950/40 border-amber-400"
                      : "bg-bridge-panelLight/30 border-bridge-border"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-[11px] font-bold text-white flex items-center space-x-1">
                      <GameAsset
                        assetKey="hud_license"
                        width={16}
                        height={16}
                        className="w-4 h-4 rounded-sm shrink-0 object-contain"
                      />
                      <span className="truncate">
                        {language === "zh" ? "运河 VIP 绿色免检" : "Canal VIP Fast-Track"}
                      </span>
                    </div>
                    <div className="text-[9px] text-bridge-textMuted mt-0.5">
                      {canalVipOwned
                        ? language === "zh"
                          ? "永久股东特权已生效 (+20% 通航速度)"
                          : "Permanent Shareholder (+20% Transit Speed)"
                        : language === "zh"
                        ? "优先过闸免排队 · 耗时缩短 15% (15,000 CR/次)"
                        : "Priority Canal Transit · -15% Time (15,000 CR)"}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={canalVipOwned || (!useCanalVipForTrip && playerCredits < 15000)}
                    onClick={() => setUseCanalVipForTrip(!useCanalVipForTrip)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer disabled:opacity-60 ${
                      useCanalVipForTrip || canalVipOwned
                        ? "bg-amber-400 text-bridge-bg"
                        : "bg-bridge-panel border border-amber-400/50 text-amber-300"
                    }`}
                  >
                    {canalVipOwned
                      ? language === "zh"
                        ? "永久免费"
                        : "Owned"
                      : useCanalVipForTrip
                      ? language === "zh"
                        ? "已预约"
                        : "Booked"
                      : "15,000 CR"}
                  </button>
                </div>
              </div>

              {/* 航路点 */}
              <div className="bg-bridge-panelLight/30 p-2 rounded-xl border border-bridge-border space-y-1">
                <div className="text-[10px] text-bridge-textMuted font-bold">
                  {t.routePlanner.waypointsList} ({plan.waypoints.length})
                </div>
                <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 text-[9px]">
                  <span className="px-2 py-0.5 rounded bg-bridge-safe text-bridge-bg font-bold whitespace-nowrap">
                    {t.routePlanner.startPoint}
                  </span>
                  <span>➔</span>
                  {plan.waypoints.map((wp: RouteWaypoint, idx: number) => (
                    <React.Fragment key={wp.waypointId}>
                      <span className="px-1.5 py-0.5 rounded bg-bridge-panel border border-bridge-border text-bridge-text whitespace-nowrap">
                        WP{idx + 1} ({wp.position.latitude.toFixed(1)}°,{" "}
                        {wp.position.longitude.toFixed(1)}°)
                      </span>
                      {idx < plan.waypoints.length - 1 && <span>➔</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* 航行时间尺度选择 (与特许资质等级挂钩) */}
              <div className="bg-bridge-panelLight/30 p-2.5 rounded-xl border border-bridge-border space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-bridge-textMuted font-bold">
                    {language === "zh"
                      ? `⏱️ 巡航倍速 (${currentLicense.titleZh.split(" ")[0]} 最高解锁 ${maxAllowedScale}×)`
                      : `⏱️ Time Scale (Max ${maxAllowedScale}x unlocked)`}
                  </span>
                  <span className="text-amber-400 font-bold">
                    {language === "zh" ? "预计现实耗时: " : "Real-Time ETA: "}
                    {(() => {
                      const realHours = plan.estimatedDurationGameHours / gameClock.timeScale;
                      if (realHours >= 1) return `${realHours.toFixed(1)} h`;
                      const realMinutes = realHours * 60;
                      if (realMinutes >= 1) return `${realMinutes.toFixed(1)} min`;
                      return `${Math.max(1, Math.round(realMinutes * 60))} s`;
                    })()}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {([1, 60, 120, 180, 300, 600] as const).map((scale) => {
                    const unlocked = scale <= maxAllowedScale;
                    return (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => {
                          if (!unlocked) {
                            openModal("JOURNAL", { journalTab: "LICENSES" });
                            return;
                          }
                          setTimeScale(scale);
                        }}
                        className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center space-x-0.5 cursor-pointer ${
                          gameClock.timeScale === scale && unlocked
                            ? "bg-bridge-accent text-bridge-bg border-white shadow-sm"
                            : unlocked
                            ? "bg-bridge-panel text-bridge-textMuted border-bridge-border hover:text-white"
                            : "bg-bridge-panel/40 text-bridge-textMuted/50 border-bridge-border/40 hover:border-amber-400/60 hover:text-amber-300"
                        }`}
                      >
                        {!unlocked && <Lock size={9} className="text-amber-400" />}
                        <span>
                          {scale === 1
                            ? language === "zh"
                              ? "1×(真实)"
                              : "1×(1:1)"
                            : `${scale}×`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 确认起航 */}
            <div className="pt-2 border-t border-bridge-border flex items-center justify-between">
              <button
                onClick={handleStartVoyage}
                className="w-full py-3 rounded-xl bg-bridge-safe text-bridge-bg font-bold text-xs hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Play size={14} />
                <span>{t.routePlanner.startVoyageBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

