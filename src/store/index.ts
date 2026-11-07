import { create } from "zustand";
import { ShipSlice, createShipSlice } from "./slices/shipSlice";
import { NavigationSlice, createNavigationSlice } from "./slices/navigationSlice";
import { EconomySlice, createEconomySlice } from "./slices/economySlice";
import { WorldSlice, createWorldSlice } from "./slices/worldSlice";
import { UIModalSlice, createUIModalSlice } from "./slices/uiModalSlice";

export type GameStore = ShipSlice &
  NavigationSlice &
  EconomySlice &
  WorldSlice &
  UIModalSlice;

export const useGameStore = create<GameStore>()((...a) => ({
  ...createShipSlice(...a),
  ...createNavigationSlice(...a),
  ...createEconomySlice(...a),
  ...createWorldSlice(...a),
  ...createUIModalSlice(...a),
}));
