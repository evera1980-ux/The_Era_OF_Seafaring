/**
 * 计算港口船坞维修费用 (Drydock Hull Repair Cost)
 * PRD 3.3.3: hullHp 范围 0 ~ 10000 (相当于 100 HP 百分比制 * 100)
 * 每修复 100 点 hullHp (即 1% 耐久) 基础费用 45 CR * 阶位系数
 */
export function calculateDrydockRepairCost(
  repairAmountHp: number,
  vesselTier: number = 1
): number {
  const clampedHp = Math.max(0, repairAmountHp);
  const tierFactor = 1 + (Math.max(1, vesselTier) - 1) * 0.5;
  // 每 1 点 hullHp 约 0.45 CR (1000 HP = 10% = 450 CR)
  return Math.round(clampedHp * 0.45 * tierFactor);
}

export interface SeaRepairResult {
  canRepair: boolean;
  hpRestored: number;
  sparePartsConsumedT: number;
  nextHullHp: number;
  nextSparePartsT: number;
}

/**
 * 计算海上备件应急抢修结果 (At-Sea Emergency Hull Repair)
 * PRD 3.1.4: 每次消耗 0.1 吨备件 (Spare Parts)，恢复 1500 点 hullHp (即 15% 船体耐久，最高至 hullHpMax)
 */
export function calculateSeaRepairResult(
  currentHullHp: number,
  hullHpMax: number,
  currentSparePartsT: number,
  partCostT: number = 0.1,
  hpRestoredPerAction: number = 1500
): SeaRepairResult {
  if (currentSparePartsT < partCostT || currentHullHp >= hullHpMax) {
    return {
      canRepair: false,
      hpRestored: 0,
      sparePartsConsumedT: 0,
      nextHullHp: currentHullHp,
      nextSparePartsT: currentSparePartsT,
    };
  }

  const nextHullHp = Math.min(hullHpMax, currentHullHp + hpRestoredPerAction);
  const hpRestored = Math.round(nextHullHp - currentHullHp);
  const nextSparePartsT = Math.max(0, Math.round((currentSparePartsT - partCostT) * 100) / 100);

  return {
    canRepair: true,
    hpRestored,
    sparePartsConsumedT: partCostT,
    nextHullHp,
    nextSparePartsT,
  };
}
