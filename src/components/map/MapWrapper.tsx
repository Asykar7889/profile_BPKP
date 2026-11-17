'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import InMapRiskSidebar from './InMapRiskSidebar';
import { useDashboard } from '@/context/DashboardContext';
import { getTierByScore, formatScore } from '@/lib/scoringUtils';
import { TrendingUp, ShieldAlert } from 'lucide-react';

const SumselLeafletMap = dynamic(() => import('./SumselLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 gap-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-bpkp-blueSoft border-t-bpkp-blue rounded-full animate-spin" />
      <span className="text-xs sm:text-sm font-medium text-slate-600">Memuat Peta Spasial Sumatera Selatan...</span>
    </div>
  ),
});

export default function MapWrapper() {
  const { hoveredCity } = useDashboard();
  const hoveredTier = hoveredCity ? getTierByScore(Number(hoveredCity.skor_total)) : null;

  return (
    <div className="relative isolate z-10 w-full h-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white">
      {/* 1. Header Judul "Sumatera Selatan" Sesuai Referensi Paintmaps */}
      <div className="absolute top-3.5 left-4 z-[400] pointer-events-none select-none flex flex-col">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-sans drop-shadow-2xs">
          Sumatera Selatan
        </h2>
        <span className="text-[10px] sm:text-xs text-slate-500 font-semibold">
          Peta Zonasi Tingkat Risiko Korupsi (SPI)
        </span>
      </div>

      {/* 2. Pop-up Statistik Single-Region saat Kursor Mengarah ke Kota Tertentu */}
      {hoveredCity && hoveredTier && (
        <div className="hidden sm:flex absolute top-3.5 right-4 z-[400] pointer-events-none select-none bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-3 max-w-[260px] flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Statistik Wilayah
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
              style={{ backgroundColor: hoveredTier.hex }}
            >
              {hoveredTier.label}
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug">
              {hoveredCity.nama_wilayah}
            </h4>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black font-mono" style={{ color: hoveredTier.hex }}>
                {formatScore(Number(hoveredCity.skor_total))}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100 grid grid-cols-3 gap-1 text-[10px] text-slate-500">
            <div>
              <span className="block text-[9px] text-slate-400">Internal</span>
              <span className="font-bold text-slate-700">{formatScore(Number(hoveredCity.indikator_internal))}</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-400">Eksternal</span>
              <span className="font-bold text-slate-700">{formatScore(Number(hoveredCity.indikator_eksternal))}</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-400">Eksper</span>
              <span className="font-bold text-slate-700">{formatScore(Number(hoveredCity.indikator_eksper))}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Core Leaflet Map Canvas */}
      <SumselLeafletMap />

      {/* 4. In-Map Sidebar Menu untuk Tingkat Risiko SPI (Terisolasi di dalam z-10 kontainer peta) */}
      <InMapRiskSidebar />
    </div>
  );
}
