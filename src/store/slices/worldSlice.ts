import { StateCreator } from "zustand";
import {
  GameClockState,
  MarineWeatherCell,
  AISVesselTarget,
  makeLat,
  makeLon,
} from "../../types";
import { generateSyntheticWeather } from "../../services/weather/weatherService";

export type SupportedLanguage = "zh" | "en";

export interface WorldSlice {
  gameClock: GameClockState;
  currentWeather: MarineWeatherCell;
  currentDepthM: number;
  aisTargets: AISVesselTarget[];
  discoveredPortIds: string[];
  collectedAISIds: string[];
  activeContractIds: string[];
  completedContractIds: string[];
  systemLogs: {
    id: string;
    timestamp: number;
    text: string;
    type: "INFO" | "WARN" | "ALERT";
  }[];
  language: SupportedLanguage;

  setTimeScale: (scale: GameClockState["timeScale"]) => void;
  togglePause: () => void;
  updateWeather: (cell: MarineWeatherCell) => void;
  updateDepth: (depthM: number) => void;
  updateAISTargets: (targets: AISVesselTarget[]) => void;
  discoverPort: (portId: string) => void;
  collectAISTarget: (targetId: string) => boolean;
  acceptContract: (contractId: string) => void;
  completeContract: (contractId: string) => boolean;
  addLog: (text: string, type?: "INFO" | "WARN" | "ALERT") => void;
  setLanguage: (lang: SupportedLanguage) => void;
}

const initialWeather = generateSyntheticWeather({
  latitude: makeLat(30.6),
  longitude: makeLon(122.1),
});

// 获取初始语言 (优先本地缓存，其次浏览器语言，默认 zh)
const getInitialLanguage = (): SupportedLanguage => {
  try {
    const saved = localStorage.getItem("seafaring_lang");
    if (saved === "zh" || saved === "en") return saved;
    if (
      typeof navigator !== "undefined" &&
      navigator.language?.toLowerCase().startsWith("en")
    ) {
      return "en";
    }
  } catch (e) {
    // 忽略异常
  }
  return "zh";
};

export const createWorldSlice: StateCreator<WorldSlice> = (set, get) => ({
  gameClock: {
    gameTimeMs: Date.now(),
    realTimeMs: Date.now(),
    timeScale: 1,
    paused: false,
  },
  currentWeather: initialWeather,
  currentDepthM: 25.0,
  aisTargets: [],
  discoveredPortIds: ["CNSHA"],
  collectedAISIds: [],
  activeContractIds: ["CNT_001"],
  completedContractIds: [],
  systemLogs: [
    {
      id: "log_0",
      timestamp: Date.now(),
      text: "ECDIS 舰桥电子海图系统初始化就绪。锚泊于舟山群岛锚地。",
      type: "INFO",
    },
  ],
  language: getInitialLanguage(),

  setTimeScale: (scale) =>
    set((state) => ({
      gameClock: { ...state.gameClock, timeScale: scale },
    })),

  togglePause: () =>
    set((state) => ({
      gameClock: { ...state.gameClock, paused: !state.gameClock.paused },
    })),

  updateWeather: (cell) => set({ currentWeather: cell }),
  updateDepth: (depthM) => set({ currentDepthM: depthM }),
  updateAISTargets: (targets) =>
    set((state) => ({
      aisTargets: targets.map((t) => ({
        ...t,
        isCollectedInShipBook: state.collectedAISIds.includes(t.targetId),
      })),
    })),

  discoverPort: (portId) =>
    set((state) => {
      if (state.discoveredPortIds.includes(portId)) return state;
      return { discoveredPortIds: [...state.discoveredPortIds, portId] };
    }),

  collectAISTarget: (targetId) => {
    const { collectedAISIds, aisTargets } = get();
    if (collectedAISIds.includes(targetId)) return false;
    set({
      collectedAISIds: [...collectedAISIds, targetId],
      aisTargets: aisTargets.map((t) =>
        t.targetId === targetId ? { ...t, isCollectedInShipBook: true } : t
      ),
    });
    return true;
  },

  acceptContract: (contractId) =>
    set((state) => {
      if (
        state.activeContractIds.includes(contractId) ||
        state.completedContractIds.includes(contractId)
      ) {
        return state;
      }
      return {
        activeContractIds: [...state.activeContractIds, contractId],
      };
    }),

  completeContract: (contractId) => {
    const { activeContractIds, completedContractIds } = get();
    if (!activeContractIds.includes(contractId)) return false;
    set({
      activeContractIds: activeContractIds.filter((id) => id !== contractId),
      completedContractIds: [...completedContractIds, contractId],
    });
    return true;
  },

  addLog: (text, type = "INFO") =>
    set((state) => ({
      systemLogs: [
        {
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: Date.now(),
          text,
          type,
        },
        ...state.systemLogs.slice(0, 49),
      ],
    })),

  setLanguage: (lang) => {
    try {
      localStorage.setItem("seafaring_lang", lang);
    } catch (e) {}
    set({ language: lang });
  },
});
