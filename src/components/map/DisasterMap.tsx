import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { DisasterEvent } from '../../types/disaster';
import { DISASTER_TYPES_CONFIG, SEVERITY_CONFIG } from '../../utils/formatters';
import { RotateCcw, Map as MapIcon, Moon, Satellite, Navigation, Loader2, Plus, Minus } from 'lucide-react';
import { THAILAND_RIVERS, MAJOR_DAMS } from '../../data/thailandRivers';
import { rainViewerAdapter, getRadarTileUrl, type RadarFrame } from '../../services/api/adapters/rainViewerAdapter';
import { MapOverlayControl, type MapOverlaySettings } from './MapOverlayControl';
import { geolocationService } from '../../services/geolocationService';
import { geocodingService } from '../../services/geocodingService';
import { provinceService } from '../../services/provinceService';

export interface UserGPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  addressName?: string;
  provinceName?: string;
  districtName?: string;
}

export interface SearchPinLocation {
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
}

interface DisasterMapProps {
  events: DisasterEvent[];
  selectedEventId: string | null;
  onSelectEvent: (event: DisasterEvent) => void;
  focusedLocation: { center: [number, number]; zoom: number } | null;
  userLocation?: UserGPSLocation | null;
  searchPinLocation?: SearchPinLocation | null;
  onUserLocationFound?: (location: UserGPSLocation) => void;
  className?: string;
}

type BasemapType = 'osm-dark' | 'osm-standard' | 'satellite';

const THAILAND_CENTER: [number, number] = [13.7563, 100.5018];
const DEFAULT_ZOOM = 6;

