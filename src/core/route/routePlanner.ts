import {
  GeoPosition,
  RouteWaypoint,
  PlannedRoute,
  makeGameHours,
  makeNM,
  makeUnixMs,
  PortInfo,
  VesselSpec,
} from "../../types";
import { calculateDistanceNM } from "../physics/navigation";
import { calculateTotalFuelRateKgH } from "../physics/fuel";
import { generateGreatCirclePositions } from "./greatCircle";

/**
 * 依据起点、终点港口和当前船型参数生成球面大圆航线与精确燃油/时间评估
 */
export function createPassagePlan(
  startPos: GeoPosition,
  destinationPort: PortInfo,
  cruisingSpeedKn: number,
  vesselSpec?: VesselSpec
): PlannedRoute {
  const directDistanceNM = calculateDistanceNM(startPos, destinationPort.position);
  const numSteps = Math.min(10, Math.max(2, Math.floor(directDistanceNM / 220)));
  const gcPositions = generateGreatCirclePositions(
    startPos,
    destinationPort.position,
    numSteps
  );

  // 计算沿海上航道各航路点的真实累计海上航程 (NM)
  const fullChain = [startPos, ...gcPositions, destinationPort.position];
  let rawDistanceNM = 0;
  for (let i = 0; i < fullChain.length - 1; i++) {
    rawDistanceNM += calculateDistanceNM(fullChain[i], fullChain[i + 1]);
  }
  const totalDistanceNM = makeNM(Math.round(rawDistanceNM * 10) / 10);

  const speed = Math.max(4, cruisingSpeedKn);
  const estimatedHours = totalDistanceNM / speed;

  const waypoints: RouteWaypoint[] = gcPositions.map((pos, idx) => {
    const fraction = (idx + 1) / (gcPositions.length + 1);
    return {
      waypointId: `wp_${idx + 1}`,
      position: pos,
      expectedArrivalGameTime: Date.now() + fraction * estimatedHours * 3600000,
      waypointType: "NAVIGATION",
    };
  });

  waypoints.push({
    waypointId: `dest_${destinationPort.portId}`,
    position: destinationPort.position,
    expectedArrivalGameTime: Date.now() + estimatedHours * 3600000,
    waypointType: "PORT",
  });

  // 依据船舶实际经济油耗率计算预计总燃油消耗 (t)
  let estimatedFuelT = Math.round(estimatedHours * 0.02 * 10) / 10;
  if (vesselSpec) {
    const hourlyKg = calculateTotalFuelRateKgH(vesselSpec.ecoSpeedKn, vesselSpec);
    estimatedFuelT = Math.round(((hourlyKg * estimatedHours) / 1000.0) * 100) / 100;
  }

  return {
    routeId: `route_to_${destinationPort.portId}_${Date.now()}`,
    waypoints,
    totalDistanceNM,
    estimatedDurationGameHours: makeGameHours(estimatedHours),
    estimatedFuelT,
    estimatedRisk: totalDistanceNM > 2000 ? 0.65 : totalDistanceNM > 600 ? 0.35 : 0.15,
    createdAt: makeUnixMs(Date.now()),
  };
}
