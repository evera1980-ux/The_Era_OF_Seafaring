import React, { useEffect, useRef } from "react";
import { TopNavBar } from "./components/hud/TopNavBar";
import { ECDISMap } from "./components/map/ECDISMap";
import { BridgeHUD } from "./components/hud/BridgeHUD";
import { PortTradeModal } from "./components/modals/PortTradeModal";
import { ShipyardModal } from "./components/modals/ShipyardModal";
import { AISDetailModal } from "./components/modals/AISDetailModal";
import { MaydayModal } from "./components/modals/MaydayModal";
import { JournalModal } from "./components/modals/JournalModal";
import { RoutePlannerModal } from "./components/modals/RoutePlannerModal";
import { useGameStore } from "./store";
import { simulateTick } from "./core/simulation/tick";
import { weatherService } from "./services/weather/weatherService";
import { aisService } from "./services/ais/aisService";
import { bathymetryService } from "./services/bathymetry/bathymetryService";
import { calculateBearingDeg, calculateDistanceNM } from "./core/physics/navigation";
import { GAME_BALANCE } from "./config/gameBalance";

export const App: React.FC = () => {
  const activeVessel = useGameStore((state) => state.activeVessel);
  const gameClock = useGameStore((state) => state.gameClock);
  const currentWeather = useGameStore((state) => state.currentWeather);
  const currentDepth = useGameStore((state) => state.currentDepthM);
  const plannedRoute = useGameStore((state) => state.plannedRoute);
  const autopilotEnabled = useGameStore((state) => state.autopilotEnabled);
  const activeWaypointIndex = useGameStore((state) => state.activeWaypointIndex);
  const setHeadingDeg = useGameStore((state) => state.setHeadingDeg);
  const advanceWaypoint = useGameStore((state) => state.advanceWaypoint);
  const setEngineTelegraph = useGameStore((state) => state.setEngineTelegraph);
  const openModal = useGameStore((state) => state.openModal);

  const updateVesselState = useGameStore((state) => state.updateVesselState);
  const updateWeather = useGameStore((state) => state.updateWeather);
  const updateDepth = useGameStore((state) => state.updateDepth);
  const updateAISTargets = useGameStore((state) => state.updateAISTargets);
  const addXP = useGameStore((state) => state.addXP);
  const addLog = useGameStore((state) => state.addLog);

  const lastTickTimeRef = useRef<number>(Date.now());

  // 定期刷新水深与气象、AIS
  useEffect(() => {
    let isMounted = true;

    const fetchEnvironments = async () => {
      try {
        const weatherRes = await weatherService.getWeatherAt(activeVessel.position);
        const depthRes = await bathymetryService.getDepthAt(activeVessel.position);
        const aisRes = await aisService.getActiveTargets();

        if (isMounted) {
          updateWeather(weatherRes.data);
          updateDepth(depthRes.data.depthM);
          updateAISTargets(aisRes.data);
        }
      } catch (err) {
        console.error("Environment refresh error:", err);
      }
    };

    fetchEnvironments();
    const interval = setInterval(fetchEnvironments, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeVessel.position.latitude, activeVessel.position.longitude]);

  // 核心物理仿真循环与自动舵引导
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameClock.paused) return;

      const dtSeconds = 1.0 * gameClock.timeScale;

      // 1. 自动舵引导操舵 (Autopilot Course Tracking)
      if (autopilotEnabled && plannedRoute && plannedRoute.waypoints.length > 0) {
        const targetWp = plannedRoute.waypoints[activeWaypointIndex];
        if (targetWp) {
          const bearing = calculateBearingDeg(activeVessel.position, targetWp.position);
          const distanceToWp = calculateDistanceNM(activeVessel.position, targetWp.position);

          // 自动平滑调整船首向逼近航点方位角
          const currentHdg = activeVessel.headingDeg;
          let diff = (bearing - currentHdg + 360) % 360;
          if (diff > 180) diff -= 360;

          // 每秒最大转向舵角 4度 * 时间倍率
          const turnRate = Math.min(Math.abs(diff), 4.0 * Math.min(5, gameClock.timeScale));
          const nextHdg = (currentHdg + Math.sign(diff) * turnRate + 360) % 360;
          setHeadingDeg(nextHdg);

          // 到达航点判定 (距离小于 2.5 NM)
          if (distanceToWp < 2.5) {
            if (activeWaypointIndex >= plannedRoute.waypoints.length - 1) {
              // 顺利抵达最终目的港！
              setEngineTelegraph("STOP");
              addLog(`🎉 成功抵达航运目的港！自动舵完成引航。请进入港口贸易大厅交割货物。`, "INFO");
              advanceWaypoint();
              openModal("PORT_TRADE");
            } else {
              addLog(`已通过航路点 WP${activeWaypointIndex + 1}，转向下一航段。`, "INFO");
              advanceWaypoint();
            }
          }
        }
      }

      // 2. 物理与水文推进
      const result = simulateTick({
        vesselState: activeVessel,
        weather: currentWeather,
        waterDepthM: currentDepth,
        dtSeconds,
      });

      updateVesselState(result.nextVesselState);

      // 里程经验结算
      if (result.distanceAdvancedNM > 0) {
        const gainedXP = Math.round(result.distanceAdvancedNM * GAME_BALANCE.XP_PER_NAUTICAL_MILE * 10) / 10;
        addXP(gainedXP);
      }

      // 异常警报派发
      if (result.warnings.length > 0) {
        result.warnings.forEach((w) => {
          const type = w.includes("CRITICAL") || w.includes("MAYDAY") ? "ALERT" : "WARN";
          addLog(w, type);
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    activeVessel,
    gameClock.paused,
    gameClock.timeScale,
    currentWeather,
    currentDepth,
    autopilotEnabled,
    plannedRoute,
    activeWaypointIndex,
  ]);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-bridge-bg font-sans">
      <TopNavBar />

      <div className="relative flex-1 w-full h-full overflow-hidden">
        <ECDISMap />
        <BridgeHUD />
      </div>

      <PortTradeModal />
      <ShipyardModal />
      <AISDetailModal />
      <MaydayModal />
      <JournalModal />
      <RoutePlannerModal />
    </div>
  );
};

export default App;
