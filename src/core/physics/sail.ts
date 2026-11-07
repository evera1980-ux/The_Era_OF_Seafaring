import { PHYSICS_CONSTANTS } from "../../config/physics";
import { VesselSpec } from "../../types";

/**
 * 角度规范化至 [-180, 180]
 */
export function normalizeAngle180(deg: number): number {
  let a = deg % 360;
  if (a > 180) a -= 360;
  if (a < -180) a += 360;
  return a;
}

/**
 * 计算视风向量与视风角 (AWA, 0~180°) 和视风速 (AWS)
 */
export function calculateApparentWind(
  headingDeg: number,
  boatSpeedKn: number,
  trueWindDirDeg: number,
  trueWindSpeedKn: number
): { awaDeg: number; awsKn: number } {
  const twaDeg = normalizeAngle180(trueWindDirDeg - headingDeg);
  const twaRad = (twaDeg * Math.PI) / 180;

  // 沿船首向与垂直船首向的分解
  // 迎面相对风分量: boatSpeed + TWS * cos(TWA)
  const vForward = boatSpeedKn + trueWindSpeedKn * Math.cos(twaRad);
  const vLateral = trueWindSpeedKn * Math.sin(twaRad);

  const awsKn = Math.sqrt(vForward * vForward + vLateral * vLateral);
  let awaRad = Math.atan2(Math.abs(vLateral), vForward);
  const awaDeg = (awaRad * 180) / Math.PI;

  return { awaDeg, awsKn };
}

/**
 * 依据极坐标 Polar 曲线插值计算风帆效率系数 (0.0 ~ 1.15)
 */
export function getSailEfficiency(awaDeg: number): number {
  const polar = PHYSICS_CONSTANTS.SAIL_POLAR_CURVE;
  const absAwa = Math.min(180, Math.max(0, Math.abs(awaDeg)));

  if (absAwa <= polar[1].awaDeg) {
    // 死区 No-Go Zone
    return 0.0;
  }

  for (let i = 1; i < polar.length - 1; i++) {
    const p1 = polar[i];
    const p2 = polar[i + 1];
    if (absAwa >= p1.awaDeg && absAwa <= p2.awaDeg) {
      const t = (absAwa - p1.awaDeg) / (p2.awaDeg - p1.awaDeg);
      return p1.efficiency + t * (p2.efficiency - p1.efficiency);
    }
  }

  return polar[polar.length - 1].efficiency;
}

/**
 * 计算帆船在当前风场下的风力驱动航速
 */
export function calculateSailSpeedKn(
  awaDeg: number,
  trueWindSpeedKn: number,
  vessel: VesselSpec,
  riggingBonus: number = 0
): number {
  if (vessel.propulsion !== "Sail" && vessel.propulsion !== "Hybrid") {
    return 0;
  }
  const efficiency = getSailEfficiency(awaDeg) * (1 + riggingBonus);
  // 风力转化航速经验公式
  const rawSpeed = trueWindSpeedKn * efficiency * 0.42;
  return Math.min(vessel.maxSpeedKn, rawSpeed);
}
