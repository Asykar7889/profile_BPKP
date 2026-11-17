'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import BpkpLogo from '@/components/common/BpkpLogo';
import {
  Search,
  Calendar,
  TrendingUp,
  X,
  Menu,
  PanelLeftOpen
} from 'lucide-react';
import { getTierByScore, formatScore } from '@/lib/scoringUtils';

export default function TopHeader() {
  const {
    regions,
    searchQuery,
    setSearchQuery,
    activeCity,
    setActiveCity,
    selectedYear,
    setSelectedYear,
    summary,
    isMainSidebarOpen,
    toggleMainSidebar,
    setIsMobileSidebarOpen,
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
    <header className="bg-white border-b border-bpkp-border px-3 sm:px-5 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 select-none shadow-2xs">
      {/* Left Area: Sidebar Toggle & Search */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {/* Mobile Hamburger Button (< 1024px) */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 -ml-1 text-slate-600 hover:text-bpkp-blue hover:bg-bpkp-blueSoft rounded-xl lg:hidden flex-shrink-0 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Open Toggle (Shown only when Main Sidebar is hidden on Desktop) */}
        {!isMainSidebarOpen && (
          <button
            onClick={toggleMainSidebar}
            className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 bg-bpkp-blueSoft hover:bg-bpkp-blueBorder text-bpkp-blue rounded-xl transition text-xs font-bold mr-1 min-h-[40px]"
            title="Buka Sidebar Navigasi"
          >
            <PanelLeftOpen className="w-4 h-4" />
            <span className="hidden xl:inline">Navigasi</span>
          </button>
        )}

        {/* Mini BPKP Logo when sidebar is hidden on desktop */}
        {!isMainSidebarOpen && (
          <div className="hidden lg:flex items-center mr-2">
            <BpkpLogo className="h-6 w-auto" />
          </div>
        )}

        {/* Quick Search Combobox */}
        <div className="relative flex-1 sm:w-80 md:w-96" ref={searchContainerRef}>
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
              placeholder="Cari Kab/Kota (Palembang, OKI)..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-bpkp-blue/20 focus:border-bpkp-blue transition-all min-h-[44px]"
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
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-1.5">
              {filteredRegions.map((region) => {
                const tier = getTierByScore(Number(region.skor_total));
                const isSelected = activeCity?.kode_wilayah === region.kode_wilayah;
                return (
                  <div
                    key={region.kode_wilayah}
                    onClick={() => handleSelectCity(region)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                      isSelected ? 'bg-bpkp-blueSoft text-bpkp-blue font-bold' : 'hover:bg-slate-50 text-slate-700'
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: BPKP KPI Stats & Year Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
        {/* KPI: Rata-Rata Provinsi */}
        <div className="flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 bg-bpkp-blueSoft/50 border border-bpkp-blueBorder rounded-xl text-xs flex-shrink-0">
          <TrendingUp className="w-4 h-4 text-bpkp-blue" />
          <div className="flex flex-col">
            <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-tight">Rata-Rata Sumsel</span>
            <div className="flex items-center gap-1.5">
              <span className="font-black font-mono text-bpkp-black text-sm">
                {formatScore(summary.rataRataSkor)}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.2 rounded font-bold text-white"
                style={{ backgroundColor: avgTier.hex }}
              >
                {avgTier.label}
              </span>
            </div>
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 flex-shrink-0 min-h-[44px]">
          <Calendar className="w-3.5 h-3.5 text-bpkp-blue hidden sm:block" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent focus:outline-none cursor-pointer text-xs"
          >
            <option value={2026}>Tahun 2026</option>
            <option value={2025}>Tahun 2025</option>
            <option value={2024}>Tahun 2024</option>
          </select>
        </div>
      </div>
    </header>
  );
}
