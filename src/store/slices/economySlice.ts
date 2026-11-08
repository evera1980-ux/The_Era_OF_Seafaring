import { StateCreator } from "zustand";
import { Credits, makeCredits, makeKn } from "../../types";
import { GAME_BALANCE } from "../../config/gameBalance";
import { VESSELS } from "../../config/vessels";
import { CAPTAIN_PERK_MAP } from "../../config/captainPerks";
import { calculateCurrentDraft } from "../../core/physics/draft";
import { ShipSlice } from "./shipSlice";

export interface EconomySlice {
  playerCredits: Credits;
  playerLevel: number;
  playerXP: number;
  ownedVesselIds: string[];
  unlockedPerkIds: string[];
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => boolean;
  addXP: (xp: number) => void;
  purchaseVessel: (vesselId: string, price: Credits) => boolean;
  switchVessel: (vesselId: string) => void;
  unlockPerk: (perkId: string) => boolean;
}

export const createEconomySlice: StateCreator<
  EconomySlice & ShipSlice,
  [],
  [],
  EconomySlice
> = (set, get) => ({
  playerCredits: GAME_BALANCE.INITIAL_CREDITS,
  playerLevel: GAME_BALANCE.INITIAL_LEVEL,
  playerXP: GAME_BALANCE.INITIAL_XP,
  ownedVesselIds: [GAME_BALANCE.INITIAL_VESSEL_ID],
  unlockedPerkIds: [],

  addCredits: (amount) =>
    set((state) => ({
      playerCredits: makeCredits(Math.round(Math.max(0, state.playerCredits + amount))),
    })),

  deductCredits: (amount) => {
    const current = get().playerCredits;
    if (current < amount) return false;
    set({ playerCredits: makeCredits(Math.round(current - amount)) });
    return true;
  },

  addXP: (xpGained) =>
    set((state) => {
      const newXP = Math.round((state.playerXP + xpGained) * 10) / 10;
      // 升级门槛: BaseXP * Level^1.6
      let newLevel = state.playerLevel;
      while (true) {
        const requiredXP = Math.round(
          GAME_BALANCE.BASE_XP * Math.pow(newLevel, GAME_BALANCE.XP_EXPONENT)
        );
        if (newXP >= requiredXP) {
          newLevel++;
        } else {
          break;
        }
      }
      return { playerXP: newXP, playerLevel: newLevel };
    }),

  purchaseVessel: (vesselId, price) => {
    const { playerCredits, ownedVesselIds } = get();
    if (playerCredits < price || ownedVesselIds.includes(vesselId)) {
      return false;
    }
    set({
      playerCredits: makeCredits(Math.round(playerCredits - price)),
      ownedVesselIds: [...ownedVesselIds, vesselId],
    });
    return true;
  },

  switchVessel: (vesselId) => {
    const { ownedVesselIds, activeVessel } = get();
    const spec = VESSELS[vesselId];
    if (!spec || !ownedVesselIds.includes(vesselId)) return;

    const newSupplies = {
      fuelT: Math.round(spec.fuelCapacityT * 0.85 * 10) / 10,
      freshWaterT: Math.round(spec.waterCapacityT * 0.9 * 10) / 10,
      rationT: Math.round(spec.rationCapacityT * 0.9 * 10) / 10,
      sparePartsT: Math.round(spec.sparePartsCapacityT * 0.6 * 10) / 10,
    };

    const { draftM, displacementT } = calculateCurrentDraft(
      spec,
      newSupplies,
      0
    );

    set({
      activeVessel: {
        ...activeVessel,
        vesselId: spec.vesselId,
        propulsionMode: spec.propulsion,
        engineTelegraph: "STOP",
        sogKn: makeKn(0),
        supplies: newSupplies,
        cargoItems: [],
        cargoWeightT: 0,
        cargoVolumeM3: 0,
        hullHp: 10000,
        hullHpMax: 10000,
        currentDraftM: draftM,
        currentDisplacementT: displacementT,
        engineTemperature: 45,
        engineOverheated: false,
        grounded: false,
        gameStatus: "DOCKED",
      },
    });
  },

  unlockPerk: (perkId) => {
    const { playerLevel, unlockedPerkIds } = get();
    const perk = CAPTAIN_PERK_MAP[perkId];
    if (!perk || unlockedPerkIds.includes(perkId)) return false;
    if (playerLevel < perk.unlockLevel) return false;

    const usedPoints = unlockedPerkIds.reduce(
      (sum, id) => sum + (CAPTAIN_PERK_MAP[id]?.pointCost ?? 1),
      0
    );
    const totalPoints = Math.max(1, playerLevel);
    const availablePoints = totalPoints - usedPoints;
    if (availablePoints < perk.pointCost) return false;

    set({
      unlockedPerkIds: [...unlockedPerkIds, perkId],
    });
    return true;
  },
});
