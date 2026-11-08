import React from "react";
import { useGameStore } from "../../store";
import { X, AlertTriangle, LifeBuoy, Radio, Anchor } from "lucide-react";
import { PORTS } from "../../config/ports";
import { SALVAGE_TUG_PRICES } from "../../config/economy";
import { useTranslation } from "../../i18n";
import { portService } from "../../services/ports/portService";
import { calculateRefloatProbability } from "../../core/physics/grounding";
import { aggregateVesselBonuses } from "../../core/simulation/tick";
import { makeKn } from "../../types";

export const MaydayModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const activeVessel = useGameStore((state) => state.activeVessel);
  const currentDepthM = useGameStore((state) => state.currentDepthM);
  const unlockedPerkIds = useGameStore((state) => state.unlockedPerkIds);
  const updateVesselState = useGameStore((state) => state.updateVesselState);
  const attemptSelfRefloat = useGameStore((state) => state.attemptSelfRefloat);
  const refuel = useGameStore((state) => state.refuel);
  const replenishWater = useGameStore((state) => state.replenishWater);
  const replenishRations = useGameStore((state) => state.replenishRations);
  const deductCredits = useGameStore((state) => state.deductCredits);
  const addLog = useGameStore((state) => state.addLog);
  const { t, language } = useTranslation();

  if (activeModal !== "MAYDAY") return null;

  const nearestInfo = portService.findNearestPort(activeVessel.position);
  const rescuePort = nearestInfo ? nearestInfo.port : PORTS["CNSHA"];
  const bonuses = aggregateVesselBonuses(activeVessel, unlockedPerkIds);
  const refloatProbPct = Math.round(
    calculateRefloatProbability(
      currentDepthM,
      activeVessel.currentDraftM,
      0.5,
      bonuses.refloatChanceBonus
    ) * 100
  );

  // 1. 呼叫 < 20 NM 邻近 AIS 商船人道接济 (PRD 3.3.1)
  const handleRequestAISAid = () => {
    const aidCost = 600;
    deductCredits(aidCost);
    refuel(1.5);
    replenishWater(0.8);
    replenishRations(0.3);

    addLog(
      language === "zh"
        ? `📡 [VHF CH16] 邻近商船响应求援！已通过海上高架索道过驳应急燃油与淡水，支付平价成本 ${aidCost} CR。`
        : `📡 [VHF CH16] Passing merchant vessel transferred emergency fuel & water via highline (${aidCost} CR).`,
      "INFO"
    );
    closeModal();
  };

  // 2. 尝试倒车/抛货自主脱浅 (PRD 1.7.2)
  const handleSelfRefloat = () => {
    const res = attemptSelfRefloat(currentDepthM, bonuses.refloatChanceBonus);
    if (res.success) {
      addLog(
        language === "zh"
          ? `⚓ 自主脱浅成功 (概率 ${Math.round(res.prob * 100)}%)！螺旋桨倒车摆脱浅滩，恢复自由航行。`
          : `⚓ Self-refloat succeeded (${Math.round(res.prob * 100)}%)! Vessel is clear of the shoal.`,
        "INFO"
      );
      closeModal();
    } else {
      addLog(
        language === "zh"
          ? `⚠️ 自主脱浅失败，船底与礁石摩擦受损 (-3.5% HP)，建议再次尝试或呼叫远洋拖轮！`
          : `⚠️ Self-refloat failed; hull scraped against seabed (-3.5% HP).`,
        "WARN"
      );
    }
  };

  // 3. 呼叫商业远洋救助拖轮拖带回港 (PRD 3.3.2)
  const handleCallSalvage = () => {
    const cost = SALVAGE_TUG_PRICES.BASE_CALLOUT_FEE;
    deductCredits(cost);

    updateVesselState({
      position: rescuePort.position,
      headingDeg: 90,
      cogDeg: 90,
      sogKn: makeKn(0),
      engineTelegraph: "STOP",
      grounded: false,
      gameStatus: "DOCKED",
      hullHp: Math.max(2500, activeVessel.hullHp),
      crewHealth: Math.max(60, activeVessel.crewHealth),
      supplies: {
        ...activeVessel.supplies,
        fuelT: Math.max(0.8, activeVessel.supplies.fuelT),
        freshWaterT: Math.max(0.6, activeVessel.supplies.freshWaterT),
        rationT: Math.max(0.3, activeVessel.supplies.rationT),
      },
    });

    const msg =
      language === "zh"
        ? `🚨 远洋救助拖轮抵达！已成功将船舶脱浅并安全拖带至 ${rescuePort.name}，支付救助费 ${cost} CR。`
        : `🚨 Salvage tug on scene! Vessel refloated and towed to ${rescuePort.name}. Fee: ${cost} CR.`;
    addLog(msg, "ALERT");
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end md:items-center justify-center font-mono">
      <div className="bg-bridge-panel border-t md:border-2 border-bridge-danger/80 rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden pb-safe animate-in slide-in-from-bottom duration-200">
        <div className="px-4 py-3 md:px-6 md:py-4 bg-bridge-danger/20 border-b border-bridge-danger/40 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 text-bridge-danger">
            <AlertTriangle size={20} className="animate-pulse" />
            <div>
              <div className="text-sm md:text-base font-bold text-white">
                {t.mayday.title}
              </div>
              <div className="text-[10px] text-bridge-danger">
                {t.mayday.channel}
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

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
          {/* 选项 A: 自主脱浅操作 */}
          <div className="bg-bridge-panelLight/40 p-3.5 rounded-xl border border-bridge-border space-y-2">
            <div className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
              <Anchor size={14} />
              <span>
                {t.mayday.refloatTitle} ({refloatProbPct}%)
              </span>
            </div>
            <div className="text-[11px] text-bridge-textMuted">
              {t.mayday.refloatDesc}
            </div>
            <button
              onClick={handleSelfRefloat}
              className="w-full py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/50 font-bold text-xs hover:bg-amber-500/30 transition-all"
            >
              {t.mayday.refloatBtn} ({refloatProbPct}%)
            </button>
          </div>

          {/* 选项 B: 邻近商船人道接济 */}
          <div className="bg-bridge-panelLight/40 p-3.5 rounded-xl border border-bridge-border space-y-2">
            <div className="text-xs font-bold text-sky-400 flex items-center space-x-1.5">
              <Radio size={14} />
              <span>{t.mayday.aisAidTitle}</span>
            </div>
            <div className="text-[11px] text-bridge-textMuted">
              {t.mayday.aisAidDesc}
            </div>
            <button
              onClick={handleRequestAISAid}
              className="w-full py-2.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/50 font-bold text-xs hover:bg-sky-500/30 transition-all"
            >
              {t.mayday.aisAidBtn} (600 CR)
            </button>
          </div>

          {/* 选项 C: 商业远洋拖轮救援 */}
          <div className="bg-bridge-panelLight/40 p-3.5 rounded-xl border border-bridge-danger/40 space-y-2 text-xs">
            <div className="text-[11px] text-bridge-text leading-relaxed">
              {t.mayday.warningDesc}
            </div>
            <div className="flex justify-between">
              <span className="text-bridge-textMuted">{t.mayday.calloutFee}:</span>
              <span className="text-amber-400 font-bold">
                {SALVAGE_TUG_PRICES.BASE_CALLOUT_FEE} CR
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-bridge-textMuted">
                {t.mayday.destinationPort}:
              </span>
              <span className="text-bridge-safe font-bold">
                {rescuePort.name} ({rescuePort.unlocode})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-bridge-textMuted">
                {t.mayday.emergencySupplies}:
              </span>
              <span className="text-bridge-highlight font-bold">
                {t.mayday.emergencySuppliesFree}
              </span>
            </div>

            <button
              onClick={handleCallSalvage}
              className="w-full mt-2 py-3 rounded-xl bg-bridge-danger text-white font-bold text-xs hover:bg-red-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-500/20"
            >
              <LifeBuoy size={16} />
              <span>{t.mayday.sendSignalBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
