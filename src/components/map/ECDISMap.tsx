import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { useGameStore } from "../../store";
import { PORTS } from "../../config/ports";
import { checkWebGLSupport } from "./webglDetector";
import { CanvasFallbackMap } from "./CanvasFallbackMap";
import { Locate, Plus, Minus, Wind, CircleDot } from "lucide-react";
import { buildRangeRingsGeoJSON } from "./RangeRingLayer";
import { WindParticleLayer } from "./WindParticleLayer";
import { selectMaxRangeNM } from "../../store/selectors/shipSelectors";
import { useTranslation } from "../../i18n";

export const ECDISMap: React.FC = () => {
  const [webglStatus, setWebglStatus] = useState(() => checkWebGLSupport());

  if (!webglStatus.supported) {
    return <CanvasFallbackMap />;
  }

  return (
    <WebGLMapContent
      onWebGLError={() =>
        setWebglStatus({ supported: false, reason: "MapLibre WebGL2 context failed" })
      }
    />
  );
};

const WebGLMapContent: React.FC<{ onWebGLError: () => void }> = ({ onWebGLError }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const playerMarkerRef = useRef<maplibregl.Marker | null>(null);
  const aisMarkersRef = useRef<maplibregl.Marker[]>([]);

  const activeVessel = useGameStore((state) => state.activeVessel);
  const trackHistory = useGameStore((state) => state.trackHistory);
  const unlockedPerkIds = useGameStore((state) => state.unlockedPerkIds);
  const roWaterMakerEnabled = useGameStore((state) => state.roWaterMakerEnabled);
  const currentWeather = useGameStore((state) => state.currentWeather);
  const aisTargets = useGameStore((state) => state.aisTargets);
  const mapTileSource = useGameStore((state) => state.mapTileSource);
  const plannedRoute = useGameStore((state) => state.plannedRoute);
  const activeWaypointIndex = useGameStore((state) => state.activeWaypointIndex);
  const openModal = useGameStore((state) => state.openModal);
  const { t } = useTranslation();

  const [showWindParticles, setShowWindParticles] = useState(true);
  const [showRangeRing, setShowRangeRing] = useState(true);

  const maxRangeNM = selectMaxRangeNM(
    activeVessel,
    unlockedPerkIds,
    roWaterMakerEnabled
  );

  const getInitialMapStyle = (
    initialSource: typeof mapTileSource
  ): maplibregl.StyleSpecification => {
    const bgColors: Record<typeof mapTileSource, string> = {
      NAUTICAL_DARK: "#07131F",
      GOOGLE_SATELLITE: "#031B28",
      OPENSTREETMAP: "#B8DDF0",
    };

    return {
      version: 8,
      sources: {
        "basemap-dark": {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "© Esri / NOAA",
        },
        "basemap-dark-ref": {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
        "basemap-satellite": {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "© Esri World Imagery",
        },
        "basemap-satellite-ref": {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
        "basemap-osm": {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "© Esri Ocean / Hydrographic Chart",
        },
        "basemap-osm-ref": {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
        "tactical-range-rings-source": {
          type: "geojson",
          data: buildRangeRingsGeoJSON(activeVessel.position, maxRangeNM, 20),
        },
        "vessel-track-source": {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        },
        "planned-route-source": {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        },
      },
      layers: [
        {
          id: "ocean-background",
          type: "background",
          paint: {
            "background-color": bgColors[initialSource],
          },
        },
        {
          id: "layer-NAUTICAL_DARK",
          type: "raster",
          source: "basemap-dark",
          minzoom: 0,
          maxzoom: 19,
          layout: {
            visibility: initialSource === "NAUTICAL_DARK" ? "visible" : "none",
          },
        },
        {
          id: "layer-NAUTICAL_DARK-ref",
          type: "raster",
          source: "basemap-dark-ref",
          minzoom: 0,
          maxzoom: 19,
          layout: {
            visibility: initialSource === "NAUTICAL_DARK" ? "visible" : "none",
          },
        },
        {
          id: "layer-GOOGLE_SATELLITE",
          type: "raster",
          source: "basemap-satellite",
          minzoom: 0,
          maxzoom: 19,
          layout: {
            visibility: initialSource === "GOOGLE_SATELLITE" ? "visible" : "none",
          },
        },
        {
          id: "layer-GOOGLE_SATELLITE-ref",
          type: "raster",
          source: "basemap-satellite-ref",
          minzoom: 0,
          maxzoom: 19,
          layout: {
            visibility: initialSource === "GOOGLE_SATELLITE" ? "visible" : "none",
          },
        },
        {
          id: "layer-OPENSTREETMAP",
          type: "raster",
          source: "basemap-osm",
          minzoom: 0,
          maxzoom: 13,
          layout: {
            visibility: initialSource === "OPENSTREETMAP" ? "visible" : "none",
          },
        },
        {
          id: "layer-OPENSTREETMAP-ref",
          type: "raster",
          source: "basemap-osm-ref",
          minzoom: 0,
          maxzoom: 13,
          layout: {
            visibility: initialSource === "OPENSTREETMAP" ? "visible" : "none",
          },
        },
        {
          id: "tactical-fuel-ring-fill",
          type: "fill",
          source: "tactical-range-rings-source",
          filter: ["==", ["get", "ringType"], "FUEL_RANGE"],
          paint: {
            "fill-color": "#35D39A",
            "fill-opacity": 0.05,
          },
        },
        {
          id: "tactical-fuel-ring-outline",
          type: "line",
          source: "tactical-range-rings-source",
          filter: ["==", ["get", "ringType"], "FUEL_RANGE"],
          paint: {
            "line-color": "#35D39A",
            "line-width": 1.8,
            "line-dasharray": [4, 3],
          },
        },
        {
          id: "tactical-radar-ring-outline",
          type: "line",
          source: "tactical-range-rings-source",
          filter: ["==", ["get", "ringType"], "RADAR_20NM"],
          paint: {
            "line-color": "#35C6D8",
            "line-width": 1.2,
            "line-dasharray": [2, 2],
            "line-opacity": 0.65,
          },
        },
        {
          id: "vessel-track-line",
          type: "line",
          source: "vessel-track-source",
          paint: {
            "line-color": "#38BDF8",
            "line-width": 2,
            "line-dasharray": [2, 2],
            "line-opacity": 0.85,
          },
        },
        {
          id: "planned-route-line",
          type: "line",
          source: "planned-route-source",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#56D9E8",
            "line-width": 3,
            "line-dasharray": [3, 2],
          },
        },
      ],
    };
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getInitialMapStyle(mapTileSource),
        center: [activeVessel.position.longitude, activeVessel.position.latitude],
        zoom: 7.5,
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
      onWebGLError();
    }

    return () => {
      if (playerMarkerRef.current) {
        playerMarkerRef.current.remove();
        playerMarkerRef.current = null;
      }
      aisMarkersRef.current.forEach((m) => m.remove());
      aisMarkersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyBasemapVisibility = () => {
      try {
        const bgColors: Record<typeof mapTileSource, string> = {
          NAUTICAL_DARK: "#07131F",
          GOOGLE_SATELLITE: "#031B28",
          OPENSTREETMAP: "#B8DDF0",
        };

        if (map.getLayer("ocean-background")) {
          map.setPaintProperty(
            "ocean-background",
            "background-color",
            bgColors[mapTileSource]
          );
        }

        const sources: (typeof mapTileSource)[] = [
          "NAUTICAL_DARK",
          "GOOGLE_SATELLITE",
          "OPENSTREETMAP",
        ];

        sources.forEach((src) => {
          const vis = src === mapTileSource ? "visible" : "none";
          const baseLayerId = `layer-${src}`;
          const refLayerId = `layer-${src}-ref`;
          if (map.getLayer(baseLayerId)) {
            map.setLayoutProperty(baseLayerId, "visibility", vis);
          }
          if (map.getLayer(refLayerId)) {
            map.setLayoutProperty(refLayerId, "visibility", vis);
          }
        });
        map.triggerRepaint();
      } catch {
        // Style not initialized yet
      }
    };

    if (map.getLayer("ocean-background")) {
      applyBasemapVisibility();
    } else {
      map.once("styledata", applyBasemapVisibility);
    }
  }, [mapTileSource]);

  // 更新大圆航线、历史尾迹线与燃油续航圈/雷达圈图层 (直接调用 GeoJSONSource.setData，零闪烁且不依赖瓦片加载完成)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateTacticalLayers = () => {
      try {
        // 1. 燃油续航圈 + 20NM 雷达圈
        const ringSource = map.getSource("tactical-range-rings-source") as
          | maplibregl.GeoJSONSource
          | undefined;
        if (ringSource) {
          if (showRangeRing) {
            ringSource.setData(
              buildRangeRingsGeoJSON(activeVessel.position, maxRangeNM, 20)
            );
          } else {
            ringSource.setData({ type: "FeatureCollection", features: [] });
          }
        }

        // 2. 历史尾迹线 (Track Trail)
        const trackSource = map.getSource("vessel-track-source") as
          | maplibregl.GeoJSONSource
          | undefined;
        if (trackSource) {
          if (trackHistory.length >= 1) {
            trackSource.setData({
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [
                  ...trackHistory.map((pt) => [pt.longitude, pt.latitude]),
                  [activeVessel.position.longitude, activeVessel.position.latitude],
                ],
              },
            });
          } else {
            trackSource.setData({ type: "FeatureCollection", features: [] });
          }
        }

        // 3. 规划大圆航线
        const routeSource = map.getSource("planned-route-source") as
          | maplibregl.GeoJSONSource
          | undefined;
        if (routeSource) {
          if (plannedRoute && plannedRoute.waypoints.length > 0) {
            const remainingWaypoints = plannedRoute.waypoints.slice(activeWaypointIndex);
            const coordinates = [
              [activeVessel.position.longitude, activeVessel.position.latitude],
              ...remainingWaypoints.map((wp) => [
                wp.position.longitude,
                wp.position.latitude,
              ]),
            ];
            routeSource.setData({
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates,
              },
            });
          } else {
            routeSource.setData({ type: "FeatureCollection", features: [] });
          }
        }

        map.triggerRepaint();
      } catch {
        // Ignore transient style init
      }
    };

    updateTacticalLayers();
    map.once("styledata", updateTacticalLayers);
  }, [
    plannedRoute,
    activeWaypointIndex,
    activeVessel.position,
    maxRangeNM,
    showRangeRing,
    trackHistory,
  ]);

  useEffect(() => {
    if (!mapRef.current) return;

    const [lon, lat] = [activeVessel.position.longitude, activeVessel.position.latitude];

    if (!playerMarkerRef.current || !playerMarkerRef.current.getElement().isConnected) {
      const el = document.createElement("div");
      el.className = "player-ship-marker pointer-events-none flex flex-col items-center";
      el.style.zIndex = "40";
      el.innerHTML = `
        <div class="player-ship-hull flex items-center justify-center" style="width:44px;height:44px;transform:rotate(${activeVessel.headingDeg}deg)">
          <svg width="44" height="44" viewBox="0 0 44 44" style="filter:drop-shadow(0 0 8px #56D9E8)">
            <line x1="22" y1="22" x2="22" y2="2" stroke="#56D9E8" stroke-width="2.5" stroke-dasharray="3,2" />
            <polygon points="22,6 31,35 22,29 13,35" fill="#35C6D8" stroke="#FFFFFF" stroke-width="2" />
            <circle cx="22" cy="22" r="3.5" fill="#FFFFFF" />
          </svg>
        </div>
        <div class="text-[9px] font-mono font-bold text-cyan-200 bg-slate-950/90 px-1.5 py-0.5 rounded border border-cyan-400/70 -mt-1 shadow-lg whitespace-nowrap">
          🚢 ${activeVessel.sogKn.toFixed(1)} kn
        </div>
      `;
      playerMarkerRef.current = new maplibregl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([lon, lat])
        .addTo(mapRef.current);
    } else {
      playerMarkerRef.current.setLngLat([lon, lat]);
      const markerEl = playerMarkerRef.current.getElement();
      const hullEl = markerEl.querySelector(".player-ship-hull") as HTMLElement | null;
      if (hullEl) {
        hullEl.style.transform = `rotate(${activeVessel.headingDeg}deg)`;
      }
      const badgeEl = markerEl.querySelector("div:last-child") as HTMLElement | null;
      if (badgeEl) {
        badgeEl.textContent = `🚢 ${activeVessel.sogKn.toFixed(1)} kn`;
      }
    }

    // 仅当本船驶出视口中心安全框 (60% 区域) 时平滑跟焦，从而让玩家直观看到船标在海图上沿航线移动
    const bounds = mapRef.current.getBounds();
    const west = bounds.getWest();
    const east = bounds.getEast();
    const south = bounds.getSouth();
    const north = bounds.getNorth();
    const padLon = (east - west) * 0.22;
    const padLat = (north - south) * 0.22;
    if (
      lon < west + padLon ||
      lon > east - padLon ||
      lat < south + padLat ||
      lat > north - padLat
    ) {
      mapRef.current.easeTo({
        center: [lon, lat],
        duration: 500,
      });
    }
  }, [activeVessel.position, activeVessel.headingDeg, activeVessel.sogKn]);

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

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [activeVessel.position.longitude, activeVessel.position.latitude],
        zoom: 8.5,
        duration: 800,
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 动态风场粒子层 */}
      <WindParticleLayer
        windSpeedKn={currentWeather.windSpeedKn}
        windDirectionDeg={currentWeather.windDirectionDeg}
        enabled={showWindParticles}
      />

      {/* 手机端右侧浮动触控工具条 (>= 40x40px 触控热区) */}
      <div className="absolute right-3 top-20 flex flex-col space-y-1.5 z-20 pointer-events-auto">
        <button
          onClick={handleRecenter}
          className="w-10 h-10 rounded-xl bg-bridge-panel/90 backdrop-blur border border-bridge-border text-bridge-highlight flex items-center justify-center shadow-xl active:bg-bridge-accent active:text-bridge-bg"
          title="Recenter"
        >
          <Locate size={16} />
        </button>
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-10 h-10 rounded-xl bg-bridge-panel/90 backdrop-blur border border-bridge-border text-white flex items-center justify-center shadow-xl active:bg-bridge-accent active:text-bridge-bg font-bold"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-10 h-10 rounded-xl bg-bridge-panel/90 backdrop-blur border border-bridge-border text-white flex items-center justify-center shadow-xl active:bg-bridge-accent active:text-bridge-bg font-bold"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={() => setShowWindParticles((v) => !v)}
          className={`w-10 h-10 rounded-xl backdrop-blur border flex items-center justify-center shadow-xl transition-all ${
            showWindParticles
              ? "bg-sky-500/25 border-sky-400 text-sky-300"
              : "bg-bridge-panel/90 border-bridge-border text-bridge-textMuted"
          }`}
          title={t.hud.windLayer}
        >
          <Wind size={16} />
        </button>
        <button
          onClick={() => setShowRangeRing((v) => !v)}
          className={`w-10 h-10 rounded-xl backdrop-blur border flex items-center justify-center shadow-xl transition-all ${
            showRangeRing
              ? "bg-emerald-500/25 border-emerald-400 text-emerald-300"
              : "bg-bridge-panel/90 border-bridge-border text-bridge-textMuted"
          }`}
          title={t.hud.rangeRing}
        >
          <CircleDot size={16} />
        </button>
      </div>

      {/* 经纬度位置与最大续航圈指示 */}
      <div className="absolute top-3 left-2.5 pointer-events-none bg-bridge-panel/85 backdrop-blur border border-bridge-border px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-mono flex items-center space-x-1 sm:space-x-1.5 text-bridge-text z-20 max-w-[42vw] sm:max-w-none truncate">
        <span className="w-1.5 h-1.5 rounded-full bg-bridge-safe animate-pulse shrink-0"></span>
        <span className="text-bridge-highlight font-bold hidden sm:inline">WGS84</span>
        <span className="text-bridge-textMuted truncate">
          {activeVessel.position.latitude.toFixed(2)}°N, {activeVessel.position.longitude.toFixed(2)}°E
        </span>
        <span className="text-bridge-border hidden xs:inline">·</span>
        <span className="text-bridge-safe font-bold shrink-0 hidden xs:inline">
          <span className="hidden sm:inline">{t.hud.rangeNM}: </span>
          {maxRangeNM} NM
        </span>
      </div>
    </div>
  );
};
