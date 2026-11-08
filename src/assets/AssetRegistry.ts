import { AssetKey, AssetManifest } from "../types";
import { generateVesselSvg } from "./procedural/vesselSvg";
import { generateWeatherSvgDataUri } from "./procedural/weatherSvg";
import { generateCompassSvgDataUri } from "./procedural/compassSvg";
import { generateCargoSvgDataUri } from "./procedural/cargoSvg";

export class AssetRegistry {
  private overrides: Map<AssetKey, string> = new Map();
  private manifest: AssetManifest | null = null;

  constructor() {
    this.loadManifestAsync();
  }

  private async loadManifestAsync() {
    if (typeof fetch === "undefined") return;
    try {
      const res = await fetch("/assets/assetManifest.json");
      if (res.ok) {
        const data: AssetManifest = await res.json();
        this.manifest = data;
      }
    } catch {
      // 默认使用内置程序化 SVG
    }
  }

  registerOverride(key: AssetKey, url: string) {
    this.overrides.set(key, url);
  }

  hasOverride(key: AssetKey): boolean {
    return this.overrides.has(key);
  }

  getVesselSvg(
    tier: 1 | 2 | 3 | 4 | 5 | 6,
    propulsion: "Sail" | "Diesel" | "Hybrid" | "Nuclear"
  ): string {
    return generateVesselSvg(tier, propulsion);
  }

  resolveProceduralFallback(key: AssetKey): string {
    if (key.startsWith("vessel.")) {
      let tier: 1 | 2 | 3 | 4 | 5 | 6 = 1;
      if (key.includes("tier2")) tier = 2;
      else if (key.includes("tier3")) tier = 3;
      else if (key.includes("tier4")) tier = 4;
      else if (key.includes("tier5")) tier = 5;
      else if (key.includes("tier6")) tier = 6;

      let propulsion: "Sail" | "Diesel" | "Hybrid" | "Nuclear" = "Diesel";
      if (key.includes("sloop") || key.includes("Clipper")) propulsion = "Sail";
      else if (key.includes("nuclear")) propulsion = "Nuclear";
      else if (key.includes("research") || key.includes("Explorer") || key.includes("Expedition"))
        propulsion = "Hybrid";

      const rawSvg = generateVesselSvg(tier, propulsion);
      return `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
    }
    if (key.startsWith("weather.") || key === "hud.seaWindow") {
      return generateWeatherSvgDataUri(key);
    }
    if (key.startsWith("hud.")) {
      return generateCompassSvgDataUri();
    }
    return generateCargoSvgDataUri(key);
  }

  resolveAssetUri(key: AssetKey): string {
    const manualOverride = this.overrides.get(key);
    if (manualOverride) return manualOverride;

    const cfg = this.manifest?.assets?.[key];
    if (cfg && cfg.mode === "image" && cfg.overridePath) {
      return cfg.overridePath;
    }
    return this.resolveProceduralFallback(key);
  }
}

export const assetRegistry = new AssetRegistry();
