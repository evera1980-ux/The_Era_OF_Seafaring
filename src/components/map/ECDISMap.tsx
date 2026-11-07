import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { useGameStore } from "../../store";
import { PORTS } from "../../config/ports";
import { checkWebGLSupport } from "./webglDetector";
import { CanvasFallbackMap } from "./CanvasFallbackMap";
import { WebGLTroubleshootModal } from "../modals/WebGLTroubleshootModal";
import { Locate, Plus, Minus } from "lucide-react";

export const ECDISMap: React.FC = () => {
  const [webglStatus] = useState(() => checkWebGLSupport());
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  if (!webglStatus.supported) {
    return (
      <>
        <CanvasFallbackMap onShowHelp={() => setShowTroubleshoot(true)} />
        <WebGLTroubleshootModal
          isOpen={showTroubleshoot}
          onClose={() => setShowTroubleshoot(false)}
        />
      </>
    );
  }

  return <WebGLMapContent />;
};

const WebGLMapContent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const playerMarkerRef = useRef<maplibregl.Marker | null>(null);
  const aisMarkersRef = useRef<maplibregl.Marker[]>([]);

  const activeVessel = useGameStore((state) => state.activeVessel);
  const aisTargets = useGameStore((state) => state.aisTargets);
  const mapTileSource = useGameStore((state) => state.mapTileSource);
  const plannedRoute = useGameStore((state) => state.plannedRoute);
  const openModal = useGameStore((state) => state.openModal);

  const getMapStyle = (source: typeof mapTileSource): maplibregl.StyleSpecification => {
    let tileUrl = "https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png";
    let attribution = "© CARTO / OpenStreetMap";

    if (source === "GOOGLE_SATELLITE") {
      tileUrl = "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";
      attribution = "© Google Maps Satellite";
    } else if (source === "OPENSTREETMAP") {
      tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      attribution = "© OpenStreetMap contributors";
    }

    return {
      version: 8,
      sources: {
        "ocean-basemap": {
          type: "raster",
          tiles: [tileUrl],
          tileSize: 256,
          attribution,
        },
      },
      layers: [
        {
          id: "ocean-basemap-layer",
          type: "raster",
          source: "ocean-basemap",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getMapStyle(mapTileSource),
        center: [activeVessel.position.longitude, activeVessel.position.latitude],
        zoom: 10,
        pitch: 0,
        bearing: 0,
        attributionControl: false,
      });

      mapRef.current = map;

      Object.values(PORTS).forEach((port) => {
        const el = document.createElement("div");
        el.className = "port-marker cursor-pointer group flex flex-col items-center";
        el.innerHTML = `
          <div class="w-4 h-4 rounded-full bg-bridge-safe border-2 border-white shadow-[0_0_10px_#35D39A] group-hover:scale-125 transition-transform flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-[#07131F]"></div>
          </div>
          <div class="text-[10px] font-mono font-bold text-bridge-safe bg-bridge-panel/90 px-1.5 py-0.5 rounded border border-bridge-border mt-1 shadow-md whitespace-nowrap">
            ⚓ ${port.name.split(" ")[0]}
          </div>
        `;
        el.onclick = () => {
          openModal("PORT_TRADE", { portId: port.portId });
        };

        new maplibregl.Marker({ element: el })
          .setLngLat([port.position.longitude, port.position.latitude])
          .addTo(map);
      });
    } catch (err) {
      console.error("MapLibre init error:", err);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(getMapStyle(mapTileSource));
    }
  }, [mapTileSource]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateRouteLayer = () => {
      if (!map.isStyleLoaded()) return;

      const sourceId = "planned-route-source";
      const layerId = "planned-route-line";

      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      if (plannedRoute && plannedRoute.waypoints.length > 0) {
        const coordinates = [
          [activeVessel.position.longitude, activeVessel.position.latitude],
          ...plannedRoute.waypoints.map((wp) => [wp.position.longitude, wp.position.latitude]),
        ];

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates,
            },
          },
        });

        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#56D9E8",
            "line-width": 3,
            "line-dasharray": [2, 2],
          },
        });
      }
    };

    if (map.isStyleLoaded()) {
      updateRouteLayer();
    } else {
      map.once("style.load", updateRouteLayer);
    }
  }, [plannedRoute, activeVessel.position]);

  useEffect(() => {
    if (!mapRef.current) return;

    const [lon, lat] = [activeVessel.position.longitude, activeVessel.position.latitude];

    if (!playerMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "player-ship-marker relative flex items-center justify-center";
      el.innerHTML = `
        <div class="w-10 h-10 -ml-5 -mt-5 flex items-center justify-center transition-transform duration-200">
          <svg viewBox="0 0 40 40" class="w-full h-full filter drop-shadow-[0_0_8px_#35C6D8]">
            <line x1="20" y1="20" x2="20" y2="2" stroke="#56D9E8" stroke-width="2" stroke-dasharray="3,2" />
            <polygon points="20,6 27,32 20,28 13,32" fill="#35C6D8" stroke="#FFFFFF" stroke-width="1.5" />
            <circle cx="20" cy="20" r="3" fill="#FFFFFF" />
          </svg>
        </div>
      `;
      playerMarkerRef.current = new maplibregl.Marker({ element: el, rotationAlignment: "map" })
        .setLngLat([lon, lat])
        .addTo(mapRef.current);
    } else {
      playerMarkerRef.current.setLngLat([lon, lat]);
      playerMarkerRef.current.setRotation(activeVessel.headingDeg);
    }

    mapRef.current.easeTo({
      center: [lon, lat],
      duration: 600,
    });
  }, [activeVessel.position, activeVessel.headingDeg]);

  useEffect(() => {
    if (!mapRef.current) return;

    aisMarkersRef.current.forEach((m) => m.remove());
    aisMarkersRef.current = [];

    aisTargets.forEach((target) => {
      const el = document.createElement("div");
      el.className = "ais-target-marker cursor-pointer flex flex-col items-center";
      el.innerHTML = `
        <div class="w-6 h-6 flex items-center justify-center" style="transform: rotate(${target.cogDeg}deg)">
          <svg viewBox="0 0 24 24" class="w-full h-full text-bridge-warning">
            <polygon points="12,2 18,20 12,16 6,20" fill="rgba(245,185,66,0.85)" stroke="#FFFFFF" stroke-width="1.2" />
          </svg>
        </div>
        <div class="text-[9px] font-mono text-bridge-warning bg-bridge-panel/90 px-1 py-0.2 rounded border border-bridge-border mt-0.5">
          ${target.vesselName.substring(0, 10)}
        </div>
      `;
      el.onclick = () => {
        openModal("AIS_DETAIL", { aisId: target.targetId });
      };

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([target.position.longitude, target.position.latitude])
        .addTo(mapRef.current!);

      aisMarkersRef.current.push(marker);
    });
  }, [aisTargets]);

  // 手机端快捷居中本船
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [activeVessel.position.longitude, activeVessel.position.latitude],
        zoom: 11,
        duration: 800,
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 手机端右侧浮动触控工具条 */}
      <div className="absolute right-3 top-20 flex flex-col space-y-1.5 z-20 pointer-events-auto">
        {/* 一键居中本船 */}
        <button
          onClick={handleRecenter}
          className="w-9 h-9 rounded-xl bg-bridge-panel/90 backdrop-blur border border-bridge-border text-bridge-highlight flex items-center justify-center shadow-xl active:bg-bridge-accent active:text-bridge-bg"
          title="居中本船 (Recenter)"
        >
          <Locate size={16} />
        </button>
        {/* 缩放 + */}
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-9 h-9 rounded-xl bg-bridge-panel/90 backdrop-blur border border-bridge-border text-white flex items-center justify-center shadow-xl active:bg-bridge-accent active:text-bridge-bg font-bold"
        >
          <Plus size={16} />
        </button>
        {/* 缩放 - */}
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-9 h-9 rounded-xl bg-bridge-panel/90 backdrop-blur border border-bridge-border text-white flex items-center justify-center shadow-xl active:bg-bridge-accent active:text-bridge-bg font-bold"
        >
          <Minus size={16} />
        </button>
      </div>

      {/* 经纬度位置指示 */}
      <div className="absolute top-3 left-3 pointer-events-none bg-bridge-panel/85 backdrop-blur border border-bridge-border px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center space-x-2 text-bridge-text">
        <span className="w-1.5 h-1.5 rounded-full bg-bridge-safe animate-pulse"></span>
        <span className="text-bridge-highlight font-bold">WGS84</span>
        <span className="text-bridge-textMuted hidden xs:inline">
          {activeVessel.position.latitude.toFixed(2)}°N, {activeVessel.position.longitude.toFixed(2)}°E
        </span>
      </div>
    </div>
  );
};
