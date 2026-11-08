import { PortInfo, VesselSpec } from "../../types";

export interface RouteValidationResult {
  canEnterPort: boolean;
  draftMarginM: number;
  hasSufficientFuelCapacity: boolean;
  warnings: string[];
}

/**
 * 校验船舶吃水是否满足目的港最大允许吃水，以及燃油舱上限是否支持该航程
 */
export function validateRouteFeasibility(
  currentDraftM: number,
  destinationPort: PortInfo,
  estimatedFuelT: number,
  vesselSpec: VesselSpec
): RouteValidationResult {
  const draftMarginM = destinationPort.maxAllowedDraftM - currentDraftM;
  const canEnterPort = draftMarginM >= 0.5;
  const hasSufficientFuelCapacity =
    vesselSpec.propulsion === "Sail" ||
    vesselSpec.propulsion === "Nuclear" ||
    estimatedFuelT <= vesselSpec.fuelCapacityT;

  const warnings: string[] = [];
  if (!canEnterPort) {
    warnings.push(
      `DRAFT_EXCEEDED: 本船当前吃水 (${currentDraftM.toFixed(1)}m) 接近或超出 ${destinationPort.name} 最大吃水限制 (${destinationPort.maxAllowedDraftM}m)`
    );
  }
  if (!hasSufficientFuelCapacity) {
    warnings.push(
      `RANGE_EXCEEDED: 预计航程耗油 (${estimatedFuelT.toFixed(1)}t) 超出本船燃油舱总容量 (${vesselSpec.fuelCapacityT}t)`
    );
  }

  return {
    canEnterPort,
    draftMarginM,
    hasSufficientFuelCapacity,
    warnings,
  };
}
