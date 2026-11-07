import { EngineTelegraph, VesselSpec, Knots, makeKn } from "../../types";
import { TELEGRAPH_SETTINGS } from "../../config/physics";

export function getPowerRatio(telegraph: EngineTelegraph): number {
  return TELEGRAPH_SETTINGS[telegraph]?.powerRatio ?? 0.0;
}

export function getSpeedRatio(telegraph: EngineTelegraph): number {
  return TELEGRAPH_SETTINGS[telegraph]?.speedRatio ?? 0.0;
}

/**
 * 依据车钟档位和船舶属性计算对水目标航速 (Knots)
 * 公式: V_target = V_max * SpeedRatio
 */
export function calculateTargetSpeed(
  telegraph: EngineTelegraph,
  vessel: VesselSpec
): Knots {
  if (telegraph === "STOP") {
    return makeKn(0);
  }
  const speedRatio = getSpeedRatio(telegraph);
  return makeKn(vessel.maxSpeedKn * speedRatio);
}
