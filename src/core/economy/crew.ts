import { SupplyState } from "../../types";
import { CREW_CONSUMPTION_CONFIG } from "../../config/economy";

export interface CrewStatusEvaluation {
  dailyWageCredits: number;
  isDehydrated: boolean;
  isStarving: boolean;
  efficiencyMultiplier: number; // 1.0 = normal, <1.0 = debuffed
  hullDecayPerHourFromMutiny: number;
}

/**
 * 船员日薪与淡水/口粮阶梯 Debuff 评估纯函数 (PRD 3.1.2 & 3.1.3)
 * - 缺水 (Dehydration): 船员效率骤降 50%
 * - 断粮 (Starvation): 船员效率降低 35%，且每小时引发设备失修损耗
 */
export function evaluateCrewStatus(
  crewCount: number,
  supplies: SupplyState,
  wagePerCrewPerDay: number = CREW_CONSUMPTION_CONFIG.WAGE_CR_PER_PERSON_DAY
): CrewStatusEvaluation {
  const dailyWageCredits = Math.max(0, crewCount) * wagePerCrewPerDay;
  const isDehydrated = supplies.freshWaterT <= 0.001;
  const isStarving = supplies.rationT <= 0.001;

  let efficiencyMultiplier = 1.0;
  let hullDecayPerHourFromMutiny = 0;

  if (isDehydrated) {
    efficiencyMultiplier *= 0.5;
    hullDecayPerHourFromMutiny += 120; // 1.2% of 10000 HP
  }
  if (isStarving) {
    efficiencyMultiplier *= 0.65;
    hullDecayPerHourFromMutiny += 60; // 0.6% of 10000 HP
  }

  return {
    dailyWageCredits,
    isDehydrated,
    isStarving,
    efficiencyMultiplier: Math.round(efficiencyMultiplier * 100) / 100,
    hullDecayPerHourFromMutiny,
  };
}
