import { SupplyState, VesselSpec } from "../../types";
import { CREW_CONSUMPTION_CONFIG } from "../../config/economy";

export interface SupplyConsumptionResult {
  nextSupplies: SupplyState;
  waterConsumedT: number;
  rationConsumedT: number;
  sparePartsConsumedT: number;
  crewHealthDelta: number;
  warnings: string[];
}

/**
 * 计算给定模拟秒数与航行距离下的淡水、口粮、备件消耗
 */
export function consumeSupplies(
  currentSupplies: SupplyState,
  vessel: VesselSpec,
  elapsedSeconds: number,
  distanceTravelledNM: number,
  waterMakerBonusTPerDay: number = 0
): SupplyConsumptionResult {
  const days = elapsedSeconds / 86400.0;
  const crew = Math.max(1, vessel.crewCount);

  // 淡水消耗与造水机生成
  const grossWaterConsumed = days * crew * CREW_CONSUMPTION_CONFIG.WATER_TONS_PER_PERSON_DAY;
  const waterProduced = days * waterMakerBonusTPerDay;
  const netWaterConsumed = Math.max(0, grossWaterConsumed - waterProduced);

  // 口粮消耗
  const rationConsumed = days * crew * CREW_CONSUMPTION_CONFIG.RATION_TONS_PER_PERSON_DAY;

  // 备件磨损消耗
  const sparePartsConsumed = (distanceTravelledNM / 100.0) * CREW_CONSUMPTION_CONFIG.PARTS_CONSUMPTION_PER_100_NM;

  const nextFuel = currentSupplies.fuelT;
  let nextWater = currentSupplies.freshWaterT - netWaterConsumed;
  let nextRation = currentSupplies.rationT - rationConsumed;
  let nextParts = currentSupplies.sparePartsT - sparePartsConsumed;

  let crewHealthDelta = 0;
  const warnings: string[] = [];

  if (nextWater <= 0) {
    nextWater = 0;
    crewHealthDelta -= days * 20; // 缺水剧烈掉血
    warnings.push("CRITICAL: 淡水耗尽！船员健康急剧下降！");
  }

  if (nextRation <= 0) {
    nextRation = 0;
    crewHealthDelta -= days * 10; // 缺粮掉血
    warnings.push("WARNING: 口粮告罄！船员陷入饥饿状态！");
  }

  if (nextParts <= 0) {
    nextParts = 0;
    warnings.push("CAUTION: 维修备件不足，船体磨损将无法自行维护！");
  }

  return {
    nextSupplies: {
      fuelT: nextFuel,
      freshWaterT: Math.max(0, nextWater),
      rationT: Math.max(0, nextRation),
      sparePartsT: Math.max(0, nextParts),
    },
    waterConsumedT: netWaterConsumed,
    rationConsumedT: rationConsumed,
    sparePartsConsumedT: sparePartsConsumed,
    crewHealthDelta,
    warnings,
  };
}
