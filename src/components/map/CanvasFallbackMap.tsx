import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "../../store";
import { PORTS } from "../../config/ports";
import { Plus, Minus } from "lucide-react";
import { useTranslation } from "../../i18n";
import { selectMaxRangeNM } from "../../store/selectors/shipSelectors";
import { WindParticleLayer } from "./WindParticleLayer";
import { GameAsset } from "../common/GameAsset";

const tileImageCache = new Map<string, HTMLImageElement>();

function getTileUrls(
  source: "NAUTICAL_DARK" | "GOOGLE_SATELLITE" | "OPENSTREETMAP",
  z: number,
  x: number,
  y: number
): { base: string; ref: string } {
  if (source === "GOOGLE_SATELLITE") {
    return {
      base: `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
      ref: `https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/${z}/${y}/${x}`,
    };
  }
  if (source === "OPENSTREETMAP") {
    return {
      base: `https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/${z}/${y}/${x}`,
      ref: `https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/${z}/${y}/${x}`,
    };
  }
  return {
    base: `https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${z}/${y}/${x}`,
    ref: `https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/${z}/${y}/${x}`,
  };
}

function getOrLoadTileImage(url: string): HTMLImageElement {
  let img = tileImageCache.get(url);
  if (!img) {
    img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    tileImageCache.set(url, img);
  }
  return img;
}

function lonToTileX(lon: number, z: number): number {
  return ((lon + 180) / 360) * Math.pow(2, z);
}

function latToTileY(lat: number, z: number): number {
  const clamped = Math.max(-85, Math.min(85, lat));
  const rad = (clamped * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
    Math.pow(2, z)
  );
}

export const CanvasFallbackMap: React.FC<{ onShowHelp?: () => void }> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeVessel = useGameStore((state) => state.activeVessel);
  const trackHistory = useGameStore((state) => state.trackHistory);
  const unlockedPerkIds = useGameStore((state) => state.unlockedPerkIds);
  const roWaterMakerEnabled = useGameStore((state) => state.roWaterMakerEnabled);
  const currentWeather = useGameStore((state) => state.currentWeather);
  const aisTargets = useGameStore((state) => state.aisTargets);
  const plannedRoute = useGameStore((state) => state.plannedRoute);
  const activeWaypointIndex = useGameStore((state) => state.activeWaypointIndex);
  const mapTileSource = useGameStore((state) => state.mapTileSource);
  const openModal = useGameStore((state) => state.openModal);
  const { t } = useTranslation();

  const [center, setCenter] = useState<{ lon: number; lat: number }>({
    lon: Number(activeVessel.position.longitude),
    lat: Number(activeVessel.position.latitude),
  });
  const [zoom, setZoom] = useState(7.5);
  const [showWindParticles, setShowWindParticles] = useState(true);
  const [showRangeRing, setShowRangeRing] = useState(true);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const maxRangeNM = selectMaxRangeNM(
    activeVessel,
    unlockedPerkIds,
    roWaterMakerEnabled
  );

  const tileZoom = Math.max(3, Math.min(12, Math.round(zoom)));

  const project = (lon: number, lat: number, width: number, height: number) => {
    const cx = lonToTileX(center.lon, tileZoom);
    const cy = latToTileY(center.lat, tileZoom);
    const px = lonToTileX(lon, tileZoom);
    const py = latToTileY(lat, tileZoom);
    return {
      x: width / 2 + (px - cx) * 256,
      y: height / 2 + (py - cy) * 256,
    };
  };

  // 仅当本船驶出画面中心安全框 (距离中心超过 28% 视口宽高) 时才自动跟焦平移，使玩家肉眼清晰看见船标沿航线前进
  useEffect(() => {
    const canvas = canvasRef.current;
    const width = canvas?.clientWidth || 1000;
    const height = canvas?.clientHeight || 700;
    const pt = project(
      activeVessel.position.longitude,
      activeVessel.position.latitude,
      width,
      height
    );
    const marginX = width * 0.22;
    const marginY = height * 0.22;
    if (
      pt.x < marginX ||
      pt.x > width - marginX ||
      pt.y < marginY ||
      pt.y > height - marginY
    ) {
      setCenter({
        lon: Number(activeVessel.position.longitude),
        lat: Number(activeVessel.position.latitude),
      });
    }
  }, [activeVessel.position.latitude, activeVessel.position.longitude]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = (canvas.width = canvas.clientWidth);
      const height = (canvas.height = canvas.clientHeight);

      // 1. 底图背景色 (随 mapTileSource 切换)
      if (mapTileSource === "GOOGLE_SATELLITE") {
        ctx.fillStyle = "#031B28";
      } else if (mapTileSource === "OPENSTREETMAP") {
        ctx.fillStyle = "#B8DDF0";
      } else {
        ctx.fillStyle = "#07131F";
      }
      ctx.fillRect(0, 0, width, height);

      // 1.5 渲染真实瓦片图层 (深色海图 / 卫星遥感 / 标准海洋海图)
      const cx = lonToTileX(center.lon, tileZoom);
      const cy = latToTileY(center.lat, tileZoom);
      const maxTileIndex = Math.pow(2, tileZoom);
      const halfTilesX = Math.ceil(width / 512) + 1;
      const halfTilesY = Math.ceil(height / 512) + 1;
      const minTx = Math.floor(cx) - halfTilesX;
      const maxTx = Math.floor(cx) + halfTilesX;
      const minTy = Math.max(0, Math.floor(cy) - halfTilesY);
      const maxTy = Math.min(maxTileIndex - 1, Math.floor(cy) + halfTilesY);

      for (let tx = minTx; tx <= maxTx; tx++) {
        const wrappedTx = ((tx % maxTileIndex) + maxTileIndex) % maxTileIndex;
        for (let ty = minTy; ty <= maxTy; ty++) {
          const sx = Math.floor(width / 2 + (tx - cx) * 256);
          const sy = Math.floor(height / 2 + (ty - cy) * 256);
          const urls = getTileUrls(mapTileSource, tileZoom, wrappedTx, ty);
          const baseImg = getOrLoadTileImage(urls.base);
          if (baseImg.complete && baseImg.naturalWidth > 0) {
            ctx.drawImage(baseImg, sx, sy, 257, 257);
          }
          const refImg = getOrLoadTileImage(urls.ref);
          if (refImg.complete && refImg.naturalWidth > 0) {
            ctx.drawImage(refImg, sx, sy, 257, 257);
          }
        }
      }

      // 2. 经纬度航海网格
      ctx.strokeStyle =
        mapTileSource === "OPENSTREETMAP"
          ? "rgba(15, 46, 68, 0.18)"
          : mapTileSource === "GOOGLE_SATELLITE"
          ? "rgba(56, 189, 248, 0.2)"
          : "rgba(35, 64, 82, 0.35)";
      ctx.lineWidth = 1;
      const step = tileZoom < 7 ? 2.0 : 0.5;

      const labelColor =
        mapTileSource === "OPENSTREETMAP"
          ? "rgba(15, 46, 68, 0.65)"
          : "rgba(142, 167, 184, 0.55)";

      const startLon = Math.floor((center.lon - 12) / step) * step;
      const endLon = Math.ceil((center.lon + 12) / step) * step;
      for (let lon = startLon; lon <= endLon; lon += step) {
        const p1 = project(lon, center.lat + 12, width, height);
        const p2 = project(lon, center.lat - 12, width, height);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.fillStyle = labelColor;
        ctx.font = "9px monospace";
        ctx.fillText(`${lon.toFixed(1)}°E`, p1.x + 4, 15);
      }

      const startLat = Math.floor((center.lat - 12) / step) * step;
      const endLat = Math.ceil((center.lat + 12) / step) * step;
      for (let lat = startLat; lat <= endLat; lat += step) {
        const p1 = project(center.lon - 12, lat, width, height);
        const p2 = project(center.lon + 12, lat, width, height);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.fillStyle = labelColor;
        ctx.font = "9px monospace";
        ctx.fillText(`${lat.toFixed(1)}°N`, 8, p1.y - 4);
      }

      const playerPt = project(
        activeVessel.position.longitude,
        activeVessel.position.latitude,
        width,
        height
      );

      // 2.5 燃油最大续航圈与 20 NM 雷达通联圈
      if (showRangeRing) {
        const edgeFuelPt = project(
          activeVessel.position.longitude,
          activeVessel.position.latitude + maxRangeNM / 60,
          width,
          height
        );
        const edgeRadarPt = project(
          activeVessel.position.longitude,
          activeVessel.position.latitude + 20 / 60,
          width,
          height
        );
        const fuelRadiusPx = Math.max(8, Math.abs(playerPt.y - edgeFuelPt.y));
        const radarRadiusPx = Math.max(4, Math.abs(playerPt.y - edgeRadarPt.y));

        ctx.save();
        ctx.fillStyle = "rgba(53, 211, 154, 0.06)";
        ctx.strokeStyle = "rgba(53, 211, 154, 0.75)";
        ctx.lineWidth = 1.6;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(playerPt.x, playerPt.y, fuelRadiusPx, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(86, 217, 232, 0.6)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(playerPt.x, playerPt.y, radarRadiusPx, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 2.8 船只历史尾迹线 (Track Trail)
      if (trackHistory.length > 1) {
        ctx.save();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.65)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        trackHistory.forEach((pt, idx) => {
          const p = project(pt.longitude, pt.latitude, width, height);
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.lineTo(playerPt.x, playerPt.y);
        ctx.stroke();
        ctx.restore();
      }

      // 3. 规划大圆航线 (从本船当前坐标连接至尚未通过的航路点)
      if (plannedRoute && plannedRoute.waypoints.length > 0) {
        const remainingWaypoints = plannedRoute.waypoints.slice(activeWaypointIndex);
        ctx.save();
        ctx.strokeStyle = "#56D9E8";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 6]);
        ctx.shadowColor = "#56D9E8";
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(playerPt.x, playerPt.y);

        remainingWaypoints.forEach((wp) => {
          const pt = project(wp.position.longitude, wp.position.latitude, width, height);
          ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.restore();

        remainingWaypoints.forEach((wp, idx) => {
          const actualWpNum = activeWaypointIndex + idx + 1;
          const pt = project(wp.position.longitude, wp.position.latitude, width, height);
          ctx.fillStyle = "#56D9E8";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
          ctx.fill();

          if (idx === remainingWaypoints.length - 1 || idx === 0 || idx % 2 === 0) {
            ctx.fillStyle = "#EAF4FA";
            ctx.font = "10px monospace";
            ctx.fillText(`WP${actualWpNum}`, pt.x + 6, pt.y - 4);
          }
        });
      }

      // 4. 港口点位
      Object.values(PORTS).forEach((port) => {
        const pt = project(port.position.longitude, port.position.latitude, width, height);
        if (pt.x < -60 || pt.x > width + 60 || pt.y < -60 || pt.y > height + 60) return;
        ctx.save();
        ctx.fillStyle = "#35D39A";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#07131F";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#35D39A";
        ctx.font = "bold 11px monospace";
        ctx.fillText(`⚓ ${port.name.split(" ")[0]}`, pt.x + 8, pt.y + 4);
        ctx.restore();
      });

      // 5. AIS 伴航船只
      aisTargets.forEach((target) => {
        const pt = project(target.position.longitude, target.position.latitude, width, height);
        if (pt.x < -40 || pt.x > width + 40 || pt.y < -40 || pt.y > height + 40) return;
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate((target.cogDeg * Math.PI) / 180);

        ctx.fillStyle = "rgba(245, 185, 66, 0.9)";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(6, 9);
        ctx.lineTo(0, 6);
        ctx.lineTo(-6, 9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "#F5B942";
        ctx.font = "9px monospace";
        ctx.fillText(target.vesselName.substring(0, 10), pt.x + 8, pt.y + 3);
      });

      // 6. 玩家本船
      ctx.save();
      ctx.translate(playerPt.x, playerPt.y);

      ctx.save();
      ctx.rotate((activeVessel.headingDeg * Math.PI) / 180);
      ctx.strokeStyle = "#56D9E8";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -45);
      ctx.stroke();
      ctx.restore();

      ctx.rotate((activeVessel.headingDeg * Math.PI) / 180);
      ctx.fillStyle = "#35C6D8";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#35C6D8";
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(8, 14);
      ctx.lineTo(0, 10);
      ctx.lineTo(-8, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [
    center,
    zoom,
    tileZoom,
    activeVessel,
    aisTargets,
    plannedRoute,
    activeWaypointIndex,
    mapTileSource,
    showRangeRing,
    maxRangeNM,
    trackHistory,
  ]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !canvasRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    const degPerPixel = 360 / (256 * Math.pow(2, tileZoom));
    setCenter((prev) => ({
      lon: prev.lon - dx * degPerPixel,
      lat: Math.max(-80, Math.min(80, prev.lat + dy * degPerPixel * 0.85)),
    }));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    for (const port of Object.values(PORTS)) {
      const pt = project(port.position.longitude, port.position.latitude, width, height);
      const dist = Math.hypot(clickX - pt.x, clickY - pt.y);
      if (dist < 22) {
        openModal("PORT_TRADE", { portId: port.portId });
        return;
      }
    }

    for (const target of aisTargets) {
      const pt = project(target.position.longitude, target.position.latitude, width, height);
      const dist = Math.hypot(clickX - pt.x, clickY - pt.y);
      if (dist < 20) {
        openModal("AIS_DETAIL", { aisId: target.targetId });
        return;
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.5 : 0.5;
    setZoom((prev) => Math.max(3, Math.min(12, prev + zoomDelta)));
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden touch-none font-mono">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* 动态风场粒子层 */}
      <WindParticleLayer
        windSpeedKn={currentWeather.windSpeedKn}
        windDirectionDeg={currentWeather.windDirectionDeg}
        enabled={showWindParticles}
      />

      {/* 左上角无边框高精度经纬度与续航遥测文字 */}
      <div className="absolute top-2 left-2.5 pointer-events-none text-[10px] sm:text-[11px] font-mono tabular-nums flex items-center space-x-1 sm:space-x-1.5 text-slate-100 z-20 max-w-[46vw] sm:max-w-none truncate [text-shadow:0_1px_4px_rgba(0,0,0,0.98),0_0_10px_rgba(0,0,0,0.9)]">
        <span className="text-cyan-300 font-extrabold hidden md:inline">WGS84</span>
        <span className="text-slate-200 font-semibold truncate sm:hidden">
          {activeVessel.position.latitude.toFixed(2)}°N, {activeVessel.position.longitude.toFixed(2)}°E
        </span>
        <span className="text-slate-200 font-semibold truncate hidden sm:inline">
          {activeVessel.position.latitude.toFixed(4)}°N, {activeVessel.position.longitude.toFixed(4)}°E
        </span>
        <span className="text-slate-400 hidden md:inline">·</span>
        <span className="text-sky-300 font-bold shrink-0 hidden md:inline">
          {(activeVessel.sogKn * 1.852).toFixed(1)} km/h
        </span>
        <span className="text-slate-400 hidden sm:inline">·</span>
        <span className="text-emerald-300 font-bold shrink-0 hidden sm:inline">
          {maxRangeNM} NM
        </span>
      </div>

      {/* 右侧浮动无框高对比触控工具条 (去掉底色和线框，多重投影确保全海图清晰可见) */}
      <div className="absolute right-2.5 top-16 flex flex-col items-center space-y-2 z-20 pointer-events-auto select-none">
        <button
          type="button"
          onClick={() =>
            setCenter({
              lon: Number(activeVessel.position.longitude),
              lat: Number(activeVessel.position.latitude),
            })
          }
          className="w-11 h-11 flex flex-col items-center justify-center text-cyan-300 hover:text-white active:scale-90 transition-all cursor-pointer group"
          title="Recenter"
        >
          <GameAsset
            assetKey="hud_compass"
            width={26}
            height={26}
            className="w-6 h-6 object-contain [filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.98))_drop-shadow(0_0_10px_rgba(0,0,0,0.9))] group-hover:scale-110 transition-transform"
          />
          <span className="text-[9px] font-mono font-extrabold text-cyan-200 leading-none mt-0.5 [text-shadow:0_1px_3px_#000,0_0_8px_#000]">
            LOC
          </span>
        </button>

        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(12, z + 1))}
          className="w-11 h-10 flex flex-col items-center justify-center text-white hover:text-cyan-300 active:scale-90 transition-all cursor-pointer group"
          title="Zoom In"
        >
          <Plus
            size={22}
            strokeWidth={3}
            className="[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.98))_drop-shadow(0_0_10px_rgba(0,0,0,0.95))] group-hover:scale-110 transition-transform"
          />
          <span className="text-[9px] font-mono font-bold text-slate-200 leading-none [text-shadow:0_1px_3px_#000,0_0_8px_#000]">
            ZOOM+
          </span>
        </button>

        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(3, z - 1))}
          className="w-11 h-10 flex flex-col items-center justify-center text-white hover:text-cyan-300 active:scale-90 transition-all cursor-pointer group"
          title="Zoom Out"
        >
          <Minus
            size={22}
            strokeWidth={3}
            className="[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.98))_drop-shadow(0_0_10px_rgba(0,0,0,0.95))] group-hover:scale-110 transition-transform"
          />
          <span className="text-[9px] font-mono font-bold text-slate-200 leading-none [text-shadow:0_1px_3px_#000,0_0_8px_#000]">
            ZOOM-
          </span>
        </button>

        <button
          type="button"
          onClick={() => setShowWindParticles((v) => !v)}
          className={`w-11 h-11 flex flex-col items-center justify-center active:scale-90 transition-all cursor-pointer group ${
            showWindParticles ? "opacity-100" : "opacity-55 hover:opacity-90"
          }`}
          title={t.hud.windLayer}
        >
          <GameAsset
            assetKey="hud_waves"
            width={26}
            height={26}
            className={`w-6 h-6 object-contain group-hover:scale-110 transition-transform ${
              showWindParticles
                ? "[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.98))_drop-shadow(0_0_10px_rgba(56,189,248,0.85))]"
                : "[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.98))_drop-shadow(0_0_8px_rgba(0,0,0,0.9))]"
            }`}
          />
          <span
            className={`text-[9px] font-mono font-extrabold leading-none mt-0.5 [text-shadow:0_1px_3px_#000,0_0_8px_#000] ${
              showWindParticles ? "text-sky-300" : "text-slate-400"
            }`}
          >
            WIND
          </span>
        </button>

        <button
          type="button"
          onClick={() => setShowRangeRing((v) => !v)}
          className={`w-11 h-11 flex flex-col items-center justify-center active:scale-90 transition-all cursor-pointer group ${
            showRangeRing ? "opacity-100" : "opacity-55 hover:opacity-90"
          }`}
          title={t.hud.rangeRing}
        >
          <GameAsset
            assetKey="hud_ais_radar"
            width={26}
            height={26}
            className={`w-6 h-6 object-contain group-hover:scale-110 transition-transform ${
              showRangeRing
                ? "[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.98))_drop-shadow(0_0_10px_rgba(52,211,153,0.85))]"
                : "[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.98))_drop-shadow(0_0_8px_rgba(0,0,0,0.9))]"
            }`}
          />
          <span
            className={`text-[9px] font-mono font-extrabold leading-none mt-0.5 [text-shadow:0_1px_3px_#000,0_0_8px_#000] ${
              showRangeRing ? "text-emerald-300" : "text-slate-400"
            }`}
          >
            RNG
          </span>
        </button>
      </div>
    </div>
  );
};
