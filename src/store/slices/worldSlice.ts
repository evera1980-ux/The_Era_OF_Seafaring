import { StateCreator } from "zustand";
import {
  GameClockState,
  MarineWeatherCell,
  AISVesselTarget,
  MaritimeLicenseId,
  FleetDispatchOrder,
  makeLat,
  makeLon,
  makeCredits,
} from "../../types";
import { generateSyntheticWeather } from "../../services/weather/weatherService";
import { EconomySlice } from "./economySlice";

export type SupportedLanguage = "zh" | "en";

export interface MaritimeLicenseSpec {
  id: MaritimeLicenseId;
  order: number;
  rankCode: string;
  titleZh: string;
  titleEn: string;
  priceCr: number;
  requiredLevel: number;
  maxTimeScale: GameClockState["timeScale"];
  offlineEfficiencyPct: number;
  maxOfflineHours: number;
  privilegeZh: string;
  privilegeEn: string;
}

export const MARITIME_LICENSES: Record<MaritimeLicenseId, MaritimeLicenseSpec> = {
  CLASS_4: {
    id: "CLASS_4",
    order: 0,
    rankCode: "Class 4",
    titleZh: "实习三副 (Cadet)",
    titleEn: "Cadet (Class 4)",
    priceCr: 0,
    requiredLevel: 1,
    maxTimeScale: 60,
    offlineEfficiencyPct: 50,
    maxOfflineHours: 2,
    privilegeZh: "基础航运控制 · 解锁最高 60× 巡航倍速",
    privilegeEn: "Basic Navigation Control · Up to 60x Time Scale",
  },
  CLASS_3: {
    id: "CLASS_3",
    order: 1,
    rankCode: "Class 3",
    titleZh: "沿海二副 (Mate)",
    titleEn: "Coastal Mate (Class 3)",
    priceCr: 10000,
    requiredLevel: 3,
    maxTimeScale: 120,
    offlineEfficiencyPct: 65,
    maxOfflineHours: 4,
    privilegeZh: "永久解锁 120× 航行倍速 · 接近目标港 20 海里自动减速提示",
    privilegeEn: "Unlocks 120x Speed · Auto-deceleration alert within 20 NM of port",
  },
  CLASS_2: {
    id: "CLASS_2",
    order: 2,
    rankCode: "Class 2",
    titleZh: "远洋大副 (Chief Officer)",
    titleEn: "Chief Officer (Class 2)",
    priceCr: 50000,
    requiredLevel: 6,
    maxTimeScale: 180,
    offlineEfficiencyPct: 80,
    maxOfflineHours: 8,
    privilegeZh: "永久解锁 180× 航行倍速 · 解锁【岸基气象导航路由】订购权限",
    privilegeEn: "Unlocks 180x Speed · Unlocks Shore Weather Routing subscription",
  },
  CLASS_1: {
    id: "CLASS_1",
    order: 3,
    rankCode: "Class 1",
    titleZh: "远洋船长 (Master Mariner)",
    titleEn: "Master Mariner (Class 1)",
    priceCr: 200000,
    requiredLevel: 10,
    maxTimeScale: 300,
    offlineEfficiencyPct: 90,
    maxOfflineHours: 12,
    privilegeZh: "永久解锁 300× 超高巡航倍速 · 险情/低油自动切回 1× 安全气囊",
    privilegeEn: "Unlocks 300x Speed · Safety Airbag auto-drops to 1x on hazard",
  },
  FLEET_OPS: {
    id: "FLEET_OPS",
    order: 4,
    rankCode: "Fleet Ops",
    titleZh: "航运运营总监 (Fleet Admiral)",
    titleEn: "Fleet Admiral (Fleet Ops)",
    priceCr: 1000000,
    requiredLevel: 15,
    maxTimeScale: 600,
    offlineEfficiencyPct: 100,
    maxOfflineHours: 24,
    privilegeZh: "永久解锁 600× 极限推演倍速 · 解锁【多船自动化班轮调度】系统",
    privilegeEn: "Unlocks 600x Speed · Unlocks Automated Multi-Ship Liner Dispatch",
  },
};

export const MARITIME_LICENSE_LIST: MaritimeLicenseSpec[] = [
  MARITIME_LICENSES.CLASS_4,
  MARITIME_LICENSES.CLASS_3,
  MARITIME_LICENSES.CLASS_2,
  MARITIME_LICENSES.CLASS_1,
  MARITIME_LICENSES.FLEET_OPS,
];

