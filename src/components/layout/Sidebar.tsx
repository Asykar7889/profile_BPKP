'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  ShieldAlert,
  Map,
  FileSpreadsheet,
  Building2,
  History,
  Download,
  CheckSquare,
  HelpCircle
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, downloadCsv } = useDashboard();

  const navItems = [
    { id: 'peta', label: 'Peta Utama SPI', icon: Map },
    { id: 'wilayah', label: 'Hasil Wilayah', icon: Building2 },
    { id: 'tabulasi', label: 'Tabulasi Instansi', icon: FileSpreadsheet },
    { id: 'historis', label: 'Data Historis', icon: History },
    { id: 'tindak_lanjut', label: 'Tindak Lanjut', icon: CheckSquare },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 flex-shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight">
                SPI SUMSEL
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Peta Risiko Korupsi BPKP
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <p className="px-3 pt-4 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Aksi & Ekspor
          </p>

          <button
            onClick={downloadCsv}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-slate-800 transition-all border border-emerald-900/40 hover:border-emerald-700/60"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Unduh Data (CSV)</span>
          </button>
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
          <span>Tentang Dashboard</span>
        </div>
        <p className="text-[10.5px] leading-relaxed text-slate-400">
          Survei Penilaian Integritas (SPI) mengukur risiko korupsi pada 17 Kab/Kota di Prov. Sumatera Selatan.
        </p>
        <div className="pt-2 text-[9.5px] text-slate-400">
          Versi 2.0 • Data Tahun 2026
        </div>
      </div>
    </aside>
  );
}
