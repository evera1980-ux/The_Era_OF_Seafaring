import React, { useState, useEffect } from "react";
import { useGameStore } from "../../store";
import {
  X,
  Check,
  Lock,
  Sparkles,
  Satellite,
  Award,
  TrendingUp,
  Copy,
  Download,
  Upload,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Search,
} from "lucide-react";
import { useTranslation } from "../../i18n";
import { CHARTER_CONTRACT_LIST, CHARTER_CONTRACTS } from "../../config/contracts";
import { PORTS } from "../../config/ports";
import { VESSELS } from "../../config/vessels";
import {
  MARITIME_LICENSE_LIST,
  MARITIME_LICENSES,
  HIREABLE_CAPTAINS,
} from "../../store/slices/worldSlice";
import { MaritimeLicenseId } from "../../types";
import {
  GLOBAL_ICON_STYLE,
  IconCategory,
  RawIconEntry,
} from "../../config/iconManifest";
import { GameAsset } from "../common/GameAsset";
import { assetRegistry } from "../../assets/AssetRegistry";

const LINER_ROUTES = [
  {
    id: "R_SHA_YOK",
    originPortId: "CNSHA",
    destinationPortId: "JPYOK",
    commodityId: "C008",
    labelZh: "上海 ⇄ 横滨 (精密电子快线)",
    labelEn: "Shanghai ⇄ Yokohama (Electronics Express)",
    baseProfitCr: 18500,
  },
  {
    id: "R_KHH_SIN",
    originPortId: "TWKHH",
    destinationPortId: "SGSIN",
    commodityId: "C009",
    labelZh: "高雄 ⇄ 新加坡 (南海半导体干线)",
    labelEn: "Kaohsiung ⇄ Singapore (Semiconductor Line)",
    baseProfitCr: 32000,
  },
  {
    id: "R_SIN_RTM",
    originPortId: "SGSIN",
    destinationPortId: "NLRTM",
    commodityId: "C003",
    labelZh: "新加坡 ⇄ 鹿特丹 (亚欧苏伊士主干线)",
    labelEn: "Singapore ⇄ Rotterdam (Eurasia Suez Trunk)",
    baseProfitCr: 96000,
  },
  {
    id: "R_SHA_LAX",
    originPortId: "CNSHA",
    destinationPortId: "USLAX",
    commodityId: "C010",
    labelZh: "上海 ⇄ 洛杉矶 (跨太平洋集装箱干线)",
    labelEn: "Shanghai ⇄ Los Angeles (Trans-Pacific Trunk)",
    baseProfitCr: 128000,
  },
];

