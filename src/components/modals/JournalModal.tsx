import React from "react";
import { useGameStore } from "../../store";
import { X, BookOpen } from "lucide-react";
import { useTranslation } from "../../i18n";

export const JournalModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const systemLogs = useGameStore((state) => state.systemLogs);
  const { t } = useTranslation();

  if (activeModal !== "JOURNAL") return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end md:items-center justify-center font-mono">
      <div className="bg-bridge-panel border-t md:border border-bridge-border rounded-t-2xl md:rounded-2xl w-full max-w-2xl max-h-[85dvh] flex flex-col shadow-2xl overflow-hidden pb-safe animate-in slide-in-from-bottom duration-200">
        <div className="px-4 py-3 md:px-6 md:py-4 bg-bridge-panelLight/60 border-b border-bridge-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 text-bridge-highlight">
            <BookOpen size={18} />
            <div>
              <div className="text-sm md:text-base font-bold text-white">{t.journal.title}</div>
              <div className="text-[10px] text-bridge-textMuted">{t.journal.subtitle}</div>
            </div>
          </div>

          <button onClick={closeModal} className="p-1 rounded-lg text-bridge-textMuted hover:text-white bg-bridge-panel border border-bridge-border">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
          {systemLogs.length === 0 ? (
            <div className="text-center text-xs text-bridge-textMuted py-8">
              {t.journal.empty}
            </div>
          ) : (
            systemLogs.map((log) => {
              const timeStr = new Date(log.timestamp).toLocaleTimeString();
              let badgeClass = "text-bridge-highlight border-bridge-border bg-bridge-panelLight";
              if (log.type === "WARN") badgeClass = "text-bridge-warning border-bridge-warning/40 bg-amber-400/10";
              if (log.type === "ALERT") badgeClass = "text-bridge-danger border-bridge-danger/40 bg-red-400/10";

              return (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg border border-bridge-border/60 bg-bridge-panelLight/30 flex items-start space-x-2 text-[11px]"
                >
                  <span className="text-bridge-textMuted whitespace-nowrap">{timeStr}</span>
                  <span className={`px-1 py-0.2 rounded border text-[9px] font-bold ${badgeClass}`}>
                    {log.type}
                  </span>
                  <span className="text-bridge-text flex-1 leading-snug">{log.text}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
