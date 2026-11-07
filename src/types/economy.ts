import { Credits } from "./index";

export interface CommoditySpec {
  commodityId: string;
  name: string;
  category: "Bulk" | "Liquid" | "Container" | "Refrigerated" | "HighTech";
  basePricePerT: Credits;
  distancePremiumAlpha: number;
  weatherRiskMultiplier: number;
  primaryOriginRegion: string;
  primaryDestinationRegion: string;
  volumeM3PerT: number;
}

export interface TradeTransactionResult {
  success: boolean;
  creditsDelta: Credits;
  cargoDeltaWeightT: number;
  message: string;
}

export interface PortDistanceTable {
  fromPortId: string;
  toPortId: string;
  distanceNM: number;
}
