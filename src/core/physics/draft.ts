import { VesselSpec, SupplyState } from "../../types";

/**
 * 依据空载吃水、满载吃水以及当前总载重计算当前动态吃水 (m)
 */
export function calculateCurrentDraft(
  vessel: VesselSpec,
  supplies: SupplyState,
  cargoWeightT: number
): { draftM: number; displacementT: number } {
  const suppliesWeightT =
    supplies.fuelT + supplies.freshWaterT + supplies.rationT + supplies.sparePartsT;
  const currentPayloadT = suppliesWeightT + cargoWeightT;

  const loadRatio = Math.min(1.0, Math.max(0.0, currentPayloadT / Math.max(1, vessel.dwtT)));
  const draftDelta = vessel.loadedDraftM - vessel.lightDraftM;
  const draftM = vessel.lightDraftM + draftDelta * loadRatio;
  const displacementT = vessel.lightDisplacementT + currentPayloadT;

  return { draftM, displacementT };
}
