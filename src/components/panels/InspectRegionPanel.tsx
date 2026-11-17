'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import {
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Users,
  Award,
  Layers,
  MapPin,
  FileText,
  MousePointerClick
} from 'lucide-react';
import { getTierByScore, formatScore, formatNumber } from '@/lib/scoringUtils';
import IndicatorRadar from './IndicatorRadar';

export default function InspectRegionPanel() {
  const { activeCity, hoveredCity, resetToProvincial, summary, setActiveCity } = useDashboard();

  // PRIORITAS TAMPILAN:
  // 1. Jika ada hoveredCity (kursor sedang diarahkan ke kota di peta) -> tampilkan statistik kota tersebut
  // 2. Jika ada activeCity (kota diklik/dipilih) -> tampilkan statistik kota tersebut
  // 3. Jika tidak ada kursor diarahkan atau kota diklik -> tampilkan Ringkasan Panduan & Provinsi
  const displayCity = hoveredCity || activeCity;

  // JIKA BELUM MENGARAHKAN KURSOR ATAU MEMILIH KOTA:
  if (!displayCity) {
    const avgTier = getTierByScore(summary.rataRataSkor);
    const highTier = getTierByScore(Number(summary.skorTertinggi?.skor_total || 0));
    const lowTier = getTierByScore(Number(summary.skorTerendah?.skor_total || 0));

    return (
      <aside className="w-full h-full bg-white flex flex-col justify-between overflow-y-auto select-none p-4 sm:p-5">
        <div>
          {/* Header */}
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Statistik Provinsi</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 leading-tight">
              Provinsi Sumatera Selatan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Arahkan kursor ke salah satu kota di peta untuk melihat statistik detailnya.
            </p>
          </div>

          {/* Interactive Guide Banner */}
          <div className="my-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white flex-shrink-0 mt-0.5">
              <MousePointerClick className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-950">
                Arahkan Kursor ke Peta
              </h4>
              <p className="text-[11px] text-blue-900/80 leading-relaxed mt-0.5">
                Statistik lengkap per kota/kabupaten hanya akan muncul saat kursor Anda berada di atas wilayah tersebut.
              </p>
            </div>
          </div>

          {/* Skor Rata-Rata Provinsi */}
          <div className="py-3 px-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Rata-Rata Provinsi
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black font-mono" style={{ color: avgTier.hex }}>
                  {formatScore(summary.rataRataSkor)}
                </span>
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
            </div>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: `${avgTier.hex}22`, color: avgTier.hex }}
            >
              {avgTier.label}
            </span>
          </div>

          {/* Ekstrem Tertinggi & Terendah */}
          <div className="mt-3.5 space-y-2">
            <div 
              onClick={() => summary.skorTertinggi && setActiveCity(summary.skorTertinggi)}
              className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition"
              title="Klik untuk memilih Palembang"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tertinggi</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                  {summary.skorTertinggi?.nama_wilayah}
                </p>
              </div>
              <span className="text-sm font-black font-mono text-emerald-700">
                {formatScore(Number(summary.skorTertinggi?.skor_total || 0))}
              </span>
            </div>

            <div 
              onClick={() => summary.skorTerendah && setActiveCity(summary.skorTerendah)}
              className="p-2.5 rounded-xl border border-red-100 bg-red-50/40 flex items-center justify-between cursor-pointer hover:bg-red-50 transition"
              title="Klik untuk memilih Muratara"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Terendah</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                  {summary.skorTerendah?.nama_wilayah}
                </p>
              </div>
              <span className="text-sm font-black font-mono text-red-600">
                {formatScore(Number(summary.skorTerendah?.skor_total || 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Bantuan */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-[10.5px] text-slate-400 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span>Mencakup 17 Kabupaten/Kota se-Sumatera Selatan</span>
        </div>
      </aside>
    );
  }

  // JIKA SEDANG MENGARAHKAN KURSOR ATAU SUDAH MENGKLIK KOTA:
  const tier = getTierByScore(Number(displayCity.skor_total));
  const isHover = Boolean(hoveredCity && (!activeCity || hoveredCity.kode_wilayah !== activeCity.kode_wilayah));

  return (
    <aside className="w-full h-full bg-white flex flex-col justify-between overflow-y-auto select-none">
      <div>
        {/* Header Detail Wilayah */}
        <div
          className="p-4 sm:p-5 border-b border-slate-100 transition-all"
          style={{ borderTop: `4px solid ${tier.hex}` }}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-500 uppercase">
              {displayCity.kode_wilayah} • {displayCity.tipe_wilayah}
            </span>
            {isHover ? (
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                <span>Sorotan Kursor</span>
              </span>
            ) : (
              <button
                onClick={resetToProvincial}
                className="flex items-center gap-1 text-[10.5px] font-semibold text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2 py-0.5 rounded-lg transition"
                title="Kembali ke Ringkasan"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
            {displayCity.nama_wilayah}
          </h2>

          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-bold shadow-xs"
              style={{ backgroundColor: `${tier.hex}22`, color: tier.hex }}
            >
              {tier.label}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Tahun {displayCity.tahun}
            </span>
          </div>
        </div>

        {/* Skor Utama & Responden */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
              Skor Total SPI
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className="text-3xl sm:text-4xl font-black font-mono tracking-tight"
                style={{ color: tier.hex }}
              >
                {formatScore(Number(displayCity.skor_total))}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
              Responden
            </span>
            <div className="flex items-center justify-end gap-1 text-slate-700 font-semibold text-xs sm:text-sm mt-0.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatNumber(displayCity.jumlah_responden)} org</span>
            </div>
          </div>
        </div>

        {/* Rincian Dimensi Penilaian */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Rincian Dimensi Penilaian
          </span>

          {/* Internal */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Internal</span>
              <span className="font-mono font-bold text-slate-900">
                {formatScore(Number(displayCity.indikator_internal))}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${displayCity.indikator_internal}%`,
                  backgroundColor: tier.hex,
                }}
              />
            </div>
          </div>

          {/* Eksternal */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Eksternal</span>
              <span className="font-mono font-bold text-slate-900">
                {formatScore(Number(displayCity.indikator_eksternal))}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${displayCity.indikator_eksternal}%`,
                  backgroundColor: tier.hex,
                }}
              />
            </div>
          </div>

          {/* Eksper */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Penilaian Ahli (Eksper)</span>
              <span className="font-mono font-bold text-slate-900">
                {formatScore(Number(displayCity.indikator_eksper))}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${displayCity.indikator_eksper}%`,
                  backgroundColor: tier.hex,
                }}
              />
            </div>
          </div>

          {/* Faktor Koreksi */}
          <div className="pt-0.5 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span>Faktor Koreksi Data:</span>
            <span className="font-mono font-bold text-red-600">
              {formatScore(Number(displayCity.faktor_koreksi))}%
            </span>
          </div>
        </div>

        {/* Radar Chart Dimensi (ECharts) */}
        <div className="p-3 sm:p-4 border-b border-slate-100">
          <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Radar Profil Risiko
          </span>
          <IndicatorRadar
            internal={Number(displayCity.indikator_internal)}
            external={Number(displayCity.indikator_eksternal)}
            expert={Number(displayCity.indikator_eksper)}
            correction={Number(displayCity.faktor_koreksi)}
            tierColor={tier.hex}
          />
        </div>

        {/* Rekomendasi KPK */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Rekomendasi Tindak Lanjut</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 leading-relaxed">
            {displayCity.rekomendasi_utama}
          </div>
        </div>
      </div>

      {activeCity && (
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={resetToProvincial}
            className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Kembali ke Ringkasan</span>
          </button>
        </div>
      )}
    </aside>
  );
}
