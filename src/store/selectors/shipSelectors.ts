import { PlayerVesselState } from "../../types";
import { VESSELS } from "../../config/vessels";
import { CAPTAIN_PERK_MAP } from "../../config/captainPerks";
import { calculateTotalFuelRateKgH } from "../../core/physics/fuel";
import { calculateTargetSpeed } from "../../core/physics/engine";
import { aggregateVesselBonuses } from "../../core/simulation/tick";

/**
 * 计算当前车钟挡位下的实时每小时总油耗率 (kg/h)
 */
export function selectHourlyFuelBurnKgH(
  vesselState: PlayerVesselState,
  unlockedPerkIds: string[] = [],
  roWaterMakerEnabled: boolean = false
): number {
  const spec = VESSELS[vesselState.vesselId] ?? VESSELS.V001;
  const bonuses = aggregateVesselBonuses(vesselState, unlockedPerkIds);
  const targetSpeedKn = calculateTargetSpeed(vesselState.engineTelegraph, spec);
  const rawRate = calculateTotalFuelRateKgH(targetSpeedKn, spec);
  let rate = rawRate * (1 - bonuses.fuelEconomyBonus);
  if (roWaterMakerEnabled && bonuses.waterProductionTPerDay > 0) {
    rate += bonuses.waterMakerFuelKgH;
  }
  return Math.max(0, Math.round(rate * 10) / 10);
}

/**
 * 计算当前燃油与车钟速度下的实时最大续航圈半径 (Nautical Miles)
 * - 纯帆船或核动力破冰船返回理论续航或基于淡水口粮的上限
 * - 柴油/混动船根据当前车钟耗油率动态缩放续航半径！
 */
export function selectMaxRangeNM(
  vesselState: PlayerVesselState,
  unlockedPerkIds: string[] = [],
  roWaterMakerEnabled: boolean = false
): number {
  const spec = VESSELS[vesselState.vesselId] ?? VESSELS.V001;

  if (spec.propulsion === "Sail" || spec.propulsion === "Nuclear") {
    // 帆船/核动力续航取决于当前淡水与口粮剩余比例
    const waterRatio =
      spec.waterCapacityT > 0 ? vesselState.supplies.freshWaterT / spec.waterCapacityT : 1;
    const rationRatio =
      spec.rationCapacityT > 0 ? vesselState.supplies.rationT / spec.rationCapacityT : 1;
    const supplyFactor = Math.max(0.08, Math.min(1, Math.min(waterRatio, rationRatio)));
    return Math.round(spec.theoreticalRangeNM * supplyFactor);
  }

  const fuelKg = vesselState.supplies.fuelT * 1000;
  if (fuelKg <= 0) return 0;

  // 若当前为 STOP，则以 ECO 巡航挡估算理论可达半径；否则按当前车钟挡位实时计算
  const effectiveTelegraph =
    vesselState.engineTelegraph === "STOP" ? "ECO" : vesselState.engineTelegraph;

  const bonuses = aggregateVesselBonuses(vesselState, unlockedPerkIds);
  const targetEngineSpeedKn = calculateTargetSpeed(effectiveTelegraph, spec);
  const baseRateKgH =
    calculateTotalFuelRateKgH(targetEngineSpeedKn, spec) *
      (1 - bonuses.fuelEconomyBonus) +
    (roWaterMakerEnabled && bonuses.waterProductionTPerDay > 0
      ? bonuses.waterMakerFuelKgH
      : 0);

  if (baseRateKgH <= 0.1) return spec.theoreticalRangeNM;

  const hoursRemaining = fuelKg / baseRateKgH;
  const speedKn =
    vesselState.sogKn > 1.5
      ? vesselState.sogKn
      : Math.max(4, targetEngineSpeedKn);

  const rangeNM = hoursRemaining * speedKn;
  return Math.max(5, Math.min(25000, Math.round(rangeNM)));
}

/**
 * 计算当前剩余可用船长技能点数
 */
export function selectAvailablePerkPoints(
  playerLevel: number,
  unlockedPerkIds: string[]
): number {
  const totalPoints = Math.max(1, playerLevel);
  const spent = unlockedPerkIds.reduce(
    (acc, id) => acc + (CAPTAIN_PERK_MAP[id]?.pointCost ?? 1),
    0
  );
  return Math.max(0, totalPoints - spent);
}
