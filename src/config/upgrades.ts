import { makeCredits } from "../types";

export interface UpgradeSpec {
  upgradeId: string;
  name: string;
  nameEn: string;
  category: string;
  price: ReturnType<typeof makeCredits>;
  weightT: number;
  description: string;
  descriptionEn: string;
  effects: {
    fuelEconomyBonus?: number;
    speedBonus?: number;
    sailEfficiencyBonus?: number;
    hullResistanceBonus?: number;
    safeWaveBonusM?: number;
    waterProductionTPerDay?: number;
    waterMakerFuelKgH?: number;
    fuelCapacityBonusT?: number;
    auxFuelReductionBonus?: number;
    autopilotEfficiencyBonus?: number;
    cargoLossReductionBonus?: number;
    radarRangeBonusNM?: number;
    cargoCapacityMultiplierBonus?: number;
  };
}

/**
 * PRD 3.2 船厂模块化改装完整 12 项配置表 (U001 ~ U012)
 */
export const UPGRADES: Record<string, UpgradeSpec> = {
  U001: {
    upgradeId: "U001",
    name: "RO 反渗透海水淡化机",
    nameEn: "RO Desalination Unit",
    category: "WaterMaker",
    price: makeCredits(80000),
    weightT: 5,
    description: "产水 2.0 吨/小时 (48t/日)，耗电折合燃油 2.64 kg/h，彻底解决中远洋淡水焦虑。",
    descriptionEn: "Produces 2.0 t/h potable water (2.64 kg/h fuel draw), eliminating ocean water shortages.",
    effects: {
      waterProductionTPerDay: 48.0,
      waterMakerFuelKgH: 2.64,
    },
  },
  U002: {
    upgradeId: "U002",
    name: "RO 海水淡化机 XL",
    nameEn: "RO Desalination Unit XL",
    category: "WaterMaker",
    price: makeCredits(350000),
    weightT: 40,
    description: "大型远洋船用二级反渗透系统，产水 20 吨/小时，满足百人科考与极地船队需求。",
    descriptionEn: "Heavy-duty marine desalination plant producing 20 t/h fresh water for large crews.",
    effects: {
      waterProductionTPerDay: 480.0,
      waterMakerFuelKgH: 26.4,
    },
  },
  U003: {
    upgradeId: "U003",
    name: "远洋副油箱扩建模块",
    nameEn: "Auxiliary Fuel Bunker Tank",
    category: "FuelEconomizer",
    price: makeCredits(120000),
    weightT: 50,
    description: "加装高强度双层副油箱，额外增加 50 吨燃油容量上限，大幅拓展跨洋续航半径。",
    descriptionEn: "Adds +50t extra fuel bunker capacity to extend transoceanic endurance.",
    effects: {
      fuelCapacityBonusT: 50,
    },
  },
  U004: {
    upgradeId: "U004",
    name: "有机硅自抛光防污底漆",
    nameEn: "Self-Polishing Anti-Fouling Coating",
    category: "HullReinforcement",
    price: makeCredits(60000),
    weightT: 1,
    description: "抑制船底藤壶附着并降低摩擦水阻，全工况航速 +3%，主机燃油消耗 -2%。",
    descriptionEn: "Reduces hull skin friction: +3% vessel speed and -2% main engine fuel burn.",
    effects: {
      speedBonus: 0.03,
      fuelEconomyBonus: 0.02,
    },
  },
  U005: {
    upgradeId: "U005",
    name: "大功率船首侧推器",
    nameEn: "Bow Tunnel Thruster",
    category: "Navigation",
    price: makeCredits(90000),
    weightT: 8,
    description: "提升窄水道与港口靠泊操纵效率 +35%，转向角速度响应更敏捷。",
    descriptionEn: "Improves harbor docking & turn rate maneuverability by +35%.",
    effects: {
      speedBonus: 0.02,
    },
  },
  U006: {
    upgradeId: "U006",
    name: "PC级冰区加强肋骨装甲",
    nameEn: "Polar Ice-Class Hull Ribs",
    category: "HullReinforcement",
    price: makeCredits(450000),
    weightT: 200,
    description: "安全抗浪高度上限 +1.5m，恶劣风浪与高纬浮冰区船体耐久损伤降低 50%。",
    descriptionEn: "Increases safe wave height by +1.5m and reduces storm/ice hull damage by 50%.",
    effects: {
      safeWaveBonusM: 1.5,
      hullResistanceBonus: 0.50,
    },
  },
  U007: {
    upgradeId: "U007",
    name: "Flettner 风力助推转子帆",
    nameEn: "Flettner Rotor Sail System",
    category: "Rigging",
    price: makeCredits(600000),
    weightT: 150,
    description: "利用马格努斯效应产生侧风推力，主机燃油消耗降低 15%，风帆推力效率 +12%。",
    descriptionEn: "Harnesses the Magnus effect: -15% engine fuel demand and +12% wind propulsion.",
    effects: {
      fuelEconomyBonus: 0.15,
      sailEfficiencyBonus: 0.12,
    },
  },
  U008: {
    upgradeId: "U008",
    name: "甲板单晶硅太阳能阵列",
    nameEn: "Marine Solar Deck Array",
    category: "Engine",
    price: makeCredits(200000),
    weightT: 20,
    description: "全天候补充船载电网，辅机发电油耗降低 20%，综合燃油效率提升 4%。",
    descriptionEn: "Reduces auxiliary generator fuel consumption by 20% and saves 4% total fuel.",
    effects: {
      auxFuelReductionBonus: 0.20,
      fuelEconomyBonus: 0.04,
    },
  },
  U009: {
    upgradeId: "U009",
    name: "多波束深海前视声呐",
    nameEn: "Multibeam Forward Deep Sonar",
    category: "Sonar",
    price: makeCredits(150000),
    weightT: 5,
    description: "海底暗礁与浅滩探测半径扩展 5 NM，大幅降低近岸搁浅风险。",
    descriptionEn: "Extends underwater reef and shoal detection range by 5 NM.",
    effects: {
      radarRangeBonusNM: 5,
    },
  },
  U010: {
    upgradeId: "U010",
    name: "AI 气象寻优自动引航系统",
    nameEn: "Weather-Routing Autopilot System",
    category: "Navigation",
    price: makeCredits(300000),
    weightT: 2,
    description: "实时补偿横漂与洋流切变，自动航行综合航速效率 +5%。",
    descriptionEn: "Optimizes course tracking against leeway and currents: +5% cruising speed.",
    effects: {
      speedBonus: 0.05,
      autopilotEfficiencyBonus: 0.05,
      cargoCapacityMultiplierBonus: 0.12,
    },
  },
  U011: {
    upgradeId: "U011",
    name: "双联高压燃油精滤系统",
    nameEn: "Duplex Fuel Purifier & Economizer",
    category: "Engine",
    price: makeCredits(180000),
    weightT: 10,
    description: "提升重油/柴油雾化燃烧效率，主机油耗降低 8%，主机过热率降低 50%。",
    descriptionEn: "Improves fuel atomization: -8% main fuel burn and -50% engine overheat rate.",
    effects: {
      fuelEconomyBonus: 0.08,
    },
  },
  U012: {
    upgradeId: "U012",
    name: "智能温控冷链集装箱货舱",
    nameEn: "Active Reefer Cold-Chain Hold",
    category: "CargoCrane",
    price: makeCredits(250000),
    weightT: 80,
    description: "为冷链海鲜与高价值货物提供恒温保护，风浪货损率降低 90%。",
    descriptionEn: "Protects perishable and fragile cargo: reduces wave cargo integrity loss by 90%.",
    effects: {
      cargoLossReductionBonus: 0.90,
      cargoCapacityMultiplierBonus: 0.05,
    },
  },
};

export const UPGRADE_CATALOG = UPGRADES;
export const UPGRADE_LIST: UpgradeSpec[] = Object.values(UPGRADES);
