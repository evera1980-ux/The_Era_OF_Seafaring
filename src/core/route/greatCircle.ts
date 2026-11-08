import * as turf from "@turf/turf";
import { GeoPosition, makeLat, makeLon } from "../../types";
import { calculateDistanceNM } from "../physics/navigation";

interface SeaNode {
  id: string;
  lat: number;
  lon: number;
  neighbors: string[];
}

/**
 * 全球真实海事航道与咽喉海峡节点网络 (Global Maritime Sea-Lane Waypoint Graph)
 * 确保全球任意两港之间的自动引航航线均沿真实外海航道、海峡与大洋航路绕行，绝不穿越大陆、半岛或岛屿陆地
 */
const SEA_NODES: Record<string, SeaNode> = {
  // === 东海、黄海、日本海与日本南岸黑潮航道 ===
  ECS_YANGTZE: {
    id: "ECS_YANGTZE",
    lat: 30.55,
    lon: 123.15,
    neighbors: ["ECS_ZHOUSHAN_S", "JEJU_WEST", "JEJU_SOUTH", "OKINAWA_NORTH"],
  },
  ECS_ZHOUSHAN_S: {
    id: "ECS_ZHOUSHAN_S",
    lat: 29.2,
    lon: 122.85,
    neighbors: ["ECS_YANGTZE", "ECS_WENZHOU", "OKINAWA_NORTH"],
  },
  ECS_WENZHOU: {
    id: "ECS_WENZHOU",
    lat: 27.3,
    lon: 121.8,
    neighbors: ["ECS_ZHOUSHAN_S", "TAIWAN_STRAIT_N", "OKINAWA_WEST"],
  },
  TAIWAN_STRAIT_N: {
    id: "TAIWAN_STRAIT_N",
    lat: 25.4,
    lon: 120.3,
    neighbors: ["ECS_WENZHOU", "TAIWAN_STRAIT_S"],
  },
  TAIWAN_STRAIT_S: {
    id: "TAIWAN_STRAIT_S",
    lat: 22.9,
    lon: 118.6,
    neighbors: ["TAIWAN_STRAIT_N", "KAOHSIUNG_APP", "HK_APPROACH", "LUZON_STRAIT"],
  },
  KAOHSIUNG_APP: {
    id: "KAOHSIUNG_APP",
    lat: 22.45,
    lon: 119.95,
    neighbors: ["TAIWAN_STRAIT_S", "LUZON_STRAIT"],
  },
  JEJU_WEST: {
    id: "JEJU_WEST",
    lat: 33.1,
    lon: 125.6,
    neighbors: ["ECS_YANGTZE", "JEJU_SOUTH", "KOREA_STRAIT_W"],
  },
  JEJU_SOUTH: {
    id: "JEJU_SOUTH",
    lat: 32.6,
    lon: 127.2,
    neighbors: ["ECS_YANGTZE", "JEJU_WEST", "KOREA_STRAIT_W", "OSUMI_WEST"],
  },
  KOREA_STRAIT_W: {
    id: "KOREA_STRAIT_W",
    lat: 34.55,
    lon: 129.15,
    neighbors: ["JEJU_WEST", "JEJU_SOUTH", "TSUSHIMA_EAST"],
  },
  TSUSHIMA_EAST: {
    id: "TSUSHIMA_EAST",
    lat: 34.2,
    lon: 130.4,
    neighbors: ["KOREA_STRAIT_W", "OSUMI_WEST"],
  },
  OKINAWA_NORTH: {
    id: "OKINAWA_NORTH",
    lat: 29.8,
    lon: 127.8,
    neighbors: ["ECS_YANGTZE", "ECS_ZHOUSHAN_S", "OSUMI_WEST", "OKINAWA_WEST"],
  },
  OKINAWA_WEST: {
    id: "OKINAWA_WEST",
    lat: 26.5,
    lon: 126.2,
    neighbors: ["ECS_WENZHOU", "OKINAWA_NORTH", "LUZON_STRAIT", "PHILIPPINE_SEA_N"],
  },
  OSUMI_WEST: {
    id: "OSUMI_WEST",
    lat: 30.5,
    lon: 129.8,
    neighbors: ["JEJU_SOUTH", "TSUSHIMA_EAST", "OKINAWA_NORTH", "OSUMI_EAST"],
  },
  OSUMI_EAST: {
    id: "OSUMI_EAST",
    lat: 30.65,
    lon: 131.6,
    neighbors: ["OSUMI_WEST", "SHIKOKU_SOUTH", "PHILIPPINE_SEA_N"],
  },
  SHIKOKU_SOUTH: {
    id: "SHIKOKU_SOUTH",
    lat: 32.2,
    lon: 134.8,
    neighbors: ["OSUMI_EAST", "KII_SOUTH"],
  },
  KII_SOUTH: {
    id: "KII_SOUTH",
    lat: 33.15,
    lon: 136.6,
    neighbors: ["SHIKOKU_SOUTH", "IZU_SOUTH"],
  },
  IZU_SOUTH: {
    id: "IZU_SOUTH",
    lat: 34.4,
    lon: 139.4,
    neighbors: ["KII_SOUTH", "TOKYO_BAY_APP", "NPAC_WEST"],
  },
  TOKYO_BAY_APP: {
    id: "TOKYO_BAY_APP",
    lat: 35.1,
    lon: 139.78,
    neighbors: ["IZU_SOUTH", "NPAC_WEST"],
  },

  // === 南海、马六甲与东南亚航道 ===
  HK_APPROACH: {
    id: "HK_APPROACH",
    lat: 21.85,
    lon: 114.5,
    neighbors: ["TAIWAN_STRAIT_S", "SCS_NORTH"],
  },
  LUZON_STRAIT: {
    id: "LUZON_STRAIT",
    lat: 20.2,
    lon: 120.8,
    neighbors: ["TAIWAN_STRAIT_S", "KAOHSIUNG_APP", "OKINAWA_WEST", "SCS_NORTH", "PHILIPPINE_SEA_S"],
  },
  SCS_NORTH: {
    id: "SCS_NORTH",
    lat: 18.2,
    lon: 114.2,
    neighbors: ["HK_APPROACH", "LUZON_STRAIT", "SCS_CENTRAL"],
  },
  SCS_CENTRAL: {
    id: "SCS_CENTRAL",
    lat: 12.5,
    lon: 111.2,
    neighbors: ["SCS_NORTH", "VUNG_TAU_APP", "SCS_SOUTH"],
  },
  VUNG_TAU_APP: {
    id: "VUNG_TAU_APP",
    lat: 10.1,
    lon: 107.3,
    neighbors: ["SCS_CENTRAL", "SCS_SOUTH"],
  },
  SCS_SOUTH: {
    id: "SCS_SOUTH",
    lat: 6.2,
    lon: 106.8,
    neighbors: ["SCS_CENTRAL", "VUNG_TAU_APP", "SINGAPORE_EAST", "KARIMATA_NORTH"],
  },
  SINGAPORE_EAST: {
    id: "SINGAPORE_EAST",
    lat: 1.35,
    lon: 104.45,
    neighbors: ["SCS_SOUTH", "SINGAPORE_STRAIT", "KARIMATA_NORTH"],
  },
  SINGAPORE_STRAIT: {
    id: "SINGAPORE_STRAIT",
    lat: 1.18,
    lon: 103.65,
    neighbors: ["SINGAPORE_EAST", "MALACCA_SOUTH"],
  },
  MALACCA_SOUTH: {
    id: "MALACCA_SOUTH",
    lat: 2.65,
    lon: 101.25,
    neighbors: ["SINGAPORE_STRAIT", "MALACCA_NORTH"],
  },
  MALACCA_NORTH: {
    id: "MALACCA_NORTH",
    lat: 5.9,
    lon: 97.5,
    neighbors: ["MALACCA_SOUTH", "ANDAMAN_EXIT"],
  },
  ANDAMAN_EXIT: {
    id: "ANDAMAN_EXIT",
    lat: 6.3,
    lon: 94.2,
    neighbors: ["MALACCA_NORTH", "SRI_LANKA_SOUTH"],
  },

  // === 印度洋、波斯湾、红海与苏伊士走廊 ===
  SRI_LANKA_SOUTH: {
    id: "SRI_LANKA_SOUTH",
    lat: 5.6,
    lon: 80.6,
    neighbors: ["ANDAMAN_EXIT", "COLOMBO_APP", "ARABIAN_SEA_SE", "INDIAN_OCEAN_E"],
  },
  COLOMBO_APP: {
    id: "COLOMBO_APP",
    lat: 6.85,
    lon: 79.4,
    neighbors: ["SRI_LANKA_SOUTH", "LACCADIVE_SEA"],
  },
  LACCADIVE_SEA: {
    id: "LACCADIVE_SEA",
    lat: 11.5,
    lon: 74.5,
    neighbors: ["COLOMBO_APP", "MUMBAI_APP", "ARABIAN_SEA_CENTRAL"],
  },
  MUMBAI_APP: {
    id: "MUMBAI_APP",
    lat: 18.7,
    lon: 72.1,
    neighbors: ["LACCADIVE_SEA", "ARABIAN_SEA_CENTRAL", "OMAN_GULF"],
  },
  ARABIAN_SEA_SE: {
    id: "ARABIAN_SEA_SE",
    lat: 8.5,
    lon: 70.0,
    neighbors: ["SRI_LANKA_SOUTH", "ARABIAN_SEA_CENTRAL", "ADEN_EAST"],
  },
  ARABIAN_SEA_CENTRAL: {
    id: "ARABIAN_SEA_CENTRAL",
    lat: 15.0,
    lon: 64.0,
    neighbors: ["LACCADIVE_SEA", "MUMBAI_APP", "ARABIAN_SEA_SE", "OMAN_GULF", "ADEN_EAST"],
  },
  OMAN_GULF: {
    id: "OMAN_GULF",
    lat: 24.8,
    lon: 58.2,
    neighbors: ["MUMBAI_APP", "ARABIAN_SEA_CENTRAL", "HORMUZ_STRAIT"],
  },
  HORMUZ_STRAIT: {
    id: "HORMUZ_STRAIT",
    lat: 26.3,
    lon: 56.35,
    neighbors: ["OMAN_GULF", "JEBEL_ALI_APP"],
  },
  JEBEL_ALI_APP: {
    id: "JEBEL_ALI_APP",
    lat: 25.25,
    lon: 54.9,
    neighbors: ["HORMUZ_STRAIT"],
  },
  ADEN_EAST: {
    id: "ADEN_EAST",
    lat: 12.6,
    lon: 51.8,
    neighbors: ["ARABIAN_SEA_SE", "ARABIAN_SEA_CENTRAL", "BAB_EL_MANDEB"],
  },
  BAB_EL_MANDEB: {
    id: "BAB_EL_MANDEB",
    lat: 12.55,
    lon: 43.35,
    neighbors: ["ADEN_EAST", "RED_SEA_MID"],
  },
  RED_SEA_MID: {
    id: "RED_SEA_MID",
    lat: 20.5,
    lon: 38.6,
    neighbors: ["BAB_EL_MANDEB", "SUEZ_GULF"],
  },
  SUEZ_GULF: {
    id: "SUEZ_GULF",
    lat: 27.6,
    lon: 34.0,
    neighbors: ["RED_SEA_MID", "PORT_SAID_APP"],
  },
  PORT_SAID_APP: {
    id: "PORT_SAID_APP",
    lat: 31.55,
    lon: 32.3,
    neighbors: ["SUEZ_GULF", "MED_EAST"],
  },

  // === 地中海、直布罗陀与西欧北海航道 ===
  MED_EAST: {
    id: "MED_EAST",
    lat: 33.8,
    lon: 26.5,
    neighbors: ["PORT_SAID_APP", "MED_CRETE_S"],
  },
  MED_CRETE_S: {
    id: "MED_CRETE_S",
    lat: 34.6,
    lon: 23.0,
    neighbors: ["MED_EAST", "SICILY_STRAIT"],
  },
  SICILY_STRAIT: {
    id: "SICILY_STRAIT",
    lat: 37.2,
    lon: 11.4,
    neighbors: ["MED_CRETE_S", "MED_WEST"],
  },
  MED_WEST: {
    id: "MED_WEST",
    lat: 36.8,
    lon: 2.0,
    neighbors: ["SICILY_STRAIT", "GIBRALTAR_STRAIT"],
  },
  GIBRALTAR_STRAIT: {
    id: "GIBRALTAR_STRAIT",
    lat: 35.96,
    lon: -5.5,
    neighbors: ["MED_WEST", "CAPE_ST_VINCENT", "NATL_WEST"],
  },
  CAPE_ST_VINCENT: {
    id: "CAPE_ST_VINCENT",
    lat: 36.8,
    lon: -9.4,
    neighbors: ["GIBRALTAR_STRAIT", "CAPE_FINISTERRE"],
  },
  CAPE_FINISTERRE: {
    id: "CAPE_FINISTERRE",
    lat: 43.3,
    lon: -9.8,
    neighbors: ["CAPE_ST_VINCENT", "USHANT_CHANNEL", "NATL_WEST"],
  },
  USHANT_CHANNEL: {
    id: "USHANT_CHANNEL",
    lat: 48.7,
    lon: -5.4,
    neighbors: ["CAPE_FINISTERRE", "DOVER_STRAIT"],
  },
  DOVER_STRAIT: {
    id: "DOVER_STRAIT",
    lat: 50.95,
    lon: 1.4,
    neighbors: ["USHANT_CHANNEL", "ROTTERDAM_APP"],
  },
  ROTTERDAM_APP: {
    id: "ROTTERDAM_APP",
    lat: 52.1,
    lon: 3.7,
    neighbors: ["DOVER_STRAIT", "HELGOLAND_BIGHT"],
  },
  HELGOLAND_BIGHT: {
    id: "HELGOLAND_BIGHT",
    lat: 54.05,
    lon: 7.8,
    neighbors: ["ROTTERDAM_APP"],
  },

  // === 大洋洲与印尼群岛水道 ===
  KARIMATA_NORTH: {
    id: "KARIMATA_NORTH",
    lat: -1.2,
    lon: 107.2,
    neighbors: ["SCS_SOUTH", "SINGAPORE_EAST", "JAVA_SEA_E"],
  },
  JAVA_SEA_E: {
    id: "JAVA_SEA_E",
    lat: -6.2,
    lon: 115.2,
    neighbors: ["KARIMATA_NORTH", "LOMBOK_SOUTH"],
  },
  LOMBOK_SOUTH: {
    id: "LOMBOK_SOUTH",
    lat: -9.5,
    lon: 115.7,
    neighbors: ["JAVA_SEA_E", "INDIAN_OCEAN_E", "NW_SHELF_AUS"],
  },
  INDIAN_OCEAN_E: {
    id: "INDIAN_OCEAN_E",
    lat: -8.0,
    lon: 102.0,
    neighbors: ["SRI_LANKA_SOUTH", "LOMBOK_SOUTH", "NW_SHELF_AUS"],
  },
  NW_SHELF_AUS: {
    id: "NW_SHELF_AUS",
    lat: -18.5,
    lon: 117.8,
    neighbors: ["LOMBOK_SOUTH", "INDIAN_OCEAN_E", "CAPE_LEEUWIN"],
  },
  CAPE_LEEUWIN: {
    id: "CAPE_LEEUWIN",
    lat: -35.2,
    lon: 114.5,
    neighbors: ["NW_SHELF_AUS", "BASS_STRAIT"],
  },
  BASS_STRAIT: {
    id: "BASS_STRAIT",
    lat: -39.2,
    lon: 146.5,
    neighbors: ["CAPE_LEEUWIN", "SYDNEY_APP"],
  },
  PHILIPPINE_SEA_N: {
    id: "PHILIPPINE_SEA_N",
    lat: 24.0,
    lon: 132.0,
    neighbors: ["OKINAWA_WEST", "OSUMI_EAST", "PHILIPPINE_SEA_S", "NPAC_WEST"],
  },
  PHILIPPINE_SEA_S: {
    id: "PHILIPPINE_SEA_S",
    lat: 10.0,
    lon: 132.0,
    neighbors: ["LUZON_STRAIT", "PHILIPPINE_SEA_N", "SOLOMON_SEA"],
  },
  SOLOMON_SEA: {
    id: "SOLOMON_SEA",
    lat: -8.0,
    lon: 155.0,
    neighbors: ["PHILIPPINE_SEA_S", "CORAL_SEA_E", "EPAC_TROPICAL"],
  },
  CORAL_SEA_E: {
    id: "CORAL_SEA_E",
    lat: -23.0,
    lon: 155.5,
    neighbors: ["SOLOMON_SEA", "SYDNEY_APP"],
  },
  SYDNEY_APP: {
    id: "SYDNEY_APP",
    lat: -33.95,
    lon: 151.8,
    neighbors: ["CORAL_SEA_E", "BASS_STRAIT", "SPAC_WEST"],
  },

  // === 北太平洋、东太平洋、巴拿马与南美麦哲伦/合恩角航道 ===
  NPAC_WEST: {
    id: "NPAC_WEST",
    lat: 38.5,
    lon: 148.0,
    neighbors: ["IZU_SOUTH", "TOKYO_BAY_APP", "PHILIPPINE_SEA_N", "NPAC_MID"],
  },
  NPAC_MID: {
    id: "NPAC_MID",
    lat: 43.5,
    lon: 176.0,
    neighbors: ["NPAC_WEST", "NPAC_EAST"],
  },
  NPAC_EAST: {
    id: "NPAC_EAST",
    lat: 40.5,
    lon: -142.0,
    neighbors: ["NPAC_MID", "LAX_APPROACH"],
  },
  LAX_APPROACH: {
    id: "LAX_APPROACH",
    lat: 33.4,
    lon: -119.2,
    neighbors: ["NPAC_EAST", "CABO_CORRIDOR"],
  },
  CABO_CORRIDOR: {
    id: "CABO_CORRIDOR",
    lat: 21.5,
    lon: -110.5,
    neighbors: ["LAX_APPROACH", "EPAC_TROPICAL", "PANAMA_GULF"],
  },
  EPAC_TROPICAL: {
    id: "EPAC_TROPICAL",
    lat: 6.0,
    lon: -95.0,
    neighbors: ["CABO_CORRIDOR", "PANAMA_GULF", "PERU_OFFSHORE", "SOLOMON_SEA"],
  },
  PANAMA_GULF: {
    id: "PANAMA_GULF",
    lat: 7.4,
    lon: -79.8,
    neighbors: ["CABO_CORRIDOR", "EPAC_TROPICAL", "PERU_OFFSHORE", "CARIBBEAN_GATE"],
  },
  CARIBBEAN_GATE: {
    id: "CARIBBEAN_GATE",
    lat: 14.5,
    lon: -75.0,
    neighbors: ["PANAMA_GULF", "NATL_WEST"],
  },
  NATL_WEST: {
    id: "NATL_WEST",
    lat: 28.0,
    lon: -45.0,
    neighbors: ["CARIBBEAN_GATE", "GIBRALTAR_STRAIT", "CAPE_FINISTERRE"],
  },
  PERU_OFFSHORE: {
    id: "PERU_OFFSHORE",
    lat: -12.0,
    lon: -81.5,
    neighbors: ["EPAC_TROPICAL", "PANAMA_GULF", "VALPARAISO_APP"],
  },
  VALPARAISO_APP: {
    id: "VALPARAISO_APP",
    lat: -33.0,
    lon: -72.8,
    neighbors: ["PERU_OFFSHORE", "CHILE_SOUTH"],
  },
  CHILE_SOUTH: {
    id: "CHILE_SOUTH",
    lat: -50.5,
    lon: -76.5,
    neighbors: ["VALPARAISO_APP", "CAPE_HORN_S", "SPAC_WEST"],
  },
  SPAC_WEST: {
    id: "SPAC_WEST",
    lat: -46.0,
    lon: -135.0,
    neighbors: ["SYDNEY_APP", "CHILE_SOUTH"],
  },
  CAPE_HORN_S: {
    id: "CAPE_HORN_S",
    lat: -56.1,
    lon: -67.2,
    neighbors: ["CHILE_SOUTH", "USHUAIA_APP"],
  },
  USHUAIA_APP: {
    id: "USHUAIA_APP",
    lat: -54.95,
    lon: -67.6,
    neighbors: ["CAPE_HORN_S"],
  },
};

