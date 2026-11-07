import { GeoPosition, Knots, Latitude, Longitude, makeLat, makeLon, makeNM, NauticalMiles } from "../../types";

const EARTH_RADIUS_NM = 3440.065; // 地球平均半径 (海里)

/**
 * 球面大圆航程 Haversine 公式计算 (海里 NM)
 */
export function calculateDistanceNM(pos1: GeoPosition, pos2: GeoPosition): NauticalMiles {
  const lat1 = (pos1.latitude * Math.PI) / 180;
  const lat2 = (pos2.latitude * Math.PI) / 180;
  const dLat = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
  const dLon = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return makeNM(EARTH_RADIUS_NM * c);
}

/**
 * 计算两点间初始真航向 (Bearing Deg 0~360)
 */
export function calculateBearingDeg(pos1: GeoPosition, pos2: GeoPosition): number {
  const lat1 = (pos1.latitude * Math.PI) / 180;
  const lat2 = (pos2.latitude * Math.PI) / 180;
  const dLon = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * 依据对地速度 (SOG)、对地航向 (COG) 与经过时间 (秒) 推算下一个位置 (Dead Reckoning)
 */
export function advancePosition(
  currentPos: GeoPosition,
  cogDeg: number,
  sogKn: Knots,
  elapsedSeconds: number
): { nextPos: GeoPosition; distanceTravelledNM: number } {
  if (sogKn <= 0.001 || elapsedSeconds <= 0) {
    return { nextPos: currentPos, distanceTravelledNM: 0 };
  }

  // 航行距离 (NM) = 节 (NM/h) * (秒 / 3600)
  const distanceNM = (sogKn * elapsedSeconds) / 3600;
  const angularDistance = distanceNM / EARTH_RADIUS_NM;

  const latRad = (currentPos.latitude * Math.PI) / 180;
  const lonRad = (currentPos.longitude * Math.PI) / 180;
  const cogRad = (cogDeg * Math.PI) / 180;

  const nextLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
      Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(cogRad)
  );

  const nextLonRad =
    lonRad +
    Math.atan2(
      Math.sin(cogRad) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(nextLatRad)
    );

  let nextLatDeg = (nextLatRad * 180) / Math.PI;
  let nextLonDeg = (nextLonRad * 180) / Math.PI;

  // 经度规范化 [-180, 180]
  if (nextLonDeg > 180) nextLonDeg -= 360;
  if (nextLonDeg < -180) nextLonDeg += 360;

  return {
    nextPos: {
      latitude: makeLat(nextLatDeg),
      longitude: makeLon(nextLonDeg),
    },
    distanceTravelledNM: distanceNM,
  };
}
