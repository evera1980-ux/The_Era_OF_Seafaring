import React, { useState } from "react";
import { useGameStore } from "../../store";
import { X, Check } from "lucide-react";
import { useTranslation } from "../../i18n";
import { calculateDistanceNM } from "../../core/physics/navigation";
import { GameAsset } from "../common/GameAsset";

export const AISDetailModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const selectedAISTargetId = useGameStore((state) => state.selectedAISTargetId);
  const activeVessel = useGameStore((state) => state.activeVessel);
  const aisTargets = useGameStore((state) => state.aisTargets);
  const collectedAISIds = useGameStore((state) => state.collectedAISIds);
  const collectAISTarget = useGameStore((state) => state.collectAISTarget);
  const addXP = useGameStore((state) => state.addXP);
  const addLog = useGameStore((state) => state.addLog);
  const { t, language } = useTranslation();

  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);

  if (activeModal !== "AIS_DETAIL") return null;

  const effectiveId = localSelectedId || selectedAISTargetId;
  const target =
    aisTargets.find((item) => item.targetId === effectiveId) || aisTargets[0];

  const handleVHFContact = () => {
    if (!target) return;
    const callMsg = `[VHF CH16] Calling ${target.vesselName}: "This is ${activeVessel.vesselId} on your bow, request passing arrangement."`;
    addLog(callMsg, "INFO");
    setTimeout(() => {
      const respMsg = `[VHF CH16] ${target.vesselName}: "Roger, maintain course and speed. Safe passage, captain."`;
      addLog(respMsg, "INFO");
    }, 900);
  };

  const handleSpotShip = () => {
    if (!target) return;
    const xpReward =
      target.vesselType === "Icebreaker" || target.vesselType === "Research"
        ? 300
        : 150;
    if (collectAISTarget(target.targetId)) {
      addXP(xpReward);
      addLog(
        language === "zh"
          ? `📸 成功收录船舶图鉴：【${target.vesselName}】(MMSI: ${target.mmsi})，获得 +${xpReward} SXP！`
          : `📸 Ship Spotted & Logged: [${target.vesselName}] (MMSI: ${target.mmsi}), +${xpReward} SXP!`
      );
    }
  };

  const isSpotted = target ? collectedAISIds.includes(target.targetId) : false;
  const targetDistanceNM = target
    ? Math.round(calculateDistanceNM(activeVessel.position, target.position) * 10) / 10
    : 0;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end md:items-center justify-center font-mono">
      <div className="bg-bridge-panel border-t md:border border-bridge-border rounded-t-2xl md:rounded-2xl w-full max-w-2xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden pb-safe animate-in slide-in-from-bottom duration-200">
        <div className="px-4 py-3 md:px-6 md:py-4 bg-bridge-panelLight/60 border-b border-bridge-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 text-amber-400">
            <GameAsset
              assetKey="hud_ais_radar"
              width={24}
              height={24}
              className="w-6 h-6 rounded-md object-contain"
            />
            <div>
              <div className="text-sm md:text-base font-bold text-white">
                {t.ais.title}
              </div>
              <div className="text-[10px] text-bridge-textMuted">
                {t.ais.subtitle} ({collectedAISIds.length}/{aisTargets.length})
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

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* 船队快速切换条 */}
          {aisTargets.length > 0 && (
            <div>
              <div className="text-[10px] text-bridge-textMuted font-bold mb-1.5">
                {t.ais.fleetList} ({aisTargets.length})
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {aisTargets.map((item) => {
                  const dist = Math.round(
                    calculateDistanceNM(activeVessel.position, item.position)
                  );
                  const active = target?.targetId === item.targetId;
                  const spotted = collectedAISIds.includes(item.targetId);
                  return (
                    <button
                      key={item.targetId}
                      onClick={() => setLocalSelectedId(item.targetId)}
                      className={`px-2.5 py-1.5 rounded-lg border text-left shrink-0 transition-all ${
                        active
                          ? "bg-amber-400/20 border-amber-400 text-white"
                          : "bg-bridge-panelLight/40 border-bridge-border text-bridge-textMuted"
                      }`}
                    >
                      <div className="text-[10px] font-bold flex items-center space-x-1">
                        <GameAsset
                          assetKey="hud_ais_marker"
                          width={14}
                          height={14}
                          className="w-3.5 h-3.5 rounded-sm object-contain"
                        />
                        <span>{item.vesselName.substring(0, 12)}</span>
                        {spotted && <span className="text-bridge-safe">✓</span>}
                      </div>
                      <div className="text-[9px] text-amber-400">{dist} NM</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {target ? (
            <div className="space-y-4">
              <div className="bg-bridge-panelLight/40 p-3.5 rounded-xl border border-bridge-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm md:text-base font-bold text-white flex items-center space-x-2">
                    <GameAsset
                      assetKey={
                        target.vesselType === "Tanker"
                          ? "V008"
                          : target.vesselType === "Sailboat"
                          ? "V003"
                          : target.vesselType === "BulkCarrier"
                          ? "V009"
                          : "V007"
                      }
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-lg border border-bridge-border object-contain bg-[#0A1128]"
                    />
                    <span>{target.vesselName}</span>
                  </div>
                  <div className="text-[10px] px-2 py-0.5 rounded bg-bridge-bg text-bridge-highlight border border-bridge-border">
                    {target.vesselType}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-bridge-textMuted pt-1">
                  <div>
                    MMSI: <span className="text-white font-bold">{target.mmsi}</span>
                  </div>
                  <div>
                    IMO:{" "}
                    <span className="text-white font-bold">
                      {target.imo ?? "N/A"}
                    </span>
                  </div>
                  <div>
                    {t.hud.sog}:{" "}
                    <span className="text-bridge-safe font-bold">
                      {Number(target.sogKn).toFixed(1)} {t.common.knots}
                    </span>
                  </div>
                  <div>
                    {t.hud.cog}:{" "}
                    <span className="text-amber-400 font-bold">
                      {Math.round(target.cogDeg)}°
                    </span>
                  </div>
                  <div>
                    {t.ais.draft}:{" "}
                    <span className="text-white font-bold">
                      {target.draftM != null ? Number(target.draftM).toFixed(1) : "N/A"}{" "}
                      {t.common.meter}
                    </span>
                  </div>
                  <div>
                    {t.ais.destination}:{" "}
                    <span className="text-bridge-highlight font-bold">
                      {target.destinationPort ?? "SEA TRIAL"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    {t.ais.distanceNM}:{" "}
                    <span className="text-bridge-safe font-bold">
                      {targetDistanceNM} {t.common.nauticalMiles}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleVHFContact}
                  className="w-full py-3 rounded-xl bg-bridge-accent text-bridge-bg font-bold text-xs hover:bg-bridge-highlight transition-all flex items-center justify-center space-x-2"
                >
                  <GameAsset
                    assetKey="hud_ais_radar"
                    width={16}
                    height={16}
                    className="w-4 h-4 rounded-sm object-contain"
                  />
                  <span>{t.ais.vhfCall}</span>
                </button>

                <button
                  disabled={isSpotted}
                  onClick={handleSpotShip}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                    isSpotted
                      ? "bg-bridge-safe/20 text-bridge-safe border border-bridge-safe/40"
                      : "bg-amber-400 text-bridge-bg hover:bg-amber-300"
                  }`}
                >
                  {isSpotted ? (
                    <Check size={14} />
                  ) : (
                    <GameAsset
                      assetKey="hud_xp_badge"
                      width={16}
                      height={16}
                      className="w-4 h-4 rounded-sm object-contain"
                    />
                  )}
                  <span>
                    {isSpotted ? t.ais.spotted : `${t.ais.spotShipBtn} (+150 SXP)`}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-bridge-textMuted text-center py-6">
              {t.ais.noTargets}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
