'use client';

import React from 'react';
import { useSpiDashboard } from '@/context/SpiDashboardContext';
import { getTierByScore, formatScore } from '@/lib/scoringEngine';
import { Award, AlertTriangle, TrendingUp, BarChart2 } from 'lucide-react';

export default function HighlightSummaryBar() {
  const { summary, setActiveCity, thresholds } = useSpiDashboard();

  const avgTier = summary.tierRataRata;
  const highCity = summary.skorTertinggi;
  const highTier = highCity ? getTierByScore(highCity.skor_total, thresholds) : null;
  const lowCity = summary.skorTerendah;
  const lowTier = lowCity ? getTierByScore(lowCity.skor_total, thresholds) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 select-none">
      {/* 1. Rata-Rata Indeks Provinsi Sumsel */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
            <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Rata-Rata Sumsel</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black font-mono" style={{ color: avgTier.hex }}>
              {formatScore(summary.rataRataSkor)}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">/ 100</span>
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-black shrink-0"
          style={{ backgroundColor: `${avgTier.hex}22`, color: avgTier.hex }}
        >
          {avgTier.label}
        </span>
      </div>

      {/* 2. Kota Skor Tertinggi */}
      {highCity && highTier && (
        <button
          onClick={() => setActiveCity(highCity)}
          className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 shadow-2xs flex items-center justify-between text-left transition group cursor-pointer"
          title="Klik untuk memilih kota ini di peta"
        >
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Integritas Tertinggi</span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate mt-0.5 group-hover:text-emerald-700">
              {highCity.nama_wilayah}
            </h4>
          </div>
          <div className="text-right shrink-0">
            <span className="text-lg sm:text-xl font-black font-mono text-emerald-700 block">
              {formatScore(highCity.skor_total)}
            </span>
            <span
              className="px-2 py-0.2 rounded-full text-[9px] font-black inline-block mt-0.5"
              style={{ backgroundColor: `${highTier.hex}25`, color: highTier.hex }}
            >
              {highTier.label}
            </span>
          </div>
        </button>
      )}

      {/* 3. Perlu Perhatian Khusus (Skor Terendah) */}
      {lowCity && lowTier && (
        <button
          onClick={() => setActiveCity(lowCity)}
          className="p-3 sm:p-3.5 rounded-2xl bg-rose-50/60 hover:bg-rose-50 border border-rose-100 shadow-2xs flex items-center justify-between text-left transition group cursor-pointer"
          title="Klik untuk memilih kota ini di peta"
        >
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-rose-800 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Perlu Perhatian</span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate mt-0.5 group-hover:text-rose-700">
              {lowCity.nama_wilayah}
            </h4>
          </div>
          <div className="text-right shrink-0">
            <span className="text-lg sm:text-xl font-black font-mono text-rose-600 block">
              {formatScore(lowCity.skor_total)}
            </span>
            <span
              className="px-2 py-0.2 rounded-full text-[9px] font-black inline-block mt-0.5"
              style={{ backgroundColor: `${lowTier.hex}25`, color: lowTier.hex }}
            >
              {lowTier.label}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
