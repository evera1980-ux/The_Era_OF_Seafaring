import { GeoPosition, MarineWeatherCell } from "../../types";

interface CacheEntry {
  cell: MarineWeatherCell;
  expiresAtMs: number;
}

/**
 * 海洋气象空间网格缓存 (Spatial Grid Weather Cache)
 * 将经纬度按 0.5° 网格量化，默认缓存有效期 5 分钟
 */
export class WeatherCache {
  private cache = new Map<string, CacheEntry>();
  private readonly ttlMs: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  private toGridKey(pos: GeoPosition): string {
    const qLat = (Math.round(pos.latitude * 2) / 2).toFixed(1);
    const qLon = (Math.round(pos.longitude * 2) / 2).toFixed(1);
    return `grid_${qLat}_${qLon}`;
  }

  get(pos: GeoPosition): MarineWeatherCell | null {
    const key = this.toGridKey(pos);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAtMs) {
      this.cache.delete(key);
      return null;
    }
    return entry.cell;
  }

  set(pos: GeoPosition, cell: MarineWeatherCell): void {
    const key = this.toGridKey(pos);
    this.cache.set(key, {
      cell,
      expiresAtMs: Date.now() + this.ttlMs,
    });
  }
}

export const weatherCache = new WeatherCache();
