import {
  PlayerVesselState,
  MarineWeatherCell,
  SimulationResult,
  makeKn,
  makeUnixMs,
} from "../../types";
import { VESSELS } from "../../config/vessels";
import { calculateTargetSpeed } from "../physics/engine";
import { calculateApparentWind, calculateSailSpeedKn } from "../physics/sail";
import { calculateWindageFactor, calculateLeewayAngleDeg } from "../physics/windage";
import { calculateWaveImpact } from "../physics/waves";
import { calculateSpeedOverGround } from "../physics/current";
import { calculateFuelConsumedT } from "../physics/fuel";
import { advancePosition } from "../physics/navigation";
import { calculateCurrentDraft } from "../physics/draft";
import { checkGroundingRisk } from "../physics/grounding";
import { consumeSupplies } from "../economy/supplies";

export interface TickInput {
  vesselState: PlayerVesselState;
  weather: MarineWeatherCell;
  waterDepthM: number;
  dtSeconds: number; // 考虑加速后的游戏经过秒数
}

/**
 * 核心仿真循环: 严格固定步长纯函数模拟
 */
export function simulateTick(input: TickInput): SimulationResult {
  const { vesselState, weather, waterDepthM, dtSeconds } = input;
  const vesselSpec = VESSELS[vesselState.vesselId];
  const warnings: string[] = [];

  if (!vesselSpec) {
    throw new Error(`Unknown vessel id: ${vesselState.vesselId}`);
  }

  // 1. 动力与风力航速计算
  const engineSpeedKn = calculateTargetSpeed(vesselState.engineTelegraph, vesselSpec);

  // 2. 视风与帆力计算
  const { awaDeg, awsKn } = calculateApparentWind(
    vesselState.headingDeg,
    engineSpeedKn,
    weather.windDirectionDeg,
    weather.windSpeedKn
  );
  const sailSpeedKn = calculateSailSpeedKn(awaDeg, weather.windSpeedKn, vesselSpec);

  // 基础对水速度 (发动机动力 + 风帆动力)
  let stwBase = Math.max(engineSpeedKn, sailSpeedKn);
  if (vesselSpec.propulsion === "Hybrid") {
    // 混合动力可以顺风省油叠加
    stwBase = Math.min(vesselSpec.maxSpeedKn, engineSpeedKn + sailSpeedKn * 0.4);
  }

  // 3. 风阻与横漂 Leeway
  const windageFactor = calculateWindageFactor(awaDeg, awsKn);
  let effectiveStw = stwBase * windageFactor;
  const leewayDeg = calculateLeewayAngleDeg(awaDeg, awsKn, effectiveStw, vesselSpec);
  const apparentHeadingDeg = (vesselState.headingDeg + leewayDeg + 360) % 360;

  // 4. 波浪失速与船体/货物损伤
  const waveImpact = calculateWaveImpact(weather.significantWaveHeightM, vesselSpec);
  effectiveStw *= waveImpact.speedRetentionFactor;

  const hours = dtSeconds / 3600.0;
  const hullDamage = waveImpact.hullDamagePerHour * hours;
  const cargoDamage = waveImpact.cargoDamagePerHour * hours;

  if (waveImpact.isStormExceeded) {
    warnings.push(`SEAS_ALERT: 遭遇超出安全抗浪上限的大浪 (${weather.significantWaveHeightM}m)！船体受损失速！`);
  }

  // 5. 洋流矢量合成 (对地航速 SOG / 对地航向 COG)
  const groundSpeed = calculateSpeedOverGround(
    apparentHeadingDeg,
    effectiveStw,
    weather.currentDirectionDeg,
    weather.currentSpeedKn
  );

  // 6. 燃油消耗 (若没油了则发动机熄火)
  let fuelConsumedT = 0;
  if (vesselState.supplies.fuelT > 0 && engineSpeedKn > 0) {
    fuelConsumedT = calculateFuelConsumedT(engineSpeedKn, vesselSpec, dtSeconds);
    if (fuelConsumedT > vesselState.supplies.fuelT) {
      fuelConsumedT = vesselState.supplies.fuelT;
      warnings.push("OUT_OF_FUEL: 船舶燃油已耗尽！主机失灵！");
    }
  }

  // 7. 球面推算位置移动
  const { nextPos, distanceTravelledNM } = advancePosition(
    vesselState.position,
    groundSpeed.cogDeg,
    groundSpeed.sogKn,
    dtSeconds
  );

  // 8. 补给扣除 (淡水、口粮、备件)
  const supplyResult = consumeSupplies(
    {
      ...vesselState.supplies,
      fuelT: Math.max(0, vesselState.supplies.fuelT - fuelConsumedT),
    },
    vesselSpec,
    dtSeconds,
    distanceTravelledNM
  );
  warnings.push(...supplyResult.warnings);

  // 9. 吃水与搁浅判定
  const { draftM, displacementT } = calculateCurrentDraft(
    vesselSpec,
    supplyResult.nextSupplies,
    vesselState.cargoWeightT
  );
  const grounding = checkGroundingRisk(waterDepthM, draftM);
  if (grounding.isGrounded) {
    warnings.push("MAYDAY: 船舶搁浅！龙骨触底！");
  } else if (grounding.isShallowWaterWarning) {
    warnings.push(`SHALLOW_WATER: 浅水警告！富裕水深仅 ${grounding.clearanceM.toFixed(1)}m！`);
  }

  // 10. 组装下一时刻船舶状态
  const nextHullHp = Math.max(0, vesselState.hullHp - hullDamage);
  const nextCargoIntegrity = Math.max(0, vesselState.cargoIntegrity - cargoDamage);

  const nextVesselState: PlayerVesselState = {
    ...vesselState,
    position: nextPos,
    cogDeg: groundSpeed.cogDeg,
    sogKn: makeKn(groundSpeed.sogKn),
    supplies: supplyResult.nextSupplies,
    hullHp: nextHullHp,
    cargoIntegrity: nextCargoIntegrity,
    currentDraftM: draftM,
    currentDisplacementT: displacementT,
    grounded: grounding.isGrounded,
    crewHealth: Math.max(0, Math.min(100, vesselState.crewHealth + supplyResult.crewHealthDelta)),
    gameStatus: grounding.isGrounded ? "GROUNDED" : (groundSpeed.sogKn > 0.1 ? "SAILING" : "IDLE"),
    lastSimulationTimestamp: makeUnixMs(Date.now()),
  };

  return {
    nextVesselState,
    distanceAdvancedNM: distanceTravelledNM,
    fuelConsumedT,
    waterConsumedT: supplyResult.waterConsumedT,
    rationConsumedT: supplyResult.rationConsumedT,
    sparePartsConsumedT: supplyResult.sparePartsConsumedT,
    hullDamage,
    cargoDamage,
    grounded: grounding.isGrounded,
    warnings,
  };
}