export const HIREABLE_CAPTAINS = [
  {
    captainId: "CAP_01",
    nameZh: "陈海生 船长",
    nameEn: "Capt. Haisheng Chen",
    traitZh: "节能专家 (省油 +15% · 稳健航行)",
    traitEn: "Eco Master (+15% Fuel Economy)",
    profitBonus: 1.15,
    speedFactor: 1.0,
  },
  {
    captainId: "CAP_02",
    nameZh: "佐藤健 船长",
    nameEn: "Capt. Ken Sato",
    traitZh: "省时快运 (班轮周转速度 +25%)",
    traitEn: "Express Liner (+25% Turnaround Speed)",
    profitBonus: 1.1,
    speedFactor: 1.25,
  },
  {
    captainId: "CAP_03",
    nameZh: "霍金斯 船长",
    nameEn: "Capt. Jack Hawkins",
    traitZh: "风浪老手 (无惧西风带风暴 · 零货损)",
    traitEn: "Storm Veteran (Zero Storm Cargo Loss)",
    profitBonus: 1.2,
    speedFactor: 1.05,
  },
  {
    captainId: "CAP_04",
    nameZh: "林岚 船长",
    nameEn: "Capt. Lan Lin",
    traitZh: "跨洋贸易官 (高价值货品溢价 +22%)",
    traitEn: "Trade Commodore (+22% High-Value Margin)",
    profitBonus: 1.22,
    speedFactor: 1.1,
  },
];

export interface WorldSlice {
  gameClock: GameClockState;
  currentWeather: MarineWeatherCell;
  currentDepthM: number;
  aisTargets: AISVesselTarget[];
  discoveredPortIds: string[];
  collectedAISIds: string[];
  activeContractIds: string[];
  completedContractIds: string[];
  licenseId: MaritimeLicenseId;
  weatherRoutingActive: boolean;
  canalVipPassActive: boolean;
  canalVipOwned: boolean;
  commandCenterBuilt: boolean;
  fleetDispatches: FleetDispatchOrder[];
  fleetLedgerLogs: {
    id: string;
    timestamp: number;
    text: string;
    profitCr: number;
  }[];
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
  unlockLicense: (targetLicenseId: MaritimeLicenseId) => {
    ok: boolean;
    reason?: string;
  };
  setWeatherRouting: (active: boolean) => void;
  setCanalVipPass: (active: boolean) => void;
  purchaseCanalVipShare: () => boolean;
  buildCommandCenter: () => boolean;
  assignFleetDispatch: (
    order: Omit<FleetDispatchOrder, "progressPct" | "tripsCompleted" | "totalEarnedCr">
  ) => void;
  removeFleetDispatch: (vesselId: string) => void;
  tickFleetDispatches: (dtRealSeconds: number) => void;
  addLog: (text: string, type?: "INFO" | "WARN" | "ALERT") => void;
  setLanguage: (lang: SupportedLanguage) => void;
}

const initialWeather = generateSyntheticWeather({
  latitude: makeLat(30.6),
  longitude: makeLon(122.1),
});

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

export const createWorldSlice: StateCreator<
  WorldSlice & EconomySlice,
  [],
  [],
  WorldSlice
