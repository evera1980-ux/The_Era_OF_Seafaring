import { StateCreator } from "zustand";
import {
  GameClockState,
  MarineWeatherCell,
  AISVesselTarget,
  PortInfo,
  makeUnixMs,
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
  systemLogs: { id: string; timestamp: number; text: string; type: "INFO" | "WARN" | "ALERT" }[];
  language: SupportedLanguage;
  
  setTimeScale: (scale: GameClockState["timeScale"]) => void;
  togglePause: () => void;
  updateWeather: (cell: MarineWeatherCell) => void;
  updateDepth: (depthM: number) => void;
  updateAISTargets: (targets: AISVesselTarget[]) => void;
  discoverPort: (portId: string) => void;
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
    if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("en")) {
      return "en";
    }
  } catch (e) {
    // 忽略异常
  }
  return "zh";
};

export const createWorldSlice: StateCreator<WorldSlice> = (set) => ({
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
  updateAISTargets: (targets) => set({ aisTargets: targets }),

  discoverPort: (portId) =>
    set((state) => {
      if (state.discoveredPortIds.includes(portId)) return state;
      return { discoveredPortIds: [...state.discoveredPortIds, portId] };
    }),

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
