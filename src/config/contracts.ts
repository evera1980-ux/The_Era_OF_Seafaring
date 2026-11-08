export interface CharterContractSpec {
  contractId: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  originPortId: string;
  destinationPortId: string;
  commodityId: string;
  requiredTons: number;
  rewardCredits: number;
  rewardXP: number;
  minTier: number;
}

/**
 * 全球特许航运合约库 (Charter Contracts)
 * 涵盖 PRD 5.2.7 新手近海委派与跨洋干线特许合约
 * 商品 ID 严格对齐 COMMODITIES (C001 ~ C015)
 */
export const CHARTER_CONTRACTS: Record<string, CharterContractSpec> = {
  CNT_001: {
    contractId: "CNT_001",
    title: "东海集装箱百货加急调拨",
    titleEn: "East China Sea Container Express",
    description: "从上海/舟山港运输 10 吨集装箱百货 (C001) 至日本横滨港，完成首航委派。",
    descriptionEn: "Transport 10t of Container Goods (C001) from Shanghai/Zhoushan to Yokohama Port.",
    originPortId: "CNSHA",
    destinationPortId: "JPYOK",
    commodityId: "C001",
    requiredTons: 10,
    rewardCredits: 12000,
    rewardXP: 2000,
    minTier: 1,
  },
  CNT_002: {
    contractId: "CNT_002",
    title: "海峡两岸百货快航专线",
    titleEn: "Strait Express Cargo Dispatch",
    description: "从上海/舟山港运输 8 吨集装箱百货 (C001) 前往高雄港。",
    descriptionEn: "Deliver 8t of Container Goods (C001) from Shanghai/Zhoushan to Kaohsiung.",
    originPortId: "CNSHA",
    destinationPortId: "TWKHH",
    commodityId: "C001",
    requiredTons: 8,
    rewardCredits: 13500,
    rewardXP: 2200,
    minTier: 1,
  },
  CNT_003: {
    contractId: "CNT_003",
    title: "东北亚精密汽车组件直航",
    titleEn: "Northeast Asia Precision Auto Direct",
    description: "从横滨港运送 8 吨日本精密汽车 (C014) 前往釜山港。",
    descriptionEn: "Ship 8t of Precision Automobiles (C014) from Yokohama to Busan.",
    originPortId: "JPYOK",
    destinationPortId: "KRPUS",
    commodityId: "C014",
    requiredTons: 8,
    rewardCredits: 19500,
    rewardXP: 2800,
    minTier: 1,
  },
  CNT_004: {
    contractId: "CNT_004",
    title: "马六甲天然橡胶南洋线",
    titleEn: "Malacca Natural Rubber Clipper",
    description: "从新加坡港装载 30 吨东南亚橡胶 (C006) 运往香港维多利亚港。",
    descriptionEn: "Carry 30t of Southeast Asian Rubber (C006) from Singapore to Hong Kong.",
    originPortId: "SGSIN",
    destinationPortId: "CNHKG",
    commodityId: "C006",
    requiredTons: 30,
    rewardCredits: 32000,
    rewardXP: 4500,
    minTier: 2,
  },
  CNT_005: {
    contractId: "CNT_005",
    title: "印度洋能源补给干线",
    titleEn: "Indian Ocean Crude Energy Trunk",
    description: "从迪拜杰贝阿里港运输 200 吨波斯湾原油 (C002) 前往新加坡港。",
    descriptionEn: "Transport 200t of Persian Gulf Crude Oil (C002) from Jebel Ali Dubai to Singapore.",
    originPortId: "AEJEA",
    destinationPortId: "SGSIN",
    commodityId: "C002",
    requiredTons: 200,
    rewardCredits: 68000,
    rewardXP: 7500,
    minTier: 2,
  },
  CNT_006: {
    contractId: "CNT_006",
    title: "亚欧苏伊士精密海事仪器包船",
    titleEn: "Asia-Europe Suez Precision Instruments Charter",
    description: "从鹿特丹港运输 120 吨精密海事仪器 (C005) 经苏伊士运河抵达上海港。",
    descriptionEn: "Deliver 120t of Precision Marine Instruments (C005) from Rotterdam to Shanghai.",
    originPortId: "NLRTM",
    destinationPortId: "CNSHA",
    commodityId: "C005",
    requiredTons: 120,
    rewardCredits: 380000,
    rewardXP: 18000,
    minTier: 3,
  },
  CNT_007: {
    contractId: "CNT_007",
    title: "跨太平洋大圆谷物快航",
    titleEn: "Trans-Pacific Great Circle Grain Express",
    description: "从洛杉矶港运输 300 吨北美谷物 (C010) 跨越北太平洋直达横滨港。",
    descriptionEn: "Ship 300t of North American Grain (C010) across the North Pacific from Los Angeles to Yokohama.",
    originPortId: "USLAX",
    destinationPortId: "JPYOK",
    commodityId: "C010",
    requiredTons: 300,
    rewardCredits: 220000,
    rewardXP: 14000,
    minTier: 3,
  },
  CNT_008: {
    contractId: "CNT_008",
    title: "德雷克海峡极地冷链科考补给",
    titleEn: "Drake Passage Polar Cold-Chain Supply",
    description: "从乌斯怀亚港运送 50 吨智利冷链海鲜 (C004) 前往瓦尔帕莱索港。",
    descriptionEn: "Deliver 50t of Chilean Cold-Chain Seafood (C004) from Ushuaia to Valparaiso.",
    originPortId: "ARGUS",
    destinationPortId: "CLVAP",
    commodityId: "C004",
    requiredTons: 50,
    rewardCredits: 175000,
    rewardXP: 12000,
    minTier: 3,
  },
};

export const CHARTER_CONTRACT_LIST: CharterContractSpec[] = Object.values(CHARTER_CONTRACTS);
