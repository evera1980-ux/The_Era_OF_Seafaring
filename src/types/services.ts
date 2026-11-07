import { GeoPosition, MarineWeatherCell, AISVesselTarget, BathymetrySample, ServiceResult } from "./index";

export interface IWeatherService {
  getWeatherAt(pos: GeoPosition): Promise<ServiceResult<MarineWeatherCell>>;
}

export interface IAISService {
  getActiveTargets(bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }): Promise<ServiceResult<AISVesselTarget[]>>;
}

export interface IBathymetryService {
  getDepthAt(pos: GeoPosition): Promise<ServiceResult<BathymetrySample>>;
}
