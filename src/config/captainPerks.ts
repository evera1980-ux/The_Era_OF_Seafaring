export interface CaptainPerk {
  perkId: string;
  name: string;
  nameEn: string;
  unlockLevel: number;
  pointCost: number;
  description: string;
  descriptionEn: string;
  bonus: {
    type: "FUEL" | "SPEED" | "WEATHER" | "TRADE" | "CREW" | "CARGO" | "MAYDAY" | "XP";
    value: number;
  };
}

/**
 * PRD 4.2.4 船长技能树完整 10 项配置表
 */
export const CAPTAIN_PERKS: CaptainPerk[] = [
  {
    perkId: "PERK_EFFICIENT_ENGINE",
    name: "轮机精通 (Efficient Engine)",
    nameEn: "Efficient Engine",
    unlockLevel: 1,
    pointCost: 1,
    description: "熟悉主机最佳经济工况区间，主机燃油消耗降低 5%。",
    descriptionEn: "Mastery of main engine RPM curves reduces fuel consumption by 5%.",
    bonus: { type: "FUEL", value: 0.05 },
  },
  {
    perkId: "PERK_WEATHER_READER",
    name: "海洋气象学家 (Weather Reader)",
    nameEn: "Weather Reader",
    unlockLevel: 5,
    pointCost: 2,
    description: "精准研判锋面气旋与涌浪周期，风浪失速与天气误差影响降低 15%。",
    descriptionEn: "Reads barometric fronts and swell periods, reducing wave speed penalty by 15%.",
    bonus: { type: "WEATHER", value: 0.15 },
  },
  {
    perkId: "PERK_CARGO_MASTER",
    name: "精明大副 (Cargo Master)",
    nameEn: "Cargo Master",
    unlockLevel: 10,
    pointCost: 2,
    description: "科学配平压载水与货舱系固，货物抗浪完好度损耗降低 25%，贸易收益 +5%。",
    descriptionEn: "Optimizes ballast and cargo lashing, boosting trade payout by +5%.",
    bonus: { type: "TRADE", value: 0.05 },
  },
  {
    perkId: "PERK_EMERGENCY_CAPTAIN",
    name: "海事搜救专家 (Emergency Captain)",
    nameEn: "Emergency Captain",
    unlockLevel: 15,
    pointCost: 3,
    description: "Mayday 商船求援成功率 +15%，自主脱浅成功率 +15%。",
    descriptionEn: "Increases Mayday AIS aid and self-refloat success probability by +15%.",
    bonus: { type: "MAYDAY", value: 0.15 },
  },
  {
    perkId: "PERK_OCEAN_NAVIGATOR",
    name: "大洋领航员 (Ocean Navigator)",
    nameEn: "Ocean Navigator",
    unlockLevel: 20,
    pointCost: 3,
    description: "精通大圆航线与黑潮/湾流借力，综合巡航航速提升 8%。",
    descriptionEn: "Harnesses great circle routes and ocean currents for +8% cruising speed.",
    bonus: { type: "SPEED", value: 0.08 },
  },
  {
    perkId: "PERK_FLEET_MANAGER",
    name: "远洋船队总管 (Fleet Manager)",
    nameEn: "Fleet Manager",
    unlockLevel: 25,
    pointCost: 4,
    description: "严密管理船员轮班与膳食配给，淡水与口粮日消耗降低 15%。",
    descriptionEn: "Streamlines crew watch schedules, reducing daily water and ration burn by 15%.",
    bonus: { type: "CREW", value: 0.15 },
  },
  {
    perkId: "PERK_POLAR_SPECIALIST",
    name: "极地破冰先驱 (Polar Specialist)",
    nameEn: "Polar Specialist",
    unlockLevel: 30,
    pointCost: 4,
    description: "高纬度冰区与狂暴西风带船体损伤减少 25%。",
    descriptionEn: "Reduces hull structural damage in high-latitude ice and storm zones by 25%.",
    bonus: { type: "WEATHER", value: 0.25 },
  },
  {
    perkId: "PERK_TRADE_NEGOTIATOR",
    name: "远洋谈判专家 (Trade Negotiator)",
    nameEn: "Trade Negotiator",
    unlockLevel: 35,
    pointCost: 5,
    description: "全球港口贸易交割售价额外提升 8%，加油与修船费享受折扣。",
    descriptionEn: "Secures +8% higher commodity sell prices across all global ports.",
    bonus: { type: "TRADE", value: 0.08 },
  },
  {
    perkId: "PERK_MASTER_MARINER",
    name: "传奇船长 (Master Mariner)",
    nameEn: "Master Mariner",
    unlockLevel: 40,
    pointCost: 5,
    description: "所有航行里程、港口开拓与 AIS 图鉴获取的航海经验 (SXP) +20%。",
    descriptionEn: "Increases all Seamanship XP gained from sailing and spotting by +20%.",
    bonus: { type: "XP", value: 0.20 },
  },
  {
    perkId: "PERK_GLOBAL_EXPLORER",
    name: "环球远征统帅 (Global Explorer)",
    nameEn: "Global Explorer",
    unlockLevel: 45,
    pointCost: 6,
    description: "主机燃油消耗再降 6%，特许航运合约与环球任务奖金提升 25%。",
    descriptionEn: "Reduces fuel burn by an additional 6% and boosts charter rewards by +25%.",
    bonus: { type: "FUEL", value: 0.06 },
  },
];

export const CAPTAIN_PERK_LIST: CaptainPerk[] = CAPTAIN_PERKS;
export const CAPTAIN_PERK_MAP: Record<string, CaptainPerk> = Object.fromEntries(
  CAPTAIN_PERKS.map((p) => [p.perkId, p])
);
