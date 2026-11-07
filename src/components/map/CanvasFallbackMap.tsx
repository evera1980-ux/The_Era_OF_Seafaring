import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "../../store";
import { PORTS } from "../../config/ports";
import { HelpCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "../../i18n";

export const CanvasFallbackMap: React.FC<{ onShowHelp: () => void }> = ({ onShowHelp }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeVessel = useGameStore((state) => state.activeVessel);
  const aisTargets = useGameStore((state) => state.aisTargets);
  const plannedRoute = useGameStore((state) => state.plannedRoute);
  const mapTileSource = useGameStore((state) => state.mapTileSource);
  const openModal = useGameStore((state) => state.openModal);
  const { t, language } = useTranslation();

  const [center, setCenter] = useState<{ lon: number; lat: number }>({
    lon: Number(activeVessel.position.longitude),
    lat: Number(activeVessel.position.latitude),
  });
  const [zoom, setZoom] = useState(10);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const project = (lon: number, lat: number, width: number, height: number) => {
    const scale = Math.pow(2, zoom) / 4;
    const x = width / 2 + (lon - center.lon) * scale;
    const y = height / 2 - (lat - center.lat) * scale;
    return { x, y };
  };

  useEffect(() => {
    setCenter({
      lon: Number(activeVessel.position.longitude),
      lat: Number(activeVessel.position.latitude),
    });
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

      // 1. 底图背景
      ctx.fillStyle = mapTileSource === "GOOGLE_SATELLITE" ? "#061521" : "#07131F";
      ctx.fillRect(0, 0, width, height);

      // 2. 经纬度航海网格
      ctx.strokeStyle = "rgba(35, 64, 82, 0.4)";
      ctx.lineWidth = 1;
      const step = 0.5;

      const startLon = Math.floor((center.lon - 5) / step) * step;
      const endLon = Math.ceil((center.lon + 5) / step) * step;
      for (let lon = startLon; lon <= endLon; lon += step) {
        const p1 = project(lon, center.lat + 5, width, height);
        const p2 = project(lon, center.lat - 5, width, height);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.fillStyle = "rgba(142, 167, 184, 0.5)";
        ctx.font = "9px monospace";
        ctx.fillText(`${lon.toFixed(1)}°E`, p1.x + 4, 15);
      }

      const startLat = Math.floor((center.lat - 5) / step) * step;
      const endLat = Math.ceil((center.lat + 5) / step) * step;
      for (let lat = startLat; lat <= endLat; lat += step) {
        const p1 = project(center.lon - 5, lat, width, height);
        const p2 = project(center.lon + 5, lat, width, height);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.fillStyle = "rgba(142, 167, 184, 0.5)";
        ctx.font = "9px monospace";
        ctx.fillText(`${lat.toFixed(1)}°N`, 8, p1.y - 4);
      }

      // 3. 规划大圆航线
      if (plannedRoute && plannedRoute.waypoints.length > 0) {
        ctx.save();
        ctx.strokeStyle = "#56D9E8";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 6]);
        ctx.shadowColor = "#56D9E8";
        ctx.shadowBlur = 8;

        const startPt = project(activeVessel.position.longitude, activeVessel.position.latitude, width, height);
        ctx.beginPath();
        ctx.moveTo(startPt.x, startPt.y);

        plannedRoute.waypoints.forEach((wp) => {
          const pt = project(wp.position.longitude, wp.position.latitude, width, height);
          ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.restore();

        plannedRoute.waypoints.forEach((wp, idx) => {
          const pt = project(wp.position.longitude, wp.position.latitude, width, height);
          ctx.fillStyle = "#56D9E8";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#EAF4FA";
          ctx.font = "10px monospace";
          ctx.fillText(`WP${idx + 1}`, pt.x + 6, pt.y - 4);
        });
      }

      // 4. 港口点位
      Object.values(PORTS).forEach((port) => {
        const pt = project(port.position.longitude, port.position.latitude, width, height);
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
      const playerPt = project(activeVessel.position.longitude, activeVessel.position.latitude, width, height);
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
  }, [center, zoom, activeVessel, aisTargets, plannedRoute, mapTileSource]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !canvasRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    const scale = Math.pow(2, zoom) / 4;
    setCenter((prev) => ({
      lon: prev.lon - dx / scale,
      lat: prev.lat + dy / scale,
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
      if (dist < 20) {
        openModal("PORT_TRADE", { portId: port.portId });
        return;
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom((prev) => Math.max(6, Math.min(15, prev + zoomDelta)));
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

      {/* 顶部兼容提示与指引按钮 */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="bg-amber-500/90 backdrop-blur border border-amber-300 px-2.5 py-1 rounded-lg text-black text-[10px] md:text-xs font-bold flex items-center space-x-1.5 shadow-lg pointer-events-auto">
          <AlertCircle size={14} className="shrink-0" />
          <span>{language === "zh" ? "兼容模式已启用 (Canvas 2D 引擎)" : "Compatibility Mode (Canvas 2D)"}</span>
        </div>

        <button
          onClick={onShowHelp}
          className="bg-bridge-panel/95 backdrop-blur border border-bridge-highlight/70 px-2.5 py-1 rounded-lg text-bridge-highlight text-[10px] md:text-xs font-bold flex items-center space-x-1 shadow-lg pointer-events-auto hover:bg-bridge-accent hover:text-bridge-bg transition-all"
        >
          <HelpCircle size={13} />
          <span>{language === "zh" ? "Chrome 开启 WebGL 教程" : "WebGL Guide"}</span>
        </button>
      </div>

      {/* 缩放按钮 */}
      <div className="absolute right-3 bottom-20 flex flex-col space-y-1 z-20">
        <button
          onClick={() => setZoom((z) => Math.min(15, z + 0.5))}
          className="w-8 h-8 rounded-lg bg-bridge-panel/90 border border-bridge-border text-white font-bold flex items-center justify-center shadow-lg"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(6, z - 0.5))}
          className="w-8 h-8 rounded-lg bg-bridge-panel/90 border border-bridge-border text-white font-bold flex items-center justify-center shadow-lg"
        >
          -
        </button>
      </div>
    </div>
  );
};
