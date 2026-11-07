import React, { useState } from "react";
import { useGameStore } from "../../store";
import { PORTS } from "../../config/ports";
import { COMMODITIES } from "../../config/commodities";
import { VESSELS } from "../../config/vessels";
import { X, Fuel, Droplets, Utensils, Wrench, Package } from "lucide-react";
import { useTranslation } from "../../i18n";

export const PortTradeModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const selectedPortId = useGameStore((state) => state.selectedPortId) || "CNSHA";
  const closeModal = useGameStore((state) => state.closeModal);

  const credits = useGameStore((state) => state.playerCredits);
  const addCredits = useGameStore((state) => state.addCredits);
  const deductCredits = useGameStore((state) => state.deductCredits);
  const activeVessel = useGameStore((state) => state.activeVessel);
  const refuel = useGameStore((state) => state.refuel);
  const replenishWater = useGameStore((state) => state.replenishWater);
  const replenishRations = useGameStore((state) => state.replenishRations);
  const replenishSpareParts = useGameStore((state) => state.replenishSpareParts);
  const addCargoItem = useGameStore((state) => state.addCargoItem);
  const removeCargoItem = useGameStore((state) => state.removeCargoItem);
  const addLog = useGameStore((state) => state.addLog);
  const { t, language } = useTranslation();

  const [activeTab, setActiveTab] = useState<"SUPPLIES" | "COMMODITIES">("COMMODITIES");

  if (activeModal !== "PORT_TRADE") return null;

  const port = PORTS[selectedPortId] || PORTS["CNSHA"];
  const vesselSpec = VESSELS[activeVessel.vesselId];

  const buyFuel = (amountT: number) => {
    const cost = Math.round(amountT * 1411.76);
    if (deductCredits(cost)) {
      refuel(amountT);
      const msg = language === "zh"
        ? `在 ${port.name} 采购了 ${amountT} 吨燃油，花费 ${cost} CR。`
        : `Purchased ${amountT}t Marine Diesel at ${port.name} for ${cost} CR.`;
      addLog(msg);
    } else {
      addLog(language === "zh" ? "资金不足以采购指定数量的燃油！" : "Insufficient credits for bunkering!", "WARN");
    }
  };

  const buyWater = (amountT: number) => {
    const cost = Math.round(amountT * 2.5);
    if (deductCredits(cost)) {
      replenishWater(amountT);
      const msg = language === "zh"
        ? `在 ${port.name} 补充了 ${amountT} 吨淡水，花费 ${cost} CR。`
        : `Supplied ${amountT}t Fresh Water at ${port.name} for ${cost} CR.`;
      addLog(msg);
    }
  };

  const buyRation = (amountT: number) => {
    const cost = Math.round(amountT * 5000);
    if (deductCredits(cost)) {
      replenishRations(amountT);
      const msg = language === "zh"
        ? `在 ${port.name} 补充了 ${amountT} 吨口粮，花费 ${cost} CR。`
        : `Provisioned ${amountT}t Rations at ${port.name} for ${cost} CR.`;
      addLog(msg);
    }
  };

  const buySpareParts = (amountT: number) => {
    const cost = Math.round(amountT * 1200);
    if (deductCredits(cost)) {
      replenishSpareParts(amountT);
      const msg = language === "zh"
        ? `在 ${port.name} 补充了 ${amountT} 吨备件，花费 ${cost} CR。`
        : `Acquired ${amountT}t Spare Parts at ${port.name} for ${cost} CR.`;
      addLog(msg);
    }
  };

  const handleBuyCommodity = (commId: string) => {
    const commSpec = COMMODITIES[commId];
    if (!commSpec) return;

    const remainingPayload = vesselSpec.dwtT - activeVessel.cargoWeightT;
    if (remainingPayload < 1.0) {
      addLog(language === "zh" ? "船只货舱载重已达上限！无法装载更多货物。" : "Vessel deadweight capacity reached!", "WARN");
      return;
    }

    const buyTons = Math.min(5.0, Math.floor(remainingPayload));
    const cost = commSpec.basePricePerT * buyTons;

    if (deductCredits(cost)) {
      addCargoItem({
        cargoId: `cargo_${Date.now()}_${commId}`,
        commodityId: commId,
        quantityT: buyTons,
        volumeM3: buyTons * commSpec.volumeM3PerT,
        unitBuyPrice: commSpec.basePricePerT,
        quality: "STANDARD",
        integrity: 100,
        refrigerated: commSpec.category === "Refrigerated",
      });
      const msg = language === "zh"
        ? `装载了 ${buyTons} 吨 ${commSpec.name}，买入价 ${commSpec.basePricePerT} CR/t。`
        : `Loaded ${buyTons}t ${commSpec.name} at ${commSpec.basePricePerT} CR/t.`;
      addLog(msg);
    } else {
      addLog(language === "zh" ? "资金不足，无法购入该商品！" : "Insufficient credits to purchase cargo!", "WARN");
    }
  };

  const handleSellCargo = (cargoId: string, commId: string, quantityT: number) => {
    const commSpec = COMMODITIES[commId];
    if (!commSpec) return;

    const revenue = Math.round(commSpec.basePricePerT * 1.12 * quantityT);
    addCredits(revenue);
    removeCargoItem(cargoId);
    const msg = language === "zh"
      ? `在 ${port.name} 出售了 ${quantityT} 吨 ${commSpec.name}，获得 ${revenue} CR。`
      : `Discharged ${quantityT}t ${commSpec.name} at ${port.name} for ${revenue} CR revenue.`;
    addLog(msg);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end md:items-center justify-center font-mono">
      <div className="bg-bridge-panel border-t md:border border-bridge-border rounded-t-2xl md:rounded-2xl w-full max-w-4xl max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden pb-safe animate-in slide-in-from-bottom duration-200">
        {/* 头部 */}
        <div className="px-4 py-3 md:px-6 md:py-4 bg-bridge-panelLight/60 border-b border-bridge-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-bridge-safe/20 border border-bridge-safe/40 flex items-center justify-center text-bridge-safe text-sm shrink-0">
              ⚓
            </div>
            <div>
              <div className="text-sm md:text-base font-bold text-white flex items-center space-x-1.5">
                <span className="truncate">{port.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-bridge-accent/20 text-bridge-highlight shrink-0">
                  {port.unlocode}
                </span>
              </div>
              <div className="text-[10px] text-bridge-textMuted">
                {t.trade.maxDraft}: {port.maxAllowedDraftM}{t.common.meter} · {t.trade.portFee}: {port.portFeeCredits} CR
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
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {activeTab === "COMMODITIES" ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-bridge-textMuted mb-1.5 flex items-center justify-between">
                  <span>{t.trade.cargoHold} ({activeVessel.cargoWeightT.toFixed(1)} / {vesselSpec.dwtT}{t.common.tons})</span>
                </h3>
                {activeVessel.cargoItems.length === 0 ? (
                  <div className="text-xs text-bridge-textMuted bg-bridge-panelLight/30 p-3 rounded-lg border border-dashed border-bridge-border text-center">
                    {t.trade.cargoEmpty}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeVessel.cargoItems.map((c) => {
                      const comm = COMMODITIES[c.commodityId];
                      return (
                        <div
                          key={c.cargoId}
                          className="bg-bridge-panelLight/50 p-2.5 rounded-lg border border-bridge-border flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-bold text-white">{comm?.name}</div>
                            <div className="text-[10px] text-bridge-textMuted">
                              {c.quantityT}{t.common.tons} · {c.unitBuyPrice}CR/t · {c.integrity}%
                            </div>
                          </div>
                          <button
                            onClick={() => handleSellCargo(c.cargoId, c.commodityId, c.quantityT)}
                            className="px-2.5 py-1 rounded bg-bridge-safe/20 text-bridge-safe border border-bridge-safe/40 hover:bg-bridge-safe hover:text-bridge-bg text-xs font-bold"
                          >
                            {t.trade.sellBtn}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-bridge-textMuted mb-2">{t.trade.marketList}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.values(COMMODITIES).map((comm) => (
                    <div
                      key={comm.commodityId}
                      className="bg-bridge-panelLight/40 p-2.5 rounded-lg border border-bridge-border flex items-center justify-between"
                    >
                      <div className="mr-2">
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <span>{comm.name}</span>
                          <span className="text-[9px] px-1 rounded bg-bridge-bg text-bridge-textMuted border border-bridge-border">
                            {comm.category}
                          </span>
                        </div>
                        <div className="text-[10px] text-bridge-textMuted mt-0.5">
                          {t.trade.unitPrice}: <span className="text-amber-400 font-bold">{comm.basePricePerT} CR/t</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuyCommodity(comm.commodityId)}
                        className="px-3 py-1.5 rounded bg-bridge-accent/20 text-bridge-highlight border border-bridge-accent/40 hover:bg-bridge-accent hover:text-bridge-bg text-xs font-bold shrink-0"
                      >
                        {t.trade.load5t}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 燃油 */}
              <div className="bg-bridge-panelLight/40 p-3 rounded-xl border border-bridge-border flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                    <Fuel size={14} />
                    <span>{t.trade.buyFuelTitle}</span>
                  </div>
                  <div className="text-[10px] text-bridge-textMuted mt-0.5">
                    {t.trade.currentStock}: {activeVessel.supplies.fuelT.toFixed(1)} / {vesselSpec.fuelCapacityT}{t.common.tons}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    disabled={vesselSpec.fuelCapacityT <= 0}
                    onClick={() => buyFuel(1.0)}
                    className="flex-1 py-1.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/40 text-xs font-bold disabled:opacity-40"
                  >
                    {t.trade.add1t}
                  </button>
                  <button
                    disabled={vesselSpec.fuelCapacityT <= 0}
                    onClick={() => buyFuel(5.0)}
                    className="flex-1 py-1.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/40 text-xs font-bold disabled:opacity-40"
                  >
                    {t.trade.add5t}
                  </button>
                </div>
              </div>

              {/* 淡水 */}
              <div className="bg-bridge-panelLight/40 p-3 rounded-xl border border-bridge-border flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center space-x-1.5 text-sky-400 font-bold text-xs">
                    <Droplets size={14} />
                    <span>{t.trade.buyWaterTitle}</span>
                  </div>
                  <div className="text-[10px] text-bridge-textMuted mt-0.5">
                    {t.trade.currentStock}: {activeVessel.supplies.freshWaterT.toFixed(2)} / {vesselSpec.waterCapacityT}{t.common.tons}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => buyWater(0.5)}
                    className="flex-1 py-1.5 rounded bg-sky-400/20 text-sky-400 border border-sky-400/40 text-xs font-bold"
                  >
                    {t.trade.add05t}
                  </button>
                  <button
                    onClick={() => buyWater(2.0)}
                    className="flex-1 py-1.5 rounded bg-sky-400/20 text-sky-400 border border-sky-400/40 text-xs font-bold"
                  >
                    {t.trade.add2t}
                  </button>
                </div>
              </div>

              {/* 口粮 */}
              <div className="bg-bridge-panelLight/40 p-3 rounded-xl border border-bridge-border flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs">
                    <Utensils size={14} />
                    <span>{t.trade.buyRationTitle}</span>
                  </div>
                  <div className="text-[10px] text-bridge-textMuted mt-0.5">
                    {t.trade.currentStock}: {activeVessel.supplies.rationT.toFixed(2)} / {vesselSpec.rationCapacityT}{t.common.tons}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => buyRation(0.2)}
                    className="flex-1 py-1.5 rounded bg-emerald-400/20 text-emerald-400 border border-emerald-400/40 text-xs font-bold"
                  >
                    {t.trade.add02t}
                  </button>
                  <button
                    onClick={() => buyRation(1.0)}
                    className="flex-1 py-1.5 rounded bg-emerald-400/20 text-emerald-400 border border-emerald-400/40 text-xs font-bold"
                  >
                    {t.trade.add1t}
                  </button>
                </div>
              </div>

              {/* 备件 */}
              <div className="bg-bridge-panelLight/40 p-3 rounded-xl border border-bridge-border flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center space-x-1.5 text-purple-400 font-bold text-xs">
                    <Wrench size={14} />
                    <span>{t.trade.buyPartsTitle}</span>
                  </div>
                  <div className="text-[10px] text-bridge-textMuted mt-0.5">
                    {t.trade.currentStock}: {activeVessel.supplies.sparePartsT.toFixed(2)} / {vesselSpec.sparePartsCapacityT}{t.common.tons}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => buySpareParts(0.2)}
                    className="flex-1 py-1.5 rounded bg-purple-400/20 text-purple-400 border border-purple-400/40 text-xs font-bold"
                  >
                    {t.trade.add02t}
                  </button>
                  <button
                    onClick={() => buySpareParts(0.5)}
                    className="flex-1 py-1.5 rounded bg-purple-400/20 text-purple-400 border border-purple-400/40 text-xs font-bold"
                  >
                    {t.trade.add05t}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
