import { PersistOptions } from "zustand/middleware";
import { GameStore } from "../index";

export const GAME_SAVE_STORAGE_KEY = "seafaring_live_ocean_save_v1";

export type PersistedGameSlice = Pick<
  GameStore,
  | "activeVessel"
  | "departurePortId"
  | "roWaterMakerEnabled"
  | "trackHistory"
  | "playerCredits"
  | "playerLevel"
  | "playerXP"
  | "ownedVesselIds"
  | "unlockedPerkIds"
  | "discoveredPortIds"
  | "collectedAISIds"
  | "activeContractIds"
  | "completedContractIds"
  | "licenseId"
  | "weatherRoutingActive"
  | "canalVipPassActive"
  | "canalVipOwned"
  | "commandCenterBuilt"
  | "fleetDispatches"
  | "fleetLedgerLogs"
  | "plannedRoute"
  | "autopilotEnabled"
  | "activeWaypointIndex"
  | "language"
  | "mapTileSource"
>;

export const gamePersistConfig: PersistOptions<GameStore, PersistedGameSlice> = {
  name: GAME_SAVE_STORAGE_KEY,
  version: 1,
  partialize: (state) => ({
    activeVessel: state.activeVessel,
    departurePortId: state.departurePortId,
    roWaterMakerEnabled: state.roWaterMakerEnabled,
    trackHistory: state.trackHistory,
    playerCredits: state.playerCredits,
    playerLevel: state.playerLevel,
    playerXP: state.playerXP,
    ownedVesselIds: state.ownedVesselIds,
    unlockedPerkIds: state.unlockedPerkIds,
    discoveredPortIds: state.discoveredPortIds,
    collectedAISIds: state.collectedAISIds,
    activeContractIds: state.activeContractIds,
    completedContractIds: state.completedContractIds,
    licenseId: state.licenseId,
    weatherRoutingActive: state.weatherRoutingActive,
    canalVipPassActive: state.canalVipPassActive,
    canalVipOwned: state.canalVipOwned,
    commandCenterBuilt: state.commandCenterBuilt,
    fleetDispatches: state.fleetDispatches,
    fleetLedgerLogs: state.fleetLedgerLogs,
    plannedRoute: state.plannedRoute,
    autopilotEnabled: state.autopilotEnabled,
    activeWaypointIndex: state.activeWaypointIndex,
    language: state.language,
    mapTileSource: state.mapTileSource,
  }),
};
