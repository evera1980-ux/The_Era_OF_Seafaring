import React, { useState } from "react";
import { useGameStore } from "../../store";
import { PORTS } from "../../config/ports";
import { COMMODITIES } from "../../config/commodities";
import { VESSELS } from "../../config/vessels";
import { X, Fuel, Droplets, Utensils, Wrench, Package, Shield, MapPin } from "lucide-react";
import { useTranslation } from "../../i18n";
import { calculateDistanceNM } from "../../core/physics/navigation";
import { calculateSellPricePerT, calculateStockFactor } from "../../core/economy/trade";
import { calculateDrydockRepairCost } from "../../core/economy/maintenance";
import { calculateEffectiveCargoCapacityT } from "../../core/economy/upgrades";
import { aggregateVesselBonuses } from "../../core/simulation/tick";
import { makeCredits } from "../../types";
import { GAME_BALANCE } from "../../config/gameBalance";

export const PortTradeModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const selectedPortId = useGameStore((state) => state.selectedPortId) || "CNSHA";
  const openModal = useGameStore((state) => state.openModal);
  const closeModal = useGameStore((state) => state.closeModal);

  const credits = useGameStore((state) => state.playerCredits);
  const addCredits = useGameStore((state) => state.addCredits);
  const deductCredits = useGameStore((state) => state.deductCredits);
  const addXP = useGameStore((state) => state.addXP);
  const activeVessel = useGameStore((state) => state.activeVessel);
  const departurePortId = useGameStore((state) => state.departurePortId);
  const setDeparturePort = useGameStore((state) => state.setDeparturePort);
  const unlockedPerkIds = useGameStore((state) => state.unlockedPerkIds);
  const currentWeather = useGameStore((state) => state.currentWeather);
  const discoverPort = useGameStore((state) => state.discoverPort);
  const refuel = useGameStore((state) => state.refuel);
  const replenishWater = useGameStore((state) => state.replenishWater);
  const replenishRations = useGameStore((state) => state.replenishRations);
  const replenishSpareParts = useGameStore((state) => state.replenishSpareParts);
  const repairHull = useGameStore((state) => state.repairHull);
  const addCargoItem = useGameStore((state) => state.addCargoItem);
  const removeCargoItem = useGameStore((state) => state.removeCargoItem);
  const addLog = useGameStore((state) => state.addLog);
  const { t, language } = useTranslation();

  const portTradeTab = useGameStore((state) => state.portTradeTab);
  const [activeTab, setActiveTab] = useState<"COMMODITIES" | "SUPPLIES" | "REPAIR">(
    portTradeTab || "COMMODITIES"
  );
  const [feedback, setFeedback] = useState<{
    text: string;
    type: "SUCCESS" | "INFO" | "WARN";
  } | null>(null);

  React.useEffect(() => {
    if (activeModal === "PORT_TRADE" && portTradeTab) {
      setActiveTab(portTradeTab);
    }
  }, [activeModal, portTradeTab]);

  if (activeModal !== "PORT_TRADE") return null;

  const port = PORTS[selectedPortId] || PORTS["CNSHA"];
  const departurePort = PORTS[departurePortId] || PORTS["CNSHA"];
  const vesselSpec = VESSELS[activeVessel.vesselId] ?? VESSELS.V001;
  const bonuses = aggregateVesselBonuses(activeVessel, unlockedPerkIds);
  const { effectiveCapacityT } = calculateEffectiveCargoCapacityT(
    vesselSpec,
    activeVessel.installedUpgrades,
    bonuses.cargoCapacityBonusFraction
  );

  const effectiveFuelCap = Math.max(
    2.0,
    Math.round((vesselSpec.fuelCapacityT + bonuses.fuelCapacityBonusT) * 10) / 10
  );
  const effectiveWaterCap = vesselSpec.waterCapacityT;
  const effectiveRationCap = vesselSpec.rationCapacityT;
  const effectivePartsCap = vesselSpec.sparePartsCapacityT;

  const showFeedback = (
    text: string,
    type: "SUCCESS" | "INFO" | "WARN" = "SUCCESS"
  ) => {
    setFeedback({ text, type });
  };

  // 计算起运港至当前港口的球面航程距离 (NM)
  const voyageDistanceNM = Math.round(
    calculateDistanceNM(departurePort.position, port.position)
  );
  const experiencedStorm = currentWeather.beaufortScale >= 7;

  const buyFuel = (amountT: number, silentIfFull = false): boolean => {
    const missing = Math.max(0, effectiveFuelCap - activeVessel.supplies.fuelT);
    const actualT = Math.round(Math.min(amountT, missing) * 100) / 100;
    if (actualT <= 0.001) {
      if (!silentIfFull) {
        showFeedback(
          language === "zh"
            ? `✅ 燃油舱已达 100% 满载状态 (${activeVessel.supplies.fuelT.toFixed(1)} / ${effectiveFuelCap}t)，无需补充。`
            : `✅ Fuel tank is already 100% full (${activeVessel.supplies.fuelT.toFixed(1)} / ${effectiveFuelCap}t).`,
          "INFO"
        );
      }
      return false;
    }
    const cost = Math.max(1, Math.round(actualT * (port.fuelPricePerL * 1176.47)));
    if (deductCredits(cost)) {
      refuel(actualT);
      const msg =
        language === "zh"
          ? `⛽ 在 ${port.name} 加注 +${actualT.toFixed(1)}t 燃油，花费 ${cost} CR。`
          : `⛽ Bunkered +${actualT.toFixed(1)}t fuel at ${port.name} for ${cost} CR.`;
      addLog(msg);
      if (!silentIfFull) showFeedback(msg, "SUCCESS");
      return true;
    } else {
      const warnMsg =
        language === "zh" ? "⚠️ 资金不足以采购燃油！" : "⚠️ Insufficient credits for fuel!";
      addLog(warnMsg, "WARN");
      showFeedback(warnMsg, "WARN");
      return false;
    }
  };

  const buyWater = (amountT: number, silentIfFull = false): boolean => {
    const missing = Math.max(
      0,
      effectiveWaterCap - activeVessel.supplies.freshWaterT
    );
    const actualT = Math.round(Math.min(amountT, missing) * 100) / 100;
    if (actualT <= 0.001) {
      if (!silentIfFull) {
        showFeedback(
          language === "zh"
            ? `✅ 淡水舱已达 100% 满载状态 (${activeVessel.supplies.freshWaterT.toFixed(1)} / ${effectiveWaterCap}t)，无需补充。`
            : `✅ Fresh water tank is already 100% full (${activeVessel.supplies.freshWaterT.toFixed(1)} / ${effectiveWaterCap}t).`,
          "INFO"
        );
      }
      return false;
    }
    const cost = Math.max(1, Math.round(actualT * port.freshWaterPricePerT));
    if (deductCredits(cost)) {
      replenishWater(actualT);
      const msg =
        language === "zh"
          ? `💧 在 ${port.name} 补充 +${actualT.toFixed(1)}t 淡水，花费 ${cost} CR。`
          : `💧 Supplied +${actualT.toFixed(1)}t water at ${port.name} for ${cost} CR.`;
      addLog(msg);
      if (!silentIfFull) showFeedback(msg, "SUCCESS");
      return true;
    } else {
      const warnMsg =
        language === "zh" ? "⚠️ 资金不足以补充淡水！" : "⚠️ Insufficient credits for fresh water!";
      addLog(warnMsg, "WARN");
      showFeedback(warnMsg, "WARN");
      return false;
    }
  };

  const buyRation = (amountT: number, silentIfFull = false): boolean => {
    const missing = Math.max(
      0,
      effectiveRationCap - activeVessel.supplies.rationT
    );
    const actualT = Math.round(Math.min(amountT, missing) * 100) / 100;
    if (actualT <= 0.001) {
      if (!silentIfFull) {
        showFeedback(
          language === "zh"
            ? `✅ 口粮库已达 100% 满载状态 (${activeVessel.supplies.rationT.toFixed(1)} / ${effectiveRationCap}t)，无需补充。`
            : `✅ Rations store is already 100% full (${activeVessel.supplies.rationT.toFixed(1)} / ${effectiveRationCap}t).`,
          "INFO"
        );
      }
      return false;
    }
    const cost = Math.max(1, Math.round(actualT * port.rationPricePerT));
    if (deductCredits(cost)) {
      replenishRations(actualT);
      const msg =
        language === "zh"
          ? `🍱 在 ${port.name} 补充 +${actualT.toFixed(1)}t 口粮，花费 ${cost} CR。`
          : `🍱 Provisioned +${actualT.toFixed(1)}t rations at ${port.name} for ${cost} CR.`;
      addLog(msg);
      if (!silentIfFull) showFeedback(msg, "SUCCESS");
      return true;
    } else {
      const warnMsg =
        language === "zh" ? "⚠️ 资金不足以补充口粮！" : "⚠️ Insufficient credits for rations!";
      addLog(warnMsg, "WARN");
      showFeedback(warnMsg, "WARN");
      return false;
    }
  };

  const buySpareParts = (amountT: number, silentIfFull = false): boolean => {
    const missing = Math.max(
      0,
      effectivePartsCap - activeVessel.supplies.sparePartsT
    );
    const actualT = Math.round(Math.min(amountT, missing) * 100) / 100;
    if (actualT <= 0.001) {
      if (!silentIfFull) {
        showFeedback(
          language === "zh"
            ? `✅ 备件库已达 100% 满载状态 (${activeVessel.supplies.sparePartsT.toFixed(1)} / ${effectivePartsCap}t)，无需补充。`
            : `✅ Spare parts locker is already 100% full (${activeVessel.supplies.sparePartsT.toFixed(1)} / ${effectivePartsCap}t).`,
          "INFO"
        );
      }
      return false;
    }
    const cost = Math.max(1, Math.round(actualT * port.sparePartsPricePerT));
    if (deductCredits(cost)) {
      replenishSpareParts(actualT);
      const msg =
        language === "zh"
          ? `🔧 在 ${port.name} 补充 +${actualT.toFixed(1)}t 备件，花费 ${cost} CR。`
          : `🔧 Acquired +${actualT.toFixed(1)}t spare parts at ${port.name} for ${cost} CR.`;
      addLog(msg);
      if (!silentIfFull) showFeedback(msg, "SUCCESS");
      return true;
    } else {
      const warnMsg =
        language === "zh" ? "⚠️ 资金不足以补充备件！" : "⚠️ Insufficient credits for spare parts!";
      addLog(warnMsg, "WARN");
      showFeedback(warnMsg, "WARN");
      return false;
    }
  };

  const handleFillAllSupplies = () => {
    const f = buyFuel(effectiveFuelCap, true);
    const w = buyWater(effectiveWaterCap, true);
    const r = buyRation(effectiveRationCap, true);
    const p = buySpareParts(effectivePartsCap, true);

    if (f || w || r || p) {
      const msg =
        language === "zh"
          ? `⚡ 已在 ${port.name} 一键补满全船四项航行物资（燃油/淡水/口粮/备件 100%）！`
          : `⚡ All vessel supplies (Fuel, Water, Rations, Spare Parts) topped up to 100% at ${port.name}!`;
      addLog(msg);
      showFeedback(msg, "SUCCESS");
    } else {
      showFeedback(
        language === "zh"
          ? "✅ 全船所有物资（燃油/淡水/口粮/备件）均已处于 100% 满载状态！"
          : "✅ All vessel supplies are already at 100% capacity!",
        "INFO"
      );
    }
  };

  const handleBuyCommodity = (commId: string, requestedTons: number) => {
    const commSpec = COMMODITIES[commId];
    if (!commSpec) return;

    const remainingPayload = Math.max(0, effectiveCapacityT - activeVessel.cargoWeightT);
    if (remainingPayload < 0.5) {
      addLog(
        language === "zh"
          ? "船只货舱有效载重已达上限！无法装载更多货物。"
          : "Vessel effective deadweight capacity reached!",
        "WARN"
      );
      return;
    }

    const portComm = port.commodities.find((c) => c.commodityId === commId);
    const unitBuyPrice = portComm ? portComm.buyPricePerT : commSpec.basePricePerT;
    const maxAffordableTons = Math.floor(credits / unitBuyPrice);
    const buyTons = Math.min(
      requestedTons,
      Math.floor(remainingPayload),
      Math.max(1, maxAffordableTons)
    );

    if (buyTons < 1) {
      addLog(
        language === "zh" ? "资金或舱容不足！" : "Insufficient credits or hold space!",
        "WARN"
      );
      return;
    }

    const totalCost = Math.round(unitBuyPrice * buyTons);
    if (deductCredits(totalCost)) {
      addCargoItem({
        cargoId: `cargo_${Date.now()}_${commId}`,
        commodityId: commId,
        quantityT: buyTons,
        volumeM3: Math.round(buyTons * commSpec.volumeM3PerT * 10) / 10,
        unitBuyPrice: makeCredits(unitBuyPrice),
        quality: commSpec.category === "Refrigerated" ? "REFRIGERATED" : "STANDARD",
        integrity: 100,
        refrigerated: commSpec.category === "Refrigerated",
      });
      setDeparturePort(port.portId);
      discoverPort(port.portId);
      addLog(
        language === "zh"
          ? `在 ${port.name} 装载 ${buyTons}t ${commSpec.name}，单价 ${unitBuyPrice} CR/t。`
          : `Loaded ${buyTons}t ${commSpec.name} at ${port.name} (${unitBuyPrice} CR/t).`
      );
    } else {
      addLog(
        language === "zh" ? "资金不足，无法购入该商品！" : "Insufficient credits!",
        "WARN"
      );
    }
  };

  const handleSellCargo = (
    cargoId: string,
    commId: string,
    quantityT: number,
    unitBuyPrice: number
  ) => {
    const commSpec = COMMODITIES[commId];
    if (!commSpec) return;

    const portComm = port.commodities.find((c) => c.commodityId === commId);
    const stockFactor = portComm
      ? calculateStockFactor(portComm.stockT, portComm.maxStockT)
      : 1.08;

    const rawSellUnitPrice = calculateSellPricePerT(
      commId,
      voyageDistanceNM,
      experiencedStorm,
      stockFactor
    );
    const finalUnitPrice = Math.round(
      rawSellUnitPrice * (1 + bonuses.tradeSellBonusFraction)
    );
    const revenue = Math.round(finalUnitPrice * quantityT);
    const netProfit = Math.max(0, revenue - unitBuyPrice * quantityT);
    const profitXP = Math.round(netProfit * GAME_BALANCE.XP_PER_PROFIT_CREDITS * 10) / 10;

    addCredits(revenue);
    if (profitXP > 0) addXP(profitXP);
    removeCargoItem(cargoId);
    discoverPort(port.portId);

    addLog(
      language === "zh"
        ? `💰 在 ${port.name} 交割 ${quantityT}t ${commSpec.name} (航程 ${voyageDistanceNM} NM)，收入 ${revenue.toLocaleString()} CR，获利经验 +${profitXP} SXP！`
        : `💰 Discharged ${quantityT}t ${commSpec.name} at ${port.name} (${voyageDistanceNM} NM) for ${revenue.toLocaleString()} CR (+${profitXP} SXP)!`
    );
  };

  const missingHullHp = Math.max(0, activeVessel.hullHpMax - activeVessel.hullHp);
  const repair10PctHp = Math.min(1000, missingHullHp);
  const cost10Pct = calculateDrydockRepairCost(repair10PctHp, vesselSpec.tier);
  const costFullRepair = calculateDrydockRepairCost(missingHullHp, vesselSpec.tier);

  const handleDrydockRepair = (hpAmount: number, cost: number) => {
    if (hpAmount <= 0) return;
    if (deductCredits(cost)) {
      repairHull(hpAmount);
      addLog(
        language === "zh"
          ? `🛠️ 船坞修复完成：恢复 ${Math.round(hpAmount / 100)}% 船体结构，花费 ${cost} CR。`
          : `🛠️ Drydock repair complete: restored ${Math.round(hpAmount / 100)}% Hull HP for ${cost} CR.`
      );
    } else {
      addLog(
        language === "zh" ? "资金不足以支付船坞修理费！" : "Insufficient credits for drydock repair!",
        "WARN"
      );
    }
  };

  // 构建当前港口优先特产 + 全球大宗商品列表
  const portSpecialtyIds = new Set(port.commodities.map((c) => c.commodityId));
  const sortedCommodities = [
    ...Object.values(COMMODITIES).filter((c) => portSpecialtyIds.has(c.commodityId)),
    ...Object.values(COMMODITIES).filter((c) => !portSpecialtyIds.has(c.commodityId)),
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end md:items-center justify-center font-mono">
      <div className="bg-bridge-panel border-t md:border border-bridge-border rounded-t-2xl md:rounded-2xl w-full max-w-4xl max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden pb-safe animate-in slide-in-from-bottom duration-200">
        {/* 头部 + 港口快切下拉 */}
        <div className="px-4 py-3 md:px-6 md:py-4 bg-bridge-panelLight/60 border-b border-bridge-border flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-bridge-safe/20 border border-bridge-safe/40 flex items-center justify-center text-bridge-safe text-sm shrink-0">
              ⚓
            </div>
            <div className="min-w-0">
              <div className="text-sm md:text-base font-bold text-white flex items-center space-x-1.5">
                <span className="truncate">{port.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-bridge-accent/20 text-bridge-highlight shrink-0">
                  {port.unlocode}
                </span>
              </div>
              <div className="text-[10px] text-bridge-textMuted truncate">
                {t.trade.maxDraft}: {port.maxAllowedDraftM}
                {t.common.meter} · {t.trade.portFee}: {port.portFeeCredits} CR ·{" "}
                {t.trade.distanceBonus}: {voyageDistanceNM} NM
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <select
              value={port.portId}
              onChange={(e) => openModal("PORT_TRADE", { portId: e.target.value })}
              className="bg-bridge-bg border border-bridge-border rounded-lg px-2 py-1 text-[10px] text-bridge-highlight font-bold focus:outline-none"
            >
              {Object.values(PORTS).map((p) => (
                <option key={p.portId} value={p.portId}>
                  {p.unlocode} - {p.name.split(" ")[0]}
                </option>
              ))}
            </select>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg text-bridge-textMuted hover:text-white bg-bridge-panel border border-bridge-border"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 标签栏 */}
        <div className="flex border-b border-bridge-border px-4 md:px-6 pt-2 space-x-4 bg-bridge-panel shrink-0">
          <button
            onClick={() => setActiveTab("COMMODITIES")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "COMMODITIES"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <Package size={13} />
            <span>{t.trade.tabCommodities}</span>
          </button>
          <button
            onClick={() => setActiveTab("SUPPLIES")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "SUPPLIES"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <Fuel size={13} />
            <span>{t.trade.tabSupplies}</span>
          </button>
          <button
            onClick={() => setActiveTab("REPAIR")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === "REPAIR"
                ? "border-bridge-highlight text-bridge-highlight"
                : "border-transparent text-bridge-textMuted hover:text-white"
            }`}
          >
            <Shield size={13} />
            <span>{t.trade.tabRepair}</span>
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {feedback && (
            <div
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between animate-in fade-in duration-150 ${
                feedback.type === "SUCCESS"
                  ? "bg-emerald-950/80 border-bridge-safe text-bridge-safe"
                  : feedback.type === "WARN"
                  ? "bg-red-950/80 border-bridge-danger text-bridge-danger"
                  : "bg-sky-950/80 border-bridge-highlight text-bridge-highlight"
              }`}
            >
              <span>{feedback.text}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="ml-3 text-[10px] opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {activeTab === "COMMODITIES" && (
            <div className="space-y-4">
              {/* 当前船上货舱清单 */}
              <div>
                <h3 className="text-xs font-bold text-bridge-textMuted mb-1.5 flex items-center justify-between">
                  <span>
                    {t.trade.cargoHold} ({activeVessel.cargoWeightT.toFixed(1)} /{" "}
                    {effectiveCapacityT}
                    {t.common.tons})
                  </span>
                  <span className="text-bridge-highlight text-[10px]">
                    <MapPin size={10} className="inline mr-1" />
                    {departurePort.unlocode} ➔ {port.unlocode} ({voyageDistanceNM} NM)
                  </span>
                </h3>
                {activeVessel.cargoItems.length === 0 ? (
                  <div className="text-xs text-bridge-textMuted bg-bridge-panelLight/30 p-3 rounded-lg border border-dashed border-bridge-border text-center">
                    {t.trade.cargoEmpty}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeVessel.cargoItems.map((c) => {
                      const comm = COMMODITIES[c.commodityId];
                      const portComm = port.commodities.find(
                        (pc) => pc.commodityId === c.commodityId
                      );
                      const stockFactor = portComm
                        ? calculateStockFactor(portComm.stockT, portComm.maxStockT)
                        : 1.08;
                      const estUnitSell = Math.round(
                        calculateSellPricePerT(
                          c.commodityId,
                          voyageDistanceNM,
                          experiencedStorm,
                          stockFactor
                        ) *
                          (1 + bonuses.tradeSellBonusFraction)
                      );
                      const estTotal = Math.round(estUnitSell * c.quantityT);

                      return (
                        <div
                          key={c.cargoId}
                          className="bg-bridge-panelLight/50 p-2.5 rounded-lg border border-bridge-border flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-bold text-white">
                              {comm?.name}
                            </div>
                            <div className="text-[10px] text-bridge-textMuted">
                              {c.quantityT}
                              {t.common.tons} · IN {c.unitBuyPrice} CR/t ➔ OUT{" "}
                              <span className="text-bridge-safe font-bold">
                                {estUnitSell} CR/t
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleSellCargo(
                                c.cargoId,
                                c.commodityId,
                                c.quantityT,
                                c.unitBuyPrice
                              )
                            }
                            className="px-3 py-1.5 rounded bg-bridge-safe text-bridge-bg hover:bg-emerald-400 text-xs font-bold shrink-0"
                          >
                            {t.trade.sellBtn} (+{estTotal.toLocaleString()} CR)
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 港口大宗商品挂牌市场 */}
              <div>
                <h3 className="text-xs font-bold text-bridge-textMuted mb-2">
                  {t.trade.marketList}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sortedCommodities.map((comm) => {
                    const portComm = port.commodities.find(
                      (pc) => pc.commodityId === comm.commodityId
                    );
                    const buyPrice = portComm
                      ? portComm.buyPricePerT
                      : comm.basePricePerT;
                    const isSpecialty = Boolean(portComm);

                    return (
                      <div
                        key={comm.commodityId}
                        className={`p-2.5 rounded-lg border flex flex-col justify-between space-y-2 ${
                          isSpecialty
                            ? "bg-bridge-panelLight/60 border-bridge-highlight/50"
                            : "bg-bridge-panelLight/30 border-bridge-border"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                              <span>{comm.name}</span>
                              <span className="text-[9px] px-1 rounded bg-bridge-bg text-bridge-textMuted border border-bridge-border">
                                {comm.category}
                              </span>
                              {isSpecialty && (
                                <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-bridge-safe border border-bridge-safe/40">
                                  ★ {t.trade.portSpecialties}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-bridge-textMuted mt-0.5">
                              {t.trade.unitPrice}:{" "}
                              <span className="text-amber-400 font-bold">
                                {buyPrice} CR/t
                              </span>
                              {portComm && (
                                <span className="ml-2">
                                  · {t.trade.stockLevel}:{" "}
                                  {portComm.stockT.toLocaleString()}t
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5">
                          <button
                            onClick={() => handleBuyCommodity(comm.commodityId, 1)}
                            className="py-1.5 rounded bg-bridge-accent/15 text-bridge-highlight border border-bridge-accent/40 hover:bg-bridge-accent hover:text-bridge-bg text-[10px] font-bold"
                          >
                            {t.trade.load1t}
                          </button>
                          <button
                            onClick={() => handleBuyCommodity(comm.commodityId, 5)}
                            className="py-1.5 rounded bg-bridge-accent/15 text-bridge-highlight border border-bridge-accent/40 hover:bg-bridge-accent hover:text-bridge-bg text-[10px] font-bold"
                          >
                            {t.trade.load5t}
                          </button>
                          <button
                            onClick={() => handleBuyCommodity(comm.commodityId, 25)}
                            className="py-1.5 rounded bg-bridge-accent/15 text-bridge-highlight border border-bridge-accent/40 hover:bg-bridge-accent hover:text-bridge-bg text-[10px] font-bold"
                          >
                            {t.trade.load25t}
                          </button>
                          <button
                            onClick={() =>
                              handleBuyCommodity(comm.commodityId, effectiveCapacityT)
                            }
                            className="py-1.5 rounded bg-bridge-safe/20 text-bridge-safe border border-bridge-safe/40 hover:bg-bridge-safe hover:text-bridge-bg text-[10px] font-bold"
                          >
                            {t.trade.loadMax}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "SUPPLIES" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-bridge-panelLight/30 p-3 rounded-xl border border-bridge-border">
                <div className="text-xs text-bridge-textMuted">
                  {language === "zh"
                    ? `当前停靠补给站：${port.name} (${port.unlocode}) · 可随时补充燃油、淡水、口粮与损管备件`
                    : `Supply Station: ${port.name} (${port.unlocode}) · Replenish Fuel, Water, Rations & Spare Parts`}
                </div>
                <button
                  type="button"
                  onClick={handleFillAllSupplies}
                  className="px-4 py-2 rounded-xl bg-bridge-safe text-bridge-bg font-bold text-xs hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shrink-0 cursor-pointer"
                >
                  ⚡ {t.trade.fillAllSupplies}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 燃油 */}
                <div className="bg-bridge-panelLight/40 p-3.5 rounded-xl border border-bridge-border flex flex-col justify-between space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                        <Fuel size={14} />
                        <span>{t.trade.buyFuelTitle}</span>
                      </div>
                      <span className="text-[10px] text-amber-300 font-bold">
                        {Math.round(port.fuelPricePerL * 1176.47)} CR/t
                      </span>
                    </div>
                    <div className="text-[11px] text-bridge-textMuted mt-1 flex items-center justify-between">
                      <span>
                        {t.trade.currentStock}:{" "}
                        <strong className="text-white">
                          {activeVessel.supplies.fuelT.toFixed(1)}
                        </strong>{" "}
                        / {effectiveFuelCap}
                        {t.common.tons}
                      </span>
                      <span className="text-amber-400 font-bold">
                        {Math.min(
                          100,
                          Math.round(
                            (activeVessel.supplies.fuelT / effectiveFuelCap) * 100
                          )
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full h-2 bg-bridge-bg rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-amber-400 transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (activeVessel.supplies.fuelT / effectiveFuelCap) * 100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => buyFuel(0.5)}
                      className="py-2 rounded bg-amber-400/20 hover:bg-amber-400 hover:text-bridge-bg active:scale-95 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      +0.5{t.common.tons}
                    </button>
                    <button
                      type="button"
                      onClick={() => buyFuel(1.0)}
                      className="py-2 rounded bg-amber-400/20 hover:bg-amber-400 hover:text-bridge-bg active:scale-95 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      {t.trade.add1t}
                    </button>
                    <button
                      type="button"
                      onClick={() => buyFuel(effectiveFuelCap)}
                      className="py-2 rounded bg-amber-400/30 hover:bg-amber-400 hover:text-bridge-bg active:scale-95 text-amber-200 border border-amber-400/60 text-xs font-bold transition-all cursor-pointer"
                    >
                      {language === "zh" ? "+补满" : "+Max"}
                    </button>
                  </div>
                </div>

                {/* 淡水 */}
                <div className="bg-bridge-panelLight/40 p-3.5 rounded-xl border border-bridge-border flex flex-col justify-between space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-sky-400 font-bold text-xs">
                        <Droplets size={14} />
                        <span>{t.trade.buyWaterTitle}</span>
                      </div>
                      <span className="text-[10px] text-sky-300 font-bold">
                        {port.freshWaterPricePerT} CR/t
                      </span>
                    </div>
                    <div className="text-[11px] text-bridge-textMuted mt-1 flex items-center justify-between">
                      <span>
                        {t.trade.currentStock}:{" "}
                        <strong className="text-white">
                          {activeVessel.supplies.freshWaterT.toFixed(1)}
                        </strong>{" "}
                        / {effectiveWaterCap}
                        {t.common.tons}
                      </span>
                      <span className="text-sky-400 font-bold">
                        {Math.min(
                          100,
                          Math.round(
                            (activeVessel.supplies.freshWaterT /
                              effectiveWaterCap) *
                              100
                          )
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full h-2 bg-bridge-bg rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-sky-400 transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (activeVessel.supplies.freshWaterT /
                                effectiveWaterCap) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => buyWater(0.5)}
                      className="py-2 rounded bg-sky-400/20 hover:bg-sky-400 hover:text-bridge-bg active:scale-95 text-sky-300 border border-sky-400/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      {t.trade.add05t}
                    </button>
                    <button
                      type="button"
                      onClick={() => buyWater(2.0)}
                      className="py-2 rounded bg-sky-400/20 hover:bg-sky-400 hover:text-bridge-bg active:scale-95 text-sky-300 border border-sky-400/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      {t.trade.add2t}
                    </button>
                    <button
                      type="button"
                      onClick={() => buyWater(effectiveWaterCap)}
                      className="py-2 rounded bg-sky-400/30 hover:bg-sky-400 hover:text-bridge-bg active:scale-95 text-sky-200 border border-sky-400/60 text-xs font-bold transition-all cursor-pointer"
                    >
                      {language === "zh" ? "+补满" : "+Max"}
                    </button>
                  </div>
                </div>

                {/* 口粮 */}
                <div className="bg-bridge-panelLight/40 p-3.5 rounded-xl border border-bridge-border flex flex-col justify-between space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs">
                        <Utensils size={14} />
                        <span>{t.trade.buyRationTitle}</span>
                      </div>
                      <span className="text-[10px] text-emerald-300 font-bold">
                        {port.rationPricePerT} CR/t
                      </span>
                    </div>
                    <div className="text-[11px] text-bridge-textMuted mt-1 flex items-center justify-between">
                      <span>
                        {t.trade.currentStock}:{" "}
                        <strong className="text-white">
                          {activeVessel.supplies.rationT.toFixed(1)}
                        </strong>{" "}
                        / {effectiveRationCap}
                        {t.common.tons}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {Math.min(
                          100,
                          Math.round(
                            (activeVessel.supplies.rationT / effectiveRationCap) *
                              100
                          )
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full h-2 bg-bridge-bg rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (activeVessel.supplies.rationT /
                                effectiveRationCap) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => buyRation(0.2)}
                      className="py-2 rounded bg-emerald-400/20 hover:bg-emerald-400 hover:text-bridge-bg active:scale-95 text-emerald-300 border border-emerald-400/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      {t.trade.add02t}
                    </button>
                    <button
                      type="button"
                      onClick={() => buyRation(1.0)}
                      className="py-2 rounded bg-emerald-400/20 hover:bg-emerald-400 hover:text-bridge-bg active:scale-95 text-emerald-300 border border-emerald-400/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      {t.trade.add1t}
                    </button>
                    <button
                      type="button"
                      onClick={() => buyRation(effectiveRationCap)}
                      className="py-2 rounded bg-emerald-400/30 hover:bg-emerald-400 hover:text-bridge-bg active:scale-95 text-emerald-200 border border-emerald-400/60 text-xs font-bold transition-all cursor-pointer"
                    >
                      {language === "zh" ? "+补满" : "+Max"}
                    </button>
                  </div>
                </div>

                {/* 备件 */}
                <div className="bg-bridge-panelLight/40 p-3.5 rounded-xl border border-bridge-border flex flex-col justify-between space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-purple-400 font-bold text-xs">
                        <Wrench size={14} />
                        <span>{t.trade.buyPartsTitle}</span>
                      </div>
                      <span className="text-[10px] text-purple-300 font-bold">
                        {port.sparePartsPricePerT} CR/t
                      </span>
                    </div>
                    <div className="text-[11px] text-bridge-textMuted mt-1 flex items-center justify-between">
                      <span>
                        {t.trade.currentStock}:{" "}
                        <strong className="text-white">
                          {activeVessel.supplies.sparePartsT.toFixed(1)}
                        </strong>{" "}
                        / {effectivePartsCap}
                        {t.common.tons}
                      </span>
                      <span className="text-purple-400 font-bold">
                        {Math.min(
                          100,
                          Math.round(
                            (activeVessel.supplies.sparePartsT /
                              effectivePartsCap) *
                              100
                          )
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full h-2 bg-bridge-bg rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-purple-400 transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (activeVessel.supplies.sparePartsT /
                                effectivePartsCap) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => buySpareParts(0.2)}
                      className="py-2 rounded bg-purple-400/20 hover:bg-purple-400 hover:text-bridge-bg active:scale-95 text-purple-300 border border-purple-400/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      {t.trade.add02t}
                    </button>
                    <button
                      type="button"
                      onClick={() => buySpareParts(0.5)}
                      className="py-2 rounded bg-purple-400/20 hover:bg-purple-400 hover:text-bridge-bg active:scale-95 text-purple-300 border border-purple-400/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      {t.trade.add05t}
                    </button>
                    <button
                      type="button"
                      onClick={() => buySpareParts(effectivePartsCap)}
                      className="py-2 rounded bg-purple-400/30 hover:bg-purple-400 hover:text-bridge-bg active:scale-95 text-purple-200 border border-purple-400/60 text-xs font-bold transition-all cursor-pointer"
                    >
                      {language === "zh" ? "+补满" : "+Max"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "REPAIR" && (
            <div className="bg-bridge-panelLight/40 p-4 rounded-xl border border-bridge-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">
                    {t.trade.hullRepairTitle}
                  </div>
                  <div className="text-xs text-bridge-textMuted mt-0.5">
                    {t.hud.hull}:{" "}
                    <span className="text-bridge-safe font-bold">
                      {Math.round((activeVessel.hullHp / activeVessel.hullHpMax) * 100)}%
                    </span>{" "}
                    ({Math.round(activeVessel.hullHp)} / {activeVessel.hullHpMax} HP)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  disabled={missingHullHp <= 0}
                  onClick={() => handleDrydockRepair(repair10PctHp, cost10Pct)}
                  className="py-3 px-4 rounded-xl bg-bridge-accent/20 text-bridge-highlight border border-bridge-accent/40 font-bold text-xs disabled:opacity-40"
                >
                  {t.trade.repair100} ({cost10Pct} CR)
                </button>
                <button
                  disabled={missingHullHp <= 0}
                  onClick={() => handleDrydockRepair(missingHullHp, costFullRepair)}
                  className="py-3 px-4 rounded-xl bg-bridge-safe text-bridge-bg font-bold text-xs disabled:opacity-40"
                >
                  {t.trade.repairFull} ({costFullRepair} CR)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
