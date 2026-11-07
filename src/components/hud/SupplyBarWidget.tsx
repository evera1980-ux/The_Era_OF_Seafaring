import React from "react";
import { useGameStore } from "../../store";
import { VESSELS } from "../../config/vessels";
import { Fuel, Droplets, Utensils, Wrench, Shield, Users, Package } from "lucide-react";
import { useTranslation } from "../../i18n";

export const SupplyBarWidget: React.FC = () => {
  const activeVessel = useGameStore((state) => state.activeVessel);
  const vesselSpec = VESSELS[activeVessel.vesselId];
  const { t } = useTranslation();

  if (!vesselSpec) return null;

  const supplies = activeVessel.supplies;

  const fuelPct = vesselSpec.fuelCapacityT > 0
    ? Math.min(100, Math.round((supplies.fuelT / vesselSpec.fuelCapacityT) * 100))
    : 100;
  const waterPct = Math.min(100, Math.round((supplies.freshWaterT / vesselSpec.waterCapacityT) * 100));
  const rationPct = Math.min(100, Math.round((supplies.rationT / vesselSpec.rationCapacityT) * 100));
  const partsPct = Math.min(100, Math.round((supplies.sparePartsT / vesselSpec.sparePartsCapacityT) * 100));
  const hpPct = Math.round((activeVessel.hullHp / activeVessel.hullHpMax) * 100);

  return (
    <div className="bg-bridge-panel/90 backdrop-blur border border-bridge-border rounded-xl p-3 shadow-2xl flex flex-col space-y-2 select-none w-72 font-mono">
      <div className="flex items-center justify-between text-[10px] text-bridge-accent font-bold border-b border-bridge-border/60 pb-1">
        <span>{t.hud.logistics}</span>
        <span className="text-bridge-textMuted">{vesselSpec.name} (T{vesselSpec.tier})</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="flex items-center space-x-2 bg-bridge-panelLight/60 p-1.5 rounded border border-bridge-border">
          <Shield size={12} className={hpPct > 50 ? "text-bridge-safe" : "text-bridge-danger"} />
          <div className="flex-1">
            <div className="flex justify-between">
              <span className="text-bridge-textMuted">{t.hud.hull}</span>
              <span className="font-bold">{hpPct}%</span>
            </div>
            <div className="w-full h-1 bg-bridge-bg rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full ${hpPct > 50 ? "bg-bridge-safe" : "bg-bridge-danger"}`}
                style={{ width: `${hpPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-bridge-panelLight/60 p-1.5 rounded border border-bridge-border">
          <Users size={12} className="text-bridge-highlight" />
          <div className="flex-1">
            <div className="flex justify-between">
              <span className="text-bridge-textMuted">{t.hud.crew}</span>
              <span className="font-bold">{activeVessel.crewHealth}%</span>
            </div>
            <div className="w-full h-1 bg-bridge-bg rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-bridge-highlight"
                style={{ width: `${activeVessel.crewHealth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-[10px]">
        {/* 燃油 */}
        <div className="flex items-center space-x-2">
          <Fuel size={12} className="text-amber-400 w-4 shrink-0" />
          <span className="w-14 text-bridge-textMuted">{t.hud.fuel}</span>
          <div className="flex-1 h-1.5 bg-bridge-bg rounded-full overflow-hidden border border-bridge-border/40">
            <div
              className={`h-full ${fuelPct < 20 ? "bg-bridge-danger" : "bg-amber-400"}`}
              style={{ width: `${fuelPct}%` }}
            />
          </div>
          <span className="w-16 text-right font-mono">
            {vesselSpec.fuelCapacityT > 0 ? `${supplies.fuelT.toFixed(1)}${t.common.tons}` : "SAIL"}
          </span>
        </div>

        {/* 淡水 */}
        <div className="flex items-center space-x-2">
          <Droplets size={12} className="text-sky-400 w-4 shrink-0" />
          <span className="w-14 text-bridge-textMuted">{t.hud.water}</span>
          <div className="flex-1 h-1.5 bg-bridge-bg rounded-full overflow-hidden border border-bridge-border/40">
            <div
              className={`h-full ${waterPct < 20 ? "bg-bridge-danger" : "bg-sky-400"}`}
              style={{ width: `${waterPct}%` }}
            />
          </div>
          <span className="w-16 text-right font-mono">{supplies.freshWaterT.toFixed(2)}{t.common.tons}</span>
        </div>

        {/* 口粮 */}
        <div className="flex items-center space-x-2">
          <Utensils size={12} className="text-emerald-400 w-4 shrink-0" />
          <span className="w-14 text-bridge-textMuted">{t.hud.ration}</span>
          <div className="flex-1 h-1.5 bg-bridge-bg rounded-full overflow-hidden border border-bridge-border/40">
            <div
              className={`h-full ${rationPct < 20 ? "bg-bridge-danger" : "bg-emerald-400"}`}
              style={{ width: `${rationPct}%` }}
            />
          </div>
          <span className="w-16 text-right font-mono">{supplies.rationT.toFixed(2)}{t.common.tons}</span>
        </div>

        {/* 维修备件 */}
        <div className="flex items-center space-x-2">
          <Wrench size={12} className="text-purple-400 w-4 shrink-0" />
          <span className="w-14 text-bridge-textMuted">{t.hud.parts}</span>
          <div className="flex-1 h-1.5 bg-bridge-bg rounded-full overflow-hidden border border-bridge-border/40">
            <div
              className={`h-full ${partsPct < 20 ? "bg-bridge-danger" : "bg-purple-400"}`}
              style={{ width: `${partsPct}%` }}
            />
          </div>
          <span className="w-16 text-right font-mono">{supplies.sparePartsT.toFixed(2)}{t.common.tons}</span>
        </div>
      </div>

      <div className="pt-1 border-t border-bridge-border/60 flex items-center justify-between text-[10px] text-bridge-textMuted">
        <span className="flex items-center space-x-1">
          <Package size={11} />
          <span>{t.hud.cargoPayload}</span>
        </span>
        <span className="text-bridge-text font-bold">
          {activeVessel.cargoWeightT.toFixed(1)} / {vesselSpec.dwtT} {t.common.tons}
        </span>
      </div>
    </div>
  );
};