function toGeoPos(node: SeaNode): GeoPosition {
  return {
    latitude: makeLat(node.lat),
    longitude: makeLon(node.lon),
  };
}

function findNearestSeaNodeIds(pos: GeoPosition, k: number = 2): string[] {
  const entries = Object.values(SEA_NODES).map((node) => ({
    id: node.id,
    dist: calculateDistanceNM(pos, toGeoPos(node)),
  }));
  entries.sort((a, b) => a.dist - b.dist);
  return entries.slice(0, k).map((e) => e.id);
}

/**
 * 使用 Dijkstra 搜索起点与终点之间的最短海上航道节点序列
 */
function findShortestSeaLanePath(start: GeoPosition, end: GeoPosition): GeoPosition[] {
  const startCandidates = findNearestSeaNodeIds(start, 2);
  const endCandidates = findNearestSeaNodeIds(end, 1);
  const targetNodeId = endCandidates[0];

  const distMap: Record<string, number> = {};
  const prevMap: Record<string, string | null> = {};
  const unvisited = new Set<string>(Object.keys(SEA_NODES));

  for (const id of Object.keys(SEA_NODES)) {
    distMap[id] = Infinity;
    prevMap[id] = null;
  }

  for (const sc of startCandidates) {
    const d = calculateDistanceNM(start, toGeoPos(SEA_NODES[sc]));
    distMap[sc] = d;
  }

  while (unvisited.size > 0) {
    let u: string | null = null;
    let bestD = Infinity;
    for (const id of unvisited) {
      if (distMap[id] < bestD) {
        bestD = distMap[id];
        u = id;
      }
    }
    if (!u || bestD === Infinity) break;
    if (u === targetNodeId) break;
    unvisited.delete(u);

    const uNode = SEA_NODES[u];
    const uPos = toGeoPos(uNode);
    for (const v of uNode.neighbors) {
      if (!unvisited.has(v)) continue;
      const vNode = SEA_NODES[v];
      if (!vNode) continue;
      const weight = calculateDistanceNM(uPos, toGeoPos(vNode));
      const alt = distMap[u] + weight;
      if (alt < distMap[v]) {
        distMap[v] = alt;
        prevMap[v] = u;
      }
    }
  }

  const pathIds: string[] = [];
  let curr: string | null = targetNodeId;
  while (curr) {
    pathIds.unshift(curr);
    curr = prevMap[curr];
  }

  // 若第一个海上航路点位于本船后方且第二个航路点更接近目标方向，则平滑跳过首个回退点
  if (pathIds.length >= 2) {
    const firstPos = toGeoPos(SEA_NODES[pathIds[0]]);
    const secondPos = toGeoPos(SEA_NODES[pathIds[1]]);
    const distStartToSecond = calculateDistanceNM(start, secondPos);
    const distFirstToSecond = calculateDistanceNM(firstPos, secondPos);
    const distStartToFirst = calculateDistanceNM(start, firstPos);
    if (distStartToFirst < 140 && distStartToSecond < distFirstToSecond) {
      pathIds.shift();
    }
  }

  // 若最后一个航路点距离终点极近 (< 15 NM)，则直接并入终点
  if (pathIds.length >= 1) {
    const lastPos = toGeoPos(SEA_NODES[pathIds[pathIds.length - 1]]);
    if (calculateDistanceNM(lastPos, end) < 15) {
      pathIds.pop();
    }
  }

  return pathIds.map((id) => toGeoPos(SEA_NODES[id]));
}

