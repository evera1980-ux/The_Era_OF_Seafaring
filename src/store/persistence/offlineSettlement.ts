import { PlayerVesselState, MarineWeatherCell } from "../../types";
import { GAME_BALANCE } from "../../config/gameBalance";
import { simulateTick } from "../../core/simulation/tick";

export interface OfflineSettlementReport {
  elapsedRealSeconds: number;
  simulatedHours: number;
  distanceAdvancedNM: number;
  fuelConsumedT: number;
  nextVesselState: PlayerVesselState;
}

/**
 * 离线挂机航行结算纯函数 (PRD 5.1.1: 最多结算 24 游戏小时)
 */
export function settleOfflineVoyage(
  vesselState: PlayerVesselState,
  weather: MarineWeatherCell,
  waterDepthM: number,
  elapsedRealMs: number,
  unlockedPerkIds: string[] = []
): OfflineSettlementReport {
  const elapsedSeconds = Math.max(0, elapsedRealMs / 1000);
  // 若离线不足 60 秒或处于停船/搁浅状态，不进行离线推进
  if (
    elapsedSeconds < 60 ||
    vesselState.engineTelegraph === "STOP" ||
    vesselState.grounded
  ) {
    return {
      elapsedRealSeconds: elapsedSeconds,
      simulatedHours: 0,
      distanceAdvancedNM: 0,
      fuelConsumedT: 0,
      nextVesselState: vesselState,
    };
  }

  const maxSeconds = GAME_BALANCE.MAX_OFFLINE_SIMULATION_HOURS * 3600;
  const clampedSeconds = Math.min(elapsedSeconds, maxSeconds);

  // 分步 600 秒一段推进以保证数值稳定
  const stepSeconds = 600;
  let remaining = clampedSeconds;
  let currentVessel = vesselState;
  let totalDistance = 0;
  let totalFuel = 0;

  while (remaining > 0) {
    const dt = Math.min(stepSeconds, remaining);
    const res = simulateTick({
      vesselState: currentVessel,
      weather,
      waterDepthM,
      dtSeconds: dt,
      unlockedPerkIds,
    });
    currentVessel = res.nextVesselState;
    totalDistance += res.distanceAdvancedNM;
    totalFuel += res.fuelConsumedT;
    remaining -= dt;
    if (currentVessel.grounded || currentVessel.engineTelegraph === "STOP") {
      break;
    }
  }

  return {
    elapsedRealSeconds: elapsedSeconds,
    simulatedHours: Math.round((clampedSeconds / 3600) * 10) / 10,
    distanceAdvancedNM: Math.round(totalDistance * 10) / 10,
    fuelConsumedT: Math.round(totalFuel * 100) / 100,
    nextVesselState: currentVessel,
  };
}
