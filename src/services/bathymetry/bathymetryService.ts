import { BathymetrySample, GeoPosition, ServiceResult, makeUnixMs } from "../../types";

export class BathymetryService {
  /**
   * 估计/采样海底地形深度 (m)
   * 沿岸港口浅水区 (10~25m), 大陆架 (50~200m), 远洋深海 (2000~5000m)
   */
  async getDepthAt(pos: GeoPosition): Promise<ServiceResult<BathymetrySample>> {
    const lat = pos.latitude;
    const lon = pos.longitude;

    // 近海特定坐标检测 (如长江口/舟山水道附近)
    const distToZhoushan = Math.hypot(lat - 30.6, lon - 122.1);
    let depthM = 3500; // 默认大洋深水

    if (distToZhoushan < 0.2) {
      depthM = 18.5; // 港内锚地水深
    } else if (distToZhoushan < 1.0) {
      depthM = 32.0; // 沿岸浅海航道
    } else if (distToZhoushan < 3.0) {
      depthM = 75.0; // 东海大陆架
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
