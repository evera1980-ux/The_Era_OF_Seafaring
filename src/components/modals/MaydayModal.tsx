import React from "react";
import { useGameStore } from "../../store";
import { X, AlertTriangle, LifeBuoy } from "lucide-react";
import { PORTS } from "../../config/ports";
import { SALVAGE_TUG_PRICES } from "../../config/economy";
import { useTranslation } from "../../i18n";

export const MaydayModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const activeVessel = useGameStore((state) => state.activeVessel);
  const updateVesselState = useGameStore((state) => state.updateVesselState);
  const deductCredits = useGameStore((state) => state.deductCredits);
  const addLog = useGameStore((state) => state.addLog);
  const { t, language } = useTranslation();

  if (activeModal !== "MAYDAY") return null;

  const handleCallSalvage = () => {
    const cost = SALVAGE_TUG_PRICES.BASE_CALLOUT_FEE;
    deductCredits(cost);

    const homePort = PORTS["CNSHA"];
    updateVesselState({
      position: homePort.position,
      headingDeg: 90,
      cogDeg: 90,
      sogKn: 0 as any,
      engineTelegraph: "STOP",
      grounded: false,
      gameStatus: "DOCKED",
      hullHp: Math.max(2000, activeVessel.hullHp),
      crewHealth: Math.max(50, activeVessel.crewHealth),
      supplies: {
        ...activeVessel.supplies,
        fuelT: Math.max(0.5, activeVessel.supplies.fuelT),
        freshWaterT: Math.max(0.5, activeVessel.supplies.freshWaterT),
        rationT: Math.max(0.2, activeVessel.supplies.rationT),
      },
    });

    const msg = language === "zh"
      ? `远洋救助拖轮抵达！已成功将船舶脱浅并拖带至 ${homePort.name}，支付救助费 ${cost} CR。`
      : `Salvage tug on scene! Vessel refloated and safely towed to ${homePort.name}. Fee: ${cost} CR.`;
    addLog(msg, "ALERT");
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end md:items-center justify-center font-mono">
      <div className="bg-bridge-panel border-t md:border-2 border-bridge-danger/80 rounded-t-2xl md:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden pb-safe animate-in slide-in-from-bottom duration-200">
        <div className="px-4 py-3 md:px-6 md:py-4 bg-bridge-danger/20 border-b border-bridge-danger/40 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 text-bridge-danger">
            <AlertTriangle size={20} className="animate-pulse" />
            <div>
              <div className="text-sm md:text-base font-bold text-white">{t.mayday.title}</div>
              <div className="text-[10px] text-bridge-danger">{t.mayday.channel}</div>
            </div>
          </div>

          <button onClick={closeModal} className="p-1 rounded-lg text-bridge-textMuted hover:text-white bg-bridge-panel border border-bridge-border">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-3">
          <div className="text-xs text-bridge-text leading-relaxed">
            {t.mayday.warningDesc}
          </div>

          <div className="bg-bridge-panelLight/40 p-3.5 rounded-xl border border-bridge-border space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-bridge-textMuted">{t.mayday.calloutFee}:</span>
              <span className="text-amber-400 font-bold">{SALVAGE_TUG_PRICES.BASE_CALLOUT_FEE} CR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bridge-textMuted">{t.mayday.destinationPort}:</span>
              <span className="text-bridge-safe font-bold">Shanghai / Zhoushan (CNSHA)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bridge-textMuted">{t.mayday.emergencySupplies}:</span>
              <span className="text-bridge-highlight font-bold">{t.mayday.emergencySuppliesFree}</span>
            </div>
          </div>

          <button
            onClick={handleCallSalvage}
            className="w-full py-3 rounded-xl bg-bridge-danger text-white font-bold text-xs hover:bg-red-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-500/20"
          >
            <LifeBuoy size={16} />
            <span>{t.mayday.sendSignalBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
