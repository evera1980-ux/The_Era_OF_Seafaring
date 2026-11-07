import { AssetKey, AssetConfig } from "../types";
import { generateVesselSvg } from "./procedural/vesselSvg";

export class AssetRegistry {
  private overrides: Map<AssetKey, string> = new Map();

  constructor() {
    // 检查是否有本地预置美术
  }

  registerOverride(key: AssetKey, url: string) {
    this.overrides.set(key, url);
  }

  hasOverride(key: AssetKey): boolean {
    return this.overrides.has(key);
  }

  getVesselSvg(tier: 1 | 2 | 3 | 4 | 5 | 6, propulsion: "Sail" | "Diesel" | "Hybrid" | "Nuclear"): string {
    return generateVesselSvg(tier, propulsion);
  }
}

export const assetRegistry = new AssetRegistry();
