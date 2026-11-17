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
} from '@/lib/scoringUtils';
import { RegionData } from '@/types/dashboard';

export default function SumselLeafletMap() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const labelsLayerRef = useRef<L.LayerGroup | null>(null);
  const hasInitializedRef = useRef(false);
  const prevActiveKodeRef = useRef<string | null>(null);

  const {
    regions,
    activeCity,
    hoveredCity,
    isHeatmapActive,
    selectedTierFilter,
    isMainSidebarOpen,
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

  // Keep a mutable ref so Leaflet event listeners always read latest region data
  const regionMapRef = useRef(regionMap);
  useEffect(() => {
    regionMapRef.current = regionMap;
  }, [regionMap]);

  // Dynamic Polygon Styling Function based on state machine (Clean, crisp, non-bloating border weight)
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
          weight: 1.25,
          lineJoin: 'round',
          lineCap: 'round',
        };
      }

      const tier = getTierByScore(Number(region.skor_total));
      const isSelected = activeCity?.kode_wilayah === kode;
      const isHovered = hoveredCity?.kode_wilayah === kode;

      // 1. If Legend / Tier Filter is active
      if (selectedTierFilter) {
        if (tier.key === selectedTierFilter) {
          return {
            fillColor: tier.hex,
            fillOpacity: isHovered || isSelected ? 1.0 : 0.9,
            color: isSelected ? '#0000FE' : '#0F172A',
            weight: isSelected || isHovered ? 2 : 1.25,
            lineJoin: 'round',
            lineCap: 'round',
          };
        } else {
          return {
            fillColor: DEFAULT_MAP_FILL,
            fillOpacity: 0.15,
            color: '#CBD5E1',
            weight: 1,
            lineJoin: 'round',
            lineCap: 'round',
          };
        }
      }

      // 2. If Heatmap is Active (Show all colors)
      if (isHeatmapActive) {
        return {
          fillColor: tier.hex,
          fillOpacity: isHovered || isSelected ? 1.0 : 0.82,
          color: isSelected ? '#0000FE' : isHovered ? HOVER_MAP_STROKE : '#FFFFFF',
          weight: isSelected || isHovered ? 2 : 1.25,
          lineJoin: 'round',
          lineCap: 'round',
        };
      }

      // 3. Default Neutral Mode (Heatmap OFF) -> ONLY reveal color on hovered or active city
      if (isHovered || isSelected) {
        return {
          fillColor: tier.hex,
          fillOpacity: 0.95,
          color: isSelected ? '#0000FE' : HOVER_MAP_STROKE,
          weight: 2,
          lineJoin: 'round',
          lineCap: 'round',
        };
      }

      // Initial Neutral Grey State
      return {
        fillColor: DEFAULT_MAP_FILL,
        fillOpacity: 0.85,
        color: DEFAULT_MAP_STROKE,
        weight: 1.25,
        lineJoin: 'round',
        lineCap: 'round',
      };
    },
    [regionMap, activeCity, hoveredCity, isHeatmapActive, selectedTierFilter]
  );

  // Initialize Map with Vector Studio Canvas (Zero watermarks)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-3.35, 104.2],
      zoom: 8,
      minZoom: 6,
      maxZoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Zoom control placed at bottomright to prevent collision with In-Map Sidebar
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Zoom LOD: Update zoom classes to show/hide city labels dynamically
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
      }
    };

    map.on('zoom', updateZoomClasses);
    map.on('zoomend', updateZoomClasses);
    updateZoomClasses();

    // Click on empty canvas resets active city
    map.on('click', () => {
      setActiveCity(null);
      setHoveredCity(null);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      hasInitializedRef.current = false;
      prevActiveKodeRef.current = null;
    };
  }, [setActiveCity, setHoveredCity]);

  // Initialize GeoJSON layer and Labels layer ONCE (Never destroy/recreate on hover or style changes)
  useEffect(() => {
    if (!mapRef.current || hasInitializedRef.current) return;

    const geoLayer = L.geoJSON(SUMSEL_GEOJSON as any, {
      style: getFeatureStyle,
      onEachFeature: (feature, layer) => {
        const kode = feature.properties?.kode_wilayah;

        layer.on({
          mouseover: (e) => {
            // Only fire hover style on desktop mouse devices (prevents synthetic tap-hover flash on mobile)
            if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
              const region = regionMapRef.current.get(kode);
              if (region) {
                setHoveredCity(region);
              }
              const l = e.target as L.Path;
              l.setStyle({
                weight: 2,
                color: HOVER_MAP_STROKE,
                lineJoin: 'round',
                lineCap: 'round',
              });
              l.bringToFront();
            }
          },
          mouseout: () => {
            if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
              // Simply clear hoveredCity -> reactive setStyle effect handles restoring proper styles
              // without wiping activeCity selection or triggering camera movement
              setHoveredCity(null);
            }
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            const region = regionMapRef.current.get(kode);
            if (region) {
              setActiveCity(region);
            }
          },
        });
      },
    });

    geoLayer.addTo(mapRef.current);
    geoJsonLayerRef.current = geoLayer;

    // Render crisp region name labels matching reference map
    const labelsGroup = L.layerGroup();
    geoLayer.eachLayer((l: any) => {
      if (l.feature?.properties?.nama_wilayah && typeof l.getBounds === 'function') {
        const rawName: string = l.feature.properties.nama_wilayah;
        const cleanName = rawName
          .replace(/^Kabupaten\s+/i, '')
          .replace(/^Kota\s+/i, '')
          .trim();
        const center = l.getBounds().getCenter();
        const marker = L.marker(center, {
          icon: L.divIcon({
            className: 'region-map-label',
            html: `<span>${cleanName}</span>`,
            iconSize: [100, 20],
            iconAnchor: [50, 10],
          }),
          interactive: false,
        });
        labelsGroup.addLayer(marker);
      }
    });
    labelsGroup.addTo(mapRef.current);
    labelsLayerRef.current = labelsGroup;

    // Initial camera fitBounds to South Sumatra bounds ONCE on mount
    if (geoLayer.getBounds().isValid()) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      mapRef.current.fitBounds(geoLayer.getBounds(), {
        padding: isMobile ? [20, 20] : [35, 35],
        maxZoom: 9,
      });
    }

    hasInitializedRef.current = true;
  }, [getFeatureStyle, setActiveCity, setHoveredCity]);

  // Synchronize dynamic styles when state changes without re-creating layer
  useEffect(() => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.setStyle(getFeatureStyle);
    }
  }, [getFeatureStyle]);

  // Dedicated Map Camera Controller: ONLY responds to activeCity changes
  // NEVER moves or resets camera when cursor hovers or leaves into white space
  useEffect(() => {
    if (!mapRef.current || !geoJsonLayerRef.current) return;

    const currentKode = activeCity?.kode_wilayah ?? null;
    if (currentKode === prevActiveKodeRef.current) return;
    prevActiveKodeRef.current = currentKode;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (activeCity) {
      // Zoom into selected active city
      geoJsonLayerRef.current.eachLayer((layer: any) => {
        const kode = layer.feature?.properties?.kode_wilayah;
        if (String(kode) === String(activeCity.kode_wilayah) && typeof layer.getBounds === 'function') {
          mapRef.current?.flyToBounds(layer.getBounds(), {
            paddingTopLeft: [24, 60],
            paddingBottomRight: [24, isMobile ? 100 : 24],
            maxZoom: 9,      // Prevents extreme zoom magnification that bloats vector outline
            duration: 0.35,  // Fast, crisp transition without lingering scaling blur
          });
        }
      });
    } else if (hasInitializedRef.current) {
      // User explicitly deselected or clicked Reset -> return to full South Sumatra province view
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

  // Handle ResizeObserver / Main Sidebar Collapse to invalidate Leaflet map size smoothly
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        // Only fit provincial bounds if no city is currently active
        if (!activeCity && geoJsonLayerRef.current && geoJsonLayerRef.current.getBounds().isValid()) {
          const isMobile = window.innerWidth < 768;
          mapRef.current.fitBounds(geoJsonLayerRef.current.getBounds(), {
            padding: isMobile ? [20, 20] : [35, 35],
            maxZoom: 9,
          });
        }
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [isMainSidebarOpen, activeCity]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full z-0 outline-none" />
    </div>
  );
}
