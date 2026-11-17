'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDashboard } from '@/context/DashboardContext';
import { SUMSEL_GEOJSON } from '@/data/sumselGeoJson';
import {
  DEFAULT_MAP_FILL,
  DEFAULT_MAP_STROKE,
  HOVER_MAP_STROKE,
  getTierByScore,
  getTierColor,
  formatScore
} from '@/lib/scoringUtils';
import { RegionData, GeoJsonFeature } from '@/types/dashboard';

export default function SumselLeafletMap() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const {
    regions,
    activeCity,
    hoveredCity,
    isHeatmapActive,
    selectedTierFilter,
    setActiveCity,
    setHoveredCity,
  } = useDashboard();

  // Create region lookup map for O(1) matching
  const regionMap = React.useMemo(() => {
    const map = new Map<string, RegionData>();
    regions.forEach((r) => {
      map.set(r.kode_wilayah, r);
    });
    return map;
  }, [regions]);

  // Dynamic Polygon Styling Function based on state machine
  const getFeatureStyle = useCallback(
    (feature?: any): L.PathOptions => {
      if (!feature || !feature.properties) return {};
      const kode = feature.properties.kode_wilayah;
      const region = regionMap.get(kode);

      if (!region) {
        return {
          fillColor: DEFAULT_MAP_FILL,
          fillOpacity: 0.6,
          color: DEFAULT_MAP_STROKE,
          weight: 1.5,
        };
      }

      const tier = getTierByScore(Number(region.skor_total));
      const isSelected = activeCity?.kode_wilayah === kode;
      const isHovered = hoveredCity?.kode_wilayah === kode;

      // 1. If Legend Filter is active
      if (selectedTierFilter) {
        if (tier.key === selectedTierFilter) {
          return {
            fillColor: tier.hex,
            fillOpacity: isHovered || isSelected ? 1.0 : 0.88,
            color: isSelected ? '#0284C7' : '#0F172A',
            weight: isSelected ? 3.5 : 2.5,
          };
        } else {
          return {
            fillColor: DEFAULT_MAP_FILL,
            fillOpacity: 0.18,
            color: '#CBD5E1',
            weight: 1,
          };
        }
      }

      // 2. If Heatmap is Active
      if (isHeatmapActive) {
        return {
          fillColor: tier.hex,
          fillOpacity: isHovered || isSelected ? 1.0 : 0.82,
          color: isSelected ? '#0284C7' : isHovered ? HOVER_MAP_STROKE : '#FFFFFF',
          weight: isSelected ? 3.5 : isHovered ? 2.5 : 1.5,
        };
      }

      // 3. Default Mode (Heatmap OFF) -> Hover/Active Reveal Color
      if (isHovered || isSelected) {
        return {
          fillColor: tier.hex,
          fillOpacity: 0.95,
          color: isSelected ? '#0284C7' : HOVER_MAP_STROKE,
          weight: isSelected ? 3.5 : 2.5,
        };
      }

      // Initial Neutral Grey State
      return {
        fillColor: DEFAULT_MAP_FILL,
        fillOpacity: 0.85,
        color: DEFAULT_MAP_STROKE,
        weight: 1.5,
      };
    },
    [regionMap, activeCity, hoveredCity, isHeatmapActive, selectedTierFilter]
  );

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-3.35, 104.2],
      zoom: 8,
      minZoom: 7,
      maxZoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Basemap: Light CartoDB Positron
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update or render GeoJSON layer
  useEffect(() => {
    if (!mapRef.current) return;

    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.remove();
    }

    const geoLayer = L.geoJSON(SUMSEL_GEOJSON as any, {
      style: getFeatureStyle,
      onEachFeature: (feature, layer) => {
        const kode = feature.properties?.kode_wilayah;
        const region = regionMap.get(kode);

        layer.on({
          mouseover: (e) => {
            const l = e.target as L.Path;
            if (region) {
              setHoveredCity(region);
            }
            l.setStyle({
              weight: 2.5,
              color: HOVER_MAP_STROKE,
            });
            l.bringToFront();
          },
          mouseout: (e) => {
            setHoveredCity(null);
            geoJsonLayerRef.current?.resetStyle(e.target);
          },
          click: (e) => {
            if (region) {
              setActiveCity(region);
              if ('getBounds' in layer && typeof (layer as any).getBounds === 'function') {
                mapRef.current?.flyToBounds((layer as any).getBounds(), {
                  padding: [50, 50],
                  duration: 0.6,
                });
              }
            }
          },
        });

        // Tooltip with custom glassmorphism styling
        if (region) {
          const tier = getTierByScore(Number(region.skor_total));
          const tooltipContent = `
            <div class="min-w-[190px]">
              <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
                <span class="font-bold text-sm text-white">${region.nama_wilayah}</span>
              </div>
              <div class="flex items-center justify-between gap-3 mb-2">
                <span class="text-xs text-slate-300">Skor SPI 2026:</span>
                <span class="text-base font-black font-mono" style="color: ${tier.hex}">${formatScore(Number(region.skor_total))}</span>
              </div>
              <div class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2" style="background-color: ${tier.hex}; color: #FFFFFF">
                ${tier.label}
              </div>
              <div class="space-y-1 text-[11px] text-slate-300">
                <div class="flex justify-between">
                  <span>Internal:</span>
                  <span class="font-mono font-semibold">${formatScore(Number(region.indikator_internal))}</span>
                </div>
                <div class="flex justify-between">
                  <span>Eksternal:</span>
                  <span class="font-mono font-semibold">${formatScore(Number(region.indikator_eksternal))}</span>
                </div>
                <div class="flex justify-between">
                  <span>Eksper:</span>
                  <span class="font-mono font-semibold">${formatScore(Number(region.indikator_eksper))}</span>
                </div>
              </div>
            </div>
          `;

          layer.bindTooltip(tooltipContent, {
            sticky: true,
            className: 'sumsel-glass-tooltip',
            direction: 'top',
          });
        }
      },
    });

    geoLayer.addTo(mapRef.current);
    geoJsonLayerRef.current = geoLayer;

    // Center and fit South Sumatra bounds
    if (geoLayer.getBounds().isValid()) {
      mapRef.current.fitBounds(geoLayer.getBounds(), { padding: [25, 25] });
    }
  }, [regionMap, getFeatureStyle, setActiveCity, setHoveredCity]);

  // Synchronize dynamic styles when state changes without re-creating layer
  useEffect(() => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.setStyle(getFeatureStyle);
    }
  }, [getFeatureStyle]);

  // Fly to active city if selected externally (e.g. from search)
  useEffect(() => {
    if (!mapRef.current || !geoJsonLayerRef.current || !activeCity) return;

    geoJsonLayerRef.current.eachLayer((layer: any) => {
      if (layer.feature?.properties?.kode_wilayah === activeCity.kode_wilayah) {
        mapRef.current?.flyToBounds(layer.getBounds(), {
          padding: [60, 60],
          duration: 0.6,
        });
      }
    });
  }, [activeCity]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full z-0 outline-none" />
    </div>
  );
}
