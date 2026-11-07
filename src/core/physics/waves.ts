import { PHYSICS_CONSTANTS } from "../../config/physics";
import { VesselSpec } from "../../types";

export interface WaveImpactResult {
  speedRetentionFactor: number;
  hullDamagePerHour: number;
  cargoDamagePerHour: number;
  isStormExceeded: boolean;
}

/**
 * 依据有效波高计算波浪失速与耐久磨损
 */
export function calculateWaveImpact(
  significantWaveHeightM: number,
  vessel: VesselSpec,
  hullResistanceBonus: number = 0
): WaveImpactResult {
  const excessWave = significantWaveHeightM - vessel.safeWaveHeightM;

  if (excessWave <= 0) {
    return {
      speedRetentionFactor: 1.0,
      hullDamagePerHour: 0.0,
      cargoDamagePerHour: 0.0,
      isStormExceeded: false,
    };
  }

  // 航速衰减
  const speedLoss = Math.min(0.65, excessWave * PHYSICS_CONSTANTS.WAVE_SPEED_LOSS_COEFF);
  const speedRetentionFactor = Math.max(0.35, 1.0 - speedLoss);

  // 船体扣血
  const rawHullDamage = excessWave * PHYSICS_CONSTANTS.WAVE_HULL_DAMAGE_RATE;
  const hullDamagePerHour = Math.max(0, rawHullDamage * (1 - Math.min(0.8, hullResistanceBonus)));

  // 货物完好度损耗 (0.0 ~ 1.0)
  const cargoDamagePerHour = excessWave * PHYSICS_CONSTANTS.WAVE_CARGO_DAMAGE_RATE;

  return {
    speedRetentionFactor,
    hullDamagePerHour,
    cargoDamagePerHour,
    isStormExceeded: true,
  };
}
