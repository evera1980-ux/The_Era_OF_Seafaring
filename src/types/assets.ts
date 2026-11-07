import { AssetKey, AssetConfig } from "./index";

export interface AssetRegistryInterface {
  resolveUrl(key: AssetKey): string;
  getConfig(key: AssetKey): AssetConfig;
  hasOverride(key: AssetKey): boolean;
  registerOverride(key: AssetKey, path: string): void;
}
