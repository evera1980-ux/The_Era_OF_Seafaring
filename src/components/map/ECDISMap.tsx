import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { useGameStore } from "../../store";
import { PORTS } from "../../config/ports";
import { checkWebGLSupport } from "./webglDetector";
import { CanvasFallbackMap } from "./CanvasFallbackMap";
import { Plus, Minus } from "lucide-react";
import { buildRangeRingsGeoJSON } from "./RangeRingLayer";
import { WindParticleLayer } from "./WindParticleLayer";
import { selectMaxRangeNM } from "../../store/selectors/shipSelectors";
import { useTranslation } from "../../i18n";
import { GameAsset } from "../common/GameAsset";
import { assetRegistry } from "../../assets/AssetRegistry";

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
      const shipIconSrc = assetRegistry.resolveIconPath("hud_ship_marker", "@2x");
      const el = document.createElement("div");
      el.className = "player-ship-marker pointer-events-none flex flex-col items-center";
      el.style.zIndex = "40";
      el.innerHTML = `
        <div class="player-ship-hull flex items-center justify-center" style="width:42px;height:42px;transform:rotate(${activeVessel.headingDeg}deg)">
          <img src="${shipIconSrc}" alt="Own Ship" referrerpolicy="no-referrer" style="width:40px;height:40px;border-radius:9999px;filter:drop-shadow(0 0 8px #56D9E8);object-fit:contain;" />
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

    const aisIconSrc = assetRegistry.resolveIconPath("hud_ais_marker", "@2x");
    aisTargets.forEach((target) => {
      const el = document.createElement("div");
      el.className = "ais-target-marker cursor-pointer flex flex-col items-center";
      el.innerHTML = `
        <div class="w-6 h-6 flex items-center justify-center" style="transform: rotate(${target.cogDeg}deg)">
          <img src="${aisIconSrc}" alt="${target.vesselName}" referrerpolicy="no-referrer" style="width:24px;height:24px;border-radius:9999px;object-fit:contain;" />
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

      {/* 右侧浮动无框高对比触控工具条 (去掉底色和线框，多重投影确保全海图清晰可见) */}
      <div className="absolute right-2.5 top-16 flex flex-col items-center space-y-2 z-20 pointer-events-auto select-none">
        <button
          type="button"
          onClick={handleRecenter}
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
          onClick={() => mapRef.current?.zoomIn()}
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
          onClick={() => mapRef.current?.zoomOut()}
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

      {/* 左上角无边框高精度经纬度与续航遥测文字 (支持4位小数高精度GPS跳字与km/h实时换算) */}
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
    </div>
  );
};
