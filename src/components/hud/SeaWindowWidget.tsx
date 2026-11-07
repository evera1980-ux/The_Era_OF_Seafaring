import React from "react";
import { useGameStore } from "../../store";
import { Waves, Gauge, Anchor } from "lucide-react";
import { useTranslation } from "../../i18n";

export const SeaWindowWidget: React.FC = () => {
  const weather = useGameStore((state) => state.currentWeather);
  const currentDepth = useGameStore((state) => state.currentDepthM);
  const activeVessel = useGameStore((state) => state.activeVessel);
  const { t } = useTranslation();

  const waveDuration = Math.max(2, weather.swellPeriodS / 2);

  return (
    <div className="bg-bridge-panel/90 backdrop-blur border border-bridge-border rounded-xl p-3 shadow-2xl flex flex-col space-y-2 select-none w-56 font-mono">
      <div className="flex items-center justify-between text-[10px] text-bridge-accent font-bold border-b border-bridge-border/60 pb-1">
        <span>{t.hud.seaWindow}</span>
        <span className="text-bridge-safe">BF {weather.beaufortScale}</span>
      </div>

      <div className="relative w-full h-24 rounded-lg overflow-hidden border border-bridge-border bg-gradient-to-b from-[#0a2540] via-[#071a2e] to-[#040e1a] flex flex-col justify-end">
        <div className="absolute top-2 right-2 text-[9px] text-bridge-textMuted bg-bridge-bg/70 px-1 rounded">
          {weather.windSpeedKn} {t.common.knots} / {weather.windDirectionDeg}°
        </div>

        <div className="relative w-full h-14 overflow-hidden">
          <svg
            viewBox="0 0 500 100"
            preserveAspectRatio="none"
            className="absolute bottom-0 w-[200%] h-full opacity-60 animate-pulse"
            style={{ animationDuration: `${waveDuration}s` }}
          >
            <path
              d="M 0 50 Q 60 20, 125 50 T 250 50 T 375 50 T 500 50 L 500 100 L 0 100 Z"
              fill="#1b4965"
            />
          </svg>
          <svg
            viewBox="0 0 500 100"
            preserveAspectRatio="none"
            className="absolute bottom-0 w-[200%] h-full opacity-80"
          >
            <path
              d="M 0 60 Q 60 40, 125 60 T 250 60 T 375 60 T 500 60 L 500 100 L 0 100 Z"
              fill="#0b2545"
            />
          </svg>
        </div>

        <div className="absolute inset-x-0 bottom-1 flex justify-between px-2 text-[10px] text-white/90 z-10">
          <span className="flex items-center space-x-1">
            <Waves size={11} className="text-bridge-highlight" />
            <span>Hs: {weather.significantWaveHeightM}{t.common.meter}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Gauge size={11} className="text-bridge-accent" />
            <span>{Math.round(weather.pressureHpa)} hPa</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
        <div className="bg-bridge-panelLight/50 p-1.5 rounded border border-bridge-border flex flex-col">
          <span className="text-bridge-textMuted flex items-center space-x-1">
            <Anchor size={10} />
            <span>{t.hud.depth}</span>
          </span>
          <span className={`font-bold mt-0.5 ${currentDepth < 15 ? "text-bridge-warning" : "text-bridge-safe"}`}>
            {currentDepth.toFixed(1)} {t.common.meter}
          </span>
        </div>

        <div className="bg-bridge-panelLight/50 p-1.5 rounded border border-bridge-border flex flex-col">
          <span className="text-bridge-textMuted">{t.hud.draft}</span>
          <span className="font-bold mt-0.5 text-bridge-highlight">
            {activeVessel.currentDraftM.toFixed(2)} {t.common.meter}
          </span>
        </div>
      </div>
    </div>
  );
};