export const DisasterMap: React.FC<DisasterMapProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  focusedLocation,
  userLocation = null,
  searchPinLocation = null,
  onUserLocationFound,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const riversLayerRef = useRef<L.LayerGroup | null>(null);
  const damsLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);
  const searchPinLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const radarTileLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteTileLayerRef = useRef<L.TileLayer | null>(null);

  // Local GPS state for the map's own floating GPS button
  const [internalUserLocation, setInternalUserLocation] = useState<UserGPSLocation | null>(null);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  // Default to Standard Clean Light OpenStreetMap
  const [basemap, setBasemap] = useState<BasemapType>('osm-standard');

  // Map Overlay Layers State (Waterways, Dams, Rain Radar, Clouds)
  const [overlaySettings, setOverlaySettings] = useState<MapOverlaySettings>({
    showRivers: true,
    showDams: true,
    showRainRadar: true,
    showClouds: false,
    radarOpacity: 0.55,
    radarColorScheme: 4,
  });

  // RainViewer Radar & Satellite Cloud frames
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [latestSatelliteUrl, setLatestSatelliteUrl] = useState<string>('');
  const [isPlayingRadar, setIsPlayingRadar] = useState<boolean>(false);

  // Fetch RainViewer metadata on mount
  useEffect(() => {
    let isMounted = true;
    rainViewerAdapter.getMetadata().then((data) => {
      if (!isMounted) return;
      if (data.radarFrames && data.radarFrames.length > 0) {
        setRadarFrames(data.radarFrames);
        setCurrentFrameIndex(data.radarFrames.length - 1);
      }
      if (data.latestSatelliteUrl) {
        setLatestSatelliteUrl(data.latestSatelliteUrl);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Radar Animation Loop
  useEffect(() => {
    if (!isPlayingRadar || radarFrames.length === 0) return;
    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % radarFrames.length);
    }, 900);

    return () => clearInterval(interval);
  }, [isPlayingRadar, radarFrames.length]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: THAILAND_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 5,
      maxZoom: 17,
      zoomControl: false,
    });

    // 100% Free OpenStreetMap tile layer (Clean Light Standard)
    const baseTile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: 'map-tiles-standard',
    }).addTo(map);

    tileLayerRef.current = baseTile;

    // Rivers Layer Group
    const riversGroup = L.layerGroup().addTo(map);
    riversLayerRef.current = riversGroup;

    // Dams Layer Group
    const damsGroup = L.layerGroup().addTo(map);
    damsLayerRef.current = damsGroup;

    // Disaster Marker Layer Group
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    // User GPS Location Layer Group (Pulsing GPS)
    const userLocGroup = L.layerGroup().addTo(map);
    userLocationLayerRef.current = userLocGroup;

    // Search Pin Layer Group (Google Maps pin drop)
    const searchPinGroup = L.layerGroup().addTo(map);
    searchPinLayerRef.current = searchPinGroup;

    mapInstanceRef.current = map;

    // Ensure map layout is accurately calculated
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
      userLocationLayerRef.current = null;
      searchPinLayerRef.current = null;
      markersLayerRef.current = null;
      riversLayerRef.current = null;
      damsLayerRef.current = null;
    };
  }, []);

  // Handle Basemap Switcher
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let newTile: L.TileLayer;
    if (basemap === 'osm-dark') {
      newTile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        className: 'map-tiles-dark',
      });
    } else if (basemap === 'satellite') {
      newTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
          maxZoom: 18,
        }
      );
    } else {
      // Standard Clean Light OSM
      newTile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        className: 'map-tiles-standard',
      });
    }

    newTile.addTo(map);
    tileLayerRef.current = newTile;
  }, [basemap]);

  // Render Satellite Clouds Layer with maxNativeZoom: 6 (Prevents "Zoom Level Not Supported" tiles)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (satelliteTileLayerRef.current) {
      map.removeLayer(satelliteTileLayerRef.current);
      satelliteTileLayerRef.current = null;
    }

    if (!overlaySettings.showClouds || !latestSatelliteUrl) return;

    try {
      const satTile = L.tileLayer(latestSatelliteUrl, {
        opacity: overlaySettings.radarOpacity * 0.75,
        maxZoom: 18,
        maxNativeZoom: 6, // RainViewer infrared satellite native resolution
        zIndex: 8,
      });

      satTile.on('tileerror', (e) => {
        if (e && e.tile) {
          e.tile.style.visibility = 'hidden';
        }
      });

      satTile.addTo(map);
      satelliteTileLayerRef.current = satTile;
    } catch (err) {
      console.warn('Error setting up satellite cloud layer:', err);
    }
  }, [overlaySettings.showClouds, overlaySettings.radarOpacity, latestSatelliteUrl]);

  // Render RainViewer Weather Radar Layer with maxNativeZoom: 7 (RainViewer Free Tier max is 7)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (radarTileLayerRef.current) {
      map.removeLayer(radarTileLayerRef.current);
      radarTileLayerRef.current = null;
    }

    if (!overlaySettings.showRainRadar || radarFrames.length === 0) return;

    try {
      const activeFrame = radarFrames[currentFrameIndex] || radarFrames[radarFrames.length - 1];
      if (!activeFrame || !activeFrame.path) return;

      const tileUrl = getRadarTileUrl(
        activeFrame,
        overlaySettings.radarColorScheme ?? 4,
        true,
        false
      );

      const radarTile = L.tileLayer(tileUrl, {
        opacity: overlaySettings.radarOpacity,
        maxZoom: 19,
        maxNativeZoom: 7, // RainViewer Doppler radar free tier is strictly capped at 7
        zIndex: 10,
      });

      // Defensive guard: Hide tile if error occurs to prevent broken image placards
      radarTile.on('tileerror', (e) => {
        if (e && e.tile) {
          e.tile.style.visibility = 'hidden';
        }
      });

      radarTile.addTo(map);
      radarTileLayerRef.current = radarTile;
    } catch (err) {
      console.warn('Error setting up rain radar layer:', err);
    }
  }, [overlaySettings.showRainRadar, overlaySettings.radarOpacity, overlaySettings.radarColorScheme, currentFrameIndex, radarFrames]);

  // Render Rivers & Waterways
  useEffect(() => {
    const map = mapInstanceRef.current;
    const riversGroup = riversLayerRef.current;
    if (!map || !riversGroup) return;

    riversGroup.clearLayers();
    if (!overlaySettings.showRivers) return;

    THAILAND_RIVERS.forEach((river) => {
      try {
        // Outer glowing line
        const glowLine = L.polyline(river.coordinates, {
          color: river.color,
          weight: 6,
          opacity: 0.28,
          lineCap: 'round',
          lineJoin: 'round',
        });

        // Core river line
        const coreLine = L.polyline(river.coordinates, {
          color: river.color,
          weight: 3.5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        });

        const tooltipHtml = `
          <div class="p-1.5 text-xs w-[260px] sm:w-[280px] max-w-[85vw] whitespace-normal">
            <div class="flex items-center gap-1.5 font-bold text-sky-700 pb-1.5 border-b border-slate-100">
              <span class="text-base leading-none">🌊</span>
              <div>
                <span class="text-sm font-extrabold text-slate-900 block leading-tight">${river.nameTh}</span>
                <span class="text-[10px] text-slate-500 font-normal">(${river.nameEn}) &bull; ${river.basin}</span>
              </div>
            </div>
            
            <div class="text-[11px] text-slate-600 mt-2 leading-relaxed">
              ${river.description}
            </div>

            <div class="mt-2.5 pt-2 border-t border-slate-100 space-y-2 text-[11px]">
              <div>
                <span class="text-[10px] text-slate-400 block font-medium">ทิศทางการไหล:</span>
                <span class="text-slate-800 font-semibold block leading-snug">${river.flowDirectionTh}</span>
              </div>
              <div class="bg-amber-50/90 rounded-lg p-2 border border-amber-200/70">
                <span class="text-[10px] text-amber-800 font-bold block mb-0.5">สถานะตลิ่ง / สภาพน้ำ:</span>
                <span class="text-amber-950 font-medium block leading-snug text-[11px]">${river.currentStatusTh}</span>
              </div>
            </div>
          </div>
        `;

        coreLine.bindTooltip(tooltipHtml, {
          sticky: true,
          direction: 'auto',
          className: 'leaflet-tooltip-dark',
          offset: [0, 0],
        });

        coreLine.bindPopup(tooltipHtml, {
          offset: [0, 0],
        });

        riversGroup.addLayer(glowLine);
        riversGroup.addLayer(coreLine);
      } catch (err) {
        console.warn('Error drawing river:', river.nameTh, err);
      }
    });
  }, [overlaySettings.showRivers]);

  // Render Major Dams
  useEffect(() => {
    const map = mapInstanceRef.current;
    const damsGroup = damsLayerRef.current;
    if (!map || !damsGroup) return;

    damsGroup.clearLayers();
    if (!overlaySettings.showDams) return;

    MAJOR_DAMS.forEach((dam) => {
      try {
        const statusColor =
          dam.percentFull > 85 ? '#ef4444' : dam.percentFull > 70 ? '#f59e0b' : '#10b981';

        const damIcon = L.divIcon({
          className: 'custom-dam-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
              <div class="w-7 h-7 rounded-lg bg-white border-2 flex items-center justify-center text-xs shadow-md transition-transform group-hover:scale-110"
                   style="border-color: ${statusColor};">
                <span>🏭</span>
              </div>
              <span class="absolute -bottom-2 px-1 py-0.2 rounded text-[9px] font-black font-mono text-white shadow"
                    style="background-color: ${statusColor};">
                ${dam.percentFull}%
              </span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        const marker = L.marker(dam.coordinates, { icon: damIcon });

        const damTooltip = `
          <div class="p-1.5 text-xs w-[240px] sm:w-[260px] max-w-[85vw] whitespace-normal">
            <div class="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-100">
              <span class="font-bold text-slate-900 text-sm">${dam.nameTh}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono text-white flex-shrink-0" style="background-color: ${statusColor};">
                น้ำ ${dam.percentFull}%
              </span>
            </div>
            <div class="text-[11px] text-slate-600 mb-1.5 leading-snug">
              จ.${dam.province} (สายน้ำ: ${dam.river})
            </div>
            <div class="pt-1.5 border-t border-slate-100 text-[10px] space-y-1.5 text-slate-600">
              <div class="flex justify-between items-center gap-1">
                <span>ความจุอ่าง:</span>
                <span class="text-slate-900 font-mono font-medium">${dam.capacityMcm.toLocaleString()} ล้าน ลบ.ม.</span>
              </div>
              <div class="flex justify-between items-center gap-1">
                <span>น้ำกักเก็บปัจจุบัน:</span>
                <span class="text-slate-900 font-mono font-medium">${dam.currentStorageMcm.toLocaleString()} ล้าน ลบ.ม.</span>
              </div>
              <div class="flex justify-between items-center gap-1 text-amber-700 font-semibold">
                <span>อัตราการระบายน้ำ:</span>
                <span class="font-mono">${dam.dischargeRateM3s.toLocaleString()} ลบ.ม./วิ</span>
              </div>
            </div>
          </div>
        `;

        marker.bindTooltip(damTooltip, {
          direction: 'auto',
          className: 'leaflet-tooltip-dark',
          offset: [0, -14],
        });

        marker.bindPopup(damTooltip, {
          offset: [0, -14],
        });

        damsGroup.addLayer(marker);
      } catch (err) {
        console.warn('Error creating dam marker:', dam.nameTh, err);
      }
    });
  }, [overlaySettings.showDams]);

  // Update Disaster Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    events.forEach((event) => {
      try {
        if (
          !event ||
          typeof event.latitude !== 'number' ||
          typeof event.longitude !== 'number' ||
          isNaN(event.latitude) ||
          isNaN(event.longitude)
        ) {
          return;
        }

        const isSelected = event.id === selectedEventId;
        const typeConfig = DISASTER_TYPES_CONFIG[event.type] || DISASTER_TYPES_CONFIG.alert;
        const sevConfig = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.normal;

        // Custom HTML Marker Icon (Light Theme with White Background)
        const pulseHtml =
          event.severity === 'danger' || event.severity === 'warning'
            ? `<span class="absolute -inset-1.5 rounded-full animate-ping opacity-60" style="background-color: ${sevConfig.hexColor};"></span>`
            : '';

        const markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125 ${
            isSelected ? 'scale-125 z-50' : 'z-20'
          }" style="width: 36px; height: 36px;">
            ${pulseHtml}
            <div class="relative w-9 h-9 rounded-full flex items-center justify-center text-base shadow-md border-2 transition-all"
                 style="background-color: #ffffff; border-color: ${sevConfig.hexColor}; box-shadow: 0 4px 12px ${sevConfig.pulseColor};">
              <span>${typeConfig.emoji}</span>
            </div>
            ${
              isSelected
                ? `<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style="background-color: ${sevConfig.hexColor};"></div>`
                : ''
            }
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-disaster-marker',
          html: markerHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -20],
        });

        const marker = L.marker([event.latitude, event.longitude], {
          icon: customIcon,
          title: `${event.title} (${event.province})`,
        });

        // Tooltip on hover
        marker.bindTooltip(
          `<div class="p-1.5 text-xs w-[230px] sm:w-[250px] max-w-[85vw] whitespace-normal">
             <div class="font-bold text-slate-900 flex items-center gap-1.5 mb-1 pb-1 border-b border-slate-100">
               <span class="text-base">${typeConfig.emoji}</span>
               <span class="font-bold text-slate-900">${event.province || ''} ${event.district ? `(${event.district})` : ''}</span>
             </div>
             <div class="text-[11px] text-slate-600 leading-snug mb-1.5">${event.title || ''}</div>
             <div class="text-[10px] font-bold flex items-center gap-1" style="color: ${sevConfig.hexColor}">
               <span>${sevConfig.emoji}</span>
               <span>${sevConfig.labelTh}</span>
             </div>
           </div>`,
          {
            direction: 'auto',
            className: 'leaflet-tooltip-dark',
            offset: [0, -18],
          }
        );

        marker.on('click', () => {
          onSelectEvent(event);
        });

        markersGroup.addLayer(marker);
      } catch (err) {
        console.warn('Error creating marker for event:', event, err);
      }
    });
  }, [events, selectedEventId, onSelectEvent]);

  // Handle Pan / Zoom to focused location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (
      !map ||
      !focusedLocation ||
      !focusedLocation.center ||
      !Array.isArray(focusedLocation.center) ||
      focusedLocation.center.length < 2 ||
      typeof focusedLocation.center[0] !== 'number' ||
      typeof focusedLocation.center[1] !== 'number' ||
      isNaN(focusedLocation.center[0]) ||
      isNaN(focusedLocation.center[1])
    ) {
      return;
    }

    try {
      const zoom =
        typeof focusedLocation.zoom === 'number' && !isNaN(focusedLocation.zoom)
          ? focusedLocation.zoom
          : DEFAULT_ZOOM;

      map.invalidateSize();
      const size = map.getSize();
      if (!size || size.x === 0 || size.y === 0) {
        map.setView(focusedLocation.center, zoom);
      } else {
        map.flyTo(focusedLocation.center, zoom, {
          duration: 1.2,
          easeLinearity: 0.25,
        });
      }
    } catch (err) {
      console.warn('Map flyTo encountered an error:', err);
    }
  }, [focusedLocation]);

  // Render User GPS Location on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const userLocLayer = userLocationLayerRef.current;
    if (!map || !userLocLayer) return;

    userLocLayer.clearLayers();

    const activeLocation = userLocation || internalUserLocation;
    if (
      !activeLocation ||
      typeof activeLocation.latitude !== 'number' ||
      typeof activeLocation.longitude !== 'number' ||
      isNaN(activeLocation.latitude) ||
      isNaN(activeLocation.longitude)
    ) {
      return;
    }

    const { latitude, longitude, accuracy, addressName } = activeLocation;

    // 1. Accuracy Circle (Translucent blue circle)
    if (accuracy && accuracy > 0 && accuracy < 50000) {
      const accuracyCircle = L.circle([latitude, longitude], {
        radius: Math.max(accuracy, 25),
        color: '#0284c7',
        fillColor: '#38bdf8',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 4',
      });
      userLocLayer.addLayer(accuracyCircle);
    }

    // 2. Pulsing Blue GPS Marker (Google Maps style)
    const gpsIcon = L.divIcon({
      className: 'user-gps-container',
      html: `
        <div class="user-gps-pulse"></div>
        <div class="user-gps-dot"></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });

    const gpsMarker = L.marker([latitude, longitude], {
      icon: gpsIcon,
      zIndexOffset: 1000,
    });

    const popupHtml = `
      <div class="p-1.5 text-xs w-[240px] sm:w-[260px] max-w-[85vw] whitespace-normal">
        <div class="flex items-center gap-1.5 font-bold text-sky-600 mb-1.5 text-sm pb-1 border-b border-slate-100">
          <span>📍 ตำแหน่งปัจจุบันของคุณ (GPS)</span>
        </div>
        <div class="text-slate-900 font-bold mb-1 leading-snug">
          ${addressName || 'พิกัด GPS ของอุปกรณ์คุณ'}
        </div>
        <div class="text-[11px] text-slate-500 font-mono space-y-0.5 mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
          <div>ละติจูด: ${latitude.toFixed(5)}</div>
          <div>ลองจิจูด: ${longitude.toFixed(5)}</div>
          ${accuracy ? `<div class="text-[10px] text-slate-400">ความแม่นยำ: ±${Math.round(accuracy)} เมตร</div>` : ''}
        </div>
      </div>
    `;

    gpsMarker.bindPopup(popupHtml, {
      className: 'leaflet-tooltip-dark',
      offset: [0, -10],
    });

    userLocLayer.addLayer(gpsMarker);
  }, [userLocation, internalUserLocation]);

  // Render Search Pin Location on Map (Drop pin for searched addresses/places)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const searchPinLayer = searchPinLayerRef.current;
    if (!map || !searchPinLayer) return;

    searchPinLayer.clearLayers();

    if (
      !searchPinLocation ||
      typeof searchPinLocation.latitude !== 'number' ||
      typeof searchPinLocation.longitude !== 'number' ||
      isNaN(searchPinLocation.latitude) ||
      isNaN(searchPinLocation.longitude)
    ) {
      return;
    }

    const { latitude, longitude, title, subtitle } = searchPinLocation;

    const pinIcon = L.divIcon({
      className: 'search-pin-wrapper',
      html: `
        <div class="relative flex flex-col items-center cursor-pointer group" style="transform: translate(-50%, -100%);">
          <div class="w-8 h-8 rounded-full bg-rose-600 text-white shadow-xl flex items-center justify-center border-2 border-white ring-4 ring-rose-500/20 transition-transform group-hover:scale-110">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <div class="w-2 h-1 bg-black/30 rounded-full blur-[1px] mt-0.5"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -34],
    });

    const marker = L.marker([latitude, longitude], {
      icon: pinIcon,
      zIndexOffset: 950,
    });

    const popupHtml = `
      <div class="p-1.5 text-xs w-[240px] sm:w-[260px] max-w-[85vw] whitespace-normal">
        <div class="flex items-center gap-1.5 font-bold text-rose-600 mb-1 pb-1 border-b border-slate-100">
          <span>📍 สถานที่ค้นหา</span>
        </div>
        <div class="text-slate-900 font-bold text-sm mb-1 leading-snug">
          ${title}
        </div>
        ${subtitle ? `<div class="text-[11px] text-slate-500 mb-1.5 leading-relaxed">${subtitle}</div>` : ''}
        <div class="text-[10px] text-slate-400 font-mono bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
          พิกัด: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, {
      className: 'leaflet-tooltip-dark',
      offset: [0, -28],
    });

    searchPinLayer.addLayer(marker);
    marker.openPopup();
  }, [searchPinLocation]);

  // Handle GPS Locate Me Trigger
  const handleLocateGPS = async () => {
    setIsLocatingGPS(true);
    try {
      const pos = await geolocationService.getCurrentPosition();
      const nearest = provinceService.findNearestProvince(pos.latitude, pos.longitude);

      let addressName = '';
      try {
        const rev = await geocodingService.reverseGeocode(pos.latitude, pos.longitude);
        if (rev) addressName = rev.displayName;
      } catch {
        // fallback to province
      }

      const locData: UserGPSLocation = {
        latitude: pos.latitude,
        longitude: pos.longitude,
        accuracy: pos.accuracy,
        provinceName: nearest?.nameTh,
        districtName: nearest?.districts?.[0],
        addressName: addressName || (nearest ? `จ.${nearest.nameTh}` : 'ตำแหน่ง GPS ของคุณ'),
      };

      setInternalUserLocation(locData);

      if (onUserLocationFound) {
        onUserLocationFound(locData);
      }

      const map = mapInstanceRef.current;
      if (map) {
        map.invalidateSize();
        map.flyTo([pos.latitude, pos.longitude], 14, { duration: 1.2 });
      }
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถระบุตำแหน่ง GPS ได้ กรุณาเปิดการระบุตำแหน่งบนอุปกรณ์');
    } finally {
      setIsLocatingGPS(false);
    }
  };

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    try {
      map.invalidateSize();
      const size = map.getSize();
      if (!size || size.x === 0 || size.y === 0) {
        map.setView(THAILAND_CENTER, DEFAULT_ZOOM);
      } else {
        map.flyTo(THAILAND_CENTER, DEFAULT_ZOOM, { duration: 1 });
      }
    } catch (err) {
      console.warn('Map reset view encountered an error:', err);
    }
  };

  return (
    <div
      className={`relative w-full h-full min-h-[380px] sm:min-h-[460px] rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 ${className}`}
    >
      {/* Leaflet map canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Top Floating Controls Bar (Unified flex header to guarantee NO collision) */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-start justify-between gap-2 pointer-events-none">
        {/* 1. Map Overlay & Filter Controller (Top-Left) */}
        <div className="pointer-events-auto flex-shrink-0">
          <MapOverlayControl
            settings={overlaySettings}
            onChangeSettings={setOverlaySettings}
            radarFrames={radarFrames}
            currentFrameIndex={currentFrameIndex}
            onSelectFrameIndex={setCurrentFrameIndex}
            isPlayingRadar={isPlayingRadar}
            onTogglePlayRadar={() => setIsPlayingRadar(!isPlayingRadar)}
          />
        </div>

        {/* 2. Top-Right Action Controls (Basemap Switcher, GPS, & Reset View) - Light Theme */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Basemap Switcher */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-1 border border-slate-200 shadow-md flex items-center gap-1 text-xs">
            <button
              onClick={() => setBasemap('osm-standard')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 font-medium transition-colors ${
                basemap === 'osm-standard'
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="แผนที่มาตรฐาน OpenStreetMap"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">มาตรฐาน</span>
            </button>

            <button
              onClick={() => setBasemap('satellite')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 font-medium transition-colors ${
                basemap === 'satellite'
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="ภาพถ่ายดาวเทียมจริง (Satellite)"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span className="hidden md:inline">ดาวเทียม</span>
            </button>

            <button
              onClick={() => setBasemap('osm-dark')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 font-medium transition-colors ${
                basemap === 'osm-dark'
                  ? 'bg-slate-800 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="แผนที่กลางคืน (Midnight Dark)"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">กลางคืน</span>
            </button>
          </div>

          {/* GPS Locate Me Button */}
          <button
            onClick={handleLocateGPS}
            disabled={isLocatingGPS}
            className={`px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-slate-50 border border-slate-200 shadow-md backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-semibold ${
              internalUserLocation || userLocation ? 'text-sky-600 border-sky-300' : 'text-slate-700'
            }`}
            title="ค้นหาตำแหน่ง GPS ปัจจุบันของฉัน"
          >
            {isLocatingGPS ? (
              <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-sky-600" />
            )}
            <span className="hidden sm:inline">GPS ของฉัน</span>
          </button>

          {/* Reset View Button */}
          <button
            onClick={handleResetView}
            className="px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-md backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
            title="จัดตำแหน่งประเทศไทยตรงกลาง"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden lg:inline">ทั้งประเทศ</span>
          </button>
        </div>
      </div>

      {/* Bottom Right Floating Control Column: GPS + Zoom Controls in unified layout (Zero overlap) */}
      <div className="absolute bottom-4 right-3 z-20 pointer-events-auto flex flex-col items-center gap-2">
        {/* GPS Locate Me Button */}
        <button
          onClick={handleLocateGPS}
          disabled={isLocatingGPS}
          aria-label="ตำแหน่ง GPS ของฉัน"
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/95 hover:bg-slate-50 border border-slate-200 shadow-md flex items-center justify-center transition-all active:scale-90 ${
            internalUserLocation || userLocation
              ? 'ring-2 ring-sky-400 text-sky-600 shadow-sky-200'
              : 'text-slate-700 hover:text-sky-600'
          }`}
          title="ไปที่ตำแหน่ง GPS ปัจจุบันของฉัน"
        >
          {isLocatingGPS ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        {/* Custom Clean Light Zoom Controls */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md flex flex-col overflow-hidden">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-slate-700 hover:text-sky-600 hover:bg-slate-50 border-b border-slate-200 transition-colors active:bg-slate-100"
            title="ซูมเข้า"
            aria-label="ซูมเข้า"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-slate-700 hover:text-sky-600 hover:bg-slate-50 transition-colors active:bg-slate-100"
            title="ซูมออก"
            aria-label="ซูมออก"
          >
            <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* 3. Radar Intensity Legend & Severity Legend (Bottom Left) - Light Theme */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex flex-col gap-2">
        {/* Radar Rain Color Legend */}
        {overlaySettings.showRainRadar && (
          <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 text-[10px] shadow-md flex flex-col gap-1 text-slate-700 max-w-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">เรดาร์ฝน:</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-400" />
                <span className="text-slate-500">เบา</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="text-slate-500">ปานกลาง</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                <span className="text-slate-500">หนัก</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-600" />
                <span className="text-slate-500">หนักมาก</span>
              </div>
            </div>
            <div className="text-[9px] text-slate-400 leading-tight">
              *เส้นแถบแนวนอนเกิดจากคลื่นรบกวนของสถานีเรดาร์ (Spike) ไม่ใช่กลุ่มฝน
            </div>
          </div>
        )}

        {/* Severity Legend */}
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 text-xs shadow-md text-slate-700">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            ระดับความเสี่ยง:
          </span>
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>ปกติ</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>เฝ้าระวัง</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>เสี่ยง</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>อันตราย</span>
          </div>
        </div>
      </div>
    </div>
  );
};
