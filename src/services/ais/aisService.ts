import {
  AISVesselTarget,
  ServiceResult,
  makeUnixMs,
} from "../../types";
import { generateInitialSyntheticFleet } from "./syntheticVesselGenerator";
import { advanceAISFleet } from "./deadReckoning";

export class AISService {
  private syntheticFleet: AISVesselTarget[] = generateInitialSyntheticFleet();
  private lastAdvancementMs: number = Date.now();

  async getActiveTargets(): Promise<ServiceResult<AISVesselTarget[]>> {
    const now = Date.now();
    const dtSeconds = Math.min(300, Math.max(1, (now - this.lastAdvancementMs) / 1000));
    this.lastAdvancementMs = now;

    // 每次轮询按真实球面运动学推算船队位移 (放大 6 倍使海图视觉观测更鲜活)
    this.syntheticFleet = advanceAISFleet(this.syntheticFleet, dtSeconds * 6);

    return {
      data: this.syntheticFleet,
      receivedAt: makeUnixMs(now),
      stale: false,
      source: "SYNTHETIC_FLEET",
    };
  }
}

export const aisService = new AISService();
