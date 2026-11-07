import { VesselSpec } from "../../types";

/**
 * 主机油耗率 (kg/h) - 体现 Speed^3 的非线性立方关系
 */
export function calculateMainFuelRateKgH(
  speedKn: number,
  vessel: VesselSpec
): number {
  if (vessel.propulsion === "Sail" || vessel.mainFuelRateEcoKgH <= 0 || speedKn <= 0.05) {
    return 0;
  }
  const speedRatio = speedKn / vessel.ecoSpeedKn;
  return vessel.mainFuelRateEcoKgH * Math.pow(speedRatio, 3);
}

/**
 * 总燃油消耗率 (kg/h) = 主机 + 辅机发电
 */
export function calculateTotalFuelRateKgH(
  speedKn: number,
  vessel: VesselSpec
): number {
  if (vessel.propulsion === "Nuclear") {
    return 0; // 核动力不消耗常规柴油
  }
  const mainRate = calculateMainFuelRateKgH(speedKn, vessel);
  const auxRate = vessel.auxiliaryFuelRateKgH;
  return mainRate + auxRate;
}

/**
 * 指定秒数内的燃油消耗量 (公吨, t)
 */
export function calculateFuelConsumedT(
  speedKn: number,
  vessel: VesselSpec,
  durationSeconds: number,
  fuelEconomyBonus: number = 0
): number {
  const hourlyKg = calculateTotalFuelRateKgH(speedKn, vessel);
  const actualKg = hourlyKg * (1 - Math.min(0.5, fuelEconomyBonus));
  const totalKg = (actualKg * durationSeconds) / 3600;
  return totalKg / 1000.0;
}
