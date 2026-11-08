import { AssetKey, AssetManifest } from "../types";
import {
  GLOBAL_ICON_STYLE,
  ICON_MANIFEST,
  IconManifestItem,
  RawIconEntry,
  buildIconManifestItem,
} from "../config/iconManifest";
import { generateVesselSvg } from "./procedural/vesselSvg";
import { generateWeatherSvgDataUri } from "./procedural/weatherSvg";
import { generateCompassSvgDataUri } from "./procedural/compassSvg";
import { generateCargoSvgDataUri } from "./procedural/cargoSvg";
import { generateHighPrecisionIconDataUri } from "./procedural/iconStudioSvg";

const CRUD_STORAGE_KEY = "seafaring_icon_manifest_crud_v1";
const OVERRIDE_STORAGE_KEY = "seafaring_icon_overrides_v1";

interface PersistedCrudState {
  customOrEdited: Record<string, RawIconEntry>;
  deletedIds: string[];
}

export class AssetRegistry {
  private overrides: Map<string, string> = new Map();
  private manifest: AssetManifest | null = null;
  private customOrEdited: Map<string, RawIconEntry> = new Map();
  private deletedIds: Set<string> = new Set();

  private byId: Map<string, IconManifestItem> = new Map();
  private byEntityId: Map<string, IconManifestItem> = new Map();
  private byAssetKey: Map<string, IconManifestItem> = new Map();
  private orderedItems: IconManifestItem[] = [];

  constructor() {
    this.loadPersistedCrud();
    this.rebuildIndex();
    this.loadManifestAsync();
  }

