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

export type PortTradeTab = "COMMODITIES" | "SUPPLIES" | "REPAIR";

export interface UIModalSlice {
  activeModal: ActiveModal;
  selectedPortId: string | null;
  selectedAISTargetId: string | null;
  portTradeTab: PortTradeTab;
  mapTileSource: "NAUTICAL_DARK" | "GOOGLE_SATELLITE" | "OPENSTREETMAP";

  openModal: (
    modal: ActiveModal,
    payload?: { portId?: string; aisId?: string; tab?: PortTradeTab }
  ) => void;
  closeModal: () => void;
  setMapTileSource: (source: "NAUTICAL_DARK" | "GOOGLE_SATELLITE" | "OPENSTREETMAP") => void;
}

export const createUIModalSlice: StateCreator<UIModalSlice> = (set) => ({
  activeModal: "NONE",
  selectedPortId: null,
  selectedAISTargetId: null,
  portTradeTab: "COMMODITIES",
  mapTileSource: "NAUTICAL_DARK",

  openModal: (modal, payload) =>
    set((state) => ({
      activeModal: modal,
      selectedPortId: payload?.portId ?? state.selectedPortId,
      selectedAISTargetId: payload?.aisId ?? null,
      portTradeTab: payload?.tab ?? "COMMODITIES",
    })),

  closeModal: () =>
    set({
      activeModal: "NONE",
      selectedPortId: null,
      selectedAISTargetId: null,
    }),

  setMapTileSource: (source) => set({ mapTileSource: source }),
});
