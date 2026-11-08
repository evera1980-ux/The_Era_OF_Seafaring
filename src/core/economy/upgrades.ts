import { VesselSpec, VesselInstalledUpgrade } from "../../types";
import { UPGRADE_CATALOG } from "../../config/upgrades";

export interface UpgradeValidationResult {
  allowed: boolean;
  maxSlots: number;
  reason?: "ALREADY_INSTALLED" | "SLOTS_FULL" | "INSUFFICIENT_CREDITS" | "NOT_FOUND";
}

/**
 * 获取船只可用改装槽位数 (PRD 3.2: Tier 1 为 2 槽，随阶位递增至最多 6 槽)
 */
export function getVesselMaxUpgradeSlots(vesselSpec: VesselSpec): number {
  return Math.max(vesselSpec.equipmentSlots.length, vesselSpec.tier + 1);
}

/**
 * 校验是否可以安装指定改装件 (PRD 3.2)
 */
export function canInstallUpgrade(
  vesselSpec: VesselSpec,
  installedUpgrades: VesselInstalledUpgrade[],
  upgradeId: string,
  currentCredits: number
): UpgradeValidationResult {
  const maxSlots = getVesselMaxUpgradeSlots(vesselSpec);
  const spec = UPGRADE_CATALOG[upgradeId];
  if (!spec) {
    return { allowed: false, maxSlots, reason: "NOT_FOUND" };
  }
  if (installedUpgrades.some((u) => u.upgradeId === upgradeId)) {
    return { allowed: false, maxSlots, reason: "ALREADY_INSTALLED" };
  }
  if (installedUpgrades.length >= maxSlots) {
    return { allowed: false, maxSlots, reason: "SLOTS_FULL" };
  }
  if (currentCredits < spec.price) {
    return { allowed: false, maxSlots, reason: "INSUFFICIENT_CREDITS" };
  }
  return { allowed: true, maxSlots };
}

/**
 * 计算改装件总自重与有效货舱载重上限 (Effective DWT Tons)
 * 包含 U010 集装箱甲板加固锁扣 (+12% DWT) 与改装件自身重量扣减
 */
export function calculateEffectiveCargoCapacityT(
  vesselSpec: VesselSpec,
  installedUpgrades: VesselInstalledUpgrade[],
  perkCargoBonusFraction: number = 0
): {
  effectiveCapacityT: number;
  upgradesWeightT: number;
} {
  let dwtBonusFraction = perkCargoBonusFraction;
  let upgradesWeightT = 0;

  for (const item of installedUpgrades) {
    const upg = UPGRADE_CATALOG[item.upgradeId];
    if (!upg) continue;
    upgradesWeightT += upg.weightT;
    if (upg.effects.cargoCapacityMultiplierBonus) {
      dwtBonusFraction += upg.effects.cargoCapacityMultiplierBonus;
    }
  }

  const grossCapacity = vesselSpec.dwtT * (1 + dwtBonusFraction);
  const effectiveCapacityT = Math.max(1, Math.round((grossCapacity - upgradesWeightT) * 10) / 10);

  return {
    effectiveCapacityT,
    upgradesWeightT: Math.round(upgradesWeightT * 10) / 10,
  };
}