  private loadPersistedCrud() {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem(CRUD_STORAGE_KEY);
      if (raw) {
        const parsed: PersistedCrudState = JSON.parse(raw);
        if (parsed.customOrEdited) {
          Object.entries(parsed.customOrEdited).forEach(([k, v]) => {
            this.customOrEdited.set(k, v);
          });
        }
        if (Array.isArray(parsed.deletedIds)) {
          parsed.deletedIds.forEach((id) => this.deletedIds.add(id));
        }
      }
      const rawOverrides = window.localStorage.getItem(OVERRIDE_STORAGE_KEY);
      if (rawOverrides) {
        const parsedOverrides: Record<string, string> = JSON.parse(rawOverrides);
        Object.entries(parsedOverrides).forEach(([k, v]) => {
          this.overrides.set(k, v);
        });
      }
    } catch {
      // Ignore storage errors in sandboxed contexts
    }
  }

  private savePersistedCrud() {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      const state: PersistedCrudState = {
        customOrEdited: Object.fromEntries(this.customOrEdited.entries()),
        deletedIds: Array.from(this.deletedIds.values()),
      };
      window.localStorage.setItem(CRUD_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }

  private savePersistedOverrides() {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      window.localStorage.setItem(
        OVERRIDE_STORAGE_KEY,
        JSON.stringify(Object.fromEntries(this.overrides.entries()))
      );
    } catch {
      // Ignore quota errors
    }
  }

  private rebuildIndex() {
    this.byId.clear();
    this.byEntityId.clear();
    this.byAssetKey.clear();
    const list: IconManifestItem[] = [];
    const seenIds = new Set<string>();

    for (const defaultItem of ICON_MANIFEST) {
      if (this.deletedIds.has(defaultItem.id)) continue;
      const editedRaw = this.customOrEdited.get(defaultItem.id);
      const finalItem = editedRaw
        ? buildIconManifestItem({ ...editedRaw, isCustom: true })
        : defaultItem;
      list.push(finalItem);
      seenIds.add(finalItem.id);
    }

    for (const [id, rawEntry] of this.customOrEdited.entries()) {
      if (seenIds.has(id) || this.deletedIds.has(id)) continue;
      const item = buildIconManifestItem({ ...rawEntry, isCustom: true });
      list.push(item);
      seenIds.add(id);
    }

    this.orderedItems = list;
    for (const item of list) {
      this.byId.set(item.id, item);
      this.byEntityId.set(item.entityId, item);
      if (item.assetKey) {
        this.byAssetKey.set(item.assetKey, item);
      }
    }
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
      // 默认使用内置高精度图标与程序化 SVG
    }
  }

  getAllIcons(): IconManifestItem[] {
    return this.orderedItems;
  }

  /** 增 / 改 (Create or Update Icon & Prompt) */
  upsertIconItem(entry: RawIconEntry): IconManifestItem {
    this.deletedIds.delete(entry.id);
    this.customOrEdited.set(entry.id, { ...entry, isCustom: true });
    this.rebuildIndex();
    this.savePersistedCrud();
    return this.byId.get(entry.id)!;
  }

  /** 删 (Delete Icon Item) */
  deleteIconItem(id: string): boolean {
    const existed = this.byId.has(id);
    this.deletedIds.add(id);
    this.customOrEdited.delete(id);
    this.rebuildIndex();
    this.savePersistedCrud();
    return existed;
  }

  /** 重置恢复默认全量 80 枚海事图标清单 */
  resetDefaultManifest(): void {
    this.customOrEdited.clear();
    this.deletedIds.clear();
    this.overrides.clear();
    this.rebuildIndex();
    this.savePersistedCrud();
    this.savePersistedOverrides();
  }

  /** 导出当前最新 JSON 清单（含用户增删改查结果） */
  exportManifestJson(): string {
    return JSON.stringify(
      {
        version: "2.0.0",
        updatedAt: new Date().toISOString(),
        totalIcons: this.orderedItems.length,
        globalStyle: GLOBAL_ICON_STYLE,
        icons: this.orderedItems,
      },
      null,
      2
    );
  }

  registerOverride(keyOrId: string, url: string) {
    this.overrides.set(keyOrId, url);
    this.savePersistedOverrides();
  }

  hasOverride(keyOrId: string): boolean {
    return this.overrides.has(keyOrId);
  }

  getVesselSvg(
    tier: 1 | 2 | 3 | 4 | 5 | 6,
    propulsion: "Sail" | "Diesel" | "Hybrid" | "Nuclear"
  ): string {
    return generateVesselSvg(tier, propulsion);
  }

  findIconItem(keyOrEntityOrId: string): IconManifestItem | undefined {
    return (
      this.byId.get(keyOrEntityOrId) ||
      this.byEntityId.get(keyOrEntityOrId) ||
      this.byAssetKey.get(keyOrEntityOrId)
    );
  }

  resolveIconPath(
    keyOrEntityOrId: string,
    tier: "Master" | "@3x" | "@2x" | "@1x" = "Master"
  ): string {
    const item = this.findIconItem(keyOrEntityOrId);
    if (item) {
      const manual =
        this.overrides.get(item.id) ||
        this.overrides.get(item.entityId) ||
        (item.assetKey ? this.overrides.get(item.assetKey) : undefined);
      if (manual) return manual;

      if (tier === "Master") return item.publicPath;
      return item.publicPath.replace(/\.png$/, `${tier}.png`);
    }
    return this.resolveProceduralFallback(keyOrEntityOrId as AssetKey);
  }

  resolveIconSrcSet(keyOrEntityOrId: string): string | undefined {
    const item = this.findIconItem(keyOrEntityOrId);
    if (!item) return undefined;
    const manual =
      this.overrides.get(item.id) ||
      this.overrides.get(item.entityId) ||
      (item.assetKey ? this.overrides.get(item.assetKey) : undefined);
    if (manual) return undefined;

    const p1x = item.publicPath.replace(/\.png$/, "@1x.png");
    const p2x = item.publicPath.replace(/\.png$/, "@2x.png");
    const p3x = item.publicPath.replace(/\.png$/, "@3x.png");
    return `${p1x} 1x, ${p2x} 2x, ${p3x} 3x`;
  }

  resolveProceduralFallback(keyOrId: string): string {
    const item = this.findIconItem(keyOrId);
    if (item) {
      return generateHighPrecisionIconDataUri(item.id);
    }

    if (keyOrId.startsWith("vessel.")) {
      let tier: 1 | 2 | 3 | 4 | 5 | 6 = 1;
      if (keyOrId.includes("tier2")) tier = 2;
      else if (keyOrId.includes("tier3")) tier = 3;
      else if (keyOrId.includes("tier4")) tier = 4;
      else if (keyOrId.includes("tier5")) tier = 5;
      else if (keyOrId.includes("tier6")) tier = 6;

      let propulsion: "Sail" | "Diesel" | "Hybrid" | "Nuclear" = "Diesel";
      if (keyOrId.includes("sloop") || keyOrId.includes("Clipper")) propulsion = "Sail";
      else if (keyOrId.includes("nuclear")) propulsion = "Nuclear";
      else if (
        keyOrId.includes("research") ||
        keyOrId.includes("Explorer") ||
        keyOrId.includes("Expedition")
      )
        propulsion = "Hybrid";

      const rawSvg = generateVesselSvg(tier, propulsion);
      return `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
    }
    if (keyOrId.startsWith("weather.") || keyOrId === "hud.seaWindow") {
      return generateWeatherSvgDataUri(keyOrId as AssetKey);
    }
    if (keyOrId.startsWith("hud.")) {
      return generateCompassSvgDataUri();
    }
    return generateCargoSvgDataUri(keyOrId as AssetKey);
  }

  resolveAssetUri(key: AssetKey | string): string {
    const manualOverride = this.overrides.get(key);
    if (manualOverride) return manualOverride;

    const iconItem = this.findIconItem(key);
    if (iconItem) {
      const itemOverride =
        this.overrides.get(iconItem.id) || this.overrides.get(iconItem.entityId);
      if (itemOverride) return itemOverride;
      return iconItem.publicPath;
    }

    const cfg = this.manifest?.assets?.[key as AssetKey];
    if (cfg && cfg.mode === "image" && cfg.overridePath) {
      return cfg.overridePath;
    }
    return this.resolveProceduralFallback(key);
  }
}

export const assetRegistry = new AssetRegistry();
