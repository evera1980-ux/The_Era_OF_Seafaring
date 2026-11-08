import { StateCreator } from "zustand";
import {
  PlayerVesselState,
  EngineTelegraph,
  CargoItem,
  SupplyState,
  GeoPosition,
  makeKn,
  makeLat,
  makeLon,
  makeUnixMs,
} from "../../types";
import { GAME_BALANCE } from "../../config/gameBalance";
import { VESSELS } from "../../config/vessels";
import { calculateSeaRepairResult } from "../../core/economy/maintenance";
import { calculateRefloatProbability } from "../../core/physics/grounding";
import { calculateCurrentDraft } from "../../core/physics/draft";

export interface ShipSlice {
  activeVessel: PlayerVesselState;
  departurePortId: string;
  roWaterMakerEnabled: boolean;
  trackHistory: GeoPosition[];
  setEngineTelegraph: (telegraph: EngineTelegraph) => void;
  setHeadingDeg: (heading: number) => void;
  updateVesselState: (partial: Partial<PlayerVesselState>) => void;
  refuel: (tons: number) => void;
  replenishWater: (tons: number) => void;
  replenishRations: (tons: number) => void;
  replenishSpareParts: (tons: number) => void;
  repairHull: (hpDelta: number) => void;
  addCargoItem: (item: CargoItem) => void;
  removeCargoItem: (cargoId: string) => void;
  setDeparturePort: (portId: string) => void;
  toggleWaterMaker: () => void;
  installUpgrade: (upgradeId: string) => boolean;
  performSeaRepair: () => boolean;
  attemptSelfRefloat: (
    waterDepthM: number,
    perkBonus?: number
  ) => { success: boolean; prob: number };
}

const initialSupplies: SupplyState = {
  fuelT: 1.0, // V001 配备辅机/应急柴油舱 (容量 2.0t，初始 1.0t 可随时补给)
  freshWaterT: 1.2,
  rationT: 0.6,
  sparePartsT: 0.3,
};

const initialPosition: GeoPosition = {
  latitude: makeLat(30.60),
  longitude: makeLon(122.10),
};

export const initialVesselState: PlayerVesselState = {
  vesselId: GAME_BALANCE.INITIAL_VESSEL_ID,
  position: initialPosition,
  headingDeg: 110,
  cogDeg: 110,
  sogKn: makeKn(0),
  engineTelegraph: "STOP",
  propulsionMode: "Sail",
  supplies: initialSupplies,
  cargoItems: [],
  cargoWeightT: 0,
  cargoVolumeM3: 0,
  installedUpgrades: [],
  hullHp: 10000,
  hullHpMax: 10000,
  cargoIntegrity: 100,
  currentDraftM: 1.5,
  currentDisplacementT: 21.1,
  gameStatus: "DOCKED",
  engineTemperature: 45,
  engineOverheated: false,
  grounded: false,
  crewHealth: 100,
  lastSimulationTimestamp: makeUnixMs(Date.now()),
};

