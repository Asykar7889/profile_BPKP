'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSpiDashboard } from '@/context/SpiDashboardContext';
import { CitySurvey, SurveyDimension, SurveyIndicator } from '@/types/spi';
import {
  calculateTotalSpiScore,
  getTierByScore,
  roundTo2Decimals,
  formatScore,
} from '@/lib/scoringEngine';
import {
  X,
  Calculator,
  Save,
  CheckCircle2,
  Building2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
} from 'lucide-react';

export default function PegawaiInputModal() {
  const {
    surveys,
    thresholds,
    isPegawaiInputOpen,
    setIsPegawaiInputOpen,
    editingCityForInput,
    saveAndPublishSurvey,
    currentUser,
  } = useSpiDashboard();

  // Selected city
  const [selectedKode, setSelectedKode] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [jumlahResponden, setJumlahResponden] = useState<number>(150);

  // Dimension indicator values state
  const [indicatorValues, setIndicatorValues] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Initialize form when opened or city changes
  useEffect(() => {
    if (!isPegawaiInputOpen) return;

    const baseCity =
      editingCityForInput ||
      surveys.find((s) => s.kode_wilayah === selectedKode) ||
      surveys[0];

    if (baseCity) {
      setSelectedKode(baseCity.kode_wilayah);
      setSelectedYear(baseCity.tahun);
      setJumlahResponden(baseCity.jumlah_responden || 150);

      const initialVals: Record<string, number> = {};
      baseCity.dimensions.forEach((dim) => {
        dim.indicators.forEach((ind) => {
          initialVals[ind.nama_indikator] = ind.skor_indikator;
        });
      });
      setIndicatorValues(initialVals);
    }
  }, [isPegawaiInputOpen, editingCityForInput, surveys]);

  // When city dropdown changes
  const handleCityChange = (kode: string) => {
    setSelectedKode(kode);
    const targetCity = surveys.find((s) => s.kode_wilayah === kode);
    if (targetCity) {
      setSelectedYear(targetCity.tahun);
      setJumlahResponden(targetCity.jumlah_responden || 150);
      const initialVals: Record<string, number> = {};
      targetCity.dimensions.forEach((dim) => {
        dim.indicators.forEach((ind) => {
          initialVals[ind.nama_indikator] = ind.skor_indikator;
        });
      });
      setIndicatorValues(initialVals);
    }
  };

  const handleIndicatorChange = (name: string, val: number, isKoreksi: boolean = false) => {
    const maxLimit = isKoreksi ? 30 : 100;
    const clamped = Math.max(0, Math.min(maxLimit, isNaN(val) ? 0 : roundTo2Decimals(val)));
    setIndicatorValues((prev) => ({
      ...prev,
      [name]: clamped,
    }));
  };

  // Active city object reference
  const currentCity = useMemo(() => {
    return surveys.find((s) => s.kode_wilayah === selectedKode) || surveys[0];
  }, [surveys, selectedKode]);

  // Build temporary dimensions & compute live score
  const { updatedDimensions, liveScore, liveTier } = useMemo(() => {
    if (!currentCity) {
      return {
        updatedDimensions: [],
        liveScore: 0,
        liveTier: getTierByScore(0, thresholds),
      };
    }

    const newDims: SurveyDimension[] = currentCity.dimensions.map((dim) => {
      const newInds: SurveyIndicator[] = dim.indicators.map((ind) => ({
        ...ind,
        skor_indikator:
          indicatorValues[ind.nama_indikator] !== undefined
            ? indicatorValues[ind.nama_indikator]
            : ind.skor_indikator,
      }));

      // Average score of indicators in this dimension
      const totalScore = newInds.reduce((acc, curr) => acc + curr.skor_indikator, 0);
      const avgScore = newInds.length > 0 ? roundTo2Decimals(totalScore / newInds.length) : 0;

      return {
        ...dim,
        skor_dimensi: avgScore,
        indicators: newInds,
      };
    });

    const score = calculateTotalSpiScore(newDims);
    const tier = getTierByScore(score, thresholds);

    return {
      updatedDimensions: newDims,
      liveScore: score,
      liveTier: tier,
    };
  }, [currentCity, indicatorValues, thresholds]);

  if (!isPegawaiInputOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCity) return;

    setIsSubmitting(true);
    const updatedSurvey: CitySurvey = {
      ...currentCity,
      tahun: selectedYear,
      jumlah_responden: jumlahResponden,
      skor_total: liveScore,
      kategori_risiko: liveTier.label,
      dimensions: updatedDimensions,
      updated_by: currentUser?.full_name || 'Pegawai SPI',
      updated_at: new Date().toISOString(),
    };

    const ok = await saveAndPublishSurvey(updatedSurvey);
    setIsSubmitting(false);

    if (ok) {
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-5 sm:p-6 flex items-center justify-between relative flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Portal Input Survei Penilaian Integritas (SPI)
              </h3>
              <p className="text-xs text-blue-200">
                Pembaruan Skor Indikator & Publikasi Otomatis ke Peta Spasial Sumsel
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPegawaiInputOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        {successToast && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Skor berhasil disimpan dan langsung dipublikasikan ke Peta Utama!</span>
          </div>
        )}

        {/* Content Body: Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Top Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Wilayah Evaluasi (17 Kab/Kota)
                </label>
                <div className="relative">
                  <select
                    value={selectedKode}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  >
                    {surveys.map((c) => (
                      <option key={c.kode_wilayah} value={c.kode_wilayah}>
                        {c.nama_wilayah} ({c.tipe_wilayah})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Tahun Anggaran
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full text-xs font-bold px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                >
                  <option value={2026}>2026 (Tahun Berjalan)</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Jumlah Sampel Responden
                </label>
                <input
                  type="number"
                  value={jumlahResponden}
                  onChange={(e) => setJumlahResponden(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-bold px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>
            </div>

            {/* LIVE SCORE & TIER PREVIEW CARD */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-blue-300 font-bold uppercase tracking-wider">
                  <Calculator className="w-4 h-4 text-blue-400" />
                  <span>Kalkulator Live Skor Otomatis</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Formula: (Internal × 35%) + (Eksternal × 35%) + (Eksper × 30%) − Faktor Koreksi
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-3xl font-black tracking-tight" style={{ color: liveTier.hex }}>
                    {formatScore(liveScore)}
                  </div>
                  <span className="text-[10px] text-slate-400 block">Skor Total SPI</span>
                </div>

                <div
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border shadow-sm"
                  style={{
                    backgroundColor: `${liveTier.hex}22`,
                    color: liveTier.hex,
                    borderColor: liveTier.hex,
                  }}
                >
                  {liveTier.label}
                </div>
              </div>
            </div>

            {/* 4 DIMENSIONS INPUT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {updatedDimensions.map((dim) => {
                const isKoreksi = dim.kode_dimensi === 'faktor_koreksi';

                return (
                  <div
                    key={dim.id}
                    className={`p-4 rounded-2xl border ${
                      isKoreksi
                        ? 'bg-rose-50/50 border-rose-200'
                        : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-black text-slate-800 block">
                          {dim.nama_dimensi}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {isKoreksi
                            ? 'Pengurang Langsung Skor Total'
                            : `Bobot: ${(dim.bobot * 100).toFixed(0)}%`}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                          isKoreksi
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        Sub-skor: {formatScore(dim.skor_dimensi)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {dim.indicators.map((ind) => {
                        const val =
                          indicatorValues[ind.nama_indikator] !== undefined
                            ? indicatorValues[ind.nama_indikator]
                            : ind.skor_indikator;

                        return (
                          <div key={ind.id} className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-700 font-medium line-clamp-1 pr-2">
                                {ind.nama_indikator}
                              </span>
                              <span className="font-bold text-slate-900 w-14 text-right font-mono">
                                {val.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={0}
                                max={isKoreksi ? 30 : 100}
                                step={0.1}
                                value={val}
                                onChange={(e) =>
                                  handleIndicatorChange(ind.nama_indikator, parseFloat(e.target.value), isKoreksi)
                                }
                                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
                                  isKoreksi ? 'accent-rose-600 bg-rose-200' : 'accent-blue-600 bg-slate-200'
                                }`}
                              />
                              <input
                                type="number"
                                min={0}
                                max={isKoreksi ? 30 : 100}
                                step={0.01}
                                value={val}
                                onChange={(e) =>
                                  handleIndicatorChange(ind.nama_indikator, parseFloat(e.target.value), isKoreksi)
                                }
                                className="w-16 text-center text-xs font-bold font-mono py-1 px-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                Dicatat atas nama: <strong>{currentUser?.full_name || 'Pegawai SPI'}</strong> (Audit Log RLS)
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsPegawaiInputOpen(false)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan & Publikasikan ke Peta'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
