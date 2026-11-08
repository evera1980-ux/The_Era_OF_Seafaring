/* =========================================================
 * Era of Seafaring: Live Ocean
 * Global Data Contracts
 * TypeScript Strict Mode
 * ========================================================= */

export type Brand<T, B extends string> = T & {
  readonly __brand: B;
};

export type Latitude = Brand<number, "Latitude">;
export type Longitude = Brand<number, "Longitude">;
export type NauticalMiles = Brand<number, "NauticalMiles">;
export type Knots = Brand<number, "Knots">;
export type Credits = Brand<number, "Credits">;
export type GameHours = Brand<number, "GameHours">;
export type UnixMs = Brand<number, "UnixMs">;

export const makeLat = (v: number) => v as Latitude;
export const makeLon = (v: number) => v as Longitude;
export const makeNM = (v: number) => v as NauticalMiles;
export const makeKn = (v: number) => v as Knots;
export const makeCredits = (v: number) => v as Credits;
export const makeGameHours = (v: number) => v as GameHours;
export const makeUnixMs = (v: number) => v as UnixMs;

export type Tier = 1 | 2 | 3 | 4 | 5 | 6;

export type PropulsionType =
  | "Sail"
  | "Diesel"
  | "Hybrid"
  | "Nuclear";

export type EngineTelegraph =
  | "STOP"
  | "SLOW"
  | "HALF"
  | "ECO"
  | "FULL"
  | "FLANK";

export type VesselCategory =
  | "Cargo"
  | "Tanker"
  | "Sailboat"
  | "Icebreaker"
  | "Research"
  | "BulkCarrier"
  | "Container"
  | "Fishing"
  | "Passenger"
  | "Other";

export type AISDataSource =
  | "REAL_LIVE"
  | "SYNTHETIC_OCEAN"
  | "HISTORICAL";

export type AISNavigationStatus =
  | "UNDERWAY_ENGINE"
  | "UNDERWAY_SAIL"
  | "AT_ANCHOR"
  | "MOORED"
  | "NOT_UNDER_COMMAND"
  | "RESTRICTED_MANEUVERABILITY"
  | "AGROUND"
  | "UNKNOWN";

export type SupplyType =
  | "FUEL"
  | "FRESH_WATER"
  | "RATION"
  | "SPARE_PARTS";

export type CargoQuality =
  | "STANDARD"
  | "REFRIGERATED"
  | "HAZARDOUS"
  | "FRAGILE"
  | "BULK";

export type GameStatus =
  | "IDLE"
  | "SAILING"
  | "DOCKED"
  | "GROUNDED"
  | "EMERGENCY"
  | "PAUSED";

export interface GeoPosition {
  latitude: Latitude;
  longitude: Longitude;
}

export interface Vector2 {
  east: number;
  north: number;
}

export interface VesselEquipmentSlot {
  slotId: string;
  allowedCategories: string[];
}

export interface VesselSpec {
  vesselId: string;
  name: string;
  tier: Tier;
  category: VesselCategory;
  propulsion: PropulsionType;

  unlockLevel: number;
  purchasePrice: Credits;

  lightDisplacementT: number;
  dwtT: number;
  cargoVolumeM3: number;
  containerCapacityTEU: number;

  lightDraftM: number;
  loadedDraftM: number;

  ecoSpeedKn: Knots;
  maxSpeedKn: Knots;

  mainFuelRateEcoKgH: number;
  auxiliaryFuelRateKgH: number;

  fuelCapacityT: number;
  waterCapacityT: number;
  rationCapacityT: number;
  sparePartsCapacityT: number;

  theoreticalRangeNM: NauticalMiles;

  safeBeaufort: number;
  safeWaveHeightM: number;

  crewCount: number;

  equipmentSlots: VesselEquipmentSlot[];
  assetKey: AssetKey;
}

export interface CargoItem {
  cargoId: string;
  commodityId: string;

  quantityT: number;
  volumeM3: number;

  unitBuyPrice: Credits;
  quality: CargoQuality;

  integrity: number;
  refrigerated: boolean;
}

export interface SupplyState {
  fuelT: number;
  freshWaterT: number;
  rationT: number;
  sparePartsT: number;
}

export interface VesselInstalledUpgrade {
  upgradeId: string;
  installedAtGameTime: number;
  durability: number;
}

export interface PlayerVesselState {
  vesselId: string;

  position: GeoPosition;

  headingDeg: number;
  cogDeg: number;
  sogKn: Knots;

  engineTelegraph: EngineTelegraph;
  propulsionMode: PropulsionType;

  supplies: SupplyState;

  cargoItems: CargoItem[];
  cargoWeightT: number;
  cargoVolumeM3: number;

  installedUpgrades: VesselInstalledUpgrade[];

  hullHp: number;
  hullHpMax: number;

  cargoIntegrity: number;

  currentDraftM: number;
  currentDisplacementT: number;

  gameStatus: GameStatus;

  engineTemperature: number;
  engineOverheated: boolean;

  grounded: boolean;

  crewHealth: number;

  lastSimulationTimestamp: UnixMs;
}

export interface MarineWeatherCell {
  cellId: string;

  position: GeoPosition;

  sampledAt: UnixMs;

  windSpeedKn: number;
  windDirectionDeg: number;
  windGustKn: number;

  significantWaveHeightM: number;
  swellPeriodS: number;
  swellDirectionDeg: number;

  currentSpeedKn: number;
  currentDirectionDeg: number;

  currentVector: Vector2;

  pressureHpa: number;

  beaufortScale: number;

  source:
    | "OPEN_METEO"
    | "NOAA_GFS"
    | "SYNTHETIC";

