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
import {
  advancePosition,
  calculateBearingDeg,
  calculateDistanceNM,
} from "./core/physics/navigation";
import { GAME_BALANCE } from "./config/gameBalance";
import { platformAdapter } from "./platform/platformAdapter";
import { portService } from "./services/ports/portService";
import { makeKn } from "./types";

export const App: React.FC = () => {
  const activeVessel = useGameStore((state) => state.activeVessel);
  const gameClock = useGameStore((state) => state.gameClock);
  const currentWeather = useGameStore((state) => state.currentWeather);
  const currentDepth = useGameStore((state) => state.currentDepthM);
  const plannedRoute = useGameStore((state) => state.plannedRoute);
  const autopilotEnabled = useGameStore((state) => state.autopilotEnabled);
  const activeWaypointIndex = useGameStore((state) => state.activeWaypointIndex);
  const advanceWaypoint = useGameStore((state) => state.advanceWaypoint);
  const setEngineTelegraph = useGameStore((state) => state.setEngineTelegraph);
  const openModal = useGameStore((state) => state.openModal);
  const unlockedPerkIds = useGameStore((state) => state.unlockedPerkIds);
  const roWaterMakerEnabled = useGameStore((state) => state.roWaterMakerEnabled);
  const discoverPort = useGameStore((state) => state.discoverPort);

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

  // 核心物理仿真循环与自动舵引导 (每 250ms 高频平滑推进)
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameClock.paused) return;

      // 物理/补给消耗步长 (按真实航海小时折算，防止补给过快耗尽)
      const resourceDtSeconds = 12.0 * gameClock.timeScale;
      // 海图航行位移时间步长 (使船只在海图上以流畅直观的速度沿航线航行)
      const chartNavDtSeconds = 140.0 * gameClock.timeScale;

      let effectiveHeadingDeg = activeVessel.headingDeg;
      let effectiveTelegraph = activeVessel.engineTelegraph;
      const targetWp =
        autopilotEnabled && plannedRoute && plannedRoute.waypoints.length > 0
          ? plannedRoute.waypoints[activeWaypointIndex]
          : undefined;

      if (targetWp && effectiveTelegraph === "STOP") {
        effectiveTelegraph = "FULL";
        setEngineTelegraph("FULL");
      }

      let targetBearingDeg: number | null = null;
      let distanceToWpNM = 0;

      if (targetWp) {
        targetBearingDeg = calculateBearingDeg(activeVessel.position, targetWp.position);
        distanceToWpNM = calculateDistanceNM(activeVessel.position, targetWp.position);

        let diff = (targetBearingDeg - effectiveHeadingDeg + 360) % 360;
        if (diff > 180) diff -= 360;

        const maxTurnStep = Math.max(24.0, 12.0 * gameClock.timeScale);
        const turnStep = Math.min(Math.abs(diff), maxTurnStep);
        effectiveHeadingDeg =
          Math.round(((effectiveHeadingDeg + Math.sign(diff) * turnStep + 360) % 360) * 10) / 10;
      }

      // 2. 物理与水文推进 (传入本帧最新 effectiveHeadingDeg 与 effectiveTelegraph)
      const vesselForTick = {
        ...activeVessel,
        headingDeg: effectiveHeadingDeg,
        engineTelegraph: effectiveTelegraph,
      };

      const result = simulateTick({
        vesselState: vesselForTick,
        weather: currentWeather,
        waterDepthM: currentDepth,
        dtSeconds: resourceDtSeconds,
        unlockedPerkIds,
        roWaterMakerActive: roWaterMakerEnabled,
      });

      if (result.grounded && !activeVessel.grounded) {
        platformAdapter.haptic("error");
      }

      // 3. 计算海图航迹推进与航点到达判定
      let nextPosition = result.nextVesselState.position;
      let nextCogDeg = result.nextVesselState.cogDeg;
      let nextSogKn = result.nextVesselState.sogKn;
      let distanceMovedNM = result.distanceAdvancedNM;
      let arrivedFinalDestination = false;

      if (!result.grounded && effectiveTelegraph !== "STOP") {
        if (targetWp && targetBearingDeg !== null) {
          // 自动舵航迹控制模式 (ECDIS Track Control): 自动补偿风压横漂与洋流偏航，沿大圆航线精确航行
          const cruiseSpeedKn = makeKn(
            Math.round(Math.max(7.2, nextSogKn) * 10) / 10
          );
          nextSogKn = cruiseSpeedKn;
          nextCogDeg = Math.round(targetBearingDeg) % 360;

          const navMove = advancePosition(
            activeVessel.position,
            targetBearingDeg,
            cruiseSpeedKn,
            chartNavDtSeconds
          );

          if (navMove.distanceTravelledNM >= distanceToWpNM || distanceToWpNM <= 2.5) {
            // 精确抵达当前航路点
            nextPosition = targetWp.position;
            distanceMovedNM = distanceToWpNM;

            if (activeWaypointIndex >= (plannedRoute?.waypoints.length ?? 1) - 1) {
              arrivedFinalDestination = true;
              effectiveTelegraph = "STOP";
              nextSogKn = makeKn(0);
              setEngineTelegraph("STOP");
              const nearestPort = portService.findNearestPort(targetWp.position);
              const arrivedPortId = nearestPort?.port.portId ?? "CNSHA";
              discoverPort(arrivedPortId);
              platformAdapter.haptic("medium");
              addLog(
                `🎉 成功抵达航运目的港！自动舵完成引航。请进入港口贸易大厅交割货物。`,
                "INFO"
              );
              advanceWaypoint();
              openModal("PORT_TRADE", { portId: arrivedPortId });
            } else {
              addLog(`已通过航路点 WP${activeWaypointIndex + 1}，转向下一航段。`, "INFO");
              advanceWaypoint();
            }
          } else {
            nextPosition = navMove.nextPos;
            distanceMovedNM = navMove.distanceTravelledNM;
          }
        } else if (nextSogKn > 0.1) {
          // 手动操舵航行模式：同样以海图比例推进船位
          const manualMove = advancePosition(
            activeVessel.position,
            nextCogDeg,
            nextSogKn,
            chartNavDtSeconds
          );
          nextPosition = manualMove.nextPos;
          distanceMovedNM = manualMove.distanceTravelledNM;
        }
      }

      const finalNextVesselState = {
        ...result.nextVesselState,
        position: nextPosition,
        headingDeg: effectiveHeadingDeg,
        cogDeg: nextCogDeg,
        sogKn: nextSogKn,
        engineTelegraph: arrivedFinalDestination ? ("STOP" as const) : effectiveTelegraph,
        gameStatus: arrivedFinalDestination
          ? ("DOCKED" as const)
          : result.nextVesselState.gameStatus,
      };

      updateVesselState(finalNextVesselState);

      // 里程经验结算
      if (distanceMovedNM > 0) {
        const gainedXP =
          Math.round(distanceMovedNM * GAME_BALANCE.XP_PER_NAUTICAL_MILE * 10) / 10;
        addXP(gainedXP);
      }

      // 异常警报派发
      if (result.warnings.length > 0) {
        result.warnings.forEach((w) => {
          const type = w.includes("CRITICAL") || w.includes("MAYDAY") ? "ALERT" : "WARN";
          addLog(w, type);
        });
      }
    }, 250);

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
    unlockedPerkIds,
    roWaterMakerEnabled,
    discoverPort,
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
