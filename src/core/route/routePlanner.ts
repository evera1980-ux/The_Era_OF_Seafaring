import { GeoPosition, RouteWaypoint, PlannedRoute, makeNM, makeGameHours, makeUnixMs, Knots, PortInfo } from "../../types";
import { calculateDistanceNM } from "../physics/navigation";

/**
 * 依据起点和终点生成大圆航线航路点与航行评估
 */
export function createPassagePlan(
  startPos: GeoPosition,
  destinationPort: PortInfo,
  cruisingSpeedKn: number
): PlannedRoute {
  const totalDistanceNM = calculateDistanceNM(startPos, destinationPort.position);
  const speed = Math.max(4, cruisingSpeedKn);
  const estimatedHours = totalDistanceNM / speed;

  const waypoints: RouteWaypoint[] = [];
  const numSteps = Math.min(8, Math.max(1, Math.floor(totalDistanceNM / 250)));

  for (let i = 1; i <= numSteps; i++) {
    const fraction = i / (numSteps + 1);
    const lat = startPos.latitude + (destinationPort.position.latitude - startPos.latitude) * fraction;
    const lon = startPos.longitude + (destinationPort.position.longitude - startPos.longitude) * fraction;

    waypoints.push({
      waypointId: `wp_${i}`,
      position: { latitude: lat as any, longitude: lon as any },
      expectedArrivalGameTime: Date.now() + fraction * estimatedHours * 3600000,
      waypointType: "NAVIGATION",
    });
  }

  waypoints.push({
    waypointId: `dest_${destinationPort.portId}`,
    position: destinationPort.position,
    expectedArrivalGameTime: Date.now() + estimatedHours * 3600000,
    waypointType: "PORT",
  });

  return {
    routeId: `route_to_${destinationPort.portId}_${Date.now()}`,
    waypoints,
    totalDistanceNM,
    estimatedDurationGameHours: makeGameHours(estimatedHours),
    estimatedFuelT: Math.round(estimatedHours * 0.05 * 10) / 10,
    estimatedRisk: totalDistanceNM > 2000 ? 0.6 : 0.2,
    createdAt: makeUnixMs(Date.now()),
  };
}
