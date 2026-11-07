import { makeCredits } from "../types";

export const SUPPLY_PRICES = {
  // 燃油: 1.20 CR/L, 密度 0.85 t/m3 => 1t = 1176.47 L => 1411.76 CR/t
  FUEL_CR_PER_LITER: makeCredits(1.20),
  FUEL_CR_PER_TON: makeCredits(1411.76),
  
  // 淡水: 2.50 CR/t
  FRESH_WATER_CR_PER_TON: makeCredits(2.50),
  
  // 口粮: 5.0 CR/kg => 5000 CR/t
  RATION_CR_PER_KG: makeCredits(5.0),
  RATION_CR_PER_TON: makeCredits(5000),
  
  // 备件: 1.20 CR/kg => 1200 CR/t
  SPARE_PARTS_CR_PER_KG: makeCredits(1.20),
  SPARE_PARTS_CR_PER_TON: makeCredits(1200),
};

export const CREW_CONSUMPTION_CONFIG = {
  // 人均日消费 (24小时)
  WATER_TONS_PER_PERSON_DAY: 0.015, // 15 L/人/天
  RATION_TONS_PER_PERSON_DAY: 0.003, // 3 kg/人/天
  WAGE_CR_PER_PERSON_DAY: makeCredits(200), // 200 CR/人/天
  
  // 备件基准消耗率 (每100海里消耗吨数基数)
  PARTS_CONSUMPTION_PER_100_NM: 0.005,
};

export const SALVAGE_TUG_PRICES = {
  BASE_CALLOUT_FEE: makeCredits(8000),
  FEE_PER_NM_TOWED: makeCredits(65),
  MINIMUM_REPAIR_FEE: makeCredits(3000),
};
