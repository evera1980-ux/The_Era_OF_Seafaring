import { Knots, makeKn } from "../../types";

export interface GroundSpeedResult {
  sogKn: Knots;
  cogDeg: number;
  velocityEastKn: number;
  velocityNorthKn: number;
}

/**
 * 船只对水速度向量与海洋表层洋流向量合成对地速度 (SOG) 与对地航向 (COG)
 */
export function calculateSpeedOverGround(
  headingDeg: number,
  speedThroughWaterKn: number,
  currentDirectionDeg: number,
  currentSpeedKn: number
): GroundSpeedResult {
  const headRad = (headingDeg * Math.PI) / 180;
  const currRad = (currentDirectionDeg * Math.PI) / 180;

  // 船只对水航行速度分量 (向东、向北)
  const vWaterEast = speedThroughWaterKn * Math.sin(headRad);
  const vWaterNorth = speedThroughWaterKn * Math.cos(headRad);

  // 洋流推力分量
  const vCurrEast = currentSpeedKn * Math.sin(currRad);
  const vCurrNorth = currentSpeedKn * Math.cos(currRad);

  // 合成对地速度分量
  const vEast = vWaterEast + vCurrEast;
  const vNorth = vWaterNorth + vCurrNorth;

  const sog = Math.sqrt(vEast * vEast + vNorth * vNorth);
  let cogRad = Math.atan2(vEast, vNorth);
  let cogDeg = (cogRad * 180) / Math.PI;
  if (cogDeg < 0) cogDeg += 360;

  return {
    sogKn: makeKn(sog),
    cogDeg: (cogDeg % 360),
    velocityEastKn: vEast,
    velocityNorthKn: vNorth,
  };
}