export const createShipSlice: StateCreator<ShipSlice> = (set, get) => ({
  activeVessel: initialVesselState,
  departurePortId: GAME_BALANCE.INITIAL_PORT_ID,
  roWaterMakerEnabled: false,
  trackHistory: [initialPosition],

  setEngineTelegraph: (telegraph) =>
    set((state) => ({
      activeVessel: {
        ...state.activeVessel,
        engineTelegraph: telegraph,
        gameStatus:
          telegraph === "STOP"
            ? state.activeVessel.grounded
              ? "GROUNDED"
              : "IDLE"
            : "SAILING",
      },
    })),

  setHeadingDeg: (heading) =>
    set((state) => ({
      activeVessel: {
        ...state.activeVessel,
        headingDeg: (heading + 360) % 360,
      },
    })),

  updateVesselState: (partial) =>
    set((state) => {
      const nextVessel = { ...state.activeVessel, ...partial };
      let nextTrack = state.trackHistory;

      if (partial.position) {
        const lastPos = state.trackHistory[state.trackHistory.length - 1];
        const dLat = Math.abs(partial.position.latitude - (lastPos?.latitude ?? 0));
        const dLon = Math.abs(partial.position.longitude - (lastPos?.longitude ?? 0));
        if (!lastPos || dLat > 0.015 || dLon > 0.015) {
          nextTrack = [...state.trackHistory.slice(-79), partial.position];
        }
      }

      return {
        activeVessel: nextVessel,
        trackHistory: nextTrack,
      };
    }),

  refuel: (tons) =>
    set((state) => {
      const spec = VESSELS[state.activeVessel.vesselId] ?? VESSELS.V001;
      const maxFuelCap = Math.max(0.5, spec.fuelCapacityT);
      const nextFuel = Math.round(
        Math.min(maxFuelCap, Math.max(0, state.activeVessel.supplies.fuelT + tons)) * 100
      ) / 100;
      const nextSupplies = { ...state.activeVessel.supplies, fuelT: nextFuel };
      const { draftM, displacementT } = calculateCurrentDraft(
        spec,
        nextSupplies,
        state.activeVessel.cargoWeightT
      );
      return {
        activeVessel: {
          ...state.activeVessel,
          supplies: nextSupplies,
          currentDraftM: draftM,
          currentDisplacementT: displacementT,
        },
      };
    }),

  replenishWater: (tons) =>
    set((state) => {
      const spec = VESSELS[state.activeVessel.vesselId] ?? VESSELS.V001;
      const nextWater = Math.round(
        Math.min(
          spec.waterCapacityT,
          Math.max(0, state.activeVessel.supplies.freshWaterT + tons)
        ) * 100
      ) / 100;
      const nextSupplies = { ...state.activeVessel.supplies, freshWaterT: nextWater };
      const { draftM, displacementT } = calculateCurrentDraft(
        spec,
        nextSupplies,
        state.activeVessel.cargoWeightT
      );
      return {
        activeVessel: {
          ...state.activeVessel,
          supplies: nextSupplies,
          currentDraftM: draftM,
          currentDisplacementT: displacementT,
        },
      };
    }),

  replenishRations: (tons) =>
    set((state) => {
      const spec = VESSELS[state.activeVessel.vesselId] ?? VESSELS.V001;
      const nextRation = Math.round(
        Math.min(
          spec.rationCapacityT,
          Math.max(0, state.activeVessel.supplies.rationT + tons)
        ) * 100
      ) / 100;
      const nextSupplies = { ...state.activeVessel.supplies, rationT: nextRation };
      const { draftM, displacementT } = calculateCurrentDraft(
        spec,
        nextSupplies,
        state.activeVessel.cargoWeightT
      );
      return {
        activeVessel: {
          ...state.activeVessel,
          supplies: nextSupplies,
          currentDraftM: draftM,
          currentDisplacementT: displacementT,
        },
      };
    }),

  replenishSpareParts: (tons) =>
    set((state) => {
      const spec = VESSELS[state.activeVessel.vesselId] ?? VESSELS.V001;
      const nextParts = Math.round(
        Math.min(
          spec.sparePartsCapacityT,
          Math.max(0, state.activeVessel.supplies.sparePartsT + tons)
        ) * 100
      ) / 100;
      const nextSupplies = { ...state.activeVessel.supplies, sparePartsT: nextParts };
      const { draftM, displacementT } = calculateCurrentDraft(
        spec,
        nextSupplies,
        state.activeVessel.cargoWeightT
      );
      return {
        activeVessel: {
          ...state.activeVessel,
          supplies: nextSupplies,
          currentDraftM: draftM,
          currentDisplacementT: displacementT,
        },
      };
    }),

  repairHull: (hpDelta) =>
    set((state) => ({
      activeVessel: {
        ...state.activeVessel,
        hullHp: Math.min(
          state.activeVessel.hullHpMax,
          Math.max(0, state.activeVessel.hullHp + hpDelta)
        ),
        grounded: false,
      },
    })),

  addCargoItem: (item) =>
    set((state) => {
      const spec = VESSELS[state.activeVessel.vesselId] ?? VESSELS.V001;
      const existingIdx = state.activeVessel.cargoItems.findIndex(
        (c) => c.commodityId === item.commodityId
      );
      let newItems: CargoItem[];
      if (existingIdx >= 0) {
        newItems = state.activeVessel.cargoItems.map((c, idx) =>
          idx === existingIdx
            ? {
                ...c,
                quantityT: Math.round((c.quantityT + item.quantityT) * 100) / 100,
                volumeM3: Math.round((c.volumeM3 + item.volumeM3) * 100) / 100,
              }
            : c
        );
      } else {
        newItems = [...state.activeVessel.cargoItems, item];
      }
      const newWeight =
        Math.round(newItems.reduce((acc, c) => acc + c.quantityT, 0) * 100) / 100;
      const newVolume =
        Math.round(newItems.reduce((acc, c) => acc + c.volumeM3, 0) * 100) / 100;
      const { draftM, displacementT } = calculateCurrentDraft(
        spec,
        state.activeVessel.supplies,
        newWeight
      );
      return {
        activeVessel: {
          ...state.activeVessel,
          cargoItems: newItems,
          cargoWeightT: newWeight,
          cargoVolumeM3: newVolume,
          currentDraftM: draftM,
          currentDisplacementT: displacementT,
        },
      };
    }),

  removeCargoItem: (cargoId) =>
    set((state) => {
      const spec = VESSELS[state.activeVessel.vesselId] ?? VESSELS.V001;
      const newItems = state.activeVessel.cargoItems.filter(
        (c) => c.cargoId !== cargoId
      );
      const newWeight =
        Math.round(newItems.reduce((acc, c) => acc + c.quantityT, 0) * 100) / 100;
      const newVolume =
        Math.round(newItems.reduce((acc, c) => acc + c.volumeM3, 0) * 100) / 100;
      const { draftM, displacementT } = calculateCurrentDraft(
        spec,
        state.activeVessel.supplies,
        newWeight
      );
      return {
        activeVessel: {
          ...state.activeVessel,
          cargoItems: newItems,
          cargoWeightT: newWeight,
          cargoVolumeM3: newVolume,
          currentDraftM: draftM,
          currentDisplacementT: displacementT,
        },
      };
    }),

  setDeparturePort: (portId) => set({ departurePortId: portId }),

  toggleWaterMaker: () =>
    set((state) => ({
      roWaterMakerEnabled: !state.roWaterMakerEnabled,
    })),

  installUpgrade: (upgradeId) => {
    const vessel = get().activeVessel;
    if (vessel.installedUpgrades.some((u) => u.upgradeId === upgradeId)) {
      return false;
    }
    set((state) => ({
      activeVessel: {
        ...state.activeVessel,
        installedUpgrades: [
          ...state.activeVessel.installedUpgrades,
          {
            upgradeId,
            installedAtGameTime: Date.now(),
            durability: 100,
          },
        ],
      },
    }));
    return true;
  },

  performSeaRepair: () => {
    const vessel = get().activeVessel;
    const res = calculateSeaRepairResult(
      vessel.hullHp,
      vessel.hullHpMax,
      vessel.supplies.sparePartsT
    );
    if (!res.canRepair) return false;

    set((state) => ({
      activeVessel: {
        ...state.activeVessel,
        hullHp: res.nextHullHp,
        supplies: {
          ...state.activeVessel.supplies,
          sparePartsT: res.nextSparePartsT,
        },
      },
    }));
    return true;
  },

  attemptSelfRefloat: (waterDepthM, perkBonus = 0) => {
    const vessel = get().activeVessel;
    const prob = calculateRefloatProbability(
      waterDepthM,
      vessel.currentDraftM,
      0.5,
      perkBonus
    );
    const roll = Math.random();
    if (roll <= prob) {
      set((state) => ({
        activeVessel: {
          ...state.activeVessel,
          grounded: false,
          gameStatus: "IDLE",
          engineTelegraph: "SLOW",
        },
      }));
      return { success: true, prob };
    } else {
      // 脱浅失败造成轻微船底刮擦损伤
      set((state) => ({
        activeVessel: {
          ...state.activeVessel,
          hullHp: Math.max(500, state.activeVessel.hullHp - 350),
        },
      }));
      return { success: false, prob };
    }
  },
});
