'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSpiDashboard } from '@/context/SpiDashboardContext';
import { useDashboard } from '@/context/DashboardContext';
import BpkpLogo from '@/components/common/BpkpLogo';
import {
  Search,
  Calendar,
  Download,
  FileText,
  Printer,
  LogIn,
  LogOut,
  UserCheck,
  ShieldAlert,
  X,
  Menu,
  PanelLeftOpen,
} from 'lucide-react';
import { CitySurvey } from '@/types/spi';
import { formatScore } from '@/lib/scoringEngine';

export default function TopFilterExportBar() {
  const {
    surveys,
    activeCity,
    setActiveCity,
    selectedYear,
    setSelectedYear,
    currentUser,
    userRole,
    setIsAuthModalOpen,
    logoutUser,
  } = useSpiDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Access Dashboard context for desktop sidebar & mobile drawer toggles
  const {
    isMainSidebarOpen,
    isDesktopSidebarOpen,
    toggleMainSidebar,
    setIsMobileSidebarOpen,
  } = useDashboard();
  const isSidebarOpen = isDesktopSidebarOpen ?? isMainSidebarOpen;
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = surveys.filter(
    (c) =>
      c.nama_wilayah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.kode_wilayah.includes(searchQuery)
  );

  const handleSelectCity = (city: CitySurvey) => {
    setActiveCity(city);
    setSearchQuery(city.nama_wilayah);
    setIsDropdownOpen(false);
  };

  // Client-Side CSV Export (Excel compatible)
  const handleDownloadExcel = () => {
    const headers = [
      'Kode Wilayah',
      'Nama Wilayah',
      'Tipe',
      'Tahun',
      'Skor Total SPI',
      'Kategori Risiko',
      'Skor Internal (35%)',
      'Skor Eksternal (35%)',
      'Skor Eksper (30%)',
      'Faktor Koreksi',
      'Jumlah Responden',
    ];

    const rows = surveys.map((s) => {
      const internal = s.dimensions.find((d) => d.kode_dimensi === 'internal')?.skor_dimensi || 0;
      const eksternal = s.dimensions.find((d) => d.kode_dimensi === 'eksternal')?.skor_dimensi || 0;
      const eksper = s.dimensions.find((d) => d.kode_dimensi === 'eksper')?.skor_dimensi || 0;
      const koreksi = s.dimensions.find((d) => d.kode_dimensi === 'faktor_koreksi')?.skor_dimensi || 0;

      return [
        `"${s.kode_wilayah}"`,
        `"${s.nama_wilayah}"`,
        `"${s.tipe_wilayah}"`,
        s.tahun,
        formatScore(s.skor_total),
        `"${s.kategori_risiko}"`,
        formatScore(internal),
        formatScore(eksternal),
        formatScore(eksper),
        formatScore(koreksi),
        s.jumlah_responden,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SPI_Sumsel_${selectedYear}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF / Print Handler
  const handlePrintPdf = () => {
    window.print();
  };

  // Reusable Search Input Node
  const searchInputNode = (
    <div ref={searchRef} className="relative flex-1">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari Kabupaten / Kota (17 Daerah)..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 font-medium placeholder-slate-400 transition"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCity(null);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isDropdownOpen && filteredCities.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-[600] max-h-60 overflow-y-auto py-1">
          {filteredCities.map((c) => (
            <button
              key={c.kode_wilayah}
              onClick={() => handleSelectCity(c)}
              className="w-full px-3 py-2 text-left hover:bg-blue-50/70 flex items-center justify-between text-xs transition border-b border-slate-50 last:border-none"
            >
              <div>
                <span className="font-bold text-slate-900">{c.nama_wilayah}</span>
                <span className="text-[10px] text-slate-400 block">
                  {c.tipe_wilayah} • Kode: {c.kode_wilayah}
                </span>
              </div>
              <span className="font-mono font-bold text-slate-700">
                {formatScore(c.skor_total)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Reusable Year Selector Node
  const yearSelectorNode = (
    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 shrink-0">
      <Calendar className="w-3.5 h-3.5 text-blue-600" />
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
        className="bg-transparent focus:outline-none cursor-pointer"
      >
        <option value={2026}>2026</option>
        <option value={2025}>2025</option>
        <option value={2024}>2024</option>
      </select>
    </div>
  );

  // Reusable Action Controls Node
  const actionControlsNode = (
    <div className="flex items-center gap-2 shrink-0">
      {/* Export Excel */}
      <button
        onClick={handleDownloadExcel}
        className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
        title="Download Rekap Skor Excel / CSV"
      >
        <Download className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">Excel</span>
      </button>

      {/* Print / PDF */}
      <button
        onClick={handlePrintPdf}
        className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
        title="Cetak Dokumen / Ekspor PDF"
      >
        <Printer className="w-3.5 h-3.5 text-blue-600" />
        <span className="hidden sm:inline">PDF</span>
      </button>

      {/* RBAC Portal Controls */}
      {userRole === 'public' ? (
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Masuk Pegawai</span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <div className="flex items-center gap-2 pl-2 pr-1">
            <span className="text-[11px] font-bold text-slate-700 hidden sm:inline max-w-[140px] truncate">
              {currentUser?.full_name}
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase ${
                userRole === 'admin'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {userRole}
            </span>
            <button
              onClick={logoutUser}
              className="p-1 text-slate-400 hover:text-red-600 rounded-md transition"
              title="Keluar (Logout)"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full select-none">
      {/* 1. STICKY TOP BAR: Sticky on Mobile (z-40) & Unified on Desktop */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 px-3 sm:px-6 py-2.5 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          {/* Brand & Title + Hamburger Button + Desktop Reopen Button */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Mobile Hamburger Drawer Toggle (< lg) */}
            <button
              type="button"
              onClick={toggleMobileSidebar}
              className="lg:hidden p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition min-w-[34px] min-h-[34px] flex items-center justify-center"
              title="Buka Navigasi"
              aria-label="Buka Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Desktop Reopen Sidebar Button: Renders ONLY when sidebar is collapsed (hidden lg:inline-flex) */}
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={toggleMainSidebar}
                className="hidden lg:inline-flex p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-bpkp-blue hover:bg-slate-100 transition min-w-[34px] min-h-[34px] items-center justify-center shadow-2xs active:scale-95"
                title="Buka Menu Sidebar"
                aria-label="Buka Menu Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            <BpkpLogo className="h-8 sm:h-9 w-auto" />
            <div className="flex flex-col">
              <span className="text-[9.5px] sm:text-[10px] font-black tracking-wider text-blue-700 uppercase leading-none">
                BPKP SUMATERA SELATAN
              </span>
              <h1 className="text-xs sm:text-base font-black text-slate-900 tracking-tight leading-tight">
                Pemetaan Indeks Integritas (SPI)
              </h1>
            </div>
          </div>

          {/* Desktop Middle: Autocomplete Search & Year Filter */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl mx-auto">
            {searchInputNode}
            {yearSelectorNode}
          </div>

          {/* Desktop Right: Action Buttons & RBAC */}
          <div className="hidden md:flex items-center justify-end">
            {actionControlsNode}
          </div>
        </div>
      </header>

      {/* 2. NON-STICKY MOBILE FILTER & ACTION ROW: Scrolls naturally out of view */}
      <div className="md:hidden bg-white border-b border-slate-200/90 px-3 py-2 space-y-2">
        <div className="flex items-center gap-2 w-full">
          {searchInputNode}
          {yearSelectorNode}
        </div>
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
          {actionControlsNode}
        </div>
      </div>
    </div>
  );
}
