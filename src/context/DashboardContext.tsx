'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { RegionData, RiskTierKey, ProvincialSummary } from '@/types/dashboard';
import { SUMSEL_FALLBACK_DATA } from '@/data/sumselFallbackData';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getTierByScore } from '@/lib/scoringUtils';

interface DashboardContextType {
  regions: RegionData[];
  isLoading: boolean;
  activeCity: RegionData | null;
  hoveredCity: RegionData | null;
  isHeatmapActive: boolean;
  selectedTierFilter: RiskTierKey | null;
  searchQuery: string;
  activeTab: string;
  selectedYear: number;
  summary: ProvincialSummary;
  setActiveCity: (city: RegionData | null) => void;
  setHoveredCity: (city: RegionData | null) => void;
  setIsHeatmapActive: (val: boolean | ((prev: boolean) => boolean)) => void;
  setSelectedTierFilter: (tier: RiskTierKey | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: string) => void;
  setSelectedYear: (year: number) => void;
  resetToProvincial: () => void;
  downloadCsv: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [regions, setRegions] = useState<RegionData[]>(SUMSEL_FALLBACK_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCity, setActiveCity] = useState<RegionData | null>(null);
  const [hoveredCity, setHoveredCity] = useState<RegionData | null>(null);
  const [isHeatmapActive, setIsHeatmapActive] = useState<boolean>(false);
  const [selectedTierFilter, setSelectedTierFilter] = useState<RiskTierKey | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('peta');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Fetch Supabase data or use fallback
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('regions_data')
            .select('*')
            .eq('tahun', selectedYear)
            .order('skor_total', { ascending: false });

          if (!error && data && data.length > 0) {
            setRegions(data as RegionData[]);
          } else {
            console.warn('Supabase returned empty/error, using fallback data:', error?.message);
            setRegions(SUMSEL_FALLBACK_DATA);
          }
        } catch (err) {
          console.error('Failed to query Supabase:', err);
          setRegions(SUMSEL_FALLBACK_DATA);
        }
      } else {
        setRegions(SUMSEL_FALLBACK_DATA);
      }
      setIsLoading(false);
    }

    loadData();
  }, [selectedYear]);

  // Compute Provincial Summary
  const summary = useMemo<ProvincialSummary>(() => {
    if (!regions.length) {
      return {
        totalWilayah: 0,
        rataRataSkor: 0,
        skorTertinggi: SUMSEL_FALLBACK_DATA[0],
        skorTerendah: SUMSEL_FALLBACK_DATA[0],
        tierCounts: { terjaga: 0, terawasi: 0, waspada: 0, rawan: 0, rentan: 0 },
        totalResponden: 0,
      };
    }

    const totalWilayah = regions.length;
    const totalSkor = regions.reduce((acc, r) => acc + Number(r.skor_total), 0);
    const rataRataSkor = totalSkor / totalWilayah;
    const totalResponden = regions.reduce((acc, r) => acc + Number(r.jumlah_responden || 0), 0);

    const sorted = [...regions].sort((a, b) => Number(b.skor_total) - Number(a.skor_total));
    const skorTertinggi = sorted[0];
    const skorTerendah = sorted[sorted.length - 1];

    const tierCounts: Record<RiskTierKey, number> = {
      terjaga: 0,
      terawasi: 0,
      waspada: 0,
      rawan: 0,
      rentan: 0,
    };

    regions.forEach((r) => {
      const tier = getTierByScore(Number(r.skor_total));
      tierCounts[tier.key] = (tierCounts[tier.key] || 0) + 1;
    });

    return {
      totalWilayah,
      rataRataSkor,
      skorTertinggi,
      skorTerendah,
      tierCounts,
      totalResponden,
    };
  }, [regions]);

  const resetToProvincial = () => {
    setActiveCity(null);
    setHoveredCity(null);
    setSelectedTierFilter(null);
    setSearchQuery('');
  };

  const downloadCsv = () => {
    const headers = [
      'Kode Wilayah',
      'Nama Wilayah',
      'Tipe',
      'Skor Total (SPI)',
      'Kategori Risiko',
      'Indikator Internal',
      'Indikator Eksternal',
      'Penilaian Eksper',
      'Faktor Koreksi',
      'Jumlah Responden',
      'Tahun',
      'Rekomendasi Utama'
    ];

    const rows = regions.map((r) => [
      `"${r.kode_wilayah}"`,
      `"${r.nama_wilayah}"`,
      `"${r.tipe_wilayah}"`,
      r.skor_total,
      `"${r.kategori_risiko}"`,
      r.indikator_internal,
      r.indikator_eksternal,
      r.indikator_eksper,
      r.faktor_koreksi,
      r.jumlah_responden,
      r.tahun,
      `"${r.rekomendasi_utama.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SPI_Sumatera_Selatan_${selectedYear}_17_KabKota.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardContext.Provider
      value={{
        regions,
        isLoading,
        activeCity,
        hoveredCity,
        isHeatmapActive,
        selectedTierFilter,
        searchQuery,
        activeTab,
        selectedYear,
        summary,
        setActiveCity,
        setHoveredCity,
        setIsHeatmapActive,
        setSelectedTierFilter,
        setSearchQuery,
        setActiveTab,
        setSelectedYear,
        resetToProvincial,
        downloadCsv,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
