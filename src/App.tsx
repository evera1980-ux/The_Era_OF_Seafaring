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

  const licenseId = useGameStore((state) => state.licenseId);
  const weatherRoutingActive = useGameStore((state) => state.weatherRoutingActive);
  const canalVipPassActive = useGameStore((state) => state.canalVipPassActive);
  const canalVipOwned = useGameStore((state) => state.canalVipOwned);
  const setWeatherRouting = useGameStore((state) => state.setWeatherRouting);
  const setCanalVipPass = useGameStore((state) => state.setCanalVipPass);
  const setTimeScale = useGameStore((state) => state.setTimeScale);
  const tickFleetDispatches = useGameStore((state) => state.tickFleetDispatches);

  const updateVesselState = useGameStore((state) => state.updateVesselState);
  const updateWeather = useGameStore((state) => state.updateWeather);
  const updateDepth = useGameStore((state) => state.updateDepth);
  const updateAISTargets = useGameStore((state) => state.updateAISTargets);
  const addXP = useGameStore((state) => state.addXP);
  const addLog = useGameStore((state) => state.addLog);

  const lastSafetyAirbagTimeRef = useRef<number>(0);

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

      // 推进公司自动化班轮船队 (每 250ms 步进 0.25s)
      tickFleetDispatches(0.25);

      // 真实世界 1:1 物理时间步长：每 250ms (0.25秒) 推进 0.25 * timeScale 秒
      // 1× = 真实世界 1:1 实时航速 (1秒 = 1秒)；60× = 1秒1分；300× = 1秒5分；1800× = 1秒30分；3600× = 1秒1小时
      const chartNavDtSeconds = 0.25 * gameClock.timeScale;
      const resourceDtSeconds = Math.min(chartNavDtSeconds, 30.0);

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

        const maxTurnStep = Math.max(4.0, Math.min(45.0, 2.5 * Math.sqrt(gameClock.timeScale)));
        const turnStep = Math.min(Math.abs(diff), maxTurnStep);
        effectiveHeadingDeg =
          Math.round(((effectiveHeadingDeg + Math.sign(diff) * turnStep + 360) % 360) * 10) / 10;
      }

      // 1.5 高倍速“安全气囊机制” (High-Speed Safety Airbag)
      // 触发条件：(1) 水深低于吃水线 1.5 倍；(2) 柴油船燃油不足以抵达下一航路点；(3) 突发 9 级以上风暴
      if (
        gameClock.timeScale > 1 &&
        effectiveTelegraph !== "STOP" &&
        Date.now() - lastSafetyAirbagTimeRef.current > 10000
      ) {
        const isShallowDanger = currentDepth < activeVessel.currentDraftM * 1.5;
        const isLowFuelDanger =
          activeVessel.propulsionMode === "Diesel" &&
          targetWp !== undefined &&
          activeVessel.supplies.fuelT < Math.min(0.15, distanceToWpNM * 0.002);
        const isSevereStorm =
          currentWeather.beaufortScale >= 9 && !weatherRoutingActive;

        if (isShallowDanger || isLowFuelDanger || isSevereStorm) {
          lastSafetyAirbagTimeRef.current = Date.now();
          setTimeScale(1);
          platformAdapter.haptic("warning");
          const reason = isShallowDanger
            ? `浅水预警 (水深 ${currentDepth.toFixed(1)}m < 1.5倍吃水)`
            : isLowFuelDanger
            ? "燃油储备不足以支撑至下一航路点"
            : `前方突发 ${currentWeather.beaufortScale} 级暴风`;
          addLog(
            `🛡️ [安全气囊触发] ${reason}！系统已瞬间强制切回 1×(真实) 航速并震动告警，请立即检查航况！`,
            "ALERT"
          );
        } else if (
          licenseId !== "CLASS_4" &&
          gameClock.timeScale > 60 &&
          targetWp &&
          activeWaypointIndex === (plannedRoute?.waypoints.length ?? 1) - 1 &&
          distanceToWpNM <= 20
        ) {
          // 二副 (Class 3) 及以上特权：接近目标港 20 海里自动减速至 60x
          lastSafetyAirbagTimeRef.current = Date.now();
          setTimeScale(60);
          addLog(
            `⚓ [近港引航提示] 距离目的港不足 20 海里 (${distanceToWpNM.toFixed(1)} NM)，已自动平缓降速至 60× 准备进港。`,
            "INFO"
          );
        }
      }

      // 2. 物理与水文推进 (若已订购岸基气象导航路由，免疫恶劣海况大浪失速)
      const effectiveWeather = weatherRoutingActive
        ? {
            ...currentWeather,
            significantWaveHeightM: Math.min(1.5, currentWeather.significantWaveHeightM),
          }
        : currentWeather;

      const vesselForTick = {
        ...activeVessel,
        headingDeg: effectiveHeadingDeg,
        engineTelegraph: effectiveTelegraph,
      };

      const result = simulateTick({
        vesselState: vesselForTick,
        weather: effectiveWeather,
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

      // 岸基气象路由 (+25% 顺风顺流等效航速加成) 与 运河 VIP (+20% 优先通航加成)
      const privilegeSpeedMult =
        (weatherRoutingActive ? 1.25 : 1.0) *
        (canalVipPassActive || canalVipOwned ? 1.2 : 1.0);

      if (!result.grounded && effectiveTelegraph !== "STOP") {
        if (targetWp && targetBearingDeg !== null) {
          // 自动舵航迹控制模式 (ECDIS Track Control): 保持船舶真实物理航速沿航道航行
          const cruiseSpeedKn = makeKn(
            Math.round(Math.max(6.5, nextSogKn) * privilegeSpeedMult * 10) / 10
          );
          nextSogKn = cruiseSpeedKn;
          nextCogDeg = Math.round(targetBearingDeg) % 360;

          const navMove = advancePosition(
            activeVessel.position,
            targetBearingDeg,
            cruiseSpeedKn,
            chartNavDtSeconds
          );

          if (navMove.distanceTravelledNM >= distanceToWpNM || distanceToWpNM <= 1.2) {
            // 精确抵达当前航路点
            nextPosition = targetWp.position;
            distanceMovedNM = distanceToWpNM;

            if (activeWaypointIndex >= (plannedRoute?.waypoints.length ?? 1) - 1) {
              arrivedFinalDestination = true;
              effectiveTelegraph = "STOP";
              nextSogKn = makeKn(0);
              setEngineTelegraph("STOP");
              setWeatherRouting(false);
              if (!canalVipOwned) setCanalVipPass(false);
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
          // 手动操舵航行模式：按当前物理航速与真实时间倍率推进船位
          const boostedSogKn = makeKn(Math.round(nextSogKn * privilegeSpeedMult * 10) / 10);
          nextSogKn = boostedSogKn;
          const manualMove = advancePosition(
            activeVessel.position,
            nextCogDeg,
            boostedSogKn,
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
    licenseId,
    weatherRoutingActive,
    canalVipPassActive,
    canalVipOwned,
    tickFleetDispatches,
  ]);

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden flex flex-col bg-bridge-bg font-sans">
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
