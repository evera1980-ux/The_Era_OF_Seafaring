import { describe, it, expect } from "vitest";
import { calculateTargetSpeed, getPowerRatio } from "../core/physics/engine";
import { calculateMainFuelRateKgH, calculateFuelConsumedT } from "../core/physics/fuel";
import { calculateApparentWind, getSailEfficiency, calculateSailSpeedKn } from "../core/physics/sail";
import { calculateWaveImpact } from "../core/physics/waves";
import { calculateSpeedOverGround } from "../core/physics/current";
import { calculateDistanceNM } from "../core/physics/navigation";
import { VESSELS } from "../config/vessels";
import { makeLat, makeLon } from "../types";

describe("Physics & Navigation Core Pure Functions", () => {
  const v002 = VESSELS["V002"]; // Harbor Trader (Diesel, Eco 8kn, Max 11kn, FuelEco 18kg/h)
  const v001 = VESSELS["V001"]; // Coastal Cutter (Sail, Max 9kn)

  it("1. Engine Telegraph and Power Ratio Verification", () => {
    expect(getPowerRatio("STOP")).toBe(0.0);
    expect(getPowerRatio("FULL")).toBe(1.0);
    expect(getPowerRatio("FLANK")).toBe(1.15);

    // FULL档应为额定最大航速
    const speedFull = calculateTargetSpeed("FULL", v002);
    expect(speedFull).toBe(11.0);

    // STOP档应为0节
    const speedStop = calculateTargetSpeed("STOP", v002);
    expect(speedStop).toBe(0.0);
  });

  it("2. Non-linear Cubic Fuel Consumption (Speed^3) Verification", () => {
    // 经济航速下的主机油耗应严格等于额定值 (18 kg/h)
    const ecoFuelRate = calculateMainFuelRateKgH(v002.ecoSpeedKn, v002);
    expect(Math.round(ecoFuelRate)).toBe(18);

    // 两倍航速应为 8 倍主机油耗
    const doubleSpeedFuelRate = calculateMainFuelRateKgH(v002.ecoSpeedKn * 2, v002);
    expect(Math.round(doubleSpeedFuelRate)).toBe(18 * 8);

    // 停航时油耗为0
    expect(calculateMainFuelRateKgH(0, v002)).toBe(0);
  });

  it("3. Sail Polar Curve and No-Go Zone Verification", () => {
    // 0°~35° 迎风死区 (No-Go Zone) 效率为0
    expect(getSailEfficiency(0)).toBe(0.0);
    expect(getSailEfficiency(20)).toBe(0.0);
    expect(getSailEfficiency(35)).toBe(0.0);

    // 45° 迎风约为 0.65
    expect(getSailEfficiency(45)).toBeCloseTo(0.65, 2);

    // 90° 横风为 1.00
    expect(getSailEfficiency(90)).toBeCloseTo(1.00, 2);

    // 135° 侧顺风达到最佳 1.15
    expect(getSailEfficiency(135)).toBeCloseTo(1.15, 2);

    // 帆船推力航速验证
    const sailSpeed = calculateSailSpeedKn(90, 15, v001);
    expect(sailSpeed).toBeGreaterThan(0);
    expect(sailSpeed).toBeLessThanOrEqual(v001.maxSpeedKn);
  });

  it("4. Wave Resistance and Hull Damage Verification", () => {
    // 浪高低于安全上限无额外衰减与损伤
    const calm = calculateWaveImpact(1.0, v001); // v001 safe wave = 2.0m
    expect(calm.speedRetentionFactor).toBe(1.0);
    expect(calm.hullDamagePerHour).toBe(0.0);
    expect(calm.isStormExceeded).toBe(false);

    // 浪高超出安全上限触发失速与损伤
    const storm = calculateWaveImpact(4.0, v001);
    expect(storm.speedRetentionFactor).toBeLessThan(1.0);
    expect(storm.hullDamagePerHour).toBeGreaterThan(0);
    expect(storm.isStormExceeded).toBe(true);
  });

  it("5. Current Vector & SOG/COG Verification", () => {
    // 顺流 (航向90°东，流向90°东) -> SOG = 船速 + 流速
    const groundSpeed = calculateSpeedOverGround(90, 10, 90, 2);
    expect(groundSpeed.sogKn).toBeCloseTo(12.0, 1);
    expect(groundSpeed.cogDeg).toBe(90);
  });

  it("6. Great Circle Haversine Distance Verification", () => {
    const p1 = { latitude: makeLat(30.0), longitude: makeLon(120.0) };
    const p2 = { latitude: makeLat(30.0), longitude: makeLon(121.0) };
    const dist = calculateDistanceNM(p1, p2);
    // 经度1度在纬度30度处约为 60 * cos(30°) ≈ 51.96 NM
    expect(dist).toBeGreaterThan(45);
    expect(dist).toBeLessThan(60);
  });
});
