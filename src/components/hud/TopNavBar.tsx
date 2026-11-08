import React, { useState } from "react";
import { useGameStore } from "../../store";
import { Play, Pause, ChevronDown, Languages, Lock } from "lucide-react";
import { GameClockState } from "../../types";
import { useTranslation } from "../../i18n";
import { MARITIME_LICENSES } from "../../store/slices/worldSlice";
import { GameAsset } from "../common/GameAsset";

const TIME_SCALES: GameClockState["timeScale"][] = [1, 60, 120, 180, 300, 600];

const getScaleLabel = (scale: GameClockState["timeScale"], isZh: boolean) => {
  if (scale === 1) return isZh ? "1×(真实)" : "1×(1:1)";
  return `${scale}×`;
};

const getScaleTooltip = (
  scale: GameClockState["timeScale"],
  unlocked: boolean,
  isZh: boolean
) => {
  if (!unlocked) {
    return isZh
      ? `🔒 需晋升更高阶【航运特许资质】解锁 ${scale}× 倍速（点击前往考证）`
      : `🔒 Upgrade Maritime License to unlock ${scale}x Time Warp (Click to view)`;
  }
  if (scale === 1) {
    return isZh
      ? "真实世界 1:1 实时航速 (1秒 = 1秒)"
      : "Real-World 1:1 Speed (1s = 1s)";
  }
  if (scale === 60) return isZh ? "60倍速 · 实习三副特权 (1秒 = 1分钟)" : "60x Warp · Cadet (1s = 1 min)";
  if (scale === 120) return isZh ? "120倍速 · 沿海二副特权 (1秒 = 2分钟)" : "120x Warp · Coastal Mate (1s = 2 min)";
  if (scale === 180) return isZh ? "180倍速 · 远洋大副特权 (1秒 = 3分钟)" : "180x Warp · Chief Officer (1s = 3 min)";
  if (scale === 300) return isZh ? "300倍速 · 远洋船长特权 (1秒 = 5分钟)" : "300x Warp · Master Mariner (1s = 5 min)";
  if (scale === 600) return isZh ? "600倍速 · 航运运营总监特权 (1秒 = 10分钟)" : "600x Warp · Fleet Admiral (1s = 10 min)";
  return `${scale}×`;
};

