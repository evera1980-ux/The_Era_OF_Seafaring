import { StateCreator } from "zustand";
import { Credits, makeCredits } from "../../types";
import { GAME_BALANCE } from "../../config/gameBalance";

export interface EconomySlice {
  playerCredits: Credits;
  playerLevel: number;
  playerXP: number;
  ownedVesselIds: string[];
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => boolean;
  addXP: (xp: number) => void;
  purchaseVessel: (vesselId: string, price: Credits) => boolean;
  switchVessel: (vesselId: string) => void;
}

export const createEconomySlice: StateCreator<EconomySlice> = (set, get) => ({
  playerCredits: GAME_BALANCE.INITIAL_CREDITS,
  playerLevel: GAME_BALANCE.INITIAL_LEVEL,
  playerXP: GAME_BALANCE.INITIAL_XP,
  ownedVesselIds: [GAME_BALANCE.INITIAL_VESSEL_ID],

  addCredits: (amount) =>
    set((state) => ({
      playerCredits: makeCredits(Math.max(0, state.playerCredits + amount)),
    })),

  deductCredits: (amount) => {
    const current = get().playerCredits;
    if (current < amount) return false;
    set({ playerCredits: makeCredits(current - amount) });
    return true;
  },

  addXP: (xpGained) =>
    set((state) => {
      const newXP = state.playerXP + xpGained;
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
      playerCredits: makeCredits(playerCredits - price),
      ownedVesselIds: [...ownedVesselIds, vesselId],
    });
    return true;
  },

  switchVessel: (vesselId) => {
    // 换船逻辑
  },
});
