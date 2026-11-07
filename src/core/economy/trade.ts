import { COMMODITIES } from "../../config/commodities";
import { Credits, makeCredits } from "../../types";

/**
 * 依据距离溢价与天气溢价计算贸易品销售价格 (CR/t)
 */
export function calculateSellPricePerT(
  commodityId: string,
  distanceNM: number,
  experiencedStorm: boolean = false,
  demandStockFactor: number = 1.0
): Credits {
  const spec = COMMODITIES[commodityId];
  if (!spec) {
    return makeCredits(100);
  }

  // 距离溢价 K_distance = 1 + alpha * D
  const kDistance = 1.0 + spec.distancePremiumAlpha * distanceNM;
  // 天气风险溢价
  const kWeather = experiencedStorm ? spec.weatherRiskMultiplier : 1.0;
  // 市场供需系数 (0.8 ~ 1.3)
  const kDemand = Math.max(0.7, Math.min(1.4, demandStockFactor));

  const finalPrice = spec.basePricePerT * kDistance * kWeather * kDemand;
  return makeCredits(Math.round(finalPrice));
}

/**
 * 计算单趟贸易理论净利润
 */
export function calculateTradeProfit(
  buyPricePerT: number,
  sellPricePerT: number,
  quantityT: number,
  totalVoyageCostsCR: number
): number {
  const grossRevenue = sellPricePerT * quantityT;
  const cargoCost = buyPricePerT * quantityT;
  return grossRevenue - cargoCost - totalVoyageCostsCR;
}
