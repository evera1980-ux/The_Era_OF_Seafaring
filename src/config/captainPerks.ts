export interface CaptainPerk {
  perkId: string;
  name: string;
  unlockLevel: number;
  description: string;
  bonus: {
    type: "FUEL" | "SPEED" | "WEATHER" | "TRADE" | "CREW";
    value: number;
  };
}

export const CAPTAIN_PERKS: CaptainPerk[] = [
  {
    perkId: "PERK_ROOKIE_NAVIGATOR",
    name: "见习领航员",
    unlockLevel: 2,
    description: "精准修正流压与风压差，航行失速减少 5%",
    bonus: { type: "SPEED", value: 0.05 },
  },
  {
    perkId: "PERK_FUEL_WHISPERER",
    name: "节油老手",
    unlockLevel: 5,
    description: "熟悉主机最佳燃油工况区间，巡航燃油消耗降低 6%",
    bonus: { type: "FUEL", value: 0.06 },
  },
  {
    perkId: "PERK_STORM_HUNTER",
    name: "暴风眼行者",
    unlockLevel: 10,
    description: "善于在大浪中调整切浪迎浪角，恶劣海况船体损伤减少 20%",
    bonus: { type: "WEATHER", value: 0.20 },
  },
  {
    perkId: "PERK_MASTER_TRADER",
    name: "远洋行商",
    unlockLevel: 15,
    description: "掌握各大海运指数套利机会，贸易商品出售价格提高 5%",
    bonus: { type: "TRADE", value: 0.05 },
  },
];
