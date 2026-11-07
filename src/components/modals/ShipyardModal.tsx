import React, { useState } from "react";
import { useGameStore } from "../../store";
import { VESSELS } from "../../config/vessels";
import { UPGRADES } from "../../config/upgrades";
import { X, Anchor, Lock, Cpu } from "lucide-react";
import { generateVesselSvg } from "../../assets/procedural/vesselSvg";
import { useTranslation } from "../../i18n";

export const ShipyardModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const credits = useGameStore((state) => state.playerCredits);
  const level = useGameStore((state) => state.playerLevel);
  const ownedVesselIds = useGameStore((state) => state.ownedVesselIds);
  const activeVessel = useGameStore((state) => state.activeVessel);
  const purchaseVessel = useGameStore((state) => state.purchaseVessel);
  const updateVesselState = useGameStore((state) => state.updateVesselState);
  const deductCredits = useGameStore((state) => state.deductCredits);
  const addLog = useGameStore((state) => state.addLog);
  const { t, language } = useTranslation();

  const [selectedVesselId, setSelectedVesselId] = useState<string>("V001");
  const [activeTab, setActiveTab] = useState<"VESSELS" | "UPGRADES">("VESSELS");

  if (activeModal !== "SHIPYARD") return null;

  const vesselList = Object.values(VESSELS);
  const selectedSpec = VESSELS[selectedVesselId] || vesselList[0];
  const isOwned = ownedVesselIds.includes(selectedVesselId);
  const isCurrentActive = activeVessel.vesselId === selectedVesselId;
  const isLevelUnlocked = level >= selectedSpec.unlockLevel;

  const handleBuyOrSwitch = () => {
    if (isCurrentActive) return;

    if (isOwned) {
      updateVesselState({
        vesselId: selectedVesselId,
        propulsionMode: selectedSpec.propulsion,
        currentDraftM: selectedSpec.lightDraftM,
        currentDisplacementT: selectedSpec.lightDisplacementT,
        cargoItems: [],
        cargoWeightT: 0,
        cargoVolumeM3: 0,
      });
      const msg = language === "zh"
        ? `已切换至座驾：${selectedSpec.name} (T${selectedSpec.tier})！`
        : `Flagship switched to ${selectedSpec.name} (T${selectedSpec.tier})!`;
      addLog(msg);
    } else {
      if (purchaseVessel(selectedVesselId, selectedSpec.purchasePrice)) {
        const msg = language === "zh"
          ? `成功购买新船：${selectedSpec.name}，扣除 ${selectedSpec.purchasePrice} CR！`
          : `Acquired vessel: ${selectedSpec.name}, debited ${selectedSpec.purchasePrice} CR!`;
        addLog(msg);
      } else {
        addLog(language === "zh" ? "资金不足或未达解锁条件！" : "Insufficient funds or level requirement not met!", "WARN");
      }
    }
  };

  const handleBuyUpgrade = (upgradeId: string) => {
    const upg = UPGRADES[upgradeId];
    if (!upg) return;

    if (deductCredits(upg.price)) {
      const msg = language === "zh"
        ? `为船舶加装模块化改装配件：${upg.name}，花费 ${upg.price} CR。`
        : `Fitted upgrade: ${upg.name} for ${upg.price} CR.`;
      addLog(msg);
    } else {
      addLog(language === "zh" ? "资金不足，无法购置该改装件！" : "Insufficient funds for upgrade!", "WARN");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end md:items-center justify-center font-mono">
      <div className="bg-bridge-panel border-t md:border border-bridge-border rounded-t-2xl md:rounded-2xl w-full max-w-5xl max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden pb-safe animate-in slide-in-from-bottom duration-200">
        {/* 头部 */}
        <div className="px-4 py-3 md:px-6 md:py-4 bg-bridge-panelLight/60 border-b border-bridge-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-bridge-accent/20 border border-bridge-accent/40 flex items-center justify-center text-bridge-highlight shrink-0">
              <Anchor size={18} />
            </div>
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
            className="p-1 rounded-lg text-bridge-textMuted hover:text-white bg-bridge-panel border border-bridge-border"
          >
            <X size={16} />
          </button>
        </div>

        {/* 标签栏 */}
        <div className="flex border-b border-bridge-border px-4 md:px-6 pt-2 space-x-3 bg-bridge-panel shrink-0">
          <button
            onClick={() => setActiveTab("VESSELS")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "VESSELS"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <Anchor size={13} />
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
            <Cpu size={13} />
            <span>{t.shipyard.tabUpgrades}</span>
          </button>
        </div>

        {/* 主体 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === "VESSELS" ? (
            <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">
              {/* 船只列表 */}
              <div className="md:col-span-1 space-y-1.5 md:space-y-2 md:border-r md:border-bridge-border md:pr-4">
                <div className="text-[11px] text-bridge-textMuted font-bold">{t.shipyard.selectVessel}</div>
                <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-y-auto max-h-[14vh] md:max-h-[55vh] py-1 md:py-0 pr-1">
                  {vesselList.map((v) => {
                    const owned = ownedVesselIds.includes(v.vesselId);
                    const active = activeVessel.vesselId === v.vesselId;
                    const isSelected = selectedVesselId === v.vesselId;

                    return (
                      <div
                        key={v.vesselId}
                        onClick={() => setSelectedVesselId(v.vesselId)}
                        className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 min-w-[130px] md:min-w-0 ${
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
                            {v.propulsion} · {v.dwtT}{t.common.tons}
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
                        {t.shipyard.unlockLevel}: LV.{selectedSpec.unlockLevel} · {t.shipyard.cargoVolume}: {selectedSpec.cargoVolumeM3}m³
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs md:text-sm font-bold text-amber-400">
                        {selectedSpec.purchasePrice.toLocaleString()} CR
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-24 md:h-32 bg-bridge-panelLight/40 rounded-xl border border-bridge-border flex items-center justify-center relative overflow-hidden">
                    <div
                      className="w-16 h-20 md:w-20 md:h-28 flex items-center justify-center"
                      dangerouslySetInnerHTML={{
                        __html: generateVesselSvg(selectedSpec.tier, selectedSpec.propulsion),
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="bg-bridge-panelLight/50 p-2 rounded-lg border border-bridge-border">
                      <div className="text-bridge-textMuted text-[10px]">{t.shipyard.draftRange}</div>
                      <div className="font-bold text-white mt-0.5">
                        {selectedSpec.lightDraftM}m ~ {selectedSpec.loadedDraftM}m
                      </div>
                    </div>
                    <div className="bg-bridge-panelLight/50 p-2 rounded-lg border border-bridge-border">
                      <div className="text-bridge-textMuted text-[10px]">{t.shipyard.dwt}</div>
                      <div className="font-bold text-bridge-highlight mt-0.5">
                        {selectedSpec.dwtT.toLocaleString()} {t.common.tons}
                      </div>
                    </div>
                    <div className="bg-bridge-panelLight/50 p-2 rounded-lg border border-bridge-border">
                      <div className="text-bridge-textMuted text-[10px]">{t.shipyard.speedRange}</div>
                      <div className="font-bold text-bridge-safe mt-0.5">
                        {selectedSpec.ecoSpeedKn} / {selectedSpec.maxSpeedKn} {t.common.knots}
                      </div>
                    </div>
                    <div className="bg-bridge-panelLight/50 p-2 rounded-lg border border-bridge-border">
                      <div className="text-bridge-textMuted text-[10px]">{t.shipyard.maxRange}</div>
                      <div className="font-bold text-amber-400 mt-0.5">
                        {selectedSpec.theoreticalRangeNM.toLocaleString()} {t.common.nauticalMiles}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-bridge-border flex items-center justify-between">
                  <div className="text-[10px] text-bridge-textMuted">
                    {!isLevelUnlocked && (
                      <span className="text-bridge-danger flex items-center space-x-1">
                        <Lock size={11} />
                        <span>{t.shipyard.levelLocked} (LV.{level} / LV.{selectedSpec.unlockLevel})</span>
                      </span>
                    )}
                  </div>

                  <button
                    disabled={!isLevelUnlocked || isCurrentActive || (!isOwned && credits < selectedSpec.purchasePrice)}
                    onClick={handleBuyOrSwitch}
                    className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-bridge-accent text-bridge-bg font-bold text-xs hover:bg-bridge-highlight shadow-lg transition-all disabled:opacity-40"
                  >
                    {isCurrentActive ? t.shipyard.currentActive : isOwned ? t.shipyard.switchBtn : t.shipyard.buyBtn}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(UPGRADES).map((upg) => (
                <div
                  key={upg.upgradeId}
                  className="bg-bridge-panelLight/40 p-3 rounded-xl border border-bridge-border flex flex-col justify-between space-y-2"
                >
                  <div>
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{upg.name}</span>
                      <span className="text-amber-400 font-bold">{upg.price.toLocaleString()} CR</span>
                    </div>
                    <div className="text-[10px] text-bridge-textMuted mt-1">{upg.description}</div>
                  </div>

                  <button
                    onClick={() => handleBuyUpgrade(upg.upgradeId)}
                    className="self-end px-3 py-1.5 rounded-lg bg-bridge-accent/20 text-bridge-highlight border border-bridge-accent/40 text-xs font-bold"
                  >
                    {t.shipyard.purchaseUpgrade}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
