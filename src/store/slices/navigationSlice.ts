import { StateCreator } from "zustand";
import { PlannedRoute, RouteWaypoint, makeGameHours, makeNM, makeUnixMs } from "../../types";

export interface NavigationSlice {
  plannedRoute: PlannedRoute | null;
  autopilotEnabled: boolean;
  activeWaypointIndex: number;
  setAutopilot: (enabled: boolean) => void;
  setPlannedRoute: (route: PlannedRoute | null) => void;
  addWaypoint: (waypoint: RouteWaypoint) => void;
  clearRoute: () => void;
  advanceWaypoint: () => void;
}

export const createNavigationSlice: StateCreator<NavigationSlice> = (set) => ({
  plannedRoute: null,
  autopilotEnabled: false,
  activeWaypointIndex: 0,

  setAutopilot: (enabled) => set({ autopilotEnabled: enabled }),

  setPlannedRoute: (route) =>
    set({
      plannedRoute: route,
      activeWaypointIndex: 0,
    }),

  addWaypoint: (waypoint) =>
    set((state) => {
      const existingWaypoints = state.plannedRoute?.waypoints ?? [];
      const updatedWaypoints = [...existingWaypoints, waypoint];
      const route: PlannedRoute = {
        routeId: `route_${Date.now()}`,
        waypoints: updatedWaypoints,
        totalDistanceNM: makeNM(0),
        estimatedDurationGameHours: makeGameHours(0),
        estimatedFuelT: 0,
        estimatedRisk: 0,
        createdAt: makeUnixMs(Date.now()),
      };
      return { plannedRoute: route };
    }),

  clearRoute: () => set({ plannedRoute: null, activeWaypointIndex: 0, autopilotEnabled: false }),

  advanceWaypoint: () =>
    set((state) => {
      if (!state.plannedRoute) return state;
      const nextIndex = state.activeWaypointIndex + 1;
      if (nextIndex >= state.plannedRoute.waypoints.length) {
        return { autopilotEnabled: false, activeWaypointIndex: 0 };
      }
      return { activeWaypointIndex: nextIndex };
    }),
});
