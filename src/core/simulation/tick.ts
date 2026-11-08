import {
  PlayerVesselState,
  MarineWeatherCell,
  SimulationResult,
  makeKn,
  makeUnixMs,
} from "../../types";
import { VESSELS } from "../../config/vessels";
import { UPGRADES } from "../../config/upgrades";
import { CAPTAIN_PERKS } from "../../config/captainPerks";
import { PHYSICS_CONSTANTS } from "../../config/physics";
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
import { evaluateCrewStatus } from "../economy/crew";

export interface TickInput {
  vesselState: PlayerVesselState;
  weather: MarineWeatherCell;
  waterDepthM: number;
  dtSeconds: number; // 考虑加速后的游戏经过秒数
  unlockedPerkIds?: string[];
  roWaterMakerActive?: boolean;
}

/**
 * 汇总当前船舶已安装改装件与已激活船长技能的数值加成
 */
export function aggregateVesselBonuses(
  vesselState: PlayerVesselState,
  unlockedPerkIds: string[] = []
) {
  let fuelEconomyBonus = 0;
  let speedBonus = 0;
  let sailEfficiencyBonus = 0;
  let hullResistanceBonus = 0;
  let safeWaveBonusM = 0;
  let waterProductionTPerDay = 0;
  let waterMakerFuelKgH = 0;
  let cargoLossReductionBonus = 0;
  let fuelCapacityBonusT = 0;
  let tradeSellBonusFraction = 0;
  let cargoCapacityBonusFraction = 0;
  let refloatChanceBonus = 0;

  for (const inst of vesselState.installedUpgrades) {
    const spec = UPGRADES[inst.upgradeId];
    if (!spec) continue;
    const eff = spec.effects;
    if (eff.fuelEconomyBonus) fuelEconomyBonus += eff.fuelEconomyBonus;
    if (eff.speedBonus) speedBonus += eff.speedBonus;
    if (eff.sailEfficiencyBonus) sailEfficiencyBonus += eff.sailEfficiencyBonus;
    if (eff.hullResistanceBonus) hullResistanceBonus += eff.hullResistanceBonus;
    if (eff.safeWaveBonusM) safeWaveBonusM += eff.safeWaveBonusM;
    if (eff.waterProductionTPerDay) waterProductionTPerDay += eff.waterProductionTPerDay;
    if (eff.waterMakerFuelKgH) waterMakerFuelKgH += eff.waterMakerFuelKgH;
    if (eff.cargoLossReductionBonus) cargoLossReductionBonus += eff.cargoLossReductionBonus;
    if (eff.fuelCapacityBonusT) fuelCapacityBonusT += eff.fuelCapacityBonusT;
    if (eff.cargoCapacityMultiplierBonus) {
      cargoCapacityBonusFraction += eff.cargoCapacityMultiplierBonus;
    }
  }

  for (const perkId of unlockedPerkIds) {
    const perk = CAPTAIN_PERKS.find((p) => p.perkId === perkId);
    if (!perk) continue;
    if (perk.bonus.type === "FUEL") fuelEconomyBonus += perk.bonus.value;
    if (perk.bonus.type === "SPEED") speedBonus += perk.bonus.value;
    if (perk.bonus.type === "WEATHER") hullResistanceBonus += perk.bonus.value;
    if (perk.bonus.type === "TRADE") tradeSellBonusFraction += perk.bonus.value;
    if (perk.bonus.type === "CARGO") cargoCapacityBonusFraction += perk.bonus.value;
    if (perk.bonus.type === "MAYDAY") refloatChanceBonus += perk.bonus.value;
  }

  return {
    fuelEconomyBonus: Math.min(0.45, fuelEconomyBonus),
    speedBonus: Math.min(0.25, speedBonus),
    sailEfficiencyBonus: Math.min(0.35, sailEfficiencyBonus),
    hullResistanceBonus: Math.min(0.75, hullResistanceBonus),
    safeWaveBonusM,
    waterProductionTPerDay,
    waterMakerFuelKgH,
    cargoLossReductionBonus: Math.min(0.9, cargoLossReductionBonus),
    fuelCapacityBonusT,
    tradeSellBonusFraction,
    cargoCapacityBonusFraction,
    refloatChanceBonus,
  };
}

/**
 * 核心仿真循环: 严格固定步长纯函数模拟 (接入改装件、船长技能、Flank过热与搁浅扣血)
 */
