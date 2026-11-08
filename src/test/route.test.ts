import { describe, it, expect } from "vitest";
import { generateGreatCirclePositions } from "../core/route/greatCircle";
import { createPassagePlan } from "../core/route/routePlanner";
import { validateRouteFeasibility } from "../core/route/routeValidation";
import { PORTS } from "../config/ports";
import { VESSELS } from "../config/vessels";

describe("Spherical Great Circle Route & Feasibility Validation", () => {
  it("generates spherical Great Circle intermediate waypoints using Turf.js", () => {
    const start = PORTS.CNSHA.position;
    const end = PORTS.USLAX.position;
    const pts = generateGreatCirclePositions(start, end, 12);

    expect(pts.length).toBeGreaterThan(2);
    // 北太平洋大圆航线中间点纬度会明显高于起点上海 (30.6°N) 与终点洛杉矶 (33.7°N)
    const maxLat = Math.max(...pts.map((p) => p.latitude));
    expect(maxLat).toBeGreaterThan(start.latitude);
  });

  it("calculates realistic passage plan fuel consumption and validates draft safety", () => {
    const plan = createPassagePlan(
      PORTS.CNSHA.position,
      PORTS.JPYOK,
      VESSELS.V002.ecoSpeedKn,
      VESSELS.V002
    );

    expect(plan.totalDistanceNM).toBeGreaterThan(800);
    expect(plan.estimatedFuelT).toBeGreaterThan(0);

    // V009 (Cape Bulk Carrier) 满载吃水 18.0m 超过 乌斯怀亚 ARGUS 最大吃水 10.5m
    const feasibility = validateRouteFeasibility(
      18.0,
      PORTS.ARGUS,
      plan.estimatedFuelT,
      VESSELS.V009
    );
    expect(feasibility.canEnterPort).toBe(false);
    expect(feasibility.warnings.some((w) => w.includes("DRAFT_EXCEEDED"))).toBe(true);
  });

  it("routes coastal and strait passages along maritime sea lanes instead of cutting overland", () => {
    // 上海 -> 横滨 应绕行大隅海峡与黑潮外海走廊，航路点不会穿过九州内陆 (32.0~33.5N, 130.2~131.5E)
    const shaToYok = createPassagePlan(
      PORTS.CNSHA.position,
      PORTS.JPYOK,
      VESSELS.V001.ecoSpeedKn,
      VESSELS.V001
    );
    expect(shaToYok.waypoints.length).toBeGreaterThanOrEqual(4);
    for (const wp of shaToYok.waypoints) {
      const inKyushuInland =
        wp.position.latitude > 31.6 &&
        wp.position.latitude < 33.6 &&
        wp.position.longitude > 130.2 &&
        wp.position.longitude < 131.6;
      expect(inKyushuInland).toBe(false);
    }

    // 上海 -> 新加坡 应走台湾海峡与南海航道，航程大于直线球面距离且不穿过中国华南内陆
    const shaToSin = createPassagePlan(
      PORTS.CNSHA.position,
      PORTS.SGSIN,
      VESSELS.V002.ecoSpeedKn,
      VESSELS.V002
    );
    expect(shaToSin.totalDistanceNM).toBeGreaterThan(2000);
    for (const wp of shaToSin.waypoints) {
      const inMainlandChina =
        wp.position.latitude > 23.0 &&
        wp.position.latitude < 30.0 &&
        wp.position.longitude < 118.0;
      expect(inMainlandChina).toBe(false);
    }
  });
});

