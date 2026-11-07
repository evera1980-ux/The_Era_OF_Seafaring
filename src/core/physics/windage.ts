import { PHYSICS_CONSTANTS } from "../../config/physics";
import { VesselSpec } from "../../types";

/**
 * 计算风阻对航速的影响比例系数 (0.85 ~ 1.05)
 */
export function calculateWindageFactor(
  awaDeg: number,
  apparentWindSpeedKn: number
): number {
  const rad = (awaDeg * Math.PI) / 180;
  // 迎风 (AWA接近0) 减速，顺风 (AWA接近180) 略增
  const headwindComponent = Math.cos(rad) * (apparentWindSpeedKn / 50.0);
  const factor = 1.0 - headwindComponent * 0.12;
  return Math.max(0.75, Math.min(1.10, factor));
}

/**
 * 计算横漂角 Leeway (度)
 */
export function calculateLeewayAngleDeg(
  awaDeg: number,
  apparentWindSpeedKn: number,
  boatSpeedKn: number,
  vessel: VesselSpec
): number {
  if (boatSpeedKn < 0.5) return 0;

  // 集装箱船和高受风面积船横漂更大
  const windageAreaFactor = vessel.category === "Container" ? 1.4 : 1.0;
  const sinAwa = Math.sin((awaDeg * Math.PI) / 180);

  const rawLeeway = (windageAreaFactor * (apparentWindSpeedKn / 15.0) * sinAwa) / (boatSpeedKn * 0.5 + 1.0);
  const clamped = Math.max(-PHYSICS_CONSTANTS.LEEWAY_MAX_DEG, Math.min(PHYSICS_CONSTANTS.LEEWAY_MAX_DEG, rawLeeway * 6.0));
  return clamped;
}
