import {
  AISVesselTarget,
  GeoPosition,
  ServiceResult,
  makeKn,
  makeLat,
  makeLon,
  makeUnixMs,
} from "../../types";

export class AISService {
  private syntheticFleet: AISVesselTarget[] = [
    {
      targetId: "AIS_412356789",
      mmsi: "412356789",
      imo: "9811002",
      vesselName: "COSCO SHIPPING TAURUS",
      vesselType: "Container",
      position: { latitude: makeLat(30.85), longitude: makeLon(122.45) },
      sogKn: makeKn(16.5),
      cogDeg: 125,
      headingDeg: 124,
      draftM: 14.8,
      destinationPort: "SGSIN",
      eta: makeUnixMs(Date.now() + 86400000 * 4),
      navigationStatus: "UNDERWAY_ENGINE",
      source: "SYNTHETIC_OCEAN",
      observedAt: makeUnixMs(Date.now()),
      receivedAt: makeUnixMs(Date.now()),
      isCollectedInShipBook: false,
      positionUncertaintyM: 10,
    },
    {
      targetId: "AIS_563001245",
      mmsi: "563001245",
      imo: "9328493",
      vesselName: "MAERSK MC-KINNEY MOLLER",
      vesselType: "Container",
      position: { latitude: makeLat(30.42), longitude: makeLon(122.68) },
      sogKn: makeKn(18.2),
      cogDeg: 310,
      headingDeg: 308,
      draftM: 15.2,
      destinationPort: "CNSHA",
      eta: makeUnixMs(Date.now() + 86400000 * 1),
      navigationStatus: "UNDERWAY_ENGINE",
      source: "SYNTHETIC_OCEAN",
      observedAt: makeUnixMs(Date.now()),
      receivedAt: makeUnixMs(Date.now()),
      isCollectedInShipBook: false,
      positionUncertaintyM: 8,
    },
    {
      targetId: "AIS_244670000",
      mmsi: "244670000",
      imo: "9672040",
      vesselName: "OCEAN PACIFIC VLCC",
      vesselType: "Tanker",
      position: { latitude: makeLat(29.95), longitude: makeLon(122.90) },
      sogKn: makeKn(12.0),
      cogDeg: 215,
      headingDeg: 214,
      draftM: 17.5,
      destinationPort: "NLRTM",
      eta: makeUnixMs(Date.now() + 86400000 * 18),
      navigationStatus: "UNDERWAY_ENGINE",
      source: "SYNTHETIC_OCEAN",
      observedAt: makeUnixMs(Date.now()),
      receivedAt: makeUnixMs(Date.now()),
      isCollectedInShipBook: false,
      positionUncertaintyM: 12,
    },
  ];

  async getActiveTargets(): Promise<ServiceResult<AISVesselTarget[]>> {
    return {
      data: this.syntheticFleet,
      receivedAt: makeUnixMs(Date.now()),
      stale: false,
      source: "SYNTHETIC_FLEET",
    };
  }
}

export const aisService = new AISService();