> = (set, get) => ({
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
  licenseId: "CLASS_4",
  weatherRoutingActive: false,
  canalVipPassActive: false,
  canalVipOwned: false,
  commandCenterBuilt: false,
  fleetDispatches: [],
  fleetLedgerLogs: [],
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
    set((state) => {
      const lic = MARITIME_LICENSES[state.licenseId] ?? MARITIME_LICENSES.CLASS_4;
      const maxAllowed = state.commandCenterBuilt ? 600 : lic.maxTimeScale;
      const clampedScale = (scale > maxAllowed ? maxAllowed : scale) as GameClockState["timeScale"];
      return {
        gameClock: { ...state.gameClock, timeScale: clampedScale },
      };
    }),

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

  unlockLicense: (targetLicenseId) => {
    const state = get();
    const currentSpec = MARITIME_LICENSES[state.licenseId] ?? MARITIME_LICENSES.CLASS_4;
    const targetSpec = MARITIME_LICENSES[targetLicenseId];
    if (!targetSpec) return { ok: false, reason: "INVALID" };
    if (targetSpec.order <= currentSpec.order) {
      return { ok: false, reason: "ALREADY_UNLOCKED" };
    }
    if (state.playerCredits < targetSpec.priceCr) {
      return { ok: false, reason: "INSUFFICIENT_CREDITS" };
    }
    set({
      playerCredits: makeCredits(Math.round(state.playerCredits - targetSpec.priceCr)),
      licenseId: targetLicenseId,
    });
    return { ok: true };
  },

  setWeatherRouting: (active) => set({ weatherRoutingActive: active }),
  setCanalVipPass: (active) => set({ canalVipPassActive: active }),

  purchaseCanalVipShare: () => {
    const state = get();
    if (state.canalVipOwned || state.playerCredits < 500000) return false;
    set({
      playerCredits: makeCredits(Math.round(state.playerCredits - 500000)),
      canalVipOwned: true,
      canalVipPassActive: true,
    });
    return true;
  },

  buildCommandCenter: () => {
    const state = get();
    if (state.commandCenterBuilt || state.playerCredits < 3000000) return false;
    set({
      playerCredits: makeCredits(Math.round(state.playerCredits - 3000000)),
      commandCenterBuilt: true,
      licenseId: "FLEET_OPS",
    });
    return true;
  },

  assignFleetDispatch: (order) =>
    set((state) => {
      const filtered = state.fleetDispatches.filter((d) => d.vesselId !== order.vesselId);
      return {
        fleetDispatches: [
          ...filtered,
          {
            ...order,
            progressPct: 0,
            tripsCompleted: 0,
            totalEarnedCr: 0,
          },
        ],
      };
    }),

  removeFleetDispatch: (vesselId) =>
    set((state) => ({
      fleetDispatches: state.fleetDispatches.filter((d) => d.vesselId !== vesselId),
    })),

  tickFleetDispatches: (dtRealSeconds) => {
    const state = get();
    if (state.fleetDispatches.length === 0) return;

    let totalProfitEarned = 0;
    const newLedgerEntries: WorldSlice["fleetLedgerLogs"] = [];
    const newSystemLogs: WorldSlice["systemLogs"] = [];

    const nextDispatches = state.fleetDispatches.map((d) => {
      const cap = HIREABLE_CAPTAINS.find((c) => c.captainId === d.captainId);
      const speedMult = (cap?.speedFactor ?? 1.0) * (state.commandCenterBuilt ? 1.35 : 1.0);
      // 每约 25 秒完成一趟班轮航次结算，提供持续多巴胺财报正反馈
      const nextPct = d.progressPct + dtRealSeconds * 4.0 * speedMult;
      if (nextPct >= 100) {
        const profit = Math.round(
          d.estimatedProfitPerTrip * (state.commandCenterBuilt ? 1.2 : 1.0)
        );
        totalProfitEarned += profit;
        const msg =
          state.language === "zh"
            ? `📊 [船队班轮财报] ${d.captainName} 驾驶船只完成 ${d.originPortId} ⇄ ${d.destinationPortId} 定期航次，公司净入账 +${profit.toLocaleString()} CR！`
            : `📊 [Fleet Ledger] ${d.captainName} completed liner voyage ${d.originPortId} ⇄ ${d.destinationPortId}, netting +${profit.toLocaleString()} CR!`;
        newLedgerEntries.push({
          id: `ledger_${Date.now()}_${d.vesselId}`,
          timestamp: Date.now(),
          text: msg,
          profitCr: profit,
        });
        newSystemLogs.push({
          id: `log_${Date.now()}_${d.vesselId}`,
          timestamp: Date.now(),
          text: msg,
          type: "INFO",
        });
        return {
          ...d,
          progressPct: nextPct % 100,
          tripsCompleted: d.tripsCompleted + 1,
          totalEarnedCr: d.totalEarnedCr + profit,
        };
      }
      return {
        ...d,
        progressPct: Math.round(nextPct * 10) / 10,
      };
    });

    if (totalProfitEarned > 0) {
      set({
        fleetDispatches: nextDispatches,
        playerCredits: makeCredits(Math.round(state.playerCredits + totalProfitEarned)),
        fleetLedgerLogs: [...newLedgerEntries, ...state.fleetLedgerLogs].slice(0, 30),
        systemLogs: [...newSystemLogs, ...state.systemLogs].slice(0, 50),
      });
    } else {
      set({ fleetDispatches: nextDispatches });
    }
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

