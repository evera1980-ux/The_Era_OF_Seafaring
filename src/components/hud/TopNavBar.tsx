import React, { useState } from "react";
import { useGameStore } from "../../store";
import { Play, Pause, Globe, Coins, Award, ChevronDown, Languages } from "lucide-react";
import { GameClockState } from "../../types";
import { useTranslation } from "../../i18n";

const TIME_SCALES: GameClockState["timeScale"][] = [1, 2, 5, 10, 30, 60];

export const TopNavBar: React.FC = () => {
  const credits = useGameStore((state) => state.playerCredits);
  const level = useGameStore((state) => state.playerLevel);
  const xp = useGameStore((state) => state.playerXP);
  const gameClock = useGameStore((state) => state.gameClock);
  const setTimeScale = useGameStore((state) => state.setTimeScale);
  const togglePause = useGameStore((state) => state.togglePause);
  const mapTileSource = useGameStore((state) => state.mapTileSource);
  const setMapTileSource = useGameStore((state) => state.setMapTileSource);

  const { t, language, toggleLanguage } = useTranslation();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showMapMenu, setShowMapMenu] = useState(false);

  return (
    <div className="bg-bridge-panel/95 backdrop-blur border-b border-bridge-border px-3 py-1.5 md:px-4 md:py-2.5 pt-safe flex items-center justify-between select-none shadow-lg z-30 font-mono">
      {/* 标题 / Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center shadow-[0_0_10px_#35C6D8] shrink-0">
          <span className="text-white font-black text-xs md:text-sm">ES</span>
        </div>
        <div className="hidden sm:block">
          <div className="text-xs md:text-sm font-extrabold text-white flex items-center space-x-1.5 leading-none">
            <span>{t.common.gameTitle}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-bridge-accent/20 text-bridge-highlight border border-bridge-accent/40">
              v1.0
            </span>
          </div>
          <div className="text-[9px] text-bridge-textMuted mt-0.5">{t.common.gameSubtitle}</div>
        </div>
      </div>

      {/* 玩家资产与经验 */}
      <div className="flex items-center space-x-2 bg-bridge-panelLight/70 px-2.5 py-1 rounded-lg border border-bridge-border text-[11px]">
        <div className="flex items-center space-x-1">
          <Coins size={12} className="text-amber-400 shrink-0" />
          <span className="text-amber-400 font-bold">{credits.toLocaleString()}</span>
        </div>
        <div className="h-3 w-px bg-bridge-border" />
        <div className="flex items-center space-x-1">
          <Award size={12} className="text-bridge-safe shrink-0" />
          <span className="text-bridge-textMuted">L{level}</span>
          <span className="text-bridge-safe font-bold hidden xs:inline">{Math.round(xp)}xp</span>
        </div>
      </div>

      {/* 右侧控制器 */}
      <div className="flex items-center space-x-1.5">
        {/* 多语言切换按钮 (中 / EN) */}
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-1 bg-bridge-panelLight/80 hover:bg-bridge-accent hover:text-bridge-bg px-2 py-1 rounded-lg border border-bridge-border text-[11px] font-bold transition-all text-bridge-highlight"
          title={t.nav.langSwitch}
        >
          <Languages size={13} />
          <span>{language === "zh" ? "EN" : "中文"}</span>
        </button>

        {/* 暂停 / 播放 */}
        <button
          onClick={togglePause}
          className={`p-1.5 rounded-lg border transition-all ${
            gameClock.paused
              ? "bg-bridge-danger border-white text-white animate-pulse"
              : "bg-bridge-panelLight border-bridge-border text-bridge-text"
          }`}
          title={gameClock.paused ? t.nav.resumed : t.nav.paused}
        >
          {gameClock.paused ? <Play size={13} /> : <Pause size={13} />}
        </button>

        {/* 倍速切换 */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="md:hidden flex items-center space-x-1 bg-bridge-panelLight px-2 py-1 rounded-lg border border-bridge-border text-[11px] text-bridge-highlight font-bold"
          >
            <span>{gameClock.timeScale}×</span>
            <ChevronDown size={11} />
          </button>

          {showSpeedMenu && (
            <div
              className="md:hidden absolute right-0 top-full mt-1 bg-bridge-panel border border-bridge-border rounded-xl p-1 shadow-2xl z-50 flex flex-col space-y-1 min-w-[70px]"
              onClick={() => setShowSpeedMenu(false)}
            >
              {TIME_SCALES.map((scale) => (
                <button
                  key={scale}
                  onClick={() => setTimeScale(scale)}
                  className={`py-1 text-[11px] font-bold rounded text-center ${
                    gameClock.timeScale === scale
                      ? "bg-bridge-accent text-bridge-bg"
                      : "text-bridge-text hover:bg-bridge-panelLight"
                  }`}
                >
                  {scale}×
                </button>
              ))}
            </div>
          )}

          {/* 桌面端全展开倍速 */}
          <div className="hidden md:flex items-center space-x-1 bg-bridge-panelLight/60 px-2 py-1 rounded-lg border border-bridge-border">
            {TIME_SCALES.map((scale) => (
              <button
                key={scale}
                onClick={() => setTimeScale(scale)}
                className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${
                  gameClock.timeScale === scale && !gameClock.paused
                    ? "bg-bridge-accent text-bridge-bg font-bold shadow-sm"
                    : "text-bridge-textMuted hover:text-white"
                }`}
              >
                {scale}×
              </button>
            ))}
          </div>
        </div>

        {/* 地图图层源切换 */}
        <div className="relative">
          <button
            onClick={() => setShowMapMenu(!showMapMenu)}
            className="flex items-center space-x-1 bg-bridge-panelLight px-2 py-1 rounded-lg border border-bridge-border text-[11px] text-bridge-text font-bold"
          >
            <Globe size={12} className="text-bridge-highlight" />
            <span className="hidden sm:inline">
              {mapTileSource === "NAUTICAL_DARK" ? t.nav.mapDark : mapTileSource === "GOOGLE_SATELLITE" ? t.nav.mapSatellite : t.nav.mapOSM}
            </span>
          </button>

          {showMapMenu && (
            <div
              className="absolute right-0 top-full mt-1 bg-bridge-panel border border-bridge-border rounded-xl p-1 shadow-2xl z-50 flex flex-col space-y-1 min-w-[130px]"
              onClick={() => setShowMapMenu(false)}
            >
              <button
                onClick={() => setMapTileSource("NAUTICAL_DARK")}
                className={`px-2 py-1.5 text-left text-xs rounded ${
                  mapTileSource === "NAUTICAL_DARK"
                    ? "bg-bridge-accent text-bridge-bg font-bold"
                    : "text-bridge-text hover:bg-bridge-panelLight"
                }`}
              >
                {t.nav.mapDark}
              </button>
              <button
                onClick={() => setMapTileSource("GOOGLE_SATELLITE")}
                className={`px-2 py-1.5 text-left text-xs rounded ${
                  mapTileSource === "GOOGLE_SATELLITE"
                    ? "bg-bridge-accent text-bridge-bg font-bold"
                    : "text-bridge-text hover:bg-bridge-panelLight"
                }`}
              >
                {t.nav.mapSatellite}
              </button>
              <button
                onClick={() => setMapTileSource("OPENSTREETMAP")}
                className={`px-2 py-1.5 text-left text-xs rounded ${
                  mapTileSource === "OPENSTREETMAP"
                    ? "bg-bridge-accent text-bridge-bg font-bold"
                    : "text-bridge-text hover:bg-bridge-panelLight"
                }`}
              >
                {t.nav.mapOSM}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
