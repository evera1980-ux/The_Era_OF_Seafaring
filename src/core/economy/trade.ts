import { COMMODITIES } from "../../config/commodities";
import { Credits, PortCommodity, PortInfo, makeCredits } from "../../types";

/**
 * 根据港口当前库存率计算动态供需价格系数 (0.75 ~ 1.35)
 * 库存越低，需求越旺盛，系数越高
 */
export function calculateStockFactor(stockT: number, maxStockT: number): number {
  if (maxStockT <= 0) return 1.0;
  const ratio = Math.max(0, Math.min(1, stockT / maxStockT));
  // 当 ratio = 0 时为 1.35，当 ratio = 0.5 时为 1.05，当 ratio = 1.0 时为 0.75
  return Math.round((1.35 - ratio * 0.6) * 100) / 100;
}

/**
 * 依据距离溢价、风暴天气溢价与市场库存系数计算贸易品销售价格 (CR/t)
 * PRD 2.3.1: Price_Sell = BasePrice * (1 + alpha * D_NM) * K_weather * K_demand
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

  // 即使同港或极短途卖出，也给基础保底折扣；长途航行则按距离溢价放大
  const effectiveDistance = Math.max(0, distanceNM);
  const kDistance =
    effectiveDistance < 10
      ? 0.92
      : 1.0 + Math.max(spec.distancePremiumAlpha, 0.00035) * effectiveDistance;

  // 天气风险溢价
  const kWeather = experiencedStorm ? spec.weatherRiskMultiplier : 1.0;
  // 市场供需系数 (0.7 ~ 1.4)
  const kDemand = Math.max(0.7, Math.min(1.4, demandStockFactor));

  const finalPrice = spec.basePricePerT * kDistance * kWeather * kDemand;
  return makeCredits(Math.round(finalPrice));
}

/**
 * 动态刷新港口商品库存与买卖挂牌价 (纯函数)
 */
export function refreshPortCommoditiesStock(
  commodities: PortCommodity[],
  elapsedGameHours: number
): PortCommodity[] {
  if (elapsedGameHours <= 0) return commodities;
  return commodities.map((item) => {
    const netDelta =
      (item.productionPerGameHourT - item.consumptionPerGameHourT) * elapsedGameHours;
    const nextStockT = Math.max(
      0,
      Math.min(item.maxStockT, Math.round(item.stockT + netDelta))
    );
    const stockFactor = calculateStockFactor(nextStockT, item.maxStockT);
    const baseSpec = COMMODITIES[item.commodityId];
    const basePrice = baseSpec ? baseSpec.basePricePerT : item.buyPricePerT;

    return {
      ...item,
      stockT: nextStockT,
      buyPricePerT: makeCredits(Math.round(basePrice * stockFactor)),
      sellPricePerT: makeCredits(Math.round(basePrice * stockFactor * 1.12)),
    };
  });
}

/**
 * 批量刷新全球港口商品状态
 */
export function refreshGlobalPortsEconomy(
  ports: Record<string, PortInfo>,
  elapsedGameHours: number
): Record<string, PortInfo> {
  const updated: Record<string, PortInfo> = {};
  for (const [portId, port] of Object.entries(ports)) {
    updated[portId] = {
      ...port,
      commodities: refreshPortCommoditiesStock(port.commodities, elapsedGameHours),
    };
  }
  return updated;
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