export function simulateTick(input: TickInput): SimulationResult {
  const {
    vesselState,
    weather,
    waterDepthM,
    dtSeconds,
    unlockedPerkIds = [],
    roWaterMakerActive = true,
  } = input;
  const baseSpec = VESSELS[vesselState.vesselId];
  const warnings: string[] = [];

  if (!baseSpec) {
    throw new Error(`Unknown vessel id: ${vesselState.vesselId}`);
  }

  const bonuses = aggregateVesselBonuses(vesselState, unlockedPerkIds);
  const vesselSpec = {
    ...baseSpec,
    safeWaveHeightM: baseSpec.safeWaveHeightM + bonuses.safeWaveBonusM,
    fuelCapacityT: baseSpec.fuelCapacityT + bonuses.fuelCapacityBonusT,
  };

  const hours = dtSeconds / 3600.0;

  // 1. 动力与风力航速计算
  const isStopped = vesselState.engineTelegraph === "STOP";
  const telegraphTargetSpeedKn = calculateTargetSpeed(
    vesselState.engineTelegraph,
    vesselSpec
  );
  const hasFuelForEngine =
    vesselSpec.propulsion === "Nuclear" || vesselState.supplies.fuelT > 0.0001;
  const rawEngineSpeedKn =
    !isStopped && hasFuelForEngine ? telegraphTargetSpeedKn : makeKn(0);

  // 2. 视风与帆力计算
  const { awaDeg, awsKn } = calculateApparentWind(
    vesselState.headingDeg,
    rawEngineSpeedKn,
    weather.windDirectionDeg,
    weather.windSpeedKn
  );
  const sailSpeedKn = isStopped
    ? 0
    : calculateSailSpeedKn(
        awaDeg,
        weather.windSpeedKn,
        vesselSpec,
        bonuses.sailEfficiencyBonus
      );

  // 基础对水速度 (发动机动力 + 风帆动力 + 帆船逆风之字抢风 VMG / 辅机推进保底)
  let stwBase = 0;
  if (!isStopped) {
    if (vesselSpec.propulsion === "Sail") {
      // 纯帆船在开启车钟档位时具备之字抢风(Tacking VMG)与操帆推进能力，确保逆风死区也能稳定前行
      const tackingVmgKn = telegraphTargetSpeedKn * 0.78;
      stwBase = Math.max(tackingVmgKn, sailSpeedKn);
    } else if (vesselSpec.propulsion === "Hybrid") {
      const hybridBase = hasFuelForEngine
        ? rawEngineSpeedKn + sailSpeedKn * 0.4
        : Math.max(telegraphTargetSpeedKn * 0.55, sailSpeedKn);
      stwBase = Math.min(vesselSpec.maxSpeedKn * 1.15, hybridBase);
    } else {
      // 柴油/核动力船：若有燃油按主机功率推进，若燃油耗尽保留应急跛行动力
      stwBase = hasFuelForEngine ? rawEngineSpeedKn : telegraphTargetSpeedKn * 0.3;
    }
    stwBase *= 1 + bonuses.speedBonus;
  }

  // 船员健康/脱水/断粮效率修正 (PRD 3.1)
  const crewStatus = evaluateCrewStatus(vesselSpec.crewCount, vesselState.supplies);
  stwBase *= crewStatus.efficiencyMultiplier;

  // 3. 风阻与横漂 Leeway
  const windageFactor = isStopped ? 0 : calculateWindageFactor(awaDeg, awsKn);
  let effectiveStw = stwBase * windageFactor;
  const leewayDeg = isStopped
    ? 0
    : calculateLeewayAngleDeg(awaDeg, awsKn, effectiveStw, vesselSpec);
  const apparentHeadingDeg = (vesselState.headingDeg + leewayDeg + 360) % 360;

  // 4. 波浪失速与船体/货物损伤
  const waveImpact = calculateWaveImpact(
    weather.significantWaveHeightM,
    vesselSpec,
    bonuses.hullResistanceBonus
  );
  effectiveStw *= waveImpact.speedRetentionFactor;

  let hullDamage = waveImpact.hullDamagePerHour * hours;
  const cargoDamage =
    waveImpact.cargoDamagePerHour * hours * (1 - bonuses.cargoLossReductionBonus);

  if (waveImpact.isStormExceeded) {
    warnings.push(
      `SEAS_ALERT: 遭遇超出安全抗浪上限的大浪 (${weather.significantWaveHeightM}m)！船体受损失速！`
    );
  }

  // 5. Flank 超负荷主机温升与过热损伤 (PRD 1.2.1)
  let nextTemp = vesselState.engineTemperature;
  if (vesselState.engineTelegraph === "FLANK" && hasFuelForEngine) {
    nextTemp = Math.min(
      125,
      nextTemp + PHYSICS_CONSTANTS.ENGINE_FLANK_HEAT_RATE_PER_HOUR * hours
    );
  } else {
    nextTemp = Math.max(
      PHYSICS_CONSTANTS.ENGINE_NORMAL_TEMP_C,
      nextTemp - PHYSICS_CONSTANTS.ENGINE_COOLING_RATE_PER_HOUR * hours
    );
  }
  const engineOverheated = nextTemp >= PHYSICS_CONSTANTS.ENGINE_OVERHEAT_THRESHOLD_C;
  if (engineOverheated) {
    hullDamage += PHYSICS_CONSTANTS.ENGINE_OVERHEAT_DAMAGE_HP_PER_HOUR * hours;
    warnings.push(
      `CRITICAL: 主机超负荷过热 (${Math.round(nextTemp)}°C)！请立即降档冷却，否则持续损伤主机！`
    );
  }

  // 6. 吃水与搁浅判定 (若已搁浅则对水航速强制归零)
  const { draftM: preDraftM } = calculateCurrentDraft(
    vesselSpec,
    vesselState.supplies,
    vesselState.cargoWeightT
  );
  const preGrounding = checkGroundingRisk(waterDepthM, preDraftM);
  if (preGrounding.isGrounded && vesselState.engineTelegraph !== "STOP") {
    effectiveStw = 0;
    hullDamage += PHYSICS_CONSTANTS.GROUNDING_DAMAGE_HP_PER_HOUR * hours;
  }

  // 7. 洋流矢量合成 (对地航速 SOG / 对地航向 COG)
  const groundSpeed =
    preGrounding.isGrounded || isStopped
      ? { sogKn: makeKn(0), cogDeg: vesselState.headingDeg }
      : calculateSpeedOverGround(
          apparentHeadingDeg,
          effectiveStw,
          weather.currentDirectionDeg,
          weather.currentSpeedKn
        );

  // 8. 燃油消耗 (含主机、辅机与 RO 淡化机耗电折算燃油)
  let fuelConsumedT = 0;
  if (vesselState.supplies.fuelT > 0 && rawEngineSpeedKn > 0) {
    fuelConsumedT = calculateFuelConsumedT(
      rawEngineSpeedKn,
      vesselSpec,
      dtSeconds,
      bonuses.fuelEconomyBonus
    );
  }
  const activeWaterBonusTPerDay =
    roWaterMakerActive && bonuses.waterProductionTPerDay > 0
      ? bonuses.waterProductionTPerDay
      : 0;
  if (activeWaterBonusTPerDay > 0 && vesselState.supplies.fuelT > 0) {
    fuelConsumedT += (bonuses.waterMakerFuelKgH * hours) / 1000.0;
  }
  if (fuelConsumedT > vesselState.supplies.fuelT) {
    fuelConsumedT = vesselState.supplies.fuelT;
    warnings.push("OUT_OF_FUEL: 船舶燃油已耗尽！主机失灵！");
  }

  // 9. 球面推算位置移动
  const { nextPos, distanceTravelledNM } = advancePosition(
    vesselState.position,
    groundSpeed.cogDeg,
    groundSpeed.sogKn,
    dtSeconds
  );

  // 10. 补给扣除 (淡水、口粮、备件)
  const supplyResult = consumeSupplies(
    {
      ...vesselState.supplies,
      fuelT: Math.max(0, vesselState.supplies.fuelT - fuelConsumedT),
    },
    vesselSpec,
    dtSeconds,
    distanceTravelledNM,
    activeWaterBonusTPerDay
  );
  warnings.push(...supplyResult.warnings);

  // 11. 更新吃水与搁浅状态
  const { draftM, displacementT } = calculateCurrentDraft(
    vesselSpec,
    supplyResult.nextSupplies,
    vesselState.cargoWeightT
  );
  const grounding = checkGroundingRisk(waterDepthM, draftM);
  if (grounding.isGrounded) {
    warnings.push("MAYDAY: 船舶搁浅！龙骨触底！请打开 MAYDAY 界面尝试脱浅或呼叫拖轮！");
  } else if (grounding.isShallowWaterWarning) {
    warnings.push(`SHALLOW_WATER: 浅水警告！富裕水深仅 ${grounding.clearanceM.toFixed(1)}m！`);
  }

  // 12. 组装下一时刻船舶状态 (统一数值精度，杜绝浮点长尾小数)
  const nextHullHp = Math.round(Math.max(0, vesselState.hullHp - hullDamage));
  const nextCargoIntegrity =
    Math.round(Math.max(0, vesselState.cargoIntegrity - cargoDamage) * 10) / 10;
  const cleanSogKn = Math.round(groundSpeed.sogKn * 10) / 10;
  const cleanCogDeg = Math.round(groundSpeed.cogDeg) % 360;
  const cleanTemp = Math.round(nextTemp * 10) / 10;

  const nextVesselState: PlayerVesselState = {
    ...vesselState,
    position: nextPos,
    cogDeg: cleanCogDeg,
    sogKn: makeKn(cleanSogKn),
    supplies: supplyResult.nextSupplies,
    hullHp: nextHullHp,
    cargoIntegrity: nextCargoIntegrity,
    currentDraftM: draftM,
    currentDisplacementT: displacementT,
    engineTemperature: cleanTemp,
    engineOverheated,
    grounded: grounding.isGrounded,
    crewHealth: Math.round(
      Math.max(0, Math.min(100, vesselState.crewHealth + supplyResult.crewHealthDelta))
    ),
    gameStatus: grounding.isGrounded
      ? "GROUNDED"
      : cleanSogKn > 0.1
      ? "SAILING"
      : "IDLE",
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
