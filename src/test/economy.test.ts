import { describe, it, expect } from "vitest";
import {
  calculateSellPricePerT,
  calculateStockFactor,
  refreshPortCommoditiesStock,
  calculateTradeProfit,
} from "../core/economy/trade";
import {
  calculateDrydockRepairCost,
  calculateSeaRepairResult,
} from "../core/economy/maintenance";
import { evaluateCrewStatus } from "../core/economy/crew";
import {
  canInstallUpgrade,
  calculateEffectiveCargoCapacityT,
} from "../core/economy/upgrades";
import { PORTS } from "../config/ports";
import { VESSELS } from "../config/vessels";
import { CHARTER_CONTRACT_LIST } from "../config/contracts";

describe("Economy, Trade, Maintenance & Upgrades Pure Functions", () => {
  it("expands global ports to 20+ ports across all 8 trade regions", () => {
    const portCount = Object.keys(PORTS).length;
    expect(portCount).toBeGreaterThanOrEqual(20);
    expect(PORTS.CNSHA).toBeDefined();
    expect(PORTS.SGSIN).toBeDefined();
    expect(PORTS.NLRTM).toBeDefined();
    expect(PORTS.USLAX).toBeDefined();
    expect(PORTS.ARGUS).toBeDefined();
    expect(CHARTER_CONTRACT_LIST.length).toBeGreaterThanOrEqual(8);
  });

  it("scales commodity sell price positively with voyage distance and storm bonus", () => {
    const shortHaulPrice = calculateSellPricePerT("C001", 100, false, 1.0);
    const longHaulPrice = calculateSellPricePerT("C001", 3500, false, 1.0);
    const stormLongHaulPrice = calculateSellPricePerT("C001", 3500, true, 1.0);

    expect(longHaulPrice).toBeGreaterThan(shortHaulPrice);
    expect(stormLongHaulPrice).toBeGreaterThan(longHaulPrice);
  });

  it("refreshes port commodity stocks and dynamic demand factor", () => {
    const lowStockFactor = calculateStockFactor(5000, 50000);
    const highStockFactor = calculateStockFactor(45000, 50000);
    expect(lowStockFactor).toBeGreaterThan(highStockFactor);

    const refreshed = refreshPortCommoditiesStock(PORTS.CNSHA.commodities, 10);
    expect(refreshed.length).toBe(PORTS.CNSHA.commodities.length);
    const profit = calculateTradeProfit(1700, 2200, 10, 500);
    expect(profit).toBe(4500);
  });

  it("computes drydock repair cost and at-sea emergency spare parts repair", () => {
    const costT1 = calculateDrydockRepairCost(1000, 1);
    const costT4 = calculateDrydockRepairCost(1000, 4);
    expect(costT1).toBeGreaterThan(0);
    expect(costT4).toBeGreaterThan(costT1);

    const seaRepair = calculateSeaRepairResult(7000, 10000, 0.3);
    expect(seaRepair.canRepair).toBe(true);
    expect(seaRepair.nextHullHp).toBe(8500);
    expect(seaRepair.nextSparePartsT).toBe(0.2);
  });

  it("evaluates crew dehydration/starvation debuffs and upgrade capacity bonuses", () => {
    const healthyCrew = evaluateCrewStatus(4, {
      fuelT: 1,
      freshWaterT: 1,
      rationT: 0.5,
      sparePartsT: 0.2,
    });
    expect(healthyCrew.efficiencyMultiplier).toBe(1.0);

    const dehydratedCrew = evaluateCrewStatus(4, {
      fuelT: 1,
      freshWaterT: 0,
      rationT: 0.5,
      sparePartsT: 0.2,
    });
    expect(dehydratedCrew.isDehydrated).toBe(true);
    expect(dehydratedCrew.efficiencyMultiplier).toBeLessThan(1.0);

    const check = canInstallUpgrade(VESSELS.V001, [], "U001", 90000);
    expect(check.allowed).toBe(true);

    const cap = calculateEffectiveCargoCapacityT(
      VESSELS.V004,
      [{ upgradeId: "U010", installedAtGameTime: 0, durability: 100 }],
      0
    );
    expect(cap.effectiveCapacityT).toBeGreaterThan(VESSELS.V004.dwtT);
  });
});
