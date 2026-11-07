import { StateCreator } from "zustand";

export type ActiveModal =
  | "NONE"
  | "PORT_TRADE"
  | "SHIPYARD"
  | "AIS_DETAIL"
  | "MAYDAY"
  | "JOURNAL"
  | "ROUTE_PLANNER"
  | "MAP_STYLE_SETTINGS";

export interface UIModalSlice {
  activeModal: ActiveModal;
  selectedPortId: string | null;
  selectedAISTargetId: string | null;
  mapTileSource: "NAUTICAL_DARK" | "GOOGLE_SATELLITE" | "OPENSTREETMAP";

  openModal: (modal: ActiveModal, payload?: { portId?: string; aisId?: string }) => void;
  closeModal: () => void;
  setMapTileSource: (source: "NAUTICAL_DARK" | "GOOGLE_SATELLITE" | "OPENSTREETMAP") => void;
}

export const createUIModalSlice: StateCreator<UIModalSlice> = (set) => ({
  activeModal: "NONE",
  selectedPortId: null,
  selectedAISTargetId: null,
  mapTileSource: "NAUTICAL_DARK",

  openModal: (modal, payload) =>
    set({
      activeModal: modal,
      selectedPortId: payload?.portId ?? null,
      selectedAISTargetId: payload?.aisId ?? null,
    }),

  closeModal: () =>
    set({
      activeModal: "NONE",
      selectedPortId: null,
      selectedAISTargetId: null,
    }),

  setMapTileSource: (source) => set({ mapTileSource: source }),
});
