'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Users,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  MapPin,
  FileText
} from 'lucide-react';
import { getTierByScore, formatScore, formatNumber } from '@/lib/scoringUtils';

import IndicatorRadar from './IndicatorRadar';

export default function InspectRegionPanel() {
  const { activeCity, resetToProvincial, summary } = useDashboard();

  // If no city selected, display Provincial Summary
  if (!activeCity) {
    const avgTier = getTierByScore(summary.rataRataSkor);
    const highTier = getTierByScore(Number(summary.skorTertinggi?.skor_total || 0));
    const lowTier = getTierByScore(Number(summary.skorTerendah?.skor_total || 0));

    return (
      <aside className="w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto select-none">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Ringkasan Provinsi</span>
          </div>
          <h2 className="text-lg font-black text-slate-800 leading-tight">
            Provinsi Sumatera Selatan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Survei Penilaian Integritas (SPI) Terpadu
          </p>
        </div>

        {/* Big Provincial Average Gauge */}
        <div className="p-5 border-b border-slate-100 flex flex-col items-center text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Skor Rata-Rata Provinsi
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span
              className="text-5xl font-black font-mono tracking-tight"
              style={{ color: avgTier.hex }}
            >
              {formatScore(summary.rataRataSkor)}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>

          <div
            className="px-3 py-1 rounded-full text-xs font-bold mt-2 shadow-sm"
            style={{ backgroundColor: `${avgTier.hex}1A`, color: avgTier.hex }}
          >
            Kategori: {avgTier.label} ({avgTier.description})
          </div>

          <p className="text-xs text-slate-500 mt-3 max-w-xs leading-relaxed">
            Total {summary.totalWilayah} Kabupaten dan Kota dengan cakupan {formatNumber(summary.totalResponden)} responden internal, eksternal, dan ahli.
          </p>
        </div>

        {/* High & Low Extremes */}
        <div className="p-5 border-b border-slate-100 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Sorotan Wilayah (Ekstrem)
          </span>

          {/* Highest Score */}
          <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Skor Tertinggi</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {summary.skorTertinggi?.nama_wilayah}
              </p>
            </div>
            <span className="text-base font-black font-mono text-emerald-700">
              {formatScore(Number(summary.skorTertinggi?.skor_total || 0))}
            </span>
          </div>

          {/* Lowest Score */}
          <div className="p-3 rounded-xl border border-red-100 bg-red-50/40 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Skor Terendah</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {summary.skorTerendah?.nama_wilayah}
              </p>
            </div>
            <span className="text-base font-black font-mono text-red-600">
              {formatScore(Number(summary.skorTerendah?.skor_total || 0))}
            </span>
          </div>
        </div>

        {/* Action Callout */}
        <div className="p-5 flex-1 flex flex-col justify-end">
          <div className="p-4 rounded-xl bg-slate-900 text-white text-xs leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-amber-400 mb-1.5">
              <MapPin className="w-4 h-4" />
              <span>Petunjuk Interaktif:</span>
            </div>
            <p className="text-slate-300">
              Klik pada salah satu dari 17 wilayah di peta untuk memeriksa rincian dimensi internal, eksternal, eksper, dan rekomendasi audit KPK.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  // When a specific city is selected
  const tier = getTierByScore(Number(activeCity.skor_total));

  return (
    <aside className="w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto select-none">
      {/* Detail Header */}
      <div
        className="p-5 border-b border-slate-100 transition-all"
        style={{ borderTop: `4px solid ${tier.hex}` }}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
            KODE: {activeCity.kode_wilayah} • {activeCity.tipe_wilayah}
          </span>
          <button
            onClick={resetToProvincial}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2 py-1 rounded-lg transition"
            title="Kembali ke Ringkasan Provinsi"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <h2 className="text-lg font-black text-slate-900 leading-snug">
          {activeCity.nama_wilayah}
        </h2>

        <div className="flex items-center gap-2 mt-2">
          <span
            className="text-xs px-2.5 py-0.5 rounded-full font-bold shadow-sm"
            style={{ backgroundColor: `${tier.hex}22`, color: tier.hex }}
          >
            {tier.label}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Tahun {activeCity.tahun}
          </span>
        </div>
      </div>

      {/* Main Score Display */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Skor Total SPI
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className="text-4xl font-black font-mono tracking-tight"
              style={{ color: tier.hex }}
            >
              {formatScore(Number(activeCity.skor_total))}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Responden
          </span>
          <div className="flex items-center justify-end gap-1 text-slate-700 font-semibold text-sm mt-0.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatNumber(activeCity.jumlah_responden)} org</span>
          </div>
        </div>
      </div>

      {/* Indicator Breakdown Progress Bars */}
      <div className="p-5 border-b border-slate-100 space-y-3.5">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Rincian Dimensi Penilaian
        </span>

        {/* Internal */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Indikator Internal</span>
            <span className="font-mono font-bold text-slate-900">
              {formatScore(Number(activeCity.indikator_internal))}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${activeCity.indikator_internal}%`,
                backgroundColor: tier.hex,
              }}
            />
          </div>
        </div>

        {/* Eksternal */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Indikator Eksternal</span>
            <span className="font-mono font-bold text-slate-900">
              {formatScore(Number(activeCity.indikator_eksternal))}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${activeCity.indikator_eksternal}%`,
                backgroundColor: tier.hex,
              }}
            />
          </div>
        </div>

        {/* Eksper */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Penilaian Eksper / Ahli</span>
            <span className="font-mono font-bold text-slate-900">
              {formatScore(Number(activeCity.indikator_eksper))}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${activeCity.indikator_eksper}%`,
                backgroundColor: tier.hex,
              }}
            />
          </div>
        </div>

        {/* Faktor Koreksi */}
        <div className="pt-1 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <span>Faktor Koreksi Data:</span>
          <span className="font-mono font-bold text-red-600">
            {formatScore(Number(activeCity.faktor_koreksi))}%
          </span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="p-4 border-b border-slate-100">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Radar Profil Dimensi
        </span>
        <IndicatorRadar
          internal={Number(activeCity.indikator_internal)}
          external={Number(activeCity.indikator_eksternal)}
          expert={Number(activeCity.indikator_eksper)}
          correction={Number(activeCity.faktor_koreksi)}
          tierColor={tier.hex}
        />
      </div>

      {/* KPK Recommendations */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Rekomendasi Tindak Lanjut</span>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 leading-relaxed">
            {activeCity.rekomendasi_utama}
          </div>
        </div>

        <button
          onClick={resetToProvincial}
          className="mt-6 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Kembali ke Ringkasan Provinsi</span>
        </button>
      </div>
    </aside>
  );
}
