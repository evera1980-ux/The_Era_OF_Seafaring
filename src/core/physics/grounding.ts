/**
 * 搁浅判定: 当海底水深小于当前船舶吃水加富裕水深 UKC (Under Keel Clearance) 时判定危险/搁浅
 */
export function checkGroundingRisk(
  waterDepthM: number,
  currentDraftM: number,
  safeMarginM: number = 0.8
): { isGrounded: boolean; isShallowWaterWarning: boolean; clearanceM: number } {
  const clearanceM = waterDepthM - currentDraftM;
  const isGrounded = clearanceM <= 0.05;
  const isShallowWaterWarning = !isGrounded && clearanceM < safeMarginM;

  return { isGrounded, isShallowWaterWarning, clearanceM };
}
