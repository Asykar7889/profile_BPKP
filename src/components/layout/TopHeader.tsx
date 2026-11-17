'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  Search,
  Flame,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  X
} from 'lucide-react';
import { getTierByScore, formatScore } from '@/lib/scoringUtils';

export default function TopHeader() {
  const {
    regions,
    searchQuery,
    setSearchQuery,
    activeCity,
    setActiveCity,
    isHeatmapActive,
    setIsHeatmapActive,
    selectedYear,
    setSelectedYear,
    summary,
  } = useDashboard();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRegions = regions.filter((r) =>
    r.nama_wilayah.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.kode_wilayah.includes(searchQuery)
  );

  const handleSelectCity = (city: typeof regions[0]) => {
    setActiveCity(city);
    setSearchQuery(city.nama_wilayah);
    setIsDropdownOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveCity(null);
  };

  const avgTier = getTierByScore(summary.rataRataSkor);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 select-none">
      {/* Quick Search Combobox */}
      <div className="relative w-full md:w-96" ref={searchContainerRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Cari Kabupaten / Kota (misal: Palembang)..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isDropdownOpen && filteredRegions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto p-1.5">
            {filteredRegions.map((region) => {
              const tier = getTierByScore(Number(region.skor_total));
              const isSelected = activeCity?.kode_wilayah === region.kode_wilayah;
              return (
                <div
                  key={region.kode_wilayah}
                  onClick={() => handleSelectCity(region)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                    isSelected ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tier.hex }}
                    />
                    <span className="font-semibold">{region.nama_wilayah}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-[11px] font-bold" style={{ color: tier.hex }}>
                      {formatScore(Number(region.skor_total))}
                    </span>
                    <span className="text-[10px] text-slate-400">({tier.label})</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KPI Stats & Toggles */}
      <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
        {/* KPI: Rata-Rata Provinsi */}
        <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
          <TrendingUp className="w-4 h-4 text-slate-500" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Rata-Rata Sumsel</span>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold font-mono text-slate-800 text-sm">
                {formatScore(summary.rataRataSkor)}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.2 rounded font-bold"
                style={{ backgroundColor: `${avgTier.hex}22`, color: avgTier.hex }}
              >
                {avgTier.label}
              </span>
            </div>
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent focus:outline-none cursor-pointer"
          >
            <option value={2026}>Tahun 2026</option>
            <option value={2025}>Tahun 2025</option>
            <option value={2024}>Tahun 2024</option>
          </select>
        </div>

        {/* Heatmap Toggle Switch */}
        <button
          onClick={() => setIsHeatmapActive((prev) => !prev)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isHeatmapActive
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-500/25 ring-2 ring-orange-400/30'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
          title="Alihkan mode tampilan peta antara warna netral dan visualisasi risiko koropleth"
        >
          <Flame className={`w-4 h-4 ${isHeatmapActive ? 'text-white animate-pulse' : 'text-orange-500'}`} />
          <span>Mode Heatmap Risiko: {isHeatmapActive ? 'AKTIF' : 'NONAKTIF'}</span>
        </button>
      </div>
    </header>
  );
}