export const JournalModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const journalTab = useGameStore((state) => state.journalTab);
  const openModal = useGameStore((state) => state.openModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const systemLogs = useGameStore((state) => state.systemLogs);
  const activeVessel = useGameStore((state) => state.activeVessel);
  const playerCredits = useGameStore((state) => state.playerCredits);
  const playerLevel = useGameStore((state) => state.playerLevel);
  const ownedVesselIds = useGameStore((state) => state.ownedVesselIds);
  const licenseId = useGameStore((state) => state.licenseId);
  const canalVipOwned = useGameStore((state) => state.canalVipOwned);
  const commandCenterBuilt = useGameStore((state) => state.commandCenterBuilt);
  const fleetDispatches = useGameStore((state) => state.fleetDispatches);
  const fleetLedgerLogs = useGameStore((state) => state.fleetLedgerLogs);
  const unlockLicense = useGameStore((state) => state.unlockLicense);
  const purchaseCanalVipShare = useGameStore((state) => state.purchaseCanalVipShare);
  const buildCommandCenter = useGameStore((state) => state.buildCommandCenter);
  const assignFleetDispatch = useGameStore((state) => state.assignFleetDispatch);
  const removeFleetDispatch = useGameStore((state) => state.removeFleetDispatch);
  const activeContractIds = useGameStore((state) => state.activeContractIds);
  const completedContractIds = useGameStore((state) => state.completedContractIds);
  const discoveredPortIds = useGameStore((state) => state.discoveredPortIds);
  const collectedAISIds = useGameStore((state) => state.collectedAISIds);
  const acceptContract = useGameStore((state) => state.acceptContract);
  const completeContract = useGameStore((state) => state.completeContract);
  const removeCargoItem = useGameStore((state) => state.removeCargoItem);
  const addCredits = useGameStore((state) => state.addCredits);
  const addXP = useGameStore((state) => state.addXP);
  const addLog = useGameStore((state) => state.addLog);
  const { t, language } = useTranslation();

  const [activeTab, setActiveTab] = useState<
    "LICENSES" | "FLEET" | "CONTRACTS" | "LOGS" | "ATLAS" | "ICONS"
  >(journalTab || "LICENSES");
  const [iconCategoryFilter, setIconCategoryFilter] = useState<IconCategory | "ALL">(
    "ALL"
  );
  const [iconSearchQuery, setIconSearchQuery] = useState<string>("");
  const [iconPreviewTier, setIconPreviewTier] = useState<
    "Master" | "@3x" | "@2x" | "@1x"
  >("@2x");
  const [, setHotSwapVersion] = useState(0);
  const [editingIcon, setEditingIcon] = useState<RawIconEntry | null>(null);
  const [isCreatingNewIcon, setIsCreatingNewIcon] = useState(false);
  const [banner, setBanner] = useState<{
    text: string;
    type: "SUCCESS" | "WARN";
  } | null>(null);
  const [selectedCaptainByVessel, setSelectedCaptainByVessel] = useState<
    Record<string, string>
  >({});
  const [selectedRouteByVessel, setSelectedRouteByVessel] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (activeModal === "JOURNAL" && journalTab) {
      setActiveTab(journalTab);
    }
  }, [activeModal, journalTab]);

  if (activeModal !== "JOURNAL") return null;

  const currentLicense = MARITIME_LICENSES[licenseId] ?? MARITIME_LICENSES.CLASS_4;
  const isZh = language === "zh";

  // 计算玩家当前处于四大演进阶段的哪一阶段
  const currentStage =
    playerCredits >= 5000000 || commandCenterBuilt
      ? 4
      : playerCredits >= 500000 || currentLicense.order >= 3
      ? 3
      : playerCredits >= 50000 || currentLicense.order >= 1
      ? 2
      : 1;

  const handleExamLicense = (targetId: MaritimeLicenseId) => {
    const spec = MARITIME_LICENSES[targetId];
    if (!spec) return;
    const res = unlockLicense(targetId);
    if (res.ok) {
      const msg = isZh
        ? `🎖️ 恭喜通过海事资质认证！已晋升为【${spec.titleZh}】，永久解锁 ${spec.maxTimeScale}× 航行倍速与专属特权！`
        : `🎖️ Certified as [${spec.titleEn}]! Permanently unlocked ${spec.maxTimeScale}x Time Scale!`;
      addLog(msg, "INFO");
      setBanner({ text: msg, type: "SUCCESS" });
    } else {
      const warn = isZh
        ? `⚠️ 无法考取【${spec.titleZh}】：需准备 ${spec.priceCr.toLocaleString()} CR 认证费！`
        : `⚠️ Insufficient credits (${spec.priceCr.toLocaleString()} CR required) for [${spec.titleEn}]!`;
      setBanner({ text: warn, type: "WARN" });
    }
  };

  const handleBuyCanalShare = () => {
    if (purchaseCanalVipShare()) {
      const msg = isZh
        ? "🏛️ 成功认购【全球运河 VIP 永久股东席位】（-500,000 CR）！全船队永久免排队过闸，通航效率 +20%！"
        : "🏛️ Acquired Permanent Canal VIP Equity (-500,000 CR)! +20% transit efficiency unlocked!";
      addLog(msg, "INFO");
      setBanner({ text: msg, type: "SUCCESS" });
    } else {
      setBanner({
        text: isZh
          ? "⚠️ 认购运河永久股份需 500,000 CR！"
          : "⚠️ 500,000 CR required for Permanent Canal Equity!",
        type: "WARN",
      });
    }
  };

  const handleBuildCommandCenter = () => {
    if (buildCommandCenter()) {
      const msg = isZh
        ? "🛰️ 【全球卫星指挥中心】竣工投产（-3,000,000 CR）！已解锁 600× 极限推演倍速与 100% 满额船队收益！"
        : "🛰️ Global Satellite Operations Command Center commissioned (-3,000,000 CR)! 600x Time Warp & 100% Fleet Efficiency unlocked!";
      addLog(msg, "INFO");
      setBanner({ text: msg, type: "SUCCESS" });
    } else {
      setBanner({
        text: isZh
          ? "⚠️ 建设全球卫星指挥中心需 3,000,000 CR！"
          : "⚠️ 3,000,000 CR required to build Command Center!",
        type: "WARN",
      });
    }
  };

  const handleDispatchVessel = (vesselId: string) => {
    const vesselSpec = VESSELS[vesselId] ?? VESSELS.V001;
    const capId = selectedCaptainByVessel[vesselId] || HIREABLE_CAPTAINS[0].captainId;
    const routeId = selectedRouteByVessel[vesselId] || LINER_ROUTES[0].id;
    const cap =
      HIREABLE_CAPTAINS.find((c) => c.captainId === capId) || HIREABLE_CAPTAINS[0];
    const route = LINER_ROUTES.find((r) => r.id === routeId) || LINER_ROUTES[0];

    const tierMultiplier = Math.max(1, vesselSpec.tier * 0.85);
    const estProfit = Math.round(route.baseProfitCr * tierMultiplier * cap.profitBonus);

    assignFleetDispatch({
      vesselId,
      captainId: cap.captainId,
      captainName: isZh ? cap.nameZh : cap.nameEn,
      captainTrait: isZh ? cap.traitZh : cap.traitEn,
      originPortId: route.originPortId,
      destinationPortId: route.destinationPortId,
      commodityId: route.commodityId,
      estimatedProfitPerTrip: estProfit,
    });

    const msg = isZh
      ? `🚢 已派遣【${vesselSpec.name}】由 ${cap.nameZh} 执掌，投入定期班轮航线：${route.labelZh}（预计每航次净利 +${estProfit.toLocaleString()} CR）！`
      : `🚢 Dispatched [${vesselSpec.name}] under ${cap.nameEn} on ${route.labelEn} (+${estProfit.toLocaleString()} CR/trip)!`;
    addLog(msg, "INFO");
    setBanner({ text: msg, type: "SUCCESS" });
  };

  const handleCompleteContract = (contractId: string) => {
    const spec = CHARTER_CONTRACTS[contractId];
    if (!spec) return;

    const matchingCargo = activeVessel.cargoItems.find(
      (c) => c.commodityId === spec.commodityId && c.quantityT >= spec.requiredTons
    );

    if (completeContract(contractId)) {
      if (matchingCargo) {
        removeCargoItem(matchingCargo.cargoId);
      }
      addCredits(spec.rewardCredits);
      addXP(spec.rewardXP);
      const title = isZh ? spec.title : spec.titleEn;
      const msg = isZh
        ? `🏆 特许航运合约完美履约：【${title}】！获得合约奖金 +${spec.rewardCredits.toLocaleString()} CR，航海声望 +${spec.rewardXP} SXP！`
        : `🏆 Charter Contract Fulfilled: [${title}]! Awarded +${spec.rewardCredits.toLocaleString()} CR & +${spec.rewardXP} SXP!`;
      addLog(msg);
      setBanner({ text: msg, type: "SUCCESS" });
    }
  };

  const allPorts = Object.values(PORTS);
  // 闲置可派遣船只列表：玩家已购买的所有非当前旗舰船只（若只有1艘船，也展示公司租赁支线示范船位方便体验）
  const idleOwnedVessels = ownedVesselIds.filter((id) => id !== activeVessel.vesselId);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end md:items-center justify-center font-mono">
      <div className="bg-bridge-panel border-t md:border border-bridge-border rounded-t-2xl md:rounded-2xl w-full max-w-4xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden pb-safe animate-in slide-in-from-bottom duration-200">
        <div className="px-4 py-3 md:px-6 md:py-4 bg-bridge-panelLight/60 border-b border-bridge-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 text-bridge-highlight">
            <GameAsset
              assetKey="hud_journal"
              width={26}
              height={26}
              className="w-6 h-6 rounded-md object-contain"
            />
            <div>
              <div className="text-sm md:text-base font-bold text-white">
                {isZh
                  ? "航运公司总览 · 特许资质与班轮调度中心"
                  : "Maritime Career, Licenses & Fleet Command"}
              </div>
              <div className="text-[10px] text-bridge-textMuted">
                {isZh
                  ? `当前头衔：${currentLicense.titleZh} · 最高解锁倍速：${
                      commandCenterBuilt ? 600 : currentLicense.maxTimeScale
                    }×`
                  : `Rank: ${currentLicense.titleEn} · Max Speed: ${
                      commandCenterBuilt ? 600 : currentLicense.maxTimeScale
                    }x`}
              </div>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-bridge-textMuted hover:text-white bg-bridge-panel border border-bridge-border"
          >
            <X size={16} />
          </button>
        </div>

        {/* 标签栏 */}
        <div className="flex border-b border-bridge-border px-4 md:px-6 pt-2 space-x-3 overflow-x-auto bg-bridge-panel shrink-0">
          <button
            onClick={() => setActiveTab("LICENSES")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "LICENSES"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <GameAsset
              assetKey="hud_license"
              width={15}
              height={15}
              className="w-3.5 h-3.5 rounded-sm object-contain"
            />
            <span>{isZh ? "资质与特许证书" : "Licenses & Perks"}</span>
          </button>

          <button
            onClick={() => setActiveTab("FLEET")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "FLEET"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <GameAsset
              assetKey="V007"
              width={15}
              height={15}
              className="w-3.5 h-3.5 rounded-sm object-contain"
            />
            <span>
              {isZh ? "自动化船队班轮" : "Fleet Dispatch"} ({fleetDispatches.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab("CONTRACTS")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "CONTRACTS"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <GameAsset
              assetKey="PERK_TRADE_NEGOTIATOR"
              width={15}
              height={15}
              className="w-3.5 h-3.5 rounded-sm object-contain"
            />
            <span>
              {t.journal.tabContracts} ({activeContractIds.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab("LOGS")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "LOGS"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <GameAsset
              assetKey="hud_journal"
              width={15}
              height={15}
              className="w-3.5 h-3.5 rounded-sm object-contain"
            />
            <span>{t.journal.tabLogs}</span>
          </button>

          <button
            onClick={() => setActiveTab("ATLAS")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "ATLAS"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <GameAsset
              assetKey="hud_map_globe"
              width={15}
              height={15}
              className="w-3.5 h-3.5 rounded-sm object-contain"
            />
            <span>
              {t.journal.tabAtlas} ({discoveredPortIds.length}/{allPorts.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ICONS")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "ICONS"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <GameAsset
              assetKey="hud_compass"
              width={15}
              height={15}
              className="w-3.5 h-3.5 rounded-sm object-contain"
            />
            <span>
              {isZh
                ? `ICON 资产工坊 (${assetRegistry.getAllIcons().length})`
                : `Icon Studio (${assetRegistry.getAllIcons().length})`}
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {banner && (
            <div
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                banner.type === "SUCCESS"
                  ? "bg-emerald-950/80 border-bridge-safe text-bridge-safe"
                  : "bg-red-950/80 border-bridge-danger text-bridge-danger"
              }`}
            >
              <span>{banner.text}</span>
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="ml-3 text-[10px] opacity-75 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* 1. 航运特许资质与四大演进阶段 */}
          {activeTab === "LICENSES" && (
            <div className="space-y-4">
              {/* 四大演进阶段路线图 */}
              <div className="bg-bridge-panelLight/30 p-3.5 rounded-xl border border-bridge-border space-y-2">
                <div className="text-xs font-bold text-bridge-highlight flex items-center space-x-1.5">
                  <Sparkles size={14} />
                  <span>
                    {isZh
                      ? "航海升阶四大演进阶段 (The 4-Stage Odyssey)"
                      : "The 4-Stage Maritime Odyssey"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[10px]">
                  {[
                    {
                      stage: 1,
                      title: isZh ? "阶段一：近岸探索" : "Stage 1: Coastal",
                      range: "5K ~ 50K CR",
                      desc: isZh ? "亲力亲为 · 太阳能冷凝板与首艘机动货船" : "Coastal trade & first diesel feeder",
                    },
                    {
                      stage: 2,
                      title: isZh ? "阶段二：远洋跨洋" : "Stage 2: Ocean",
                      range: "50K ~ 500K CR",
                      desc: isZh ? "考取二副/大副 · 120x~180x 与气象导航路由" : "120x-180x Warp & Weather Routing",
                    },
                    {
                      stage: 3,
                      title: isZh ? "阶段三：航运大亨" : "Stage 3: Tycoon",
                      range: "500K ~ 5M CR",
                      desc: isZh ? "远洋船长 300x · 运河 VIP 绿色免检特快" : "Master Mariner 300x & Canal VIP",
                    },
                    {
                      stage: 4,
                      title: isZh ? "阶段四：航运帝国" : "Stage 4: Empire",
                      range: "5M+ CR",
                      desc: isZh ? "600x 卫星指挥中心 · 船长派遣离线躺赚" : "600x Command Center & Auto Liner Fleet",
                    },
                  ].map((s) => {
                    const isCurrent = currentStage === s.stage;
                    const isPassed = currentStage > s.stage;
                    return (
                      <div
                        key={s.stage}
                        className={`p-2.5 rounded-lg border ${
                          isCurrent
                            ? "bg-bridge-accent/20 border-bridge-highlight text-white shadow-sm"
                            : isPassed
                            ? "bg-emerald-950/30 border-bridge-safe/50 text-bridge-safe"
                            : "bg-bridge-panel/50 border-bridge-border text-bridge-textMuted"
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>{s.title}</span>
                          <span className="text-[9px] text-amber-400">{s.range}</span>
                        </div>
                        <div className="mt-1 text-[9px] opacity-85 leading-snug">
                          {s.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 五阶特许资质认证列表 */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>
                    {isZh
                      ? "🎖️ 航运特许资质与倍速解锁阶梯表"
                      : "🎖️ Maritime License & Time Warp Certification Ladder"}
                  </span>
                  <span className="text-[10px] text-bridge-safe">
                    {isZh
                      ? "🛡️ 高倍速安全气囊已激活：浅水/低油/9级风暴自动切回 1×"
                      : "🛡️ Safety Airbag Active: Auto-drops to 1x on hazard"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {MARITIME_LICENSE_LIST.map((lic) => {
                    const isUnlocked = currentLicense.order >= lic.order;
                    const isNext = lic.order === currentLicense.order + 1;
                    const canAfford = playerCredits >= lic.priceCr;

                    return (
                      <div
                        key={lic.id}
                        className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          isUnlocked
                            ? "bg-emerald-950/25 border-bridge-safe/60"
                            : isNext
                            ? "bg-bridge-panelLight/70 border-bridge-highlight shadow-md"
                            : "bg-bridge-panelLight/30 border-bridge-border"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-bridge-bg border border-bridge-border text-[10px] font-bold text-bridge-highlight">
                              {lic.rankCode}
                            </span>
                            <span className="text-xs md:text-sm font-bold text-white">
                              {isZh ? lic.titleZh : lic.titleEn}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold">
                              MAX {lic.maxTimeScale}×
                            </span>
                          </div>
                          <div className="text-[11px] text-bridge-textMuted">
                            {isZh ? lic.privilegeZh : lic.privilegeEn}
                          </div>
                          <div className="text-[10px] text-sky-300">
                            {isZh
                              ? `离线航行效率：${lic.offlineEfficiencyPct}% (上限 ${lic.maxOfflineHours} 小时) · 推荐声望等级：L${lic.requiredLevel}`
                              : `Offline Efficiency: ${lic.offlineEfficiencyPct}% (Max ${lic.maxOfflineHours}h) · Rec. Level: L${lic.requiredLevel}`}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center space-x-2">
                          {isUnlocked ? (
                            <span className="px-3 py-1.5 rounded-lg bg-bridge-safe/20 border border-bridge-safe/50 text-bridge-safe text-xs font-bold flex items-center space-x-1">
                              <Check size={13} />
                              <span>{isZh ? "已持证生效" : "Certified"}</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={!canAfford}
                              onClick={() => handleExamLicense(lic.id)}
                              className="px-4 py-2 rounded-xl bg-bridge-accent text-bridge-bg hover:bg-bridge-highlight font-bold text-xs disabled:opacity-40 transition-all cursor-pointer"
                            >
                              {isZh
                                ? `考取证书 (${lic.priceCr.toLocaleString()} CR)`
                                : `Certify (${lic.priceCr.toLocaleString()} CR)`}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 战略级公司基建：永久运河 VIP 股份 & 全球卫星指挥中心 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl border border-amber-400/40 bg-amber-950/20 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                      <Award size={15} />
                      <span>
                        {isZh
                          ? "永久港口与运河 VIP 股东席位"
                          : "Permanent Canal VIP Shareholder"}
                      </span>
                    </div>
                    <div className="text-[11px] text-bridge-textMuted mt-1">
                      {isZh
                        ? "免除每次 15,000 CR 预约费，全船队永久免排队直通苏伊士/巴拿马/马六甲航道，全航线速度 +20%。"
                        : "Waives 15,000 CR per-trip pass. Permanent priority transit & +20% route speed."}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={canalVipOwned || playerCredits < 500000}
                    onClick={handleBuyCanalShare}
                    className="py-2 px-3 rounded-lg bg-amber-400 text-bridge-bg font-bold text-xs disabled:opacity-40 cursor-pointer"
                  >
                    {canalVipOwned
                      ? isZh
                        ? "✅ 已持有永久运河股份"
                        : "✅ Permanent Share Owned"
                      : isZh
                      ? "认购永久股份 (500,000 CR)"
                      : "Acquire Equity (500,000 CR)"}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl border border-sky-400/40 bg-sky-950/20 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-xs font-bold text-sky-300 flex items-center space-x-1.5">
                      <Satellite size={15} />
                      <span>
                        {isZh
                          ? "全球卫星指挥中心 (Operations Command)"
                          : "Global Satellite Command Center"}
                      </span>
                    </div>
                    <div className="text-[11px] text-bridge-textMuted mt-1">
                      {isZh
                        ? "终局基建：直接解锁 600× 极限推演倍速、离线推进效率提升至 100%，船队班轮收益额外 +20%。"
                        : "Endgame HQ: Unlocks 600x Time Warp, 100% offline efficiency & +20% Fleet Liner profit."}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={commandCenterBuilt || playerCredits < 3000000}
                    onClick={handleBuildCommandCenter}
                    className="py-2 px-3 rounded-lg bg-sky-400 text-bridge-bg font-bold text-xs disabled:opacity-40 cursor-pointer"
                  >
                    {commandCenterBuilt
                      ? isZh
                        ? "✅ 全球卫星指挥中心运行中"
                        : "✅ Command Center Online"
                      : isZh
                      ? "投资建设 (3,000,000 CR)"
                      : "Commission HQ (3,000,000 CR)"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. 自动化船队与定期班轮调度 (Stage 4 Fleet Dispatch & Daily Ledger) */}
          {activeTab === "FLEET" && (
            <div className="space-y-4">
              <div className="bg-bridge-panelLight/40 p-3.5 rounded-xl border border-bridge-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <GameAsset
                      assetKey="V007"
                      width={18}
                      height={18}
                      className="w-4 h-4 rounded-sm object-contain"
                    />
                    <span>
                      {isZh
                        ? "公司机队库与定期班轮自动调度 (Automated Liner Dispatch)"
                        : "Company Fleet & Automated Liner Dispatch"}
                    </span>
                  </div>
                  <div className="text-[10px] text-bridge-textMuted mt-0.5">
                    {isZh
                      ? "换新船后退役的旧船自动存入公司机队库。雇佣专业船长设定定期班轮航线，即可全自动循环跑单创收！"
                      : "Assign retired/idle vessels in your fleet to AI Captains on recurring liner trade routes."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openModal("SHIPYARD")}
                  className="px-3 py-1.5 rounded-lg bg-bridge-accent/20 border border-bridge-accent/40 text-bridge-highlight text-xs font-bold shrink-0 hover:bg-bridge-accent hover:text-bridge-bg transition-all cursor-pointer"
                >
                  {isZh ? "+ 前往船厂扩充船队" : "+ Expand Fleet in Shipyard"}
                </button>
              </div>

              {/* 可调度船只列表 */}
              {idleOwnedVessels.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-bridge-border bg-bridge-panelLight/20 text-center space-y-2">
                  <div className="text-xs font-bold text-white">
                    {isZh
                      ? "当前机队库暂无闲置船只（你目前仅拥有当前亲自驾驶的旗舰）"
                      : "No idle vessels in Company Fleet (You currently only own your active flagship)"}
                  </div>
                  <div className="text-[11px] text-bridge-textMuted">
                    {isZh
                      ? "提示：在【船厂】购入第二艘船（如 T1 港口轻型货船 18,000 CR 或 T2 支线船）后，退役的旧船会自动进入此处供你派遣船长跑班轮！"
                      : "Tip: Purchase a second vessel in the Shipyard; your previous ship will enter this fleet pool for automated liner dispatch!"}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {idleOwnedVessels.map((vId) => {
                    const spec = VESSELS[vId] ?? VESSELS.V001;
                    const activeOrder = fleetDispatches.find((d) => d.vesselId === vId);
                    const selectedCapId =
                      selectedCaptainByVessel[vId] || HIREABLE_CAPTAINS[0].captainId;
                    const selectedRouteId =
                      selectedRouteByVessel[vId] || LINER_ROUTES[0].id;

                    return (
                      <div
                        key={vId}
                        className="p-3.5 rounded-xl border border-bridge-border bg-bridge-panelLight/40 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-white flex items-center space-x-2">
                              <span>
                                {spec.name} (T{spec.tier})
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-bridge-bg border border-bridge-border text-bridge-highlight">
                                {spec.dwtT}t DWT · {spec.ecoSpeedKn} kn
                              </span>
                            </div>
                            {activeOrder && (
                              <div className="text-[10px] text-bridge-safe font-bold mt-1">
                                🚢 {activeOrder.captainName} · {activeOrder.originPortId} ⇄{" "}
                                {activeOrder.destinationPortId} · 已完成{" "}
                                {activeOrder.tripsCompleted} 航次 (累计净赚 +
                                {activeOrder.totalEarnedCr.toLocaleString()} CR)
                              </div>
                            )}
                          </div>

                          {activeOrder ? (
                            <button
                              type="button"
                              onClick={() => removeFleetDispatch(vId)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-bold cursor-pointer"
                            >
                              {isZh ? "召回停航" : "Recall"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDispatchVessel(vId)}
                              className="px-4 py-1.5 rounded-lg bg-bridge-safe text-bridge-bg font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                            >
                              {isZh ? "🚀 派遣定期班轮" : "🚀 Dispatch Liner"}
                            </button>
                          )}
                        </div>

                        {activeOrder ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-bridge-textMuted">
                              <span>
                                {isZh ? "当前航次进度" : "Voyage Progress"} (
                                {activeOrder.progressPct.toFixed(0)}%)
                              </span>
                              <span className="text-amber-400 font-bold">
                                +{activeOrder.estimatedProfitPerTrip.toLocaleString()} CR /{" "}
                                {isZh ? "航次" : "trip"}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-bridge-bg rounded-full overflow-hidden">
                              <div
                                className="h-full bg-bridge-safe transition-all duration-300"
                                style={{ width: `${activeOrder.progressPct}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <select
                              value={selectedCapId}
                              onChange={(e) =>
                                setSelectedCaptainByVessel({
                                  ...selectedCaptainByVessel,
                                  [vId]: e.target.value,
                                })
                              }
                              className="bg-bridge-bg border border-bridge-border rounded-lg px-2.5 py-1.5 text-[11px] text-white"
                            >
                              {HIREABLE_CAPTAINS.map((c) => (
                                <option key={c.captainId} value={c.captainId}>
                                  {isZh
                                    ? `${c.nameZh} — ${c.traitZh}`
                                    : `${c.nameEn} — ${c.traitEn}`}
                                </option>
                              ))}
                            </select>

                            <select
                              value={selectedRouteId}
                              onChange={(e) =>
                                setSelectedRouteByVessel({
                                  ...selectedRouteByVessel,
                                  [vId]: e.target.value,
                                })
                              }
                              className="bg-bridge-bg border border-bridge-border rounded-lg px-2.5 py-1.5 text-[11px] text-bridge-highlight"
                            >
                              {LINER_ROUTES.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {isZh ? r.labelZh : r.labelEn} (+
                                  {r.baseProfitCr.toLocaleString()} CR)
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 航运公司每日财报 (Daily Fleet Ledger) */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                  <TrendingUp size={14} />
                  <span>
                    {isZh
                      ? "航运公司班轮财报流水 (Daily Fleet Ledger)"
                      : "Daily Fleet Revenue Ledger"}
                  </span>
                </div>
                {fleetLedgerLogs.length === 0 ? (
                  <div className="p-3 rounded-xl border border-bridge-border bg-bridge-panelLight/20 text-[11px] text-bridge-textMuted text-center">
                    {isZh
                      ? "派遣闲置船只执行定期班轮后，船长会自动完成跨洋采购与卸货，并在此实时汇总公司财报。"
                      : "Dispatch an idle vessel to start receiving automated liner revenue reports here."}
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {fleetLedgerLogs.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg border border-bridge-safe/40 bg-emerald-950/20 flex items-center justify-between text-[11px]"
                      >
                        <span className="text-bridge-text">{item.text}</span>
                        <span className="text-bridge-safe font-bold shrink-0 ml-2">
                          +{item.profitCr.toLocaleString()} CR
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "LOGS" &&
            (systemLogs.length === 0 ? (
              <div className="text-center text-xs text-bridge-textMuted py-8">
                {t.journal.empty}
              </div>
            ) : (
              systemLogs.map((log) => {
                const timeStr = new Date(log.timestamp).toLocaleTimeString();
                let badgeClass =
                  "text-bridge-highlight border-bridge-border bg-bridge-panelLight";
                if (log.type === "WARN")
                  badgeClass =
                    "text-bridge-warning border-bridge-warning/40 bg-amber-400/10";
                if (log.type === "ALERT")
                  badgeClass =
                    "text-bridge-danger border-bridge-danger/40 bg-red-400/10";

                return (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg border border-bridge-border/60 bg-bridge-panelLight/30 flex items-start space-x-2 text-[11px]"
                  >
                    <span className="text-bridge-textMuted whitespace-nowrap">
                      {timeStr}
                    </span>
                    <span
                      className={`px-1 py-0.2 rounded border text-[9px] font-bold ${badgeClass}`}
                    >
                      {log.type}
                    </span>
                    <span className="text-bridge-text flex-1 leading-snug">
                      {log.text}
                    </span>
                  </div>
                );
              })
            ))}

          {activeTab === "CONTRACTS" && (
            <div className="grid grid-cols-1 gap-3">
              {CHARTER_CONTRACT_LIST.map((cnt) => {
                const isActive = activeContractIds.includes(cnt.contractId);
                const isDone = completedContractIds.includes(cnt.contractId);
                const title = isZh ? cnt.title : cnt.titleEn;
                const desc = isZh ? cnt.description : cnt.descriptionEn;
                const hasCargo = activeVessel.cargoItems.some(
                  (c) =>
                    c.commodityId === cnt.commodityId &&
                    c.quantityT >= cnt.requiredTons
                );

                return (
                  <div
                    key={cnt.contractId}
                    className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isDone
                        ? "bg-emerald-950/20 border-bridge-safe/50 opacity-75"
                        : isActive
                        ? "bg-bridge-panelLight/60 border-bridge-highlight"
                        : "bg-bridge-panelLight/30 border-bridge-border"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white flex items-center space-x-2">
                        <span>{title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-bridge-bg border border-bridge-border text-bridge-highlight">
                          {cnt.originPortId} ➔ {cnt.destinationPortId}
                        </span>
                      </div>
                      <div className="text-[11px] text-bridge-textMuted">
                        {desc}
                      </div>
                      <div className="text-[10px] text-amber-400 font-bold">
                        {t.journal.contractReward}: +{cnt.rewardCredits.toLocaleString()}{" "}
                        CR · +{cnt.rewardXP} SXP
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center space-x-2">
                      {isDone ? (
                        <span className="px-3 py-1.5 rounded-lg bg-bridge-safe/20 text-bridge-safe text-xs font-bold flex items-center space-x-1">
                          <Check size={12} />
                          <span>{t.journal.contractDone}</span>
                        </span>
                      ) : isActive ? (
                        <button
                          disabled={!hasCargo}
                          onClick={() => handleCompleteContract(cnt.contractId)}
                          className="px-3 py-2 rounded-lg bg-bridge-safe text-bridge-bg font-bold text-xs disabled:opacity-40"
                        >
                          {hasCargo
                            ? t.journal.completeContract
                            : `${t.journal.contractActive} (${cnt.requiredTons}t)`}
                        </button>
                      ) : (
                        <button
                          onClick={() => acceptContract(cnt.contractId)}
                          className="px-3 py-2 rounded-lg bg-bridge-accent text-bridge-bg font-bold text-xs hover:bg-bridge-highlight"
                        >
                          {t.journal.acceptContract}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "ATLAS" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bridge-panelLight/40 p-3 rounded-xl border border-bridge-border">
                  <div className="text-[10px] text-bridge-textMuted">
                    {t.journal.portsDiscovered}
                  </div>
                  <div className="text-base font-bold text-bridge-safe mt-0.5">
                    {discoveredPortIds.length} / {allPorts.length}
                  </div>
                </div>
                <div className="bg-bridge-panelLight/40 p-3 rounded-xl border border-bridge-border">
                  <div className="text-[10px] text-bridge-textMuted">
                    {t.journal.shipsSpotted}
                  </div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">
                    {collectedAISIds.length} / 22
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {allPorts.map((p) => {
                  const unlocked = discoveredPortIds.includes(p.portId);
                  return (
                    <div
                      key={p.portId}
                      className={`p-2.5 rounded-lg border text-xs ${
                        unlocked
                          ? "bg-bridge-panelLight/50 border-bridge-safe/50 text-white"
                          : "bg-bridge-panelLight/20 border-bridge-border text-bridge-textMuted opacity-60"
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span className="truncate">{p.name.split(" ")[0]}</span>
                        <span className="text-[9px] text-bridge-highlight">
                          {p.unlocode}
                        </span>
                      </div>
                      <div className="text-[9px] text-bridge-textMuted mt-0.5">
                        {t.trade.maxDraft}: {p.maxAllowedDraftM}m
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "ICONS" && (
            <div className="space-y-4">
              {(() => {
                const allLiveIcons = assetRegistry.getAllIcons();
                const q = iconSearchQuery.trim().toLowerCase();
                const filteredIcons = allLiveIcons.filter((item) => {
                  const matchCat =
                    iconCategoryFilter === "ALL" ||
                    item.category === iconCategoryFilter;
                  if (!matchCat) return false;
                  if (!q) return true;
                  return (
                    item.id.toLowerCase().includes(q) ||
                    item.entityId.toLowerCase().includes(q) ||
                    item.nameZh.toLowerCase().includes(q) ||
                    item.nameEn.toLowerCase().includes(q) ||
                    item.fileName.toLowerCase().includes(q) ||
                    item.subjectPrompt.toLowerCase().includes(q)
                  );
                });

                const countByCat = (cat: IconCategory) =>
                  allLiveIcons.filter((i) => i.category === cat).length;

                return (
                  <>
                    <div className="bg-bridge-panelLight/50 p-3.5 rounded-xl border border-bridge-border space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-white">
                            {isZh
                              ? `全量海事 ICON 资产与 AI 提示词 CRUD 中心（共 ${allLiveIcons.length} 枚 · 512px Master + @3x/@2x/@1x）`
                              : `Maritime 3D Icon & AI Prompt CRUD Studio (${allLiveIcons.length} Icons · Master 512px + @3x/@2x/@1x)`}
                          </div>
                          <div className="text-[10px] text-bridge-textMuted mt-0.5">
                            {isZh
                              ? "项目中所有 SVG 图标均已替换为落盘多倍 PNG 资产，支持关键词检索（查）、新增图标（增）、编辑提示词与热替换图片（改）、删除与一键重置（删）。"
                              : "All project SVGs replaced with multi-resolution PNGs on disk. Supports full Create, Read/Search, Update Prompt/Hot-Swap, and Delete (CRUD)."}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {GLOBAL_ICON_STYLE.resolutions.map((spec) => (
                            <button
                              key={spec.tier}
                              type="button"
                              onClick={() => setIconPreviewTier(spec.tier)}
                              className={`px-2 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                                iconPreviewTier === spec.tier
                                  ? "bg-bridge-accent text-bridge-bg border-bridge-highlight"
                                  : "bg-bridge-bg text-bridge-textMuted border-bridge-border hover:text-white"
                              }`}
                            >
                              {spec.tier} ({spec.sizePx}px)
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 搜索栏 + 新增 / 导出JSON / 重置默认 操作栏 */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="relative flex-1 min-w-[200px]">
                          <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-bridge-textMuted"
                          />
                          <input
                            type="text"
                            value={iconSearchQuery}
                            onChange={(e) => setIconSearchQuery(e.target.value)}
                            placeholder={
                              isZh
                                ? "搜索图标 ID / 名称 / 文件名 / AI 提示词关键词..."
                                : "Search ID, name, fileName, or AI prompt..."
                            }
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-bridge-bg border border-bridge-border text-xs text-white focus:border-bridge-highlight focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingNewIcon(true);
                              setEditingIcon({
                                id: `hud_custom_${Date.now().toString().slice(-4)}`,
                                entityId: `CUSTOM_${Date.now().toString().slice(-4)}`,
                                category: "hud",
                                nameZh: "自定义海事图标",
                                nameEn: "Custom Maritime Icon",
                                fileName: "hud_custom_icon.png",
                                subjectPrompt:
                                  "A high-precision 3D isometric maritime instrument badge with glowing cyan telemetry rings",
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-bridge-safe text-bridge-bg font-bold text-[10px] flex items-center space-x-1 hover:bg-emerald-400 cursor-pointer"
                          >
                            <Plus size={12} />
                            <span>{isZh ? "新增图标资产" : "Add Icon"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const jsonStr = assetRegistry.exportManifestJson();
                              const blob = new Blob([jsonStr], {
                                type: "application/json",
                              });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = "iconManifest.json";
                              a.click();
                              URL.revokeObjectURL(url);
                              setBanner({
                                text: isZh
                                  ? `📦 已导出最新 iconManifest.json（共 ${allLiveIcons.length} 枚图标与提示词）！`
                                  : `📦 Exported iconManifest.json (${allLiveIcons.length} icons)!`,
                                type: "SUCCESS",
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-bridge-accent/20 text-bridge-highlight border border-bridge-accent/50 font-bold text-[10px] flex items-center space-x-1 hover:bg-bridge-accent hover:text-bridge-bg cursor-pointer"
                          >
                            <Download size={12} />
                            <span>{isZh ? "导出清单JSON" : "Export JSON"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              assetRegistry.resetDefaultManifest();
                              setEditingIcon(null);
                              setIsCreatingNewIcon(false);
                              setHotSwapVersion((v) => v + 1);
                              setBanner({
                                text: isZh
                                  ? "🔄 已恢复默认全量 80 枚海事图标与标准提示词清单！"
                                  : "🔄 Restored all 80 default maritime icons & prompts!",
                                type: "SUCCESS",
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-bridge-bg text-bridge-textMuted border border-bridge-border font-bold text-[10px] flex items-center space-x-1 hover:text-white cursor-pointer"
                          >
                            <RotateCcw size={12} />
                            <span>{isZh ? "恢复默认(80)" : "Reset Defaults"}</span>
                          </button>
                        </div>
                      </div>

                      {/* 分类筛选 */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(
                          [
                            {
                              key: "ALL",
                              label: isZh
                                ? `全部 (${allLiveIcons.length})`
                                : `All (${allLiveIcons.length})`,
                            },
                            {
                              key: "commodities",
                              label: isZh
                                ? `商品 (${countByCat("commodities")})`
                                : `Commodities (${countByCat("commodities")})`,
                            },
                            {
                              key: "vessels",
                              label: isZh
                                ? `船只 (${countByCat("vessels")})`
                                : `Vessels (${countByCat("vessels")})`,
                            },
                            {
                              key: "upgrades",
                              label: isZh
                                ? `改装 (${countByCat("upgrades")})`
                                : `Upgrades (${countByCat("upgrades")})`,
                            },
                            {
                              key: "perks",
                              label: isZh
                                ? `船长专精 (${countByCat("perks")})`
                                : `Perks (${countByCat("perks")})`,
                            },
                            {
                              key: "weather",
                              label: isZh
                                ? `气象 (${countByCat("weather")})`
                                : `Weather (${countByCat("weather")})`,
                            },
                            {
                              key: "hazards",
                              label: isZh
                                ? `险情 (${countByCat("hazards")})`
                                : `Hazards (${countByCat("hazards")})`,
                            },
                            {
                              key: "hud",
                              label: isZh
                                ? `舰桥与UI (${countByCat("hud")})`
                                : `HUD & UI (${countByCat("hud")})`,
                            },
                          ] as const
                        ).map((cat) => (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => setIconCategoryFilter(cat.key)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                              iconCategoryFilter === cat.key
                                ? "bg-bridge-highlight/20 text-bridge-highlight border-bridge-highlight"
                                : "bg-bridge-bg/60 text-bridge-textMuted border-bridge-border hover:text-white"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 新增 / 编辑图标与提示词表单面板 (Create & Update Panel) */}
                    {editingIcon && (
                      <div className="p-4 rounded-xl bg-bridge-panel border-2 border-bridge-highlight shadow-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-bridge-border pb-2">
                          <span className="text-xs font-bold text-bridge-highlight">
                            {isCreatingNewIcon
                              ? isZh
                                ? "➕ 新增海事图标资产与 AI 提示词"
                                : "➕ Create New Maritime Icon & AI Prompt"
                              : isZh
                              ? `✏️ 编辑图标资产与提示词：${editingIcon.id}`
                              : `✏️ Edit Icon & Prompt: ${editingIcon.id}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingIcon(null);
                              setIsCreatingNewIcon(false);
                            }}
                            className="text-xs text-bridge-textMuted hover:text-white"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                          <div>
                            <label className="block text-[10px] text-bridge-textMuted mb-1">
                              Icon ID
                            </label>
                            <input
                              type="text"
                              value={editingIcon.id}
                              disabled={!isCreatingNewIcon}
                              onChange={(e) =>
                                setEditingIcon({ ...editingIcon, id: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 rounded bg-bridge-bg border border-bridge-border text-white disabled:opacity-60"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-bridge-textMuted mb-1">
                              Entity ID (实体绑定键)
                            </label>
                            <input
                              type="text"
                              value={editingIcon.entityId}
                              onChange={(e) =>
                                setEditingIcon({
                                  ...editingIcon,
                                  entityId: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded bg-bridge-bg border border-bridge-border text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-bridge-textMuted mb-1">
                              Category (分类目录)
                            </label>
                            <select
                              value={editingIcon.category}
                              onChange={(e) =>
                                setEditingIcon({
                                  ...editingIcon,
                                  category: e.target.value as IconCategory,
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded bg-bridge-bg border border-bridge-border text-white"
                            >
                              <option value="commodities">commodities</option>
                              <option value="vessels">vessels</option>
                              <option value="upgrades">upgrades</option>
                              <option value="perks">perks</option>
                              <option value="weather">weather</option>
                              <option value="hazards">hazards</option>
                              <option value="hud">hud</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-bridge-textMuted mb-1">
                              中文名称 (Name ZH)
                            </label>
                            <input
                              type="text"
                              value={editingIcon.nameZh}
                              onChange={(e) =>
                                setEditingIcon({
                                  ...editingIcon,
                                  nameZh: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded bg-bridge-bg border border-bridge-border text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-bridge-textMuted mb-1">
                              英文名称 (Name EN)
                            </label>
                            <input
                              type="text"
                              value={editingIcon.nameEn}
                              onChange={(e) =>
                                setEditingIcon({
                                  ...editingIcon,
                                  nameEn: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded bg-bridge-bg border border-bridge-border text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-bridge-textMuted mb-1">
                              目标文件名 (File Name)
                            </label>
                            <input
                              type="text"
                              value={editingIcon.fileName}
                              onChange={(e) =>
                                setEditingIcon({
                                  ...editingIcon,
                                  fileName: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded bg-bridge-bg border border-bridge-border text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-bridge-textMuted mb-1">
                            Nano Banana AI 主体提示词 (Subject Prompt - 自动拼接通用海事 3D 后缀)
                          </label>
                          <textarea
                            rows={3}
                            value={editingIcon.subjectPrompt}
                            onChange={(e) =>
                              setEditingIcon({
                                ...editingIcon,
                                subjectPrompt: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded bg-bridge-bg border border-bridge-border text-xs text-white font-mono"
                          />
                        </div>

                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingIcon(null);
                              setIsCreatingNewIcon(false);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-bridge-bg border border-bridge-border text-xs text-bridge-textMuted hover:text-white cursor-pointer"
                          >
                            {isZh ? "取消" : "Cancel"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const saved = assetRegistry.upsertIconItem(editingIcon);
                              setEditingIcon(null);
                              setIsCreatingNewIcon(false);
                              setHotSwapVersion((v) => v + 1);
                              setBanner({
                                text: isZh
                                  ? `✅ 已保存【${saved.nameZh} (${saved.id})】及最新 Nano Banana 提示词！`
                                  : `✅ Saved [${saved.nameEn} (${saved.id})]!`,
                                type: "SUCCESS",
                              });
                            }}
                            className="px-4 py-1.5 rounded-lg bg-bridge-safe text-bridge-bg font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                          >
                            {isZh ? "💾 保存更改" : "💾 Save Icon & Prompt"}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredIcons.map((item) => {
                        const resolvedSrc = assetRegistry.resolveIconPath(
                          item.id,
                          iconPreviewTier
                        );
                        return (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-bridge-panelLight/40 border border-bridge-border flex items-start space-x-3"
                          >
                            <GameAsset
                              assetKey={item.id}
                              resolutionTier={iconPreviewTier}
                              alt={item.nameZh}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-xl border border-bridge-border bg-[#0A1128] shrink-0 object-contain"
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-white truncate">
                                  {item.nameZh}{" "}
                                  <span className="text-[10px] text-bridge-textMuted font-normal">
                                    ({item.nameEn})
                                  </span>
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-bridge-bg text-bridge-highlight border border-bridge-border shrink-0">
                                  {item.id}
                                </span>
                              </div>
                              <div className="text-[9px] text-amber-300/90 truncate font-mono">
                                public{item.publicPath}
                              </div>
                              <div className="text-[9px] text-bridge-textMuted line-clamp-2">
                                {item.subjectPrompt}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard?.writeText(item.fullPrompt);
                                    setBanner({
                                      text: isZh
                                        ? `📋 已复制【${item.nameZh}】完整 AI 正向 Prompt！`
                                        : `📋 Copied full AI Prompt for [${item.nameEn}]!`,
                                      type: "SUCCESS",
                                    });
                                  }}
                                  className="px-2 py-1 rounded bg-bridge-accent/15 text-bridge-highlight border border-bridge-accent/40 hover:bg-bridge-accent hover:text-bridge-bg text-[9px] font-bold flex items-center space-x-1 cursor-pointer"
                                >
                                  <Copy size={10} />
                                  <span>{isZh ? "复制Prompt" : "Prompt"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsCreatingNewIcon(false);
                                    setEditingIcon({
                                      id: item.id,
                                      entityId: item.entityId,
                                      assetKey: item.assetKey,
                                      category: item.category,
                                      nameZh: item.nameZh,
                                      nameEn: item.nameEn,
                                      fileName: item.fileName,
                                      subjectPrompt: item.subjectPrompt,
                                    });
                                  }}
                                  className="px-2 py-1 rounded bg-sky-500/15 text-sky-300 border border-sky-400/40 hover:bg-sky-400 hover:text-bridge-bg text-[9px] font-bold flex items-center space-x-1 cursor-pointer"
                                >
                                  <Pencil size={10} />
                                  <span>{isZh ? "改提示词" : "Edit"}</span>
                                </button>

                                <a
                                  href={resolvedSrc}
                                  download={
                                    iconPreviewTier === "Master"
                                      ? item.fileName
                                      : item.fileName.replace(
                                          /\.png$/,
                                          `${iconPreviewTier}.png`
                                        )
                                  }
                                  className="px-2 py-1 rounded bg-emerald-500/15 text-bridge-safe border border-bridge-safe/40 hover:bg-bridge-safe hover:text-bridge-bg text-[9px] font-bold flex items-center space-x-1"
                                >
                                  <Download size={10} />
                                  <span>{iconPreviewTier}</span>
                                </a>

                                <label className="px-2 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-400/40 hover:bg-amber-400 hover:text-bridge-bg text-[9px] font-bold flex items-center space-x-1 cursor-pointer">
                                  <Upload size={10} />
                                  <span>{isZh ? "换图" : "Swap"}</span>
                                  <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        if (typeof reader.result === "string") {
                                          assetRegistry.registerOverride(
                                            item.id,
                                            reader.result
                                          );
                                          assetRegistry.registerOverride(
                                            item.entityId,
                                            reader.result
                                          );
                                          if (item.assetKey) {
                                            assetRegistry.registerOverride(
                                              item.assetKey,
                                              reader.result
                                            );
                                          }
                                          setHotSwapVersion((v) => v + 1);
                                          setBanner({
                                            text: isZh
                                              ? `✨ 已热替换【${item.nameZh}】贴图，全局界面实时生效！`
                                              : `✨ Hot-swapped [${item.nameEn}] icon live!`,
                                            type: "SUCCESS",
                                          });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }}
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={() => {
                                    assetRegistry.deleteIconItem(item.id);
                                    setHotSwapVersion((v) => v + 1);
                                    setBanner({
                                      text: isZh
                                        ? `🗑️ 已从清单移除【${item.nameZh} (${item.id})】（可随时点击“恢复默认”还原）`
                                        : `🗑️ Deleted [${item.nameEn} (${item.id})]`,
                                      type: "WARN",
                                    });
                                  }}
                                  className="px-2 py-1 rounded bg-red-500/15 text-bridge-danger border border-bridge-danger/40 hover:bg-bridge-danger hover:text-white text-[9px] font-bold flex items-center space-x-1 cursor-pointer"
                                >
                                  <Trash2 size={10} />
                                  <span>{isZh ? "删除" : "Del"}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

