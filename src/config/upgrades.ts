import { makeCredits } from "../types";

export interface UpgradeSpec {
  upgradeId: string;
  name: string;
  category: string;
  price: ReturnType<typeof makeCredits>;
  description: string;
  effects: {
    fuelEconomyBonus?: number; // 如 0.08 表示省油 8%
    sailEfficiencyBonus?: number;
    hullResistanceBonus?: number;
    waterProductionTPerDay?: number; // 每日造水量 (t)
    radarRangeBonusNM?: number;
  };
}

export const UPGRADES: Record<string, UpgradeSpec> = {
  WATER_MAKER_1: {
    upgradeId: "WATER_MAKER_1",
    name: "船载反渗透淡化机 RO-500",
    category: "WaterMaker",
    price: makeCredits(18000),
    description: "每日生产 0.5 吨淡水，大幅降低远洋饮用水耗尽风险。",
    effects: {
      waterProductionTPerDay: 0.5,
    },
  },
  FUEL_ECONOMIZER: {
    upgradeId: "FUEL_ECONOMIZER",
    name: "主机燃油优化微电脑",
    category: "FuelEconomizer",
    price: makeCredits(32000),
    description: "优化供油喷射脉宽，降低经济航速燃油消耗 8%。",
    effects: {
      fuelEconomyBonus: 0.08,
    },
  },
  AUTO_RIGGING: {
    upgradeId: "AUTO_RIGGING",
    name: "自动液压张帆索具系统",
    category: "Rigging",
    price: makeCredits(24000),
    description: "通过伺服绞盘自动配平帆角，提升风帆全向推力效率 10%。",
    effects: {
      sailEfficiencyBonus: 0.10,
    },
  },
  REINFORCED_HULL: {
    upgradeId: "REINFORCED_HULL",
    name: "重型高抗拉双层加固船壳",
    category: "HullReinforcement",
    price: makeCredits(45000),
    description: "增强船体龙骨结构，降低恶劣海况波浪损伤 30%。",
    effects: {
      hullResistanceBonus: 0.30,
    },
  },
};
