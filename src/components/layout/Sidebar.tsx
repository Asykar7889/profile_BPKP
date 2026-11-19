'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboard } from '@/context/DashboardContext';
import BpkpLogo from '@/components/common/BpkpLogo';
import {
  Map,
  FileSpreadsheet,
  Building2,
  History,
  Download,
  CheckSquare,
  HelpCircle,
  X,
  PanelLeftClose,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const {
    activeTab,
    setActiveTab,
    downloadCsv,
    isMainSidebarOpen,
    toggleMainSidebar,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useDashboard();

  // Menu navigasi utama aplikasi
  const navItems = [
    { id: 'peta', label: 'Peta Utama SPI', icon: Map, href: '/' },
    { id: 'wilayah', label: 'Hasil Wilayah', icon: Building2, href: '/' },
    { id: 'tabulasi', label: 'Tabulasi Instansi', icon: FileSpreadsheet, href: '/' },
    { id: 'profil_umum', label: 'Profil Umum BPKP', icon: Building2, href: '/profil-umum' },
    { id: 'historis', label: 'Data Historis', icon: History, href: '/' },
    { id: 'tindak_lanjut', label: 'Tindak Lanjut', icon: CheckSquare, href: '/' },
  ];

  return (
    <>
      {/* 1. Mobile Backdrop Overlay (Highest Z-Index layer z-[9990]) */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-[9990] bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 2. Main Sidebar Container (Mobile: Topmost Drawer z-[9999] | Desktop: Fixed/Collapsible z-30) */}
      <aside
        className={`fixed inset-y-0 left-0 z-[9999] w-72 bg-white text-slate-800 flex flex-col justify-between border-r border-bpkp-border flex-shrink-0 select-none shadow-2xl transition-all duration-300 ease-in-out lg:static lg:z-30 lg:shadow-none ${
          /* Mobile Drawer: Translate-X */
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          /* Desktop Collapsible Width: w-64 when open, w-0 when closed */
          isMainSidebarOpen ? 'lg:w-64 lg:opacity-100' : 'lg:w-0 lg:overflow-hidden lg:opacity-0 lg:border-none'
        }`}
      >
        <div className="w-72 lg:w-64 flex flex-col h-full overflow-y-auto">
          {/* Brand Header with BPKP Official Logo */}
          <div className="p-4 border-b border-bpkp-border flex items-center justify-between bg-gradient-to-r from-bpkp-blueSoft/50 to-white">
            <Link
              href="/"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="flex items-center hover:opacity-90 transition-opacity"
              title="Kembali ke Dashboard Utama"
            >
              <BpkpLogo className="h-8 w-auto" showText={false} />
            </Link>

            <div className="flex items-center gap-1">
              {/* Desktop Collapse Toggle Button */}
              <button
                onClick={toggleMainSidebar}
                className="hidden lg:flex p-1.5 text-slate-400 hover:text-bpkp-blue hover:bg-bpkp-blueSoft rounded-lg transition"
                title="Sembunyikan Sidebar Navigasi"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-bpkp-blue hover:bg-bpkp-blueSoft lg:hidden rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub-header Brand Title */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
            <span className="font-black text-[11px] text-bpkp-blue uppercase tracking-tight block">
              PERWAKILAN BPKP SUMATERA SELATAN
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Sistem Informasi Pemetaan SPI
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 flex-1">
            <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Menu Utama
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isProfilPage = pathname === '/profil-umum';
              const isActive =
                item.id === 'profil_umum'
                  ? isProfilPage || (pathname === '/' && activeTab === 'profil_umum')
                  : !isProfilPage && activeTab === item.id;

              const activeStyles = isActive
                ? 'bg-bpkp-blueSoft text-bpkp-blue border-l-4 border-bpkp-blue font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';

              // Item "Profil Umum BPKP" always routes to /profil-umum with next/link
              if (item.id === 'profil_umum') {
                return (
                  <Link
                    key={item.id}
                    href="/profil-umum"
                    onClick={() => {
                      setActiveTab('profil_umum');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-all ${activeStyles}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-bpkp-blue' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              // Other items when on /profil-umum route back to / via next/link
              if (isProfilPage) {
                return (
                  <Link
                    key={item.id}
                    href="/"
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-all ${activeStyles}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-bpkp-blue' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              // Other items when already on / stay on page and switch tab
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-all ${activeStyles}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-bpkp-blue' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <p className="px-3 pt-4 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Aksi & Ekspor
            </p>

            <button
              onClick={() => {
                downloadCsv();
                setIsMobileSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-bpkp-blue hover:bg-bpkp-blueSoft transition-all border border-bpkp-blueBorder min-h-[44px]"
            >
              <Download className="w-4 h-4 text-bpkp-blue" />
              <span>Unduh Data (CSV)</span>
            </button>
          </nav>

          {/* Footer Info */}
          <div className="p-4 border-t border-bpkp-border bg-slate-50 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 text-bpkp-blue font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-bpkp-blue" />
              <span>Tentang Portal</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500">
              Survei Penilaian Integritas (SPI) BPKP untuk 17 Kab/Kota Prov. Sumatera Selatan.
            </p>
            <div className="pt-1 text-[9px] text-slate-400">
              Versi 2.3 • BPKP Sumsel © 2026
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