  quality:
    | "OBSERVED"
    | "FORECAST"
    | "INTERPOLATED"
    | "FALLBACK";
}

export interface AISVesselTarget {
  targetId: string;

  mmsi: string;
  imo: string | null;

  vesselName: string;

  vesselType: VesselCategory;

  position: GeoPosition;

  sogKn: Knots;
  cogDeg: number;
  headingDeg: number | null;

  draftM: number | null;

  destinationPort: string | null;
  eta: UnixMs | null;

  navigationStatus: AISNavigationStatus;

  source: AISDataSource;

  observedAt: UnixMs;
  receivedAt: UnixMs;

  isCollectedInShipBook: boolean;

  positionUncertaintyM: number;
}

export interface PortCommodity {
  commodityId: string;

  buyPricePerT: Credits;
  sellPricePerT: Credits;

  stockT: number;
  maxStockT: number;

  productionPerGameHourT: number;
  consumptionPerGameHourT: number;
}

export interface PortInfo {
  portId: string;

  unlocode: string;
  name: string;

  position: GeoPosition;

  maxAllowedDraftM: number;

  fuelPricePerL: Credits;
  freshWaterPricePerT: Credits;

  rationPricePerT: Credits;
  sparePartsPricePerT: Credits;

  portFeeCredits: Credits;

  commodities: PortCommodity[];

  canRefuel: boolean;
  canSupplyFreshWater: boolean;
  canRepair: boolean;

  hasShipyard: boolean;
  hasSalvageService: boolean;
}

export type AssetKey =
  | "vessel.tier1.sloop"
  | "vessel.tier1.harborTrader"
  | "vessel.tier2.oceanSloop"
  | "vessel.tier2.feeder120"
  | "vessel.tier3.windClipper"
  | "vessel.tier3.researchVessel"
  | "vessel.tier4.panamax"
  | "vessel.tier4.oceanExplorer"
  | "vessel.tier5.capeBulk"
  | "vessel.tier5.arcticResearch"
  | "vessel.tier6.nuclearIcebreaker"
  | "vessel.tier6.globalExpedition"
  | "weather.clear"
  | "weather.cloudy"
  | "weather.storm"
  | "weather.snow"
  | "hud.compass"
  | "hud.engineTelegraph"
  | "hud.seaWindow"
  | "port.default"
  | "cargo.container"
  | "cargo.oil"
  | "cargo.ore";

export type AssetRenderMode =
  | "procedural"
  | "image";

export type AssetFormat =
  | "svg"
  | "png"
  | "webp";

export interface AssetConfig {
  assetId: AssetKey;

  mode: AssetRenderMode;

  overridePath?: string;

  format?: AssetFormat;

  width: number;
  height: number;

  proceduralGenerator?: string;

  fallbackAssetId?: AssetKey;

  cache: boolean;
}

export interface AssetManifest {
  version: number;

  assets: Record<AssetKey, AssetConfig>;
}

export interface RouteWaypoint {
  waypointId: string;
  position: GeoPosition;

  expectedArrivalGameTime: number;

  waypointType:
    | "PORT"
    | "NAVIGATION"
    | "ANCHORAGE"
    | "POLAR_GATE";
}

export interface PlannedRoute {
  routeId: string;

  waypoints: RouteWaypoint[];

  totalDistanceNM: NauticalMiles;

  estimatedDurationGameHours: GameHours;

  estimatedFuelT: number;

  estimatedRisk: number;

  createdAt: UnixMs;
}

export type MaritimeLicenseId =
  | "CLASS_4"
  | "CLASS_3"
  | "CLASS_2"
  | "CLASS_1"
  | "FLEET_OPS";

export interface FleetDispatchOrder {
  vesselId: string;
  captainId: string;
  captainName: string;
  captainTrait: string;
  originPortId: string;
  destinationPortId: string;
  commodityId: string;
  progressPct: number;
  estimatedProfitPerTrip: number;
  tripsCompleted: number;
  totalEarnedCr: number;
}

export interface GameClockState {
  gameTimeMs: number;

  realTimeMs: number;

  timeScale: 1 | 2 | 5 | 10 | 30 | 60 | 120 | 180 | 300 | 600 | 1800 | 3600;

  paused: boolean;
}

export interface GameSaveData {
  saveVersion: number;

  playerCredits: Credits;

  playerLevel: number;
  playerXP: number;

  ownedVesselIds: string[];

  activeVessel: PlayerVesselState;

  discoveredPortIds: string[];

  collectedAISIds: string[];

  completedContracts: string[];

  gameClock: GameClockState;

  lastOnlineTimestamp: UnixMs;
}

export interface SimulationResult {
  nextVesselState: PlayerVesselState;

  distanceAdvancedNM: number;

  fuelConsumedT: number;

  waterConsumedT: number;

  rationConsumedT: number;

  sparePartsConsumedT: number;

  hullDamage: number;

  cargoDamage: number;

  grounded: boolean;

  warnings: string[];
}

export interface WeatherQuery {
  position: GeoPosition;

  requestedAt: UnixMs;
}

export interface AISQuery {
  minLatitude: number;
  maxLatitude: number;

  minLongitude: number;
  maxLongitude: number;

  vesselTypes?: VesselCategory[];
}

export interface BathymetrySample {
  position: GeoPosition;

  depthM: number;

  sampledAt: UnixMs;

  source: "GEBCO" | "CACHE" | "FALLBACK";
}

export interface ServiceResult<T> {
  data: T;

  receivedAt: UnixMs;

  stale: boolean;

  source: string;
}

export interface GameError {
  code: string;

  message: string;

  recoverable: boolean;
}
