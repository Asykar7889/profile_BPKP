'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDashboard } from '@/context/DashboardContext';
import { useSpiDashboard } from '@/context/SpiDashboardContext';
import { SUMSEL_GEOJSON } from '@/data/sumselGeoJson';
import {
  DEFAULT_MAP_FILL,
  DEFAULT_MAP_STROKE,
  HOVER_MAP_STROKE,
  getTierByScore,
  formatScore,
} from '@/lib/scoringEngine';
import { CitySurvey } from '@/types/spi';
import InteractiveLegendCards from './InteractiveLegendCards';
import InMapRiskSidebar from './InMapRiskSidebar';
import { Layers, Eye, EyeOff } from 'lucide-react';

export default function SumselLeafletMap() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const labelsLayerRef = useRef<L.LayerGroup | null>(null);
  const labelMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const hasInitializedRef = useRef(false);
  const prevActiveKodeRef = useRef<string | null>(null);

  const {
    surveys,
    activeCity,
    hoveredCity,
    isHeatmapActive,
    selectedTierFilter,
    hoveredTierFilter,
    thresholds,
    toggleHeatmap,
    setActiveCity,
    setHoveredCity,
  } = useSpiDashboard();

  const {
    setActiveCity: setDashActiveCity,
    setHoveredCity: setDashHoveredCity,
    isMainSidebarOpen,
    isDesktopSidebarOpen,
  } = useDashboard();
  const isSidebarOpen = isDesktopSidebarOpen ?? isMainSidebarOpen;

  const activeCityRef = useRef(activeCity);
  useEffect(() => {
    activeCityRef.current = activeCity;
  }, [activeCity]);

  // Create fast O(1) lookup map for 17 Kab/Kota
  const surveyMap = React.useMemo(() => {
    const map = new Map<string, CitySurvey>();
    surveys.forEach((s) => map.set(s.kode_wilayah, s));
    return map;
  }, [surveys]);

  const surveyMapRef = useRef(surveyMap);
  useEffect(() => {
    surveyMapRef.current = surveyMap;
  }, [surveyMap]);

  // Dynamic Polygon Styling Function
  const getFeatureStyle = useCallback(
    (feature?: any): L.PathOptions => {
      if (!feature || !feature.properties) return {};
      const kode = feature.properties.kode_wilayah;
      const city = surveyMap.get(kode);

      if (!city) {
        return {
          fillColor: DEFAULT_MAP_FILL,
          fillOpacity: 0.85,
          color: DEFAULT_MAP_STROKE,
          weight: 1.5,
          lineJoin: 'round',
          lineCap: 'round',
        };
      }

      const tier = getTierByScore(Number(city.skor_total), thresholds);
      const isSelected = activeCity?.kode_wilayah === kode;
      const isHovered = hoveredCity?.kode_wilayah === kode;

      // 1. Tier Filter Active (Click or Hover on Legend Cards)
      const effectiveTierFilter = selectedTierFilter || hoveredTierFilter;
      if (effectiveTierFilter) {
        if (tier.key === effectiveTierFilter) {
          return {
            fillColor: tier.hex,
            fillOpacity: isHovered || isSelected ? 1.0 : 0.90,
            color: isSelected ? '#0000FE' : HOVER_MAP_STROKE,
            weight: isSelected || isHovered ? 2.5 : 1.75,
            lineJoin: 'round',
            lineCap: 'round',
          };
        } else {
          return {
            fillColor: DEFAULT_MAP_FILL,
            fillOpacity: 0.15,
            color: '#CBD5E1',
            weight: 1.0,
            lineJoin: 'round',
            lineCap: 'round',
          };
        }
      }

      // 2. Heatmap ON (Show all 5-tier colors simultaneously)
      if (isHeatmapActive) {
        return {
          fillColor: tier.hex,
          fillOpacity: isHovered || isSelected ? 1.0 : 0.82,
          color: isSelected ? '#0000FE' : isHovered ? HOVER_MAP_STROKE : '#FFFFFF',
          weight: isSelected || isHovered ? 2.5 : 1.5,
          lineJoin: 'round',
          lineCap: 'round',
        };
      }

      // 3. Default Mode (Heatmap OFF) -> ONLY highlight hovered or clicked city
      if (isHovered || isSelected) {
        return {
          fillColor: tier.hex,
          fillOpacity: 0.95,
          color: isSelected ? '#0000FE' : HOVER_MAP_STROKE,
          weight: 2.5,
          lineJoin: 'round',
          lineCap: 'round',
        };
      }

      // Default Neutral State
      return {
        fillColor: DEFAULT_MAP_FILL,
        fillOpacity: 0.88,
        color: DEFAULT_MAP_STROKE,
        weight: 1.5,
        lineJoin: 'round',
        lineCap: 'round',
      };
    },
    [surveyMap, activeCity, hoveredCity, isHeatmapActive, selectedTierFilter, hoveredTierFilter, thresholds]
  );

  // Initialize Map Instance
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-3.35, 104.2],
      zoom: 8,
      minZoom: 6,
      maxZoom: 13,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false, // Fix 2: Disable wheel zoom so mouse wheel smoothly scrolls page content
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Zoom LOD: Auto hide labels when zoomed out, show when zoomed in
    const updateZoomClasses = () => {
      if (containerRef.current) {
        const zoom = map.getZoom();
        if (zoom < 8.2) {
          containerRef.current.classList.add('map-zoomed-out');
          containerRef.current.classList.remove('map-zoomed-in');
        } else {
          containerRef.current.classList.remove('map-zoomed-out');
          containerRef.current.classList.add('map-zoomed-in');
        }

        // Re-affirm active region label class if Leaflet refreshed the DOM during zoom
        const currentActiveKode = activeCityRef.current?.kode_wilayah
          ? String(activeCityRef.current.kode_wilayah)
          : null;
        if (currentActiveKode) {
          const activeMarker = labelMarkersRef.current.get(currentActiveKode);
          const el = activeMarker?.getElement();
          if (el) {
            el.classList.add('is-active-label');
          }
        }
      }
    };

    map.on('zoom', updateZoomClasses);
    map.on('zoomend', updateZoomClasses);
    updateZoomClasses();

    // Fix 1: Click on white canvas background outside polygons -> Reset all popups, active city, and camera zoom
    map.on('click', () => {
      // 1. Close all open popups and tooltips
      map.closePopup();
      map.eachLayer((layer: any) => {
        if (typeof layer.closeTooltip === 'function') {
          layer.closeTooltip();
        }
      });

      // 2. Reset active city and right detail panel to provincial summary
      setActiveCity(null);
      setHoveredCity(null);
      if (setDashActiveCity) setDashActiveCity(null);
      if (setDashHoveredCity) setDashHoveredCity(null);

      // 3. Smoothly reset camera to initial South Sumatra overview
      if (geoJsonLayerRef.current && geoJsonLayerRef.current.getBounds().isValid()) {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        map.flyToBounds(geoJsonLayerRef.current.getBounds(), {
          padding: isMobile ? [20, 20] : [35, 35],
          maxZoom: 9,
          duration: 0.35,
        });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      hasInitializedRef.current = false;
      prevActiveKodeRef.current = null;
    };
  }, [setHoveredCity, setActiveCity, setDashActiveCity, setDashHoveredCity]);

  // Mount GeoJSON Layer ONCE
  useEffect(() => {
    if (!mapRef.current || hasInitializedRef.current) return;

    const geoLayer = L.geoJSON(SUMSEL_GEOJSON as any, {
      style: getFeatureStyle,
      onEachFeature: (feature, layer) => {
        const kode = feature.properties?.kode_wilayah;
        const initialCity = surveyMapRef.current.get(kode);

        // Crisp Tooltip for ONLY the hovered city
        if (initialCity) {
          const tier = getTierByScore(initialCity.skor_total);
          layer.bindTooltip(
            `
            <div class="px-2 py-1.5 flex flex-col gap-0.5 text-left font-sans">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">${initialCity.tipe_wilayah}</span>
              <strong class="text-xs font-black text-slate-900">${initialCity.nama_wilayah}</strong>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="text-sm font-black font-mono text-slate-800">${formatScore(initialCity.skor_total)}</span>
                <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black" style="background-color: ${tier.hex}22; color: ${tier.hex}">${tier.label}</span>
              </div>
            </div>
            `,
            {
              sticky: true,
              direction: 'top',
              className: 'custom-map-tooltip',
              opacity: 1,
            }
          );
        }

        layer.on({
          mouseover: (e) => {
            if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
              const current = surveyMapRef.current.get(kode);
              if (current) {
                setHoveredCity(current);
                // Update tooltip content dynamically in case score updated
                const t = getTierByScore(current.skor_total);
                layer.setTooltipContent(
                  `
                  <div class="px-2 py-1.5 flex flex-col gap-0.5 text-left font-sans">
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">${current.tipe_wilayah}</span>
                    <strong class="text-xs font-black text-slate-900">${current.nama_wilayah}</strong>
                    <div class="flex items-center gap-1.5 mt-1">
                      <span class="text-sm font-black font-mono text-slate-800">${formatScore(current.skor_total)}</span>
                      <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black" style="background-color: ${t.hex}22; color: ${t.hex}">${t.label}</span>
                    </div>
                  </div>
                  `
                );
              }
              const l = e.target as L.Path;
              l.setStyle({
                weight: 2.5,
                color: HOVER_MAP_STROKE,
                lineJoin: 'round',
                lineCap: 'round',
              });
              l.bringToFront();
            }
          },
          mouseout: () => {
            if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
              setHoveredCity(null);
            }
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            if (e.originalEvent) {
              L.DomEvent.stopPropagation(e.originalEvent);
            }
            const current = surveyMapRef.current.get(kode);
            if (current) {
              setActiveCity(current);
            }
          },
        });
      },
    });

    geoLayer.addTo(mapRef.current);
    geoJsonLayerRef.current = geoLayer;

    // Attach Labels to Overlay Pane with dynamic single-region / all-region visibility
    if (labelsLayerRef.current) {
      labelsLayerRef.current.remove();
    }
    labelMarkersRef.current.clear();
    const labelsGroup = L.layerGroup();
    const activeKode = activeCityRef.current?.kode_wilayah ? String(activeCityRef.current.kode_wilayah) : null;

    geoLayer.eachLayer((l: any) => {
      if (l.feature?.properties?.nama_wilayah && typeof l.getBounds === 'function') {
        const rawName: string = l.feature.properties.nama_wilayah;
        const kode: string = String(l.feature.properties.kode_wilayah);
        let cleanName = rawName
          .replace(/^Kabupaten\s+/i, '')
          .replace(/^Kota\s+/i, '')
          .trim();

        if (/ogan komering ulu timur/i.test(cleanName)) cleanName = 'OKU Timur';
        else if (/ogan komering ulu selatan/i.test(cleanName)) cleanName = 'OKU Selatan';
        else if (/ogan komering ulu/i.test(cleanName)) cleanName = 'OKU';
        else if (/penukal abab/i.test(cleanName)) cleanName = 'PALI';
        else if (/lubuk linggau/i.test(cleanName)) cleanName = 'Lubuklinggau';

        let center = l.getBounds().getCenter();
        if (kode === '1607') center = L.latLng(-2.55, 104.55); // Banyuasin northern mainland
        else if (kode === '1603') center = L.latLng(-3.72, 103.85); // Muara Enim center

        const isCurrentlyActive = activeKode !== null && activeKode === kode;

        const marker = L.marker(center, {
          pane: 'overlayPane',
          icon: L.divIcon({
            className: `region-map-label region-label-${kode}${isCurrentlyActive ? ' is-active-label' : ''}`,
            html: `<span class="region-label-text">${cleanName}</span>`,
            iconSize: [100, 20],
            iconAnchor: [50, 10],
          }),
          interactive: false,
          zIndexOffset: isCurrentlyActive ? 1000 : 0,
        });

        labelsGroup.addLayer(marker);
        labelMarkersRef.current.set(kode, marker);
      }
    });
    labelsGroup.addTo(mapRef.current);
    labelsLayerRef.current = labelsGroup;

    // Initial fit bounds ONCE
    if (geoLayer.getBounds().isValid()) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      mapRef.current.fitBounds(geoLayer.getBounds(), {
        padding: isMobile ? [20, 20] : [35, 35],
        maxZoom: 9,
      });
    }

    hasInitializedRef.current = true;
  }, [getFeatureStyle, setActiveCity, setHoveredCity]);

  // Synchronize dynamic active region label visibility
  useEffect(() => {
    const activeKode = activeCity?.kode_wilayah ? String(activeCity.kode_wilayah) : null;

    labelMarkersRef.current.forEach((marker, kode) => {
      const el = marker.getElement();
      const isSelected = activeKode !== null && kode === activeKode;

      if (el) {
        if (isSelected) {
          el.classList.add('is-active-label');
        } else {
          el.classList.remove('is-active-label');
        }
      }

      if (typeof marker.setZIndexOffset === 'function') {
        marker.setZIndexOffset(isSelected ? 1000 : 0);
      }
    });
  }, [activeCity]);

  // Synchronize styles when state changes without destroying DOM layers
  useEffect(() => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.setStyle(getFeatureStyle);
    }
  }, [getFeatureStyle]);

  // Camera Controller: Lock zoom on activeCity only (Never reset on mouseout/hover)
  useEffect(() => {
    if (!mapRef.current || !geoJsonLayerRef.current) return;

    const currentKode = activeCity?.kode_wilayah ?? null;
    if (currentKode === prevActiveKodeRef.current) return;
    prevActiveKodeRef.current = currentKode;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (activeCity) {
      geoJsonLayerRef.current.eachLayer((layer: any) => {
        const kode = layer.feature?.properties?.kode_wilayah;
        if (String(kode) === String(activeCity.kode_wilayah) && typeof layer.getBounds === 'function') {
          mapRef.current?.flyToBounds(layer.getBounds(), {
            paddingTopLeft: [24, 60],
            paddingBottomRight: [24, isMobile ? 100 : 24],
            maxZoom: 9,
            duration: 0.35,
          });
        }
      });
    } else if (hasInitializedRef.current) {
      // User clicked "Reset ke Provinsi Sumsel"
      const bounds = geoJsonLayerRef.current.getBounds();
      if (bounds.isValid()) {
        mapRef.current.flyToBounds(bounds, {
          padding: isMobile ? [20, 20] : [35, 35],
          maxZoom: 9,
          duration: 0.35,
        });
      }
    }
  }, [activeCity]);

  // Step 3: Synchronize Leaflet map canvas size on desktop sidebar toggle after width transition completes (~250ms)
  useEffect(() => {
    if (!mapRef.current) return;

    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize({ animate: true });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white isolate z-0">
      {/* 1. In-Map Risk Sidebar / Pop-up Panel Tingkat Risiko SPI */}
      <InMapRiskSidebar />

      {/* 2. Top-Right Heatmap Toggle Button (Compact on Mobile to prevent collision) */}
      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-4 z-[400] flex items-center gap-2">
        <button
          onClick={toggleHeatmap}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border text-[11px] sm:text-xs font-bold transition-all shadow-sm backdrop-blur-md active:scale-95 ${
            isHeatmapActive
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white'
          }`}
          title="Tampilkan warna skor 5-tier pada seluruh kota sekaligus"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isHeatmapActive ? 'Heatmap: Aktif' : 'Tampilkan Warna Semua Kota'}</span>
          <span className="sm:hidden">{isHeatmapActive ? 'Heatmap Aktif' : 'Semua Warna'}</span>
        </button>
      </div>

      {/* 3. Core Map Canvas */}
      <div ref={containerRef} className="w-full h-full z-0 outline-none" />

      {/* 4. Bottom 5-Card Interactive Legend Filter */}
      <InteractiveLegendCards />
    </div>
  );
}
