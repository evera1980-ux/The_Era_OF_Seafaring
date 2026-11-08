import React, { useState } from "react";
import { useGameStore } from "../../store";
import { X, BookOpen, FileText, Globe, Check } from "lucide-react";
import { useTranslation } from "../../i18n";
import { CHARTER_CONTRACT_LIST, CHARTER_CONTRACTS } from "../../config/contracts";
import { PORTS } from "../../config/ports";

export const JournalModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const systemLogs = useGameStore((state) => state.systemLogs);
  const activeVessel = useGameStore((state) => state.activeVessel);
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

  const [activeTab, setActiveTab] = useState<"LOGS" | "CONTRACTS" | "ATLAS">(
    "LOGS"
  );

  if (activeModal !== "JOURNAL") return null;

  const handleCompleteContract = (contractId: string) => {
    const spec = CHARTER_CONTRACTS[contractId];
    if (!spec) return;

    // 检查船上是否有对应商品且数量达标 (或者玩家已抵达目的港直接交割)
    const matchingCargo = activeVessel.cargoItems.find(
      (c) => c.commodityId === spec.commodityId && c.quantityT >= spec.requiredTons
    );

    if (completeContract(contractId)) {
      if (matchingCargo) {
        removeCargoItem(matchingCargo.cargoId);
      }
      addCredits(spec.rewardCredits);
      addXP(spec.rewardXP);
      const title = language === "zh" ? spec.title : spec.titleEn;
      addLog(
        language === "zh"
          ? `🏆 特许航运合约完美履约：【${title}】！获得合约奖金 +${spec.rewardCredits.toLocaleString()} CR，航海声望 +${spec.rewardXP} SXP！`
          : `🏆 Charter Contract Fulfilled: [${title}]! Awarded +${spec.rewardCredits.toLocaleString()} CR & +${spec.rewardXP} SXP!`
      );
    }
  };

  const allPorts = Object.values(PORTS);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end md:items-center justify-center font-mono">
      <div className="bg-bridge-panel border-t md:border border-bridge-border rounded-t-2xl md:rounded-2xl w-full max-w-3xl max-h-[88dvh] flex flex-col shadow-2xl overflow-hidden pb-safe animate-in slide-in-from-bottom duration-200">
        <div className="px-4 py-3 md:px-6 md:py-4 bg-bridge-panelLight/60 border-b border-bridge-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 text-bridge-highlight">
            <BookOpen size={18} />
            <div>
              <div className="text-sm md:text-base font-bold text-white">
                {t.journal.title}
              </div>
              <div className="text-[10px] text-bridge-textMuted">
                {t.journal.subtitle}
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
        <div className="flex border-b border-bridge-border px-4 md:px-6 pt-2 space-x-4 bg-bridge-panel shrink-0">
          <button
            onClick={() => setActiveTab("LOGS")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "LOGS"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <BookOpen size={13} />
            <span>{t.journal.tabLogs}</span>
          </button>
          <button
            onClick={() => setActiveTab("CONTRACTS")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "CONTRACTS"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <FileText size={13} />
            <span>
              {t.journal.tabContracts} ({activeContractIds.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("ATLAS")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "ATLAS"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <Globe size={13} />
            <span>
              {t.journal.tabAtlas} ({discoveredPortIds.length}/{allPorts.length})
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
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
                const title = language === "zh" ? cnt.title : cnt.titleEn;
                const desc = language === "zh" ? cnt.description : cnt.descriptionEn;
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
        </div>
      </div>
    </div>
  );
};
