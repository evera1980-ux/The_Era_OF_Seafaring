import React from "react";
import { useGameStore } from "../../store";
import { useTranslation } from "../../i18n";
import { GameAsset } from "../common/GameAsset";

export const SeaWindowWidget: React.FC = () => {
  const weather = useGameStore((state) => state.currentWeather);
  const currentDepth = useGameStore((state) => state.currentDepthM);
  const activeVessel = useGameStore((state) => state.activeVessel);
  const { t } = useTranslation();

  const weatherIconKey =
    weather.beaufortScale >= 11
      ? "weather_typhoon"
      : weather.beaufortScale >= 9
      ? "weather_storm"
      : weather.beaufortScale >= 7
      ? "weather_gale"
      : weather.beaufortScale >= 5
      ? "weather_fog"
      : "weather_clear";

  return (
    <div className="bg-bridge-panel/90 backdrop-blur border border-bridge-border rounded-xl p-3 shadow-2xl flex flex-col space-y-2 select-none w-56 font-mono">
      <div className="flex items-center justify-between text-[10px] text-bridge-accent font-bold border-b border-bridge-border/60 pb-1">
        <span className="flex items-center space-x-1">
          <GameAsset
            assetKey={weatherIconKey}
            width={16}
            height={16}
            className="w-4 h-4 rounded-sm object-contain"
          />
          <span>{t.hud.seaWindow}</span>
        </span>
        <span className="text-bridge-safe">BF {weather.beaufortScale}</span>
      </div>

      <div className="relative w-full h-24 rounded-lg overflow-hidden border border-bridge-border bg-gradient-to-b from-[#0a2540] via-[#071a2e] to-[#040e1a] flex flex-col justify-end">
        <div className="absolute top-2 left-2 flex items-center space-x-1.5 z-10">
          <GameAsset
            assetKey={weatherIconKey}
            width={36}
            height={36}
            className="w-9 h-9 rounded-lg border border-bridge-border/60 shadow-md object-contain bg-[#0A1128]"
          />
        </div>
        <div className="absolute top-2 right-2 text-[9px] text-bridge-textMuted bg-bridge-bg/70 px-1 rounded z-10">
          {Math.round(weather.windSpeedKn)} {t.common.knots} / {Math.round(weather.windDirectionDeg)}°
        </div>

        <div className="relative w-full h-12 overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0b2545] via-[#1b4965]/70 to-transparent animate-pulse" />
        </div>

        <div className="absolute inset-x-0 bottom-1 flex justify-between px-2 text-[10px] text-white/90 z-10">
          <span className="flex items-center space-x-1">
            <GameAsset
              assetKey="hud_waves"
              width={14}
              height={14}
              className="w-3.5 h-3.5 rounded-sm object-contain"
            />
            <span>Hs: {weather.significantWaveHeightM.toFixed(1)}{t.common.meter}</span>
          </span>
          <span className="flex items-center space-x-1">
            <GameAsset
              assetKey="hud_compass"
              width={14}
              height={14}
              className="w-3.5 h-3.5 rounded-sm object-contain"
            />
            <span>{Math.round(weather.pressureHpa)} hPa</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
        <div className="bg-bridge-panelLight/50 p-1.5 rounded border border-bridge-border flex flex-col">
          <span className="text-bridge-textMuted flex items-center space-x-1">
            <GameAsset
              assetKey="hud_depth_anchor"
              width={13}
              height={13}
              className="w-3.5 h-3.5 rounded-sm object-contain"
            />
            <span>{t.hud.depth}</span>
          </span>
          <span className={`font-bold mt-0.5 ${currentDepth < 15 ? "text-bridge-warning" : "text-bridge-safe"}`}>
            {currentDepth.toFixed(1)} {t.common.meter}
          </span>
        </div>

        <div className="bg-bridge-panelLight/50 p-1.5 rounded border border-bridge-border flex flex-col">
          <span className="text-bridge-textMuted">{t.hud.draft}</span>
          <span className="font-bold mt-0.5 text-bridge-highlight">
            {activeVessel.currentDraftM.toFixed(1)} {t.common.meter}
          </span>
        </div>
      </div>
    </div>
  );
};