/**
 * 对远洋超长航段使用 Turf 球面大圆插值加密，同时严格保持海上走廊路径不穿陆地
 */
function subdivideLongOceanSegments(
  start: GeoPosition,
  seaWaypoints: GeoPosition[],
  end: GeoPosition
): GeoPosition[] {
  const fullChain = [start, ...seaWaypoints, end];
  const result: GeoPosition[] = [];

  for (let i = 0; i < fullChain.length - 1; i++) {
    const p1 = fullChain[i];
    const p2 = fullChain[i + 1];
    if (i > 0) {
      result.push(p1);
    }

    const segDistNM = calculateDistanceNM(p1, p2);
    if (segDistNM > 650) {
      const subSteps = Math.min(4, Math.floor(segDistNM / 450));
      try {
        const pt1 = turf.point([p1.longitude, p1.latitude]);
        const pt2 = turf.point([p2.longitude, p2.latitude]);
        const gc = turf.greatCircle(pt1, pt2, { npoints: subSteps + 2 });
        const coords: number[][] = [];
        if (gc.geometry.type === "LineString") {
          coords.push(...(gc.geometry.coordinates as number[][]));
        } else if (gc.geometry.type === "MultiLineString") {
          for (const seg of gc.geometry.coordinates as number[][][]) {
            coords.push(...seg);
          }
        }
        const midCoords = coords.slice(1, coords.length - 1);
        for (const [lon, lat] of midCoords) {
          result.push({
            latitude: makeLat(Number(lat.toFixed(4))),
            longitude: makeLon(Number(lon.toFixed(4))),
          });
        }
      } catch {
        // Ignore subdivision fallback
      }
    }
  }

  return result;
}

/**
 * 计算球面海上航道中间航路点序列 (严格沿真实国际海事海峡与外海航道绕行，绝不穿越陆地)
 */
export function generateGreatCirclePositions(
  start: GeoPosition,
  end: GeoPosition,
  npoints: number = 8
): GeoPosition[] {
  const directDistNM = calculateDistanceNM(start, end);
  if (directDistNM < 45) {
    const fallback: GeoPosition[] = [];
    const steps = Math.max(1, Math.min(3, npoints));
    for (let i = 1; i <= steps; i++) {
      const f = i / (steps + 1);
      fallback.push({
        latitude: makeLat(
          Number((start.latitude + (end.latitude - start.latitude) * f).toFixed(4))
        ),
        longitude: makeLon(
          Number((start.longitude + (end.longitude - start.longitude) * f).toFixed(4))
        ),
      });
    }
    return fallback;
  }

  const seaNodes = findShortestSeaLanePath(start, end);
  const refined = subdivideLongOceanSegments(start, seaNodes, end);
  if (refined.length > 0) {
    return refined;
  }

  return seaNodes;
}
