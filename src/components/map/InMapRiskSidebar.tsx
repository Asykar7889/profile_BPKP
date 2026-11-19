'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { useOptionalSpiDashboard } from '@/context/SpiDashboardContext';
import { RISK_TIERS, formatScore, formatNumber, getTierByScore } from '@/lib/scoringUtils';
import { getContrastTextColor } from '@/lib/riskThresholds';
import { RiskTierKey, RegionData } from '@/types/dashboard';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Flame,
  Check,
  MapPin,
  X,
  SlidersHorizontal,
  Building2,
  RotateCcw,
  TrendingUp,
  Award,
  AlertTriangle
} from 'lucide-react';

export default function InMapRiskSidebar() {
  const dashCtx = useDashboard();
  const spiCtx = useOptionalSpiDashboard();

  // Effective regions derived from live SPI surveys if present, falling back to dashCtx
  const regions: RegionData[] = useMemo(() => {
    if (spiCtx && spiCtx.surveys.length > 0) {
      return spiCtx.surveys.map((s) => {
        const internal = s.dimensions.find((d) => d.kode_dimensi === 'internal')?.skor_dimensi || 0;
        const eksternal = s.dimensions.find((d) => d.kode_dimensi === 'eksternal')?.skor_dimensi || 0;
        const eksper = s.dimensions.find((d) => d.kode_dimensi === 'eksper')?.skor_dimensi || 0;
        const koreksi = s.dimensions.find((d) => d.kode_dimensi === 'faktor_koreksi')?.skor_dimensi || 0;
        const fallbackMatch = dashCtx.regions.find((r) => r.kode_wilayah === s.kode_wilayah);

        return {
          id: s.id,
          kode_wilayah: s.kode_wilayah,
          nama_wilayah: s.nama_wilayah,
          tipe_wilayah: s.tipe_wilayah,
          skor_total: s.skor_total,
          kategori_risiko: s.kategori_risiko,
          indikator_internal: internal,
          indikator_eksternal: eksternal,
          indikator_eksper: eksper,
          faktor_koreksi: koreksi,
          jumlah_responden: s.jumlah_responden,
          tahun: s.tahun,
          rekomendasi_utama:
            fallbackMatch?.rekomendasi_utama ||
            'Tingkatkan kepatuhan tata kelola, pengawasan pengadaan barang/jasa, dan implementasi SPIP terintegrasi.',
        };
      });
    }
    return dashCtx.regions;
  }, [spiCtx?.surveys, dashCtx.regions]);

  const selectedTierFilter = spiCtx ? spiCtx.selectedTierFilter : dashCtx.selectedTierFilter;
  const isHeatmapActive = spiCtx ? spiCtx.isHeatmapActive : dashCtx.isHeatmapActive;

  const activeCity: RegionData | null = useMemo(() => {
    if (spiCtx?.activeCity) {
      return regions.find((r) => r.kode_wilayah === spiCtx.activeCity?.kode_wilayah) || null;
    }
    return dashCtx.activeCity;
  }, [spiCtx?.activeCity, dashCtx.activeCity, regions]);

  const hoveredCity: RegionData | null = useMemo(() => {
    if (spiCtx?.hoveredCity) {
      return regions.find((r) => r.kode_wilayah === spiCtx.hoveredCity?.kode_wilayah) || null;
    }
    return dashCtx.hoveredCity;
  }, [spiCtx?.hoveredCity, dashCtx.hoveredCity, regions]);

  const isMobileSidebarOpen = dashCtx.isMobileSidebarOpen;

  const handleSelectCity = (city: RegionData) => {
    dashCtx.setActiveCity(city);
    if (spiCtx) {
      const sCity = spiCtx.surveys.find((s) => s.kode_wilayah === city.kode_wilayah);
      if (sCity) spiCtx.setActiveCity(sCity);
    }
  };

  const handleResetToProvincial = () => {
    dashCtx.resetToProvincial();
    spiCtx?.resetToProvince();
  };

  const handleSetTierFilter = (key: RiskTierKey | null) => {
    dashCtx.setSelectedTierFilter(key);
    spiCtx?.setSelectedTierFilter(key);
  };

  const handleToggleHeatmap = () => {
    dashCtx.setIsHeatmapActive((prev) => !prev);
    spiCtx?.toggleHeatmap();
  };

  // Desktop (>= 768px): default open | Mobile (< 768px): default CLOSED
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'filter' | 'detail'>('filter');

  // Initialize responsive state after mounting
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsOpen(true);
    }
  }, []);

  // When Mobile Main Navigation Drawer opens, automatically collapse In-Map sidebar
  useEffect(() => {
    if (isMobileSidebarOpen) {
      setIsOpen(false);
    }
  }, [isMobileSidebarOpen]);

  // When a user selects or hovers a city, automatically switch to "detail" tab if activeCity exists
  useEffect(() => {
    if (activeCity) {
      setActiveTab('detail');
    }
  }, [activeCity]);

  const tiers: RiskTierKey[] = ['terjaga', 'terawasi', 'waspada', 'rawan', 'rentan'];

  const handleTierClick = (key: RiskTierKey) => {
    if (selectedTierFilter === key) {
      handleSetTierFilter(null);
    } else {
      handleSetTierFilter(key);
    }
  };

  // Target city for live display: hovered takes immediate priority, then active
  const currentCity = hoveredCity || activeCity;

  const thresholds = spiCtx?.thresholds;

  // Group cities by risk tier
  const citiesByTier = React.useMemo(() => {
    const grouped: Record<RiskTierKey, RegionData[]> = {
      terjaga: [],
      terawasi: [],
      waspada: [],
      rawan: [],
      rentan: [],
    };
    regions.forEach((r) => {
      const score = Number(r.skor_total);
      const tier = getTierByScore(score, thresholds);
      if (grouped[tier.key]) {
        grouped[tier.key].push(r);
      }
    });
    return grouped;
  }, [regions, thresholds]);

  const currentTier = currentCity ? getTierByScore(Number(currentCity.skor_total), thresholds) : null;

  return (
    <>
      {/* 1. Sleek Floating Trigger Pill Button (Shown when In-Map Sidebar is collapsed) */}
      {!isOpen && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className={`group absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-[400] flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/95 backdrop-blur-md border border-bpkp-blueBorder rounded-xl shadow-md hover:bg-bpkp-blueSoft text-bpkp-black text-[11px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 pointer-events-auto ${
            isMobileSidebarOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          title="Buka Menu Tingkat Risiko SPI"
        >
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-bpkp-blue text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <span className="text-bpkp-blue font-bold tracking-tight">Tingkat Risiko SPI</span>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-bpkp-blue transition-transform group-hover:translate-x-0.5" />
        </button>
      )}

      {/* 2. In-Map Sidebar: Strict 3-Part Flex Column (Header shrink-0, Body flex-1 overflow-y-auto, Footer shrink-0) */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className={`absolute z-[500] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-bpkp-blueBorder flex flex-col transition-all duration-300 ease-in-out select-none overflow-hidden ${
          /* Responsive positioning:
             - Mobile: Anchored at bottom with max-h-[64%] so top half of map stays 100% visible
             - Desktop (md:): Left docked panel filling top-to-bottom */
          'left-2.5 right-2.5 bottom-2.5 max-h-[64%] md:top-2.5 md:left-2.5 md:bottom-2.5 md:right-auto md:max-h-none md:w-80'
        } ${
          isOpen && !isMobileSidebarOpen
            ? 'translate-y-0 md:translate-y-0 md:translate-x-0 opacity-100 pointer-events-auto'
            : 'translate-y-full md:translate-y-0 md:-translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Mobile Drag-Handle Indicator Bar */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2 md:hidden flex-shrink-0" />

        {/* ── PART A: Compact Sticky Header (shrink-0) ── */}
        <div className="p-3 border-b border-bpkp-border bg-gradient-to-r from-bpkp-blueSoft/70 to-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-bpkp-blue text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-bpkp-black leading-tight truncate">
                Tingkat Risiko SPI
              </h3>
              <p className="text-[9.5px] text-slate-500 font-medium">BPKP Sumsel • 17 Kab/Kota</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-bpkp-blue hover:bg-bpkp-blueSoft rounded-lg transition min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Tutup Panel"
              aria-label="Tutup"
            >
              <X className="w-4 h-4 md:hidden" />
              <ChevronLeft className="w-4 h-4 hidden md:block" />
            </button>
          </div>
        </div>

        {/* Segmented Tab Switcher (Kategori Risiko | Detail Kota) (shrink-0) */}
        <div className="flex p-1 bg-slate-100 border-b border-slate-200/60 text-xs font-semibold gap-1 flex-shrink-0">
          <button
            onClick={() => setActiveTab('filter')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-center transition flex items-center justify-center gap-1.5 min-h-[36px] ${
              activeTab === 'filter'
                ? 'bg-white text-bpkp-blue shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Kategori Risiko</span>
          </button>
          <button
            onClick={() => setActiveTab('detail')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-center transition flex items-center justify-center gap-1.5 min-h-[36px] ${
              activeTab === 'detail'
                ? 'bg-white text-bpkp-blue shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Detail Kota {currentCity ? `(${formatScore(Number(currentCity.skor_total))})` : ''}</span>
          </button>
        </div>

        {/* ── PART B: Single Scrollable Body (flex-1 min-h-0 overflow-y-auto overscroll-contain) ── */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2.5">
          {/* TAB 1: Kategori & Filter Risiko */}
          {activeTab === 'filter' && (
            <div className="space-y-2.5">
              {/* Heatmap Quick Toggle */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Flame className={`w-3.5 h-3.5 ${isHeatmapActive ? 'text-bpkp-red' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-bold text-slate-800">Tampilkan Warna Semua Kota</span>
                  </div>
                  <button
                    onClick={handleToggleHeatmap}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isHeatmapActive ? 'bg-bpkp-red' : 'bg-slate-200'
                    }`}
                    role="switch"
                    aria-checked={isHeatmapActive}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isHeatmapActive ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[9.5px] text-slate-500 mt-1">
                  {isHeatmapActive ? 'Mode koropleth 5-tier aktif di seluruh wilayah' : 'Mode netral; warna risiko muncul saat kota disorot/diklik'}
                </p>
              </div>

              {/* 5-Tier Category List */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-bold uppercase px-0.5">
                  <span>5 Tingkat Risiko Integritas</span>
                  {selectedTierFilter && (
                    <button
                      onClick={() => handleSetTierFilter(null)}
                      className="text-bpkp-blue hover:underline normal-case font-semibold flex items-center gap-0.5"
                    >
                      <X className="w-3 h-3" />
                      Hapus Filter
                    </button>
                  )}
                </div>

                {(thresholds && thresholds.length === 5
                  ? thresholds.map((t) => ({
                      key: t.tier_key,
                      label: t.label,
                      description: RISK_TIERS[t.tier_key]?.description || '',
                      hex: t.color_hex,
                      minScore: t.min_score,
                      maxScore: t.max_score,
                    }))
                  : tiers.map((key) => ({
                      key,
                      label: RISK_TIERS[key].label,
                      description: RISK_TIERS[key].description,
                      hex: RISK_TIERS[key].hex,
                      minScore: RISK_TIERS[key].minScore,
                      maxScore: RISK_TIERS[key].maxScore,
                    }))
                ).map((tier) => {
                  const key = tier.key;
                  const matchingCities = citiesByTier[key] || [];
                  const isSelected = selectedTierFilter === key;

                  return (
                    <div
                      key={key}
                      className={`rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      {/* Tier Row */}
                      <div
                        onClick={() => handleTierClick(key)}
                        className="p-2.5 flex items-center justify-between cursor-pointer min-h-[42px]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center shadow-xs"
                            style={{ backgroundColor: tier.hex }}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-baseline gap-1.5">
                              <span className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                {tier.label}
                              </span>
                              <span className={`text-[9.5px] font-mono ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                                ({tier.minScore.toFixed(0)} - {tier.maxScore === 100 ? '100' : tier.maxScore.toFixed(2)})
                              </span>
                            </div>
                            <p className={`text-[9px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              {tier.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span
                            className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {matchingCities.length}
                          </span>
                        </div>
                      </div>

                      {/* Expandable City List in this Tier if selected */}
                      {isSelected && matchingCities.length > 0 && (
                        <div className="px-2.5 pb-2.5 pt-1 border-t border-white/10 space-y-1">
                          <span className="text-[8.5px] text-slate-300 uppercase font-semibold block">
                            Daftar Kabupaten / Kota:
                          </span>
                          <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto pr-0.5">
                            {matchingCities.map((city) => (
                              <div
                                key={city.kode_wilayah}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCity(city);
                                  setActiveTab('detail');
                                }}
                                className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-between text-xs cursor-pointer transition"
                              >
                                <span className="text-white truncate text-[11px]">{city.nama_wilayah}</span>
                                <span className="font-mono font-bold text-amber-300 text-[11px]">
                                  {formatScore(Number(city.skor_total))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Detail Kota / Sorotan Lengkap */}
          {activeTab === 'detail' && (
            <div className="space-y-2.5">
              {currentCity ? (
                <>
                  {/* City Score Banner */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-[9.5px] text-slate-500 font-bold uppercase mb-1">
                      <span>{currentCity.tipe_wilayah} • KODE: {currentCity.kode_wilayah}</span>
                      {currentTier && (
                        <span
                          className="px-2 py-0.5 rounded font-bold text-[9.5px] shadow-2xs"
                          style={{
                            backgroundColor: currentTier.hex,
                            color: getContrastTextColor(currentTier.hex),
                          }}
                        >
                          {currentTier.label}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-slate-900 leading-snug">
                      {currentCity.nama_wilayah}
                    </h4>
                    <div className="mt-2 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black font-mono leading-none" style={{ color: currentTier?.hex }}>
                          {formatScore(Number(currentCity.skor_total))}
                        </span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {formatNumber(currentCity.jumlah_responden)} responden
                      </span>
                    </div>
                  </div>

                  {/* 3 Sub-Indicators Breakdown */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Dimensi Penilaian Integritas
                    </span>

                    <div>
                      <div className="flex justify-between text-[10.5px] mb-0.5">
                        <span className="text-slate-600 font-medium">Indikator Internal</span>
                        <span className="font-mono font-bold text-slate-900">{formatScore(Number(currentCity.indikator_internal))}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-bpkp-blue rounded-full transition-all duration-300"
                          style={{ width: `${currentCity.indikator_internal}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10.5px] mb-0.5">
                        <span className="text-slate-600 font-medium">Indikator Eksternal</span>
                        <span className="font-mono font-bold text-slate-900">{formatScore(Number(currentCity.indikator_eksternal))}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                          style={{ width: `${currentCity.indikator_eksternal}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10.5px] mb-0.5">
                        <span className="text-slate-600 font-medium">Penilaian Eksper / Ahli</span>
                        <span className="font-mono font-bold text-slate-900">{formatScore(Number(currentCity.indikator_eksper))}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-300"
                          style={{ width: `${currentCity.indikator_eksper}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span>Faktor Koreksi Data:</span>
                      <span className="font-mono font-bold text-bpkp-red">
                        {formatScore(Number(currentCity.faktor_koreksi))}%
                      </span>
                    </div>
                  </div>

                  {/* Rekomendasi Utama */}
                  <div className="p-3 rounded-xl bg-bpkp-blueSoft/60 border border-bpkp-blueBorder text-[10.5px] text-slate-800 leading-relaxed">
                    <span className="font-bold text-bpkp-blue block mb-1">Rekomendasi Tindak Lanjut:</span>
                    {currentCity.rekomendasi_utama}
                  </div>

                  {/* Action Reset Button */}
                  {activeCity && (
                    <button
                      onClick={handleResetToProvincial}
                      className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 min-h-[40px]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Kembali ke Ringkasan Provinsi</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-center text-slate-400">
                  <MapPin className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Belum Ada Kota Terpilih</p>
                  <p className="text-[10px] mt-1 leading-relaxed max-w-xs text-slate-400">
                    Ketuk salah satu daerah di peta atau pilih dari tab Kategori Risiko untuk melihat statistik lengkap di sini.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── PART C: Clean Non-Clipped Footer (shrink-0) ── */}
        <div className="p-2.5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between text-[10px] text-slate-500 flex-shrink-0">
          <span className="font-bold text-bpkp-blue">BPKP Sumatera Selatan</span>
          <span className="font-bold text-slate-700">17 Wilayah Lengkap</span>
        </div>
      </div>
    </>
  );
}
