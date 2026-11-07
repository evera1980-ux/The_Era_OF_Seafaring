import React from "react";
import { useGameStore } from "../../store";
import { X, Radio } from "lucide-react";
import { useTranslation } from "../../i18n";

export const AISDetailModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const selectedAISTargetId = useGameStore((state) => state.selectedAISTargetId);
  const aisTargets = useGameStore((state) => state.aisTargets);
  const addLog = useGameStore((state) => state.addLog);
  const { t, language } = useTranslation();

  if (activeModal !== "AIS_DETAIL") return null;

  const target = aisTargets.find((t) => t.targetId === selectedAISTargetId) || aisTargets[0];

  const handleVHFContact = () => {
    if (!target) return;
    const callMsg = `[VHF CH16] Calling ${target.vesselName}: "This is sailing vessel on your port bow, request passing arrangement."`;
    addLog(callMsg, "INFO");
    setTimeout(() => {
      const respMsg = `[VHF CH16] ${target.vesselName}: "Roger, maintain course and speed. Safe passage, captain."`;
      addLog(respMsg, "INFO");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end md:items-center justify-center font-mono">
      <div className="bg-bridge-panel border-t md:border border-bridge-border rounded-t-2xl md:rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden pb-safe animate-in slide-in-from-bottom duration-200">
        <div className="px-4 py-3 md:px-6 md:py-4 bg-bridge-panelLight/60 border-b border-bridge-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5 text-amber-400">
            <Radio size={18} />
            <div>
              <div className="text-sm md:text-base font-bold text-white">{t.ais.title}</div>
              <div className="text-[10px] text-bridge-textMuted">{t.ais.subtitle}</div>
            </div>
          </div>

          <button onClick={closeModal} className="p-1 rounded-lg text-bridge-textMuted hover:text-white bg-bridge-panel border border-bridge-border">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          {target ? (
            <div className="space-y-4">
              <div className="bg-bridge-panelLight/40 p-3.5 rounded-xl border border-bridge-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm md:text-base font-bold text-white">{target.vesselName}</div>
                  <div className="text-[10px] px-2 py-0.5 rounded bg-bridge-bg text-bridge-highlight border border-bridge-border">
                    {target.vesselType}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-bridge-textMuted pt-1">
                  <div>MMSI: <span className="text-white font-bold">{target.mmsi}</span></div>
                  <div>IMO: <span className="text-white font-bold">{target.imo ?? "N/A"}</span></div>
                  <div>{t.hud.sog}: <span className="text-bridge-safe font-bold">{target.sogKn} {t.common.knots}</span></div>
                  <div>{t.hud.cog}: <span className="text-amber-400 font-bold">{target.cogDeg}°</span></div>
                  <div>{t.ais.draft}: <span className="text-white font-bold">{target.draftM} {t.common.meter}</span></div>
                  <div>{t.ais.destination}: <span className="text-bridge-highlight font-bold">{target.destinationPort ?? "SEA TRIAL"}</span></div>
                </div>
              </div>

              <div className="flex space-x-3 pt-1">
                <button
                  onClick={handleVHFContact}
                  className="w-full py-3 rounded-xl bg-bridge-accent text-bridge-bg font-bold text-xs hover:bg-bridge-highlight transition-all flex items-center justify-center space-x-2"
                >
                  <Radio size={14} />
                  <span>{t.ais.vhfCall}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-bridge-textMuted text-center py-6">
              {t.ais.noTargets}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
