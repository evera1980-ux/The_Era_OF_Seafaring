import { GeoPosition } from "../../types";

/**
 * 根据中心坐标和半径(海里 NM)生成球面近似圆多边形坐标点数组 ([lon, lat][])
 * 1 纬度 ≈ 60 NM
 */
export function buildGeodesicCircleCoordinates(
  center: GeoPosition,
  radiusNM: number,
  segments: number = 64
): [number, number][] {
  const coords: [number, number][] = [];
  const clampedNM = Math.max(2, Math.min(8000, radiusNM));
  const angularRadiusLat = clampedNM / 60;
  const cosLat = Math.max(0.15, Math.cos((center.latitude * Math.PI) / 180));

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const dLat = angularRadiusLat * Math.cos(theta);
    const dLon = (angularRadiusLat * Math.sin(theta)) / cosLat;

    const lat = Math.max(-85, Math.min(85, center.latitude + dLat));
    const lon = center.longitude + dLon;
    coords.push([lon, lat]);
  }

  return coords;
}

/**
 * 构建包含燃油最大续航圈 (Fuel Range Ring) 与 20 NM VHF/AIS 雷达通联圈的 GeoJSON FeatureCollection
 */
export function buildRangeRingsGeoJSON(
  center: GeoPosition,
  fuelRangeNM: number,
  radarRangeNM: number = 20
): GeoJSON.FeatureCollection {
  const fuelCircle = buildGeodesicCircleCoordinates(center, fuelRangeNM, 64);
  const radarCircle = buildGeodesicCircleCoordinates(center, radarRangeNM, 48);

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          ringType: "FUEL_RANGE",
          radiusNM: fuelRangeNM,
        },
        geometry: {
          type: "Polygon",
          coordinates: [fuelCircle],
        },
      },
      {
        type: "Feature",
        properties: {
          ringType: "RADAR_20NM",
          radiusNM: radarRangeNM,
        },
        geometry: {
          type: "LineString",
          coordinates: radarCircle,
        },
      },
    ],
  };
}