export const TopNavBar: React.FC = () => {
  const credits = useGameStore((state) => state.playerCredits);
  const level = useGameStore((state) => state.playerLevel);
  const xp = useGameStore((state) => state.playerXP);
  const gameClock = useGameStore((state) => state.gameClock);
  const licenseId = useGameStore((state) => state.licenseId);
  const commandCenterBuilt = useGameStore((state) => state.commandCenterBuilt);
  const fleetDispatches = useGameStore((state) => state.fleetDispatches);
  const setTimeScale = useGameStore((state) => state.setTimeScale);
  const togglePause = useGameStore((state) => state.togglePause);
  const mapTileSource = useGameStore((state) => state.mapTileSource);
  const setMapTileSource = useGameStore((state) => state.setMapTileSource);
  const openModal = useGameStore((state) => state.openModal);

  const { t, language, toggleLanguage } = useTranslation();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showMapMenu, setShowMapMenu] = useState(false);

  const currentLicense = MARITIME_LICENSES[licenseId] ?? MARITIME_LICENSES.CLASS_4;
  const maxAllowedScale = commandCenterBuilt ? 600 : currentLicense.maxTimeScale;

  const handleScaleClick = (scale: GameClockState["timeScale"]) => {
    if (scale > maxAllowedScale) {
      openModal("JOURNAL", { journalTab: "LICENSES" });
      return;
    }
    setTimeScale(scale);
  };

  return (
    <header className="relative w-full max-w-full box-border bg-gradient-to-b from-[#050B16]/95 via-[#071120]/80 to-transparent backdrop-blur-md px-2 sm:px-3.5 py-1.5 sm:py-2 pt-safe flex items-center justify-between gap-1.5 sm:gap-2 select-none z-30 font-mono">
      {/* 左侧：品牌标识（小屏仅保留罗盘图标，超宽屏显示标题，绝不挤压核心信息） */}
      <div className="flex items-center space-x-1.5 shrink-0">
        <GameAsset
          assetKey="hud_compass"
          width={26}
          height={26}
          className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 object-contain drop-shadow-[0_2px_8px_rgba(53,198,216,0.45)]"
        />
        <span className="hidden xl:inline text-xs font-extrabold tracking-wide text-white truncate max-w-[160px] [text-shadow:0_2px_6px_rgba(0,0,0,0.9)]">
          {t.common.gameTitle}
        </span>
      </div>

      {/* 中部：玩家资金 · 资历等级 · 航运特许资质（自适应紧凑内联排版，防止溢出） */}
      <div className="min-w-0 flex-1 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs tabular-nums overflow-hidden">
        <button
          type="button"
          onClick={() => openModal("PORT_TRADE", { portId: "CNSHA", tab: "COMMODITIES" })}
          className="flex items-center space-x-1 shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
          title="Credits (CR)"
        >
          <GameAsset
            assetKey="hud_credits"
            width={16}
            height={16}
            className="w-4 h-4 shrink-0 object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
          />
          <span className="text-amber-300 font-extrabold tracking-tight [text-shadow:0_1px_4px_rgba(0,0,0,0.95)]">
            {credits.toLocaleString()}
          </span>
        </button>

        <span className="text-slate-500/70 select-none shrink-0">·</span>

        <button
          type="button"
          onClick={() => openModal("JOURNAL")}
          className="flex items-center space-x-1 shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <GameAsset
            assetKey="hud_xp_badge"
            width={16}
            height={16}
            className="w-4 h-4 shrink-0 object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
          />
          <span className="text-slate-200 font-bold [text-shadow:0_1px_4px_rgba(0,0,0,0.95)]">
            Lv.{level}
          </span>
          <span className="text-emerald-400 font-semibold hidden xl:inline [text-shadow:0_1px_4px_rgba(0,0,0,0.95)]">
            ({Math.round(xp)} XP)
          </span>
        </button>

        <span className="text-slate-500/70 select-none shrink-0">·</span>

        <button
          type="button"
          onClick={() => openModal("JOURNAL", { journalTab: "LICENSES" })}
          className="min-w-0 flex items-center space-x-1 text-cyan-300 hover:text-white font-bold text-[11px] transition-colors cursor-pointer [text-shadow:0_1px_4px_rgba(0,0,0,0.95)]"
          title={
            language === "zh"
              ? `当前资质：${currentLicense.titleZh}（最高 ${maxAllowedScale}× 倍速）· 点击晋升特许证书`
              : `License: ${currentLicense.titleEn} (Max ${maxAllowedScale}x) · Click to upgrade`
          }
        >
          <GameAsset
            assetKey="hud_license"
            width={16}
            height={16}
            className="w-4 h-4 shrink-0 object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
          />
          <span className="truncate max-w-[60px] sm:max-w-[96px] underline decoration-cyan-400/40 underline-offset-4">
            {language === "zh"
              ? currentLicense.titleZh.split(" ")[0]
              : currentLicense.rankCode}
          </span>
          {fleetDispatches.length > 0 && (
            <span className="hidden sm:inline text-emerald-300 text-[10px] font-extrabold shrink-0">
              ·{fleetDispatches.length}{language === "zh" ? "船" : "S"}
            </span>
          )}
        </button>
      </div>

      {/* 右侧：时间倍速、海图源与语言（紧凑无溢出设计） */}
      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
        {/* 暂停 / 播放 */}
        <button
          type="button"
          onClick={togglePause}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            gameClock.paused
              ? "bg-rose-500/90 text-white shadow-[0_0_12px_rgba(244,63,94,0.8)]"
              : "text-slate-200 hover:text-cyan-300 [filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.9))]"
          }`}
          title={gameClock.paused ? t.nav.resumed : t.nav.paused}
        >
          {gameClock.paused ? <Play size={14} /> : <Pause size={14} />}
        </button>

        {/* 倍速切换（<1024px 使用下拉菜单，>=1024px 展开紧凑内联条） */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="lg:hidden flex items-center space-x-0.5 px-1 py-1 text-[11px] sm:text-xs text-cyan-300 font-extrabold [text-shadow:0_1px_4px_rgba(0,0,0,0.95)] cursor-pointer"
          >
            <span>{ `${gameClock.timeScale}×` }</span>
            <ChevronDown size={11} />
          </button>

          {showSpeedMenu && (
            <div
              className="lg:hidden absolute right-0 top-full mt-1.5 bg-[#071120]/95 backdrop-blur-xl rounded-2xl p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.85)] z-50 flex flex-col space-y-1 min-w-[116px]"
              onClick={() => setShowSpeedMenu(false)}
            >
              {TIME_SCALES.map((scale) => {
                const unlocked = scale <= maxAllowedScale;
                const active = gameClock.timeScale === scale && unlocked;
                return (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => handleScaleClick(scale)}
                    title={getScaleTooltip(scale, unlocked, language === "zh")}
                    className={`py-1.5 px-2.5 text-xs font-bold rounded-xl flex items-center justify-between transition-colors ${
                      active
                        ? "bg-cyan-400/20 text-cyan-300"
                        : unlocked
                        ? "text-slate-200 hover:bg-white/5"
                        : "text-slate-500 hover:text-amber-300"
                    }`}
                  >
                    <span>{getScaleLabel(scale, language === "zh")}</span>
                    {!unlocked && <Lock size={11} className="text-amber-400" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* 大屏（>=1024px）无边框紧凑内联倍速切换条 */}
          <div className="hidden lg:flex items-center space-x-0.5 tabular-nums">
            {TIME_SCALES.map((scale) => {
              const unlocked = scale <= maxAllowedScale;
              const isActive = gameClock.timeScale === scale && !gameClock.paused && unlocked;
              return (
                <button
                  key={scale}
                  type="button"
                  onClick={() => handleScaleClick(scale)}
                  title={getScaleTooltip(scale, unlocked, language === "zh")}
                  className={`relative px-1.5 py-1 text-[11px] transition-all flex items-center space-x-0.5 cursor-pointer [text-shadow:0_1px_4px_rgba(0,0,0,0.95)] ${
                    isActive
                      ? "text-cyan-300 font-extrabold"
                      : unlocked
                      ? "text-slate-400 hover:text-white font-medium"
                      : "text-slate-600 hover:text-amber-300"
                  }`}
                >
                  {!unlocked && <Lock size={9} className="text-amber-400/80 shrink-0 mr-0.5" />}
                  <span>{`${scale}×`}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1.5 right-1.5 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#35C6D8]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 地图图层源切换 */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowMapMenu(!showMapMenu)}
            className="flex items-center space-x-1 px-1 py-1 text-[11px] text-slate-200 hover:text-cyan-300 font-bold transition-colors cursor-pointer [text-shadow:0_1px_4px_rgba(0,0,0,0.95)]"
            title="Map Layer"
          >
            <GameAsset
              assetKey="hud_map_globe"
              width={18}
              height={18}
              className="w-4 h-4 shrink-0 object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
            />
            <span className="hidden xl:inline truncate max-w-[84px]">
              {mapTileSource === "NAUTICAL_DARK"
                ? t.nav.mapDark
                : mapTileSource === "GOOGLE_SATELLITE"
                ? t.nav.mapSatellite
                : t.nav.mapOSM}
            </span>
          </button>

          {showMapMenu && (
            <div
              className="absolute right-0 top-full mt-1.5 bg-[#071120]/95 backdrop-blur-xl rounded-2xl p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.85)] z-50 flex flex-col space-y-1 min-w-[136px]"
              onClick={() => setShowMapMenu(false)}
            >
              <button
                type="button"
                onClick={() => setMapTileSource("NAUTICAL_DARK")}
                className={`px-3 py-1.5 text-left text-xs rounded-xl transition-colors ${
                  mapTileSource === "NAUTICAL_DARK"
                    ? "bg-cyan-400/20 text-cyan-300 font-bold"
                    : "text-slate-200 hover:bg-white/5"
                }`}
              >
                {t.nav.mapDark}
              </button>
              <button
                type="button"
                onClick={() => setMapTileSource("GOOGLE_SATELLITE")}
                className={`px-3 py-1.5 text-left text-xs rounded-xl transition-colors ${
                  mapTileSource === "GOOGLE_SATELLITE"
                    ? "bg-cyan-400/20 text-cyan-300 font-bold"
                    : "text-slate-200 hover:bg-white/5"
                }`}
              >
                {t.nav.mapSatellite}
              </button>
              <button
                type="button"
                onClick={() => setMapTileSource("OPENSTREETMAP")}
                className={`px-3 py-1.5 text-left text-xs rounded-xl transition-colors ${
                  mapTileSource === "OPENSTREETMAP"
                    ? "bg-cyan-400/20 text-cyan-300 font-bold"
                    : "text-slate-200 hover:bg-white/5"
                }`}
              >
                {t.nav.mapOSM}
              </button>
            </div>
          )}
        </div>

        {/* 多语言切换按钮 (中 / EN) */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center space-x-0.5 px-1 py-1 text-[11px] font-bold text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer shrink-0 [text-shadow:0_1px_4px_rgba(0,0,0,0.95)]"
          title={t.nav.langSwitch}
        >
          <Languages size={13} className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" />
          <span>{language === "zh" ? "EN" : "中"}</span>
        </button>
      </div>
    </header>
  );
};
