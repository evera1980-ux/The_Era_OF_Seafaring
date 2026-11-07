import { PORTS } from "../../config/ports";
import { GeoPosition, PortInfo } from "../../types";
import { calculateDistanceNM } from "../../core/physics/navigation";

export class PortService {
  getAllPorts(): PortInfo[] {
    return Object.values(PORTS);
  }

  getPortById(portId: string): PortInfo | undefined {
    return PORTS[portId];
  }

  findNearestPort(pos: GeoPosition): { port: PortInfo; distanceNM: number } | null {
    const list = this.getAllPorts();
    if (list.length === 0) return null;

    let nearest = list[0];
    let minDistance = calculateDistanceNM(pos, nearest.position);

    for (let i = 1; i < list.length; i++) {
      const d = calculateDistanceNM(pos, list[i].position);
      if (d < minDistance) {
        minDistance = d;
        nearest = list[i];
      }
    }

    return { port: nearest, distanceNM: minDistance };
  }
}

export const portService = new PortService();
