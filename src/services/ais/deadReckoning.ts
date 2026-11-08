import { AISVesselTarget, makeUnixMs } from "../../types";
import { advancePosition } from "../../core/physics/navigation";

/**
 * AIS 船舶运动学航位推算纯函数 (Dead Reckoning Kinematics)
 * 根据每艘 AIS 目标的对地航速 (sogKn) 与对地航向 (cogDeg)，推算 dtSeconds 后的新坐标
 */
export function advanceAISTargetPosition(
  target: AISVesselTarget,
  dtSeconds: number
): AISVesselTarget {
  if (dtSeconds <= 0 || target.sogKn <= 0.1) {
    return target;
  }

  const { nextPos } = advancePosition(
    target.position,
    target.cogDeg,
    target.sogKn,
    dtSeconds
  );

  const now = makeUnixMs(Date.now());
  return {
    ...target,
    position: nextPos,
    observedAt: now,
    receivedAt: now,
  };
}

/**
 * 批量推算整支 AIS 船队的实时运动位置
 */
export function advanceAISFleet(
  fleet: AISVesselTarget[],
  dtSeconds: number
): AISVesselTarget[] {
  return fleet.map((vessel) => advanceAISTargetPosition(vessel, dtSeconds));
}
