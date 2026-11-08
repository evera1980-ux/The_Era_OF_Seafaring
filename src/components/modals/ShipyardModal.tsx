import React, { useState } from "react";
import { useGameStore } from "../../store";
import { VESSELS } from "../../config/vessels";
import { UPGRADE_LIST, UPGRADE_CATALOG } from "../../config/upgrades";
import { CAPTAIN_PERK_LIST, CAPTAIN_PERK_MAP } from "../../config/captainPerks";
import { X, Anchor, Lock, Cpu, Award, Check } from "lucide-react";
import { GameAsset } from "../common/GameAsset";
import { useTranslation } from "../../i18n";
import { canInstallUpgrade, getVesselMaxUpgradeSlots } from "../../core/economy/upgrades";
import { selectAvailablePerkPoints } from "../../store/selectors/shipSelectors";

export const ShipyardModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const credits = useGameStore((state) => state.playerCredits);
  const level = useGameStore((state) => state.playerLevel);
  const ownedVesselIds = useGameStore((state) => state.ownedVesselIds);
  const unlockedPerkIds = useGameStore((state) => state.unlockedPerkIds);
  const activeVessel = useGameStore((state) => state.activeVessel);
  const purchaseVessel = useGameStore((state) => state.purchaseVessel);
  const switchVessel = useGameStore((state) => state.switchVessel);
  const installUpgrade = useGameStore((state) => state.installUpgrade);
  const unlockPerk = useGameStore((state) => state.unlockPerk);
  const deductCredits = useGameStore((state) => state.deductCredits);
  const addLog = useGameStore((state) => state.addLog);
  const { t, language } = useTranslation();

  const [selectedVesselId, setSelectedVesselId] = useState<string>(
    activeVessel.vesselId || "V001"
  );
  const [activeTab, setActiveTab] = useState<"VESSELS" | "UPGRADES" | "PERKS">(
    "VESSELS"
  );

  if (activeModal !== "SHIPYARD") return null;

  const vesselList = Object.values(VESSELS);
  const selectedSpec = VESSELS[selectedVesselId] || vesselList[0];
  const activeSpec = VESSELS[activeVessel.vesselId] || vesselList[0];
  const isOwned = ownedVesselIds.includes(selectedVesselId);
  const isCurrentActive = activeVessel.vesselId === selectedVesselId;
  const isLevelUnlocked = level >= selectedSpec.unlockLevel;

  const maxSlots = getVesselMaxUpgradeSlots(activeSpec);
  const availablePerkPoints = selectAvailablePerkPoints(level, unlockedPerkIds);

  const handleBuyOrSwitch = () => {
    if (isCurrentActive) return;

    if (isOwned) {
      switchVessel(selectedVesselId);
      addLog(
        language === "zh"
          ? `⚓ 已切换旗舰座驾至：${selectedSpec.name} (T${selectedSpec.tier})！`
          : `⚓ Flagship switched to ${selectedSpec.name} (T${selectedSpec.tier})!`
      );
    } else {
      if (purchaseVessel(selectedVesselId, selectedSpec.purchasePrice)) {
        switchVessel(selectedVesselId);
        addLog(
          language === "zh"
            ? `🎉 成功购置并启用新船：${selectedSpec.name}，花费 ${selectedSpec.purchasePrice.toLocaleString()} CR！`
            : `🎉 Acquired and commissioned ${selectedSpec.name} for ${selectedSpec.purchasePrice.toLocaleString()} CR!`
        );
      } else {
        addLog(
          language === "zh"
            ? "资金不足或未达船长等级解锁条件！"
            : "Insufficient funds or level requirement not met!",
          "WARN"
        );
      }
    }
  };

  const handleBuyUpgrade = (upgradeId: string) => {
    const upg = UPGRADE_CATALOG[upgradeId];
    if (!upg) return;

    const validation = canInstallUpgrade(
      activeSpec,
      activeVessel.installedUpgrades,
      upgradeId,
      credits
    );

    if (!validation.allowed) {
      const msg =
        validation.reason === "SLOTS_FULL"
          ? language === "zh"
            ? `改装槽位已满 (${activeVessel.installedUpgrades.length}/${maxSlots})！`
            : `Upgrade slots full (${activeVessel.installedUpgrades.length}/${maxSlots})!`
          : language === "zh"
          ? "资金不足或已安装该改装件！"
          : "Insufficient funds or upgrade already installed!";
      addLog(msg, "WARN");
      return;
    }

    if (deductCredits(upg.price)) {
      installUpgrade(upgradeId);
      const displayName = language === "zh" ? upg.name : upg.nameEn;
      addLog(
        language === "zh"
          ? `🔩 成功加装模块化改装件：${displayName}，花费 ${upg.price.toLocaleString()} CR。`
          : `🔩 Fitted modular upgrade: ${displayName} for ${upg.price.toLocaleString()} CR.`
      );
    }
  };

  const handleUnlockPerk = (perkId: string) => {
    const perk = CAPTAIN_PERK_MAP[perkId];
    if (!perk) return;
    if (unlockPerk(perkId)) {
      const displayName = language === "zh" ? perk.name : perk.nameEn;
      addLog(
        language === "zh"
          ? `🎖️ 已点亮船长专精技能：【${displayName}】！`
          : `🎖️ Unlocked Captain Perk: [${displayName}]!`
      );
    } else {
      addLog(
        language === "zh"
          ? "技能点数或船长等级不足，无法解锁该专精！"
          : "Insufficient perk points or captain level!",
        "WARN"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end md:items-center justify-center font-mono">
      <div className="bg-bridge-panel border-t md:border border-bridge-border rounded-t-2xl md:rounded-2xl w-full max-w-5xl max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden pb-safe animate-in slide-in-from-bottom duration-200">
        {/* 头部 */}
        <div className="px-4 py-3 md:px-6 md:py-4 bg-bridge-panelLight/60 border-b border-bridge-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <GameAsset
              assetKey="hud_shipyard"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg border border-bridge-accent/40 shrink-0 object-contain bg-[#0A1128]"
            />
            <div>
              <div className="text-sm md:text-base font-bold text-white leading-tight">
                {t.shipyard.title}
              </div>
              <div className="text-[10px] text-bridge-textMuted hidden sm:block">
                {t.shipyard.subtitle}
              </div>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-bridge-textMuted hover:text-white bg-bridge-panel border border-bridge-border"
          >
            <X size={16} />
          </button>
        </div>

        {/* 标签栏 */}
        <div className="flex border-b border-bridge-border px-4 md:px-6 pt-2 space-x-4 bg-bridge-panel shrink-0">
          <button
            onClick={() => setActiveTab("VESSELS")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "VESSELS"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <GameAsset
              assetKey="hud_depth_anchor"
              width={16}
              height={16}
              className="w-4 h-4 rounded-sm object-contain"
            />
            <span>{t.shipyard.tabVessels}</span>
          </button>
          <button
            onClick={() => setActiveTab("UPGRADES")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "UPGRADES"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <GameAsset
              assetKey="hud_shipyard"
              width={16}
              height={16}
              className="w-4 h-4 rounded-sm object-contain"
            />
            <span>
              {t.shipyard.tabUpgrades} ({activeVessel.installedUpgrades.length}/{maxSlots})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("PERKS")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "PERKS"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <GameAsset
              assetKey="hud_xp_badge"
              width={16}
              height={16}
              className="w-4 h-4 rounded-sm object-contain"
            />
            <span>
              {t.shipyard.tabPerks} ({availablePerkPoints})
            </span>
          </button>
        </div>

        {/* 主体 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === "VESSELS" && (
            <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">
              {/* 船只列表 */}
              <div className="md:col-span-1 space-y-1.5 md:space-y-2 md:border-r md:border-bridge-border md:pr-4">
                <div className="text-[11px] text-bridge-textMuted font-bold">
                  {t.shipyard.selectVessel}
                </div>
                <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-y-auto max-h-[16vh] md:max-h-[55vh] py-1 md:py-0 pr-1">
                  {vesselList.map((v) => {
                    const owned = ownedVesselIds.includes(v.vesselId);
                    const active = activeVessel.vesselId === v.vesselId;
                    const isSelected = selectedVesselId === v.vesselId;

                    return (
                      <div
                        key={v.vesselId}
                        onClick={() => setSelectedVesselId(v.vesselId)}
                        className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 min-w-[135px] md:min-w-0 ${
                          isSelected
                            ? "bg-bridge-accent/20 border-bridge-highlight shadow-sm"
                            : "bg-bridge-panelLight/40 border-bridge-border hover:bg-bridge-panelLight/70"
                        }`}
                      >
                        <div className="truncate w-full mr-1">
                          <div className="text-xs font-bold text-white flex items-center space-x-1 truncate">
                            <span className="text-[9px] px-1 py-0.2 rounded bg-bridge-panel border border-bridge-border text-bridge-highlight">
                              T{v.tier}
                            </span>
                            <span className="truncate">{v.name}</span>
                          </div>
                          <div className="text-[9px] text-bridge-textMuted mt-0.5">
                            {v.propulsion} · {v.dwtT}
                            {t.common.tons}
                          </div>
                        </div>

                        <div className="mt-1 md:mt-0 shrink-0">
                          {active ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-bridge-safe text-bridge-bg font-bold">
                              {t.shipyard.currentActive}
                            </span>
                          ) : owned ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-bridge-panelLight border border-bridge-safe/50 text-bridge-safe">
                              {t.shipyard.owned}
                            </span>
                          ) : (
                            <span className="text-[9px] text-amber-400 font-bold">
                              {Math.round(v.purchasePrice / 1000)}k CR
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 详情 */}
              <div className="md:col-span-2 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm md:text-lg font-bold text-white flex items-center space-x-2">
                        <span>{selectedSpec.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-bridge-accent/20 text-bridge-highlight border border-bridge-accent/40">
                          T{selectedSpec.tier} · {selectedSpec.propulsion}
                        </span>
                      </div>
                      <div className="text-[10px] text-bridge-textMuted mt-0.5">
                        {t.shipyard.unlockLevel}: LV.{selectedSpec.unlockLevel} ·{" "}
                        {t.shipyard.cargoVolume}: {selectedSpec.cargoVolumeM3}m³
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs md:text-sm font-bold text-amber-400">
                        {selectedSpec.purchasePrice.toLocaleString()} CR
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-24 md:h-32 bg-bridge-panelLight/40 rounded-xl border border-bridge-border flex items-center justify-center relative overflow-hidden">
                    <GameAsset
                      assetKey={selectedSpec.assetKey}
                      alt={selectedSpec.name}
                      className="w-16 h-20 md:w-20 md:h-28 object-contain"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="bg-bridge-panelLight/50 p-2 rounded-lg border border-bridge-border">
                      <div className="text-bridge-textMuted text-[10px]">
                        {t.shipyard.draftRange}
                      </div>
                      <div className="font-bold text-white mt-0.5">
                        {selectedSpec.lightDraftM}m ~ {selectedSpec.loadedDraftM}m
                      </div>
                    </div>
                    <div className="bg-bridge-panelLight/50 p-2 rounded-lg border border-bridge-border">
                      <div className="text-bridge-textMuted text-[10px]">
                        {t.shipyard.dwt}
                      </div>
                      <div className="font-bold text-bridge-highlight mt-0.5">
                        {selectedSpec.dwtT.toLocaleString()} {t.common.tons}
                      </div>
                    </div>
                    <div className="bg-bridge-panelLight/50 p-2 rounded-lg border border-bridge-border">
                      <div className="text-bridge-textMuted text-[10px]">
                        {t.shipyard.speedRange}
                      </div>
                      <div className="font-bold text-bridge-safe mt-0.5">
                        {selectedSpec.ecoSpeedKn} / {selectedSpec.maxSpeedKn}{" "}
                        {t.common.knots}
                      </div>
                    </div>
                    <div className="bg-bridge-panelLight/50 p-2 rounded-lg border border-bridge-border">
                      <div className="text-bridge-textMuted text-[10px]">
                        {t.shipyard.maxRange}
                      </div>
                      <div className="font-bold text-amber-400 mt-0.5">
                        {selectedSpec.theoreticalRangeNM.toLocaleString()}{" "}
                        {t.common.nauticalMiles}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-bridge-border flex items-center justify-between">
                  <div className="text-[10px] text-bridge-textMuted">
                    {!isLevelUnlocked && (
                      <span className="text-bridge-danger flex items-center space-x-1">
                        <Lock size={11} />
                        <span>
                          {t.shipyard.levelLocked} (LV.{level} / LV.
                          {selectedSpec.unlockLevel})
                        </span>
                      </span>
                    )}
                  </div>

                  <button
                    disabled={
                      !isLevelUnlocked ||
                      isCurrentActive ||
                      (!isOwned && credits < selectedSpec.purchasePrice)
                    }
                    onClick={handleBuyOrSwitch}
                    className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-bridge-accent text-bridge-bg font-bold text-xs hover:bg-bridge-highlight shadow-lg transition-all disabled:opacity-40"
                  >
                    {isCurrentActive
                      ? t.shipyard.currentActive
                      : isOwned
                      ? t.shipyard.switchBtn
                      : t.shipyard.buyBtn}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "UPGRADES" && (
            <div className="space-y-3">
              <div className="text-xs text-bridge-textMuted flex items-center justify-between">
                <span>
                  {t.shipyard.slotsUsed}:{" "}
                  <strong className="text-bridge-highlight">
                    {activeVessel.installedUpgrades.length} / {maxSlots}
                  </strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {UPGRADE_LIST.map((upg) => {
                  const isInstalled = activeVessel.installedUpgrades.some(
                    (u) => u.upgradeId === upg.upgradeId
                  );
                  const displayName = language === "zh" ? upg.name : upg.nameEn;
                  const displayDesc =
                    language === "zh" ? upg.description : upg.descriptionEn;

                  return (
                    <div
                      key={upg.upgradeId}
                      className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${
                        isInstalled
                          ? "bg-emerald-950/30 border-bridge-safe/60"
                          : "bg-bridge-panelLight/40 border-bridge-border"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <GameAsset
                          assetKey={upg.upgradeId}
                          alt={displayName}
                          width={44}
                          height={44}
                          className="w-11 h-11 rounded-xl border border-bridge-border/70 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span className="truncate">{displayName}</span>
                            <span className="text-amber-400 font-bold shrink-0 ml-2">
                              {upg.price.toLocaleString()} CR
                            </span>
                          </div>
                          <div className="text-[10px] text-bridge-textMuted mt-1">
                            {displayDesc}
                          </div>
                          <div className="text-[9px] text-bridge-highlight mt-1">
                            {t.shipyard.weightT}: {upg.weightT}t · {upg.category}
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={
                          isInstalled ||
                          activeVessel.installedUpgrades.length >= maxSlots ||
                          credits < upg.price
                        }
                        onClick={() => handleBuyUpgrade(upg.upgradeId)}
                        className={`self-end px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                          isInstalled
                            ? "bg-bridge-safe/20 text-bridge-safe border border-bridge-safe/40"
                            : "bg-bridge-accent/20 text-bridge-highlight border border-bridge-accent/40 hover:bg-bridge-accent hover:text-bridge-bg disabled:opacity-40"
                        }`}
                      >
                        {isInstalled && <Check size={12} />}
                        <span>
                          {isInstalled
                            ? t.shipyard.installed
                            : t.shipyard.purchaseUpgrade}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "PERKS" && (
            <div className="space-y-3">
              <div className="text-xs text-bridge-textMuted flex items-center justify-between">
                <span>
                  {t.shipyard.perkPoints}:{" "}
                  <strong className="text-bridge-safe">{availablePerkPoints}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CAPTAIN_PERK_LIST.map((perk) => {
                  const isUnlocked = unlockedPerkIds.includes(perk.perkId);
                  const canUnlock =
                    !isUnlocked &&
                    level >= perk.unlockLevel &&
                    availablePerkPoints >= perk.pointCost;
                  const displayName = language === "zh" ? perk.name : perk.nameEn;
                  const displayDesc =
                    language === "zh" ? perk.description : perk.descriptionEn;

                  return (
                    <div
                      key={perk.perkId}
                      className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${
                        isUnlocked
                          ? "bg-emerald-950/30 border-bridge-safe/60"
                          : "bg-bridge-panelLight/40 border-bridge-border"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <GameAsset
                          assetKey={perk.perkId}
                          alt={displayName}
                          width={44}
                          height={44}
                          className="w-11 h-11 rounded-xl border border-bridge-border/70 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span className="truncate">{displayName}</span>
                            <span className="text-[10px] text-bridge-highlight shrink-0 ml-2">
                              LV.{perk.unlockLevel} · {perk.pointCost} PT
                            </span>
                          </div>
                          <div className="text-[10px] text-bridge-textMuted mt-1">
                            {displayDesc}
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={!canUnlock}
                        onClick={() => handleUnlockPerk(perk.perkId)}
                        className={`self-end px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                          isUnlocked
                            ? "bg-bridge-safe/20 text-bridge-safe border border-bridge-safe/40"
                            : "bg-bridge-accent/20 text-bridge-highlight border border-bridge-accent/40 hover:bg-bridge-accent hover:text-bridge-bg disabled:opacity-40"
                        }`}
                      >
                        {isUnlocked && <Check size={12} />}
                        <span>
                          {isUnlocked
                            ? t.shipyard.perkUnlocked
                            : t.shipyard.unlockPerk}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
