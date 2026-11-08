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
} from "lucide-react";
import { RouteWaypoint } from "../../types";
import { useTranslation } from "../../i18n";

export const RoutePlannerModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const activeVessel = useGameStore((state) => state.activeVessel);
  const setPlannedRoute = useGameStore((state) => state.setPlannedRoute);
  const setAutopilot = useGameStore((state) => state.setAutopilot);
  const setEngineTelegraph = useGameStore((state) => state.setEngineTelegraph);
  const addLog = useGameStore((state) => state.addLog);
  const { t, language } = useTranslation();

  const [selectedPortId, setSelectedPortId] = useState<string>("JPYOK");

  const setHeadingDeg = useGameStore((state) => state.setHeadingDeg);
  const gameClock = useGameStore((state) => state.gameClock);
  const togglePause = useGameStore((state) => state.togglePause);
  const setTimeScale = useGameStore((state) => state.setTimeScale);

  if (activeModal !== "ROUTE_PLANNER") return null;

  const portsList = Object.values(PORTS);
  const targetPort = PORTS[selectedPortId] || portsList[0];
  const vesselSpec = VESSELS[activeVessel.vesselId] ?? VESSELS.V001;

  const plan = createPassagePlan(
    activeVessel.position,
    targetPort,
    activeVessel.sogKn > 1 ? activeVessel.sogKn : vesselSpec.ecoSpeedKn,
    vesselSpec
  );

  const feasibility = validateRouteFeasibility(
    activeVessel.currentDraftM,
    targetPort,
    plan.estimatedFuelT,
    vesselSpec
  );

  const handleStartVoyage = () => {
    setPlannedRoute(plan);
    setAutopilot(true);
    if (activeVessel.engineTelegraph === "STOP") {
      setEngineTelegraph("FULL");
    }
    if (plan.waypoints.length > 0) {
      const firstWp = plan.waypoints[0];
      const dLon = ((firstWp.position.longitude - activeVessel.position.longitude) * Math.PI) / 180;
      const lat1 = (activeVessel.position.latitude * Math.PI) / 180;
      const lat2 = (firstWp.position.latitude * Math.PI) / 180;
      const y = Math.sin(dLon) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
      const initialBearing = Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
      setHeadingDeg(initialBearing);
    }
    if (gameClock.paused) {
      togglePause();
    }
    if (gameClock.timeScale < 5) {
      setTimeScale(5);
    }
    const logMsg =
      language === "zh"
        ? `🧭 大圆航线已加载！目的港：${targetPort.name} (${Math.round(plan.totalDistanceNM)} NM)，自动舵系统已接管航向并全速起航！`
        : `🧭 Great Circle Passage loaded! Destination: ${targetPort.name} (${Math.round(plan.totalDistanceNM)} NM). Autopilot engaged!`;
    addLog(logMsg, "INFO");
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end md:items-center justify-center font-mono">
      <div className="bg-bridge-panel border-t md:border border-bridge-border rounded-t-2xl md:rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] pb-safe animate-in slide-in-from-bottom duration-200">
        {/* 头部 */}
        <div className="px-4 py-3 md:px-6 md:py-4 bg-bridge-panelLight/60 border-b border-bridge-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 text-bridge-highlight">
            <Navigation size={18} />
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
            <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5 max-h-[32vh] md:max-h-[52vh] overflow-y-auto pr-1">
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
          <div className="md:col-span-2 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="bg-bridge-panelLight/40 p-3 md:p-4 rounded-xl border border-bridge-border space-y-3">
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
                      <Compass size={11} />
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
                      <Fuel size={11} />
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
                      <ShieldAlert size={11} />
                      <span>{t.routePlanner.seaRisk}</span>
                    </span>
                    <span className="font-bold text-bridge-safe mt-0.5 text-xs md:text-sm">
                      {plan.totalDistanceNM > 2000
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

              {/* 航路点 */}
              <div className="bg-bridge-panelLight/30 p-2.5 rounded-xl border border-bridge-border space-y-1">
                <div className="text-[10px] text-bridge-textMuted font-bold">
                  {t.routePlanner.waypointsList} ({plan.waypoints.length})
                </div>
                <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-[9px]">
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
            </div>

            {/* 确认起航 */}
            <div className="pt-2 border-t border-bridge-border flex items-center justify-between">
              <button
                onClick={handleStartVoyage}
                className="w-full py-3 rounded-xl bg-bridge-safe text-bridge-bg font-bold text-xs hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
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
