import React from "react";
import { useGameStore } from "../../store";
import { Compass } from "lucide-react";
import { useTranslation } from "../../i18n";
import { calculateApparentWindAngle } from "../../core/physics/sail";

export const CompassControl: React.FC = () => {
  const heading = useGameStore((state) => state.activeVessel.headingDeg);
  const cog = useGameStore((state) => state.activeVessel.cogDeg);
  const sog = useGameStore((state) => state.activeVessel.sogKn);
  const windDir = useGameStore((state) => state.currentWeather.windDirectionDeg);
  const setHeading = useGameStore((state) => state.setHeadingDeg);
  const { t } = useTranslation();

  const changeHeading = (delta: number) => {
    setHeading((heading + delta + 360) % 360);
  };

  const awa = Math.round(calculateApparentWindAngle(heading, windDir));

  return (
    <div className="bg-bridge-panel/90 backdrop-blur border border-bridge-border rounded-xl p-3 shadow-2xl flex flex-col items-center select-none w-36">
      <div className="flex items-center space-x-1 text-[10px] font-mono text-bridge-accent font-bold mb-1">
        <Compass size={13} />
        <span>{t.hud.compass}</span>
      </div>

      {/* 拟物罗经盘 (含来风角与禁航死区扇面) */}
      <div className="relative w-24 h-24 rounded-full border-2 border-bridge-border flex items-center justify-center bg-gradient-to-b from-bridge-panel to-bridge-bg my-1 shadow-inner">
        <div
          className="absolute inset-1 rounded-full border border-dashed border-bridge-border/80 transition-transform duration-300 flex items-center justify-center"
          style={{ transform: `rotate(${-heading}deg)` }}
        >
          <div className="absolute top-1 text-[9px] font-bold text-bridge-danger font-mono">N</div>
          <div className="absolute bottom-1 text-[8px] text-bridge-textMuted font-mono">S</div>
          <div className="absolute right-1 text-[8px] text-bridge-textMuted font-mono">E</div>
          <div className="absolute left-1 text-[8px] text-bridge-textMuted font-mono">W</div>
        </div>

        {/* 视风向指针 */}
        <div
          className="absolute inset-0 flex items-start justify-center pointer-events-none transition-transform duration-300"
          style={{ transform: `rotate(${windDir - heading}deg)` }}
        >
          <div className="w-1.5 h-3 bg-sky-400 rounded-b" title={`${t.hud.awa}: ${awa}°`} />
        </div>

        <div className="absolute top-0 w-0.5 h-3 bg-bridge-highlight z-10"></div>
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300"
          style={{ transform: `rotate(${cog - heading}deg)` }}
        >
          <div className="w-0.5 h-16 bg-bridge-warning/80 opacity-75"></div>
        </div>

        <div className="text-center z-10">
          <div className="text-base font-bold font-mono text-bridge-text leading-tight">
            {Math.round(heading)}°
          </div>
          <div className="text-[8px] font-mono text-sky-400">
            {t.hud.awa} {awa}°
          </div>
        </div>
      </div>

      {/* 操舵快捷按钮 */}
      <div className="grid grid-cols-4 gap-1 w-full mt-2">
        <button
          onClick={() => changeHeading(-10)}
          className="bg-bridge-panelLight/80 hover:bg-bridge-panelLight border border-bridge-border text-bridge-text rounded py-1 text-[10px] font-mono text-center"
          title={`${t.hud.rudderLeft} 10°`}
        >
          -10°
        </button>
        <button
          onClick={() => changeHeading(-1)}
          className="bg-bridge-panelLight/80 hover:bg-bridge-panelLight border border-bridge-border text-bridge-text rounded py-1 text-[10px] font-mono text-center"
          title={`${t.hud.rudderLeft} 1°`}
        >
          -1°
        </button>
        <button
          onClick={() => changeHeading(1)}
          className="bg-bridge-panelLight/80 hover:bg-bridge-panelLight border border-bridge-border text-bridge-text rounded py-1 text-[10px] font-mono text-center"
          title={`${t.hud.rudderRight} 1°`}
        >
          +1°
        </button>
        <button
          onClick={() => changeHeading(10)}
          className="bg-bridge-panelLight/80 hover:bg-bridge-panelLight border border-bridge-border text-bridge-text rounded py-1 text-[10px] font-mono text-center"
          title={`${t.hud.rudderRight} 10°`}
        >
          +10°
        </button>
      </div>

      {/* SOG 与 COG 数据 */}
      <div className="mt-2 w-full pt-1.5 border-t border-bridge-border/60 flex justify-between text-[10px] font-mono">
        <div>
          <span className="text-bridge-textMuted">{t.hud.sog}: </span>
          <span className="text-bridge-safe font-bold">
            {sog.toFixed(1)} {t.common.knots}
          </span>
        </div>
        <div>
          <span className="text-bridge-textMuted">{t.hud.cog}: </span>
          <span className="text-bridge-warning font-bold">{Math.round(cog)}°</span>
        </div>
      </div>
    </div>
  );
};
