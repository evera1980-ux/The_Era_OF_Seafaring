import React from "react";
import { X, RefreshCw, Cpu } from "lucide-react";
import { useTranslation } from "../../i18n";

export const WebGLTroubleshootModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
      <div className="bg-bridge-panel border border-bridge-border rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden pb-safe animate-in fade-in duration-200">
        <div className="px-5 py-3.5 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-amber-400">
            <Cpu size={20} />
            <div>
              <div className="text-sm font-bold text-white">{t.troubleshoot.title}</div>
              <div className="text-[10px] text-bridge-textMuted">{t.troubleshoot.subtitle}</div>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-bridge-textMuted hover:text-white bg-bridge-panel border border-bridge-border">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-bridge-text leading-relaxed">
          <div className="bg-bridge-panelLight/40 p-3 rounded-xl border border-bridge-border text-bridge-textMuted text-[11px]">
            💡 {t.troubleshoot.canvasActiveNotice}
          </div>

          <div className="bg-bridge-panelLight/50 p-3.5 rounded-xl border border-bridge-border space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-bridge-highlight">
              <span className="w-5 h-5 rounded-full bg-bridge-highlight/20 text-bridge-highlight flex items-center justify-center text-[10px]">
                1
              </span>
              <span>{t.troubleshoot.step1Title}</span>
            </div>
            <p className="text-bridge-textMuted text-[11px] pl-7">
              {t.troubleshoot.step1Desc}
            </p>
          </div>

          <div className="bg-bridge-panelLight/50 p-3.5 rounded-xl border border-bridge-border space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-bridge-highlight">
              <span className="w-5 h-5 rounded-full bg-bridge-highlight/20 text-bridge-highlight flex items-center justify-center text-[10px]">
                2
              </span>
              <span>{t.troubleshoot.step2Title}</span>
            </div>
            <p className="text-bridge-textMuted text-[11px] pl-7">
              {t.troubleshoot.step2Desc}
            </p>
          </div>

          <div className="bg-bridge-panelLight/50 p-3.5 rounded-xl border border-bridge-border space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-bridge-highlight">
              <span className="w-5 h-5 rounded-full bg-bridge-highlight/20 text-bridge-highlight flex items-center justify-center text-[10px]">
                3
              </span>
              <span>{t.troubleshoot.step3Title}</span>
            </div>
            <p className="text-bridge-textMuted text-[11px] pl-7">
              {t.troubleshoot.step3Desc}
            </p>
          </div>
        </div>

        <div className="p-4 bg-bridge-panelLight/40 border-t border-bridge-border flex items-center justify-between shrink-0">
          <span className="text-[10px] text-bridge-textMuted">{t.troubleshoot.reloadHint}</span>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-bridge-accent text-bridge-bg font-bold text-xs hover:bg-bridge-highlight transition-all flex items-center space-x-1.5"
          >
            <RefreshCw size={13} />
            <span>{t.troubleshoot.refreshBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
