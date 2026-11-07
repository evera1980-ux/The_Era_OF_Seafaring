import { StateCreator } from "zustand";
import {
  PlayerVesselState,
  EngineTelegraph,
  CargoItem,
  SupplyState,
  makeCredits,
  makeKn,
  makeLat,
  makeLon,
  makeUnixMs,
} from "../../types";
import { GAME_BALANCE } from "../../config/gameBalance";

export interface ShipSlice {
  activeVessel: PlayerVesselState;
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
}

const initialSupplies: SupplyState = {
  fuelT: 0, // V001 是纯帆船，初始燃油 0
  freshWaterT: 1.0,
  rationT: 0.5,
  sparePartsT: 0.3,
};

const initialVesselState: PlayerVesselState = {
  vesselId: GAME_BALANCE.INITIAL_VESSEL_ID,
  position: { latitude: makeLat(30.60), longitude: makeLon(122.10) }, // 舟山群岛锚地
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
  currentDraftM: 1.4,
  currentDisplacementT: 18,
  gameStatus: "DOCKED",
  engineTemperature: 45,
  engineOverheated: false,
  grounded: false,
  crewHealth: 100,
  lastSimulationTimestamp: makeUnixMs(Date.now()),
};

export const createShipSlice: StateCreator<ShipSlice> = (set) => ({
  activeVessel: initialVesselState,

  setEngineTelegraph: (telegraph) =>
    set((state) => ({
      activeVessel: { ...state.activeVessel, engineTelegraph: telegraph },
    })),

  setHeadingDeg: (heading) =>
    set((state) => ({
      activeVessel: {
        ...state.activeVessel,
        headingDeg: (heading + 360) % 360,
      },
    })),

  updateVesselState: (partial) =>
    set((state) => ({
      activeVessel: { ...state.activeVessel, ...partial },
    })),

  refuel: (tons) =>
    set((state) => ({
      activeVessel: {
        ...state.activeVessel,
        supplies: {
          ...state.activeVessel.supplies,
          fuelT: state.activeVessel.supplies.fuelT + tons,
        },
      },
    })),

  replenishWater: (tons) =>
    set((state) => ({
      activeVessel: {
        ...state.activeVessel,
        supplies: {
          ...state.activeVessel.supplies,
          freshWaterT: state.activeVessel.supplies.freshWaterT + tons,
        },
      },
    })),

  replenishRations: (tons) =>
    set((state) => ({
      activeVessel: {
        ...state.activeVessel,
        supplies: {
          ...state.activeVessel.supplies,
          rationT: state.activeVessel.supplies.rationT + tons,
        },
      },
    })),

  replenishSpareParts: (tons) =>
    set((state) => ({
      activeVessel: {
        ...state.activeVessel,
        supplies: {
          ...state.activeVessel.supplies,
          sparePartsT: state.activeVessel.supplies.sparePartsT + tons,
        },
      },
    })),

  repairHull: (hpDelta) =>
    set((state) => ({
      activeVessel: {
        ...state.activeVessel,
        hullHp: Math.min(
          state.activeVessel.hullHpMax,
          state.activeVessel.hullHp + hpDelta
        ),
      },
    })),

  addCargoItem: (item) =>
    set((state) => {
      const newItems = [...state.activeVessel.cargoItems, item];
      const newWeight = newItems.reduce((acc, c) => acc + c.quantityT, 0);
      const newVolume = newItems.reduce((acc, c) => acc + c.volumeM3, 0);
      return {
        activeVessel: {
          ...state.activeVessel,
          cargoItems: newItems,
          cargoWeightT: newWeight,
          cargoVolumeM3: newVolume,
        },
      };
    }),

  removeCargoItem: (cargoId) =>
    set((state) => {
      const newItems = state.activeVessel.cargoItems.filter(
        (c) => c.cargoId !== cargoId
      );
      const newWeight = newItems.reduce((acc, c) => acc + c.quantityT, 0);
      const newVolume = newItems.reduce((acc, c) => acc + c.volumeM3, 0);
      return {
        activeVessel: {
          ...state.activeVessel,
          cargoItems: newItems,
          cargoWeightT: newWeight,
          cargoVolumeM3: newVolume,
        },
      };
    }),
});
