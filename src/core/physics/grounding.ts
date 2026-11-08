/**
 * 搁浅判定: 当海底水深小于当前船舶吃水加富裕水深 UKC (Under Keel Clearance, PRD 1.7.2: 0.5m) 时判定危险/搁浅
 */
export function checkGroundingRisk(
  waterDepthM: number,
  currentDraftM: number,
  safeMarginM: number = 0.8
): { isGrounded: boolean; isShallowWaterWarning: boolean; clearanceM: number } {
  const clearanceM = waterDepthM - currentDraftM;
  const isGrounded = clearanceM <= 0.5;
  const isShallowWaterWarning = !isGrounded && clearanceM < safeMarginM + 0.5;

  return { isGrounded, isShallowWaterWarning, clearanceM };
}

/**
 * PRD 1.7.2 自主脱浅概率计算纯函数
 * 公式: P_refloat = Clamp(0.25 + 0.5 * (Bathymetry / (Draft + UKC)), 0.15, 0.75)
 */
export function calculateRefloatProbability(
  waterDepthM: number,
  currentDraftM: number,
  ukcM: number = 0.5,
  perkBonus: number = 0
): number {
  const denom = Math.max(0.5, currentDraftM + ukcM);
  const rawProb = 0.25 + 0.5 * (waterDepthM / denom) + perkBonus;
  return Math.max(0.15, Math.min(0.85, rawProb));
}
