import React from "react";
import { EngineTelegraph } from "../../types";
import { useGameStore } from "../../store";
import { useTranslation } from "../../i18n";
import { GameAsset } from "../common/GameAsset";

const TELEGRAPHS: EngineTelegraph[] = ["STOP", "SLOW", "HALF", "ECO", "FULL", "FLANK"];

export const EngineTelegraphControl: React.FC = () => {
  const currentTelegraph = useGameStore((state) => state.activeVessel.engineTelegraph);
  const setTelegraph = useGameStore((state) => state.setEngineTelegraph);
  const { t } = useTranslation();

  return (
    <div className="bg-bridge-panel/90 backdrop-blur border border-bridge-border rounded-xl p-3 shadow-2xl flex flex-col items-center select-none w-20">
      <div className="flex items-center space-x-1 text-[9px] font-mono text-bridge-accent font-bold tracking-wider mb-2">
        <GameAsset
          assetKey="hud_telegraph"
          width={14}
          height={14}
          className="w-3.5 h-3.5 rounded-sm object-contain"
        />
        <span>TELEGRAPH</span>
      </div>
      <div className="flex flex-col-reverse space-y-reverse space-y-1.5 w-full">
        {TELEGRAPHS.map((level) => {
          const isActive = currentTelegraph === level;
          const isDanger = level === "FLANK";
          const isStop = level === "STOP";

          let activeClass = "bg-bridge-accent text-bridge-bg font-black shadow-[0_0_12px_#35C6D8]";
          if (isDanger) activeClass = "bg-bridge-danger text-white font-black shadow-[0_0_12px_#FF5A5F]";
          if (isStop) activeClass = "bg-zinc-600 text-white font-bold";

          return (
            <button
              key={level}
              onClick={() => setTelegraph(level)}
              className={`py-1.5 px-1 rounded text-[11px] font-mono transition-all uppercase text-center border ${
                isActive
                  ? `${activeClass} border-white`
                  : "bg-bridge-panelLight/60 text-bridge-textMuted border-bridge-border hover:border-bridge-highlight hover:text-white"
              }`}
            >
              {level}
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-[9px] font-mono text-bridge-textMuted text-center truncate w-full">
        {currentTelegraph === "STOP" ? t.hud.allStop : `${currentTelegraph} ${t.hud.ahead}`}
      </div>
    </div>
  );
};
