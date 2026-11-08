import { BathymetrySample, GeoPosition, ServiceResult, makeUnixMs } from "../../types";
import { PORTS } from "../../config/ports";
import { calculateDistanceNM } from "../../core/physics/navigation";

export class BathymetryService {
  /**
   * 估计/采样全球海底地形水深 (m)
   * - 全球 20+ 港口港池锚地水深: 对齐各港 `maxAllowedDraftM + 2.5m`
   * - 进港航道 (< 18 NM): 24 ~ 42 m
   * - 大陆架浅海 (< 90 NM): 65 ~ 140 m
   * - 马六甲/苏伊士/巴拿马/台湾海峡咽喉水道: 18 ~ 35 m
   * - 远洋深海盆地: 2800 ~ 4600 m
   */
  async getDepthAt(pos: GeoPosition): Promise<ServiceResult<BathymetrySample>> {
    const lat = pos.latitude;
    const lon = pos.longitude;

    let minPortDistNM = Infinity;
    let nearestPortMaxDraft = 16.0;

    for (const port of Object.values(PORTS)) {
      const d = calculateDistanceNM(pos, port.position);
      if (d < minPortDistNM) {
        minPortDistNM = d;
        nearestPortMaxDraft = port.maxAllowedDraftM;
      }
    }

    let depthM = 3600; // 默认大洋深水

    if (minPortDistNM < 6.0) {
      // 港池与防波堤内锚地
      depthM = Math.round((nearestPortMaxDraft + 2.2) * 10) / 10;
    } else if (minPortDistNM < 20) {
      // 进出港航道
      depthM = 28.0;
    } else if (
      // 华东/华南内陆陆地边界
      (lat >= 22.8 && lat <= 34.5 && lon >= 108.0 && lon <= 120.8) ||
      // 朝鲜半岛内陆
      (lat >= 35.4 && lat <= 39.5 && lon >= 126.4 && lon <= 128.9) ||
      // 日本九州/四国/本州内陆核心区
      (lat >= 31.4 && lat <= 33.8 && lon >= 130.4 && lon <= 131.5) ||
      (lat >= 33.3 && lat <= 34.2 && lon >= 132.6 && lon <= 134.4) ||
      (lat >= 34.7 && lat <= 36.8 && lon >= 135.2 && lon <= 138.9) ||
      // 台湾岛中央山脉内陆
      (lat >= 22.8 && lat <= 24.9 && lon >= 120.5 && lon <= 121.4) ||
      // 中南半岛内陆
      (lat >= 11.4 && lat <= 21.5 && lon >= 99.0 && lon <= 106.2) ||
      // 印度次大陆内陆
      (lat >= 9.5 && lat <= 24.0 && lon >= 74.2 && lon <= 85.0)
    ) {
      // 误入浅滩/海岸礁石区触发搁浅警报
      depthM = 0.5;
    } else if (minPortDistNM < 85) {
      // 大陆架浅海
      depthM = 78.0;
    } else if (lat >= 1.0 && lat <= 5.5 && lon >= 99.5 && lon <= 104.8) {
      // 马六甲海峡浅滩区
      depthM = 23.5;
    } else if (lat >= 22.0 && lat <= 26.0 && lon >= 118.0 && lon <= 121.0) {
      // 台湾海峡大陆架
      depthM = 52.0;
    }

    return {
      data: {
        position: pos,
        depthM,
        sampledAt: makeUnixMs(Date.now()),
        source: "CACHE",
      },
      receivedAt: makeUnixMs(Date.now()),
      stale: false,
      source: "GEBCO_APPROX",
    };
  }
}

export const bathymetryService = new BathymetryService();
