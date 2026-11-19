'use client';

import React, { useState } from 'react';
import { useSpiDashboard } from '@/context/SpiDashboardContext';
import SemiCircleGauge from './SemiCircleGauge';
import { getTierByScore, formatScore } from '@/lib/scoringEngine';
import { DimensionCode } from '@/types/spi';
import {
  RotateCcw,
  ShieldCheck,
  Users,
  Award,
  Layers,
  MapPin,
  TrendingUp,
  Edit3,
  SlidersHorizontal,
} from 'lucide-react';

export default function RightScorePanel() {
  const {
    activeCity,
    hoveredCity,
    summary,
    surveys,
    thresholds,
    userRole,
    resetToProvince,
    openPegawaiInputForCity,
  } = useSpiDashboard();

  // If a city is active, show activeCity. If hovering, show preview. If neither, show Provincial Average.
  const displayCity = activeCity || hoveredCity;

  const [activeDimension, setActiveDimension] = useState<DimensionCode>('internal');

  // Compute provincial average dimensions if no city is selected
  const provincialDimensions = React.useMemo(() => {
    if (!surveys.length) return [];
    const internalTotal = surveys.reduce((acc, s) => acc + (s.dimensions.find(d => d.kode_dimensi === 'internal')?.skor_dimensi || 0), 0) / surveys.length;
    const eksternalTotal = surveys.reduce((acc, s) => acc + (s.dimensions.find(d => d.kode_dimensi === 'eksternal')?.skor_dimensi || 0), 0) / surveys.length;
    const eksperTotal = surveys.reduce((acc, s) => acc + (s.dimensions.find(d => d.kode_dimensi === 'eksper')?.skor_dimensi || 0), 0) / surveys.length;
    const koreksiTotal = surveys.reduce((acc, s) => acc + (s.dimensions.find(d => d.kode_dimensi === 'faktor_koreksi')?.skor_dimensi || 0), 0) / surveys.length;

    return [
      {
        kode_dimensi: 'internal' as DimensionCode,
        nama_dimensi: 'Dimensi Internal (Pegawai/ASN)',
        skor_dimensi: internalTotal,
        bobot: 0.35,
        indicators: [
          { nama_indikator: 'Integritas Pelaksanaan Tugas', skor_indikator: internalTotal + 1.2 },
          { nama_indikator: 'Transparansi Pengelolaan Anggaran', skor_indikator: internalTotal },
          { nama_indikator: 'Pengelolaan SDM & Rekrutmen/Mutasi', skor_indikator: Math.max(0, internalTotal - 2.0) },
          { nama_indikator: 'Pengadaan Barang & Jasa (PBJ)', skor_indikator: Math.max(0, internalTotal - 3.1) },
        ],
      },
      {
        kode_dimensi: 'eksternal' as DimensionCode,
        nama_dimensi: 'Dimensi Eksternal (Masyarakat)',
        skor_dimensi: eksternalTotal,
        bobot: 0.35,
        indicators: [
          { nama_indikator: 'Kualitas Pelayanan & Bebas Pungli', skor_indikator: eksternalTotal + 1.8 },
          { nama_indikator: 'Keterbukaan Informasi Publik', skor_indikator: eksternalTotal },
          { nama_indikator: 'Efektivitas Kanal Pengaduan WBS', skor_indikator: Math.max(0, eksternalTotal - 1.5) },
        ],
      },
      {
        kode_dimensi: 'eksper' as DimensionCode,
        nama_dimensi: 'Dimensi Eksper (Pakar/Auditor)',
        skor_dimensi: eksperTotal,
        bobot: 0.30,
        indicators: [
          { nama_indikator: 'Kesesuaian Regulasi & Tata Kelola', skor_indikator: eksperTotal },
          { nama_indikator: 'Mitigasi Risiko Suap/Gratifikasi', skor_indikator: eksperTotal + 1.0 },
          { nama_indikator: 'Independensi Pengawasan APIP', skor_indikator: Math.max(0, eksperTotal - 1.7) },
        ],
      },
      {
        kode_dimensi: 'faktor_koreksi' as DimensionCode,
        nama_dimensi: 'Faktor Koreksi (LHKPN/Dumas)',
        skor_dimensi: koreksiTotal,
        bobot: 1.00,
        indicators: [
          { nama_indikator: 'Kepatuhan Pelaporan LHKPN', skor_indikator: koreksiTotal * 0.4 },
          { nama_indikator: 'Tindak Lanjut Hasil Audit BPKP', skor_indikator: koreksiTotal * 0.6 },
        ],
      },
    ];
  }, [surveys]);

  const currentDimensions = displayCity ? displayCity.dimensions : provincialDimensions;
  const currentDimData = currentDimensions.find((d) => d.kode_dimensi === activeDimension) || currentDimensions[0];

  const currentScore = displayCity ? Number(displayCity.skor_total) : summary.rataRataSkor;
  const currentTier = getTierByScore(currentScore, thresholds);

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden select-none">
      {/* Header Panel */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-start justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="truncate">
              {displayCity ? `${displayCity.tipe_wilayah} Terpilih` : 'Provinsi Sumatera Selatan'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
            {displayCity ? displayCity.nama_wilayah : 'Rata-Rata Provinsi'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {displayCity
              ? `Data Survei Penilaian Integritas (Tahun ${displayCity.tahun})`
              : 'Akumulasi rata-rata skor 17 Kabupaten/Kota'}
          </p>
        </div>

        {activeCity && (
          <button
            onClick={resetToProvince}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition shrink-0"
            title="Kembali ke Ringkasan Provinsi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3.5 sm:p-4 space-y-4">
        {/* Semi-Circle Gauge Chart */}
        <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col items-center">
          <SemiCircleGauge score={currentScore} thresholds={thresholds} />
        </div>

        {/* Action Button for Pegawai / Admin */}
        {(userRole === 'pegawai' || userRole === 'admin') && displayCity && (
          <button
            onClick={() => openPegawaiInputForCity(displayCity)}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Edit3 className="w-4 h-4" />
            <span>Input / Perbarui Data Skor {displayCity.nama_wilayah}</span>
          </button>
        )}

        {/* Dimension Breakdown Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Rincian 4 Dimensi SPI</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              Bobot Terstandar
            </span>
          </div>

          {/* 4 Interactive Dimension Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
            {(['internal', 'eksternal', 'eksper', 'faktor_koreksi'] as DimensionCode[]).map((dimKey) => {
              const isActive = activeDimension === dimKey;
              const labels: Record<DimensionCode, string> = {
                internal: 'Internal',
                eksternal: 'Eksternal',
                eksper: 'Eksper',
                faktor_koreksi: 'Koreksi',
              };

              return (
                <button
                  key={dimKey}
                  onClick={() => setActiveDimension(dimKey)}
                  className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition text-center truncate ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labels[dimKey]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Dimension Details & Indicator Progress Bars */}
        {currentDimData && (
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-black text-slate-800">
                  {currentDimData.nama_dimensi}
                </h4>
                <span className="text-[10px] font-medium text-slate-400">
                  Bobot Formula: {(currentDimData.bobot * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black font-mono text-slate-900">
                  {formatScore(currentDimData.skor_dimensi)}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">/100</span>
              </div>
            </div>

            {/* Child Indicators List */}
            <div className="space-y-2.5">
              {currentDimData.indicators.map((ind, idx) => {
                const score = Number(ind.skor_indikator);
                const indTier = getTierByScore(score, thresholds);
                const pct = Math.min(100, Math.max(0, score));

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700 truncate pr-2">
                        {ind.nama_indikator}
                      </span>
                      <span className="font-bold font-mono text-slate-900 shrink-0">
                        {formatScore(score)}
                      </span>
                    </div>

                    {/* Horizontal Progress Track */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: indTier.hex,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
