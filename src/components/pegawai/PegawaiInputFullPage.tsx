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
import { getContrastTextColor } from '@/lib/riskThresholds';
import {
  Calculator,
  Save,
  CheckCircle2,
  Building2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export default function PegawaiInputFullPage() {
  const {
    surveys,
    thresholds,
    saveAndPublishSurvey,
    currentUser,
    selectedYear: globalYear,
  } = useSpiDashboard();

  // Selected city & basic metadata
  const [selectedKode, setSelectedKode] = useState<string>(surveys[0]?.kode_wilayah || '1671');
  const [selectedYear, setSelectedYear] = useState<number>(globalYear || 2026);
  const [jumlahResponden, setJumlahResponden] = useState<number>(150);

  // Dimension indicator values state
  const [indicatorValues, setIndicatorValues] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Active city object reference
  const currentCity = useMemo(() => {
    return surveys.find((s) => s.kode_wilayah === selectedKode) || surveys[0];
  }, [surveys, selectedKode]);

  // Initialize or re-populate form whenever currentCity changes
  useEffect(() => {
    if (currentCity) {
      setSelectedYear(currentCity.tahun || 2026);
      setJumlahResponden(currentCity.jumlah_responden || 150);

      const initialVals: Record<string, number> = {};
      currentCity.dimensions?.forEach((dim) => {
        dim.indicators?.forEach((ind) => {
          initialVals[ind.nama_indikator] = ind.skor_indikator;
        });
      });
      setIndicatorValues(initialVals);
      setValidationError(null);
    }
  }, [currentCity]);

  // When city selector changes
  const handleCityChange = (kode: string) => {
    setSelectedKode(kode);
    const targetCity = surveys.find((s) => s.kode_wilayah === kode);
    if (targetCity) {
      setSelectedYear(targetCity.tahun || 2026);
      setJumlahResponden(targetCity.jumlah_responden || 150);
      const initialVals: Record<string, number> = {};
      targetCity.dimensions?.forEach((dim) => {
        dim.indicators?.forEach((ind) => {
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

  // Build updated dimensions & compute live score
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

  const liveContrastColor = useMemo(() => {
    return getContrastTextColor(liveTier.hex);
  }, [liveTier.hex]);

  // Delta comparison with saved city score
  const scoreDelta = useMemo(() => {
    if (!currentCity) return 0;
    return roundTo2Decimals(liveScore - Number(currentCity.skor_total));
  }, [liveScore, currentCity]);

  // Reset form to active city's saved state
  const handleReset = () => {
    if (currentCity) {
      const initialVals: Record<string, number> = {};
      currentCity.dimensions?.forEach((dim) => {
        dim.indicators?.forEach((ind) => {
          initialVals[ind.nama_indikator] = ind.skor_indikator;
        });
      });
      setIndicatorValues(initialVals);
      setValidationError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCity) return;

    if (isNaN(liveScore) || liveScore < 0 || liveScore > 100) {
      setValidationError('Skor Total SPI harus berada di antara 0.00 hingga 100.00.');
      return;
    }
    if (isNaN(jumlahResponden) || jumlahResponden <= 0) {
      setValidationError('Jumlah responden harus berupa bilangan positif.');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    const updatedSurvey: CitySurvey = {
      ...currentCity,
      tahun: selectedYear,
      jumlah_responden: Math.round(jumlahResponden),
      skor_total: liveScore,
      kategori_risiko: liveTier.label,
      dimensions: updatedDimensions,
      updated_by: currentUser?.full_name || 'Pegawai SPI',
      updated_at: new Date().toISOString(),
    };

    const note = `Pembaruan data indikator SPI ${currentCity.nama_wilayah} oleh ${currentUser?.full_name || 'Pegawai SPI'}.`;
    const ok = await saveAndPublishSurvey(updatedSurvey, currentUser?.full_name || 'Pegawai SPI', note);
    setIsSubmitting(false);

    if (ok) {
      setSuccessToast(`Survei SPI ${currentCity.nama_wilayah} berhasil disimpan dan dipublikasikan ke Peta Utama!`);
      setTimeout(() => {
        setSuccessToast(null);
      }, 3500);
    } else {
      setValidationError('Gagal menyimpan survei ke server Supabase. Silakan coba kembali.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Input Survei Penilaian Integritas (SPI)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700">
                Pegawai Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pembaruan Skor Indikator & Publikasi Otomatis ke Peta Spasial Sumatera Selatan
            </p>
          </div>
        </div>

        {/* Global Year Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-slate-500 text-[11px] font-medium">Tahun Evaluasi:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value={2026}>2026 (Aktif)</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button
            onClick={() => setValidationError(null)}
            className="text-rose-700 hover:text-rose-900 text-xs"
          >
            Tutup
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Region & Metadata Selector Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                Wilayah Evaluasi (17 Kab/Kota)
              </label>
              <select
                value={selectedKode}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full text-xs font-bold px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 cursor-pointer"
              >
                {surveys.map((c) => (
                  <option key={c.kode_wilayah} value={c.kode_wilayah}>
                    {c.nama_wilayah} ({c.tipe_wilayah}) - Kode: {c.kode_wilayah}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                Tahun Anggaran Survei
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full text-xs font-bold px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 cursor-pointer"
              >
                <option value={2026}>2026 (Tahun Berjalan)</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                Jumlah Sampel Responden
              </label>
              <input
                type="number"
                min={1}
                value={jumlahResponden}
                onChange={(e) => setJumlahResponden(Math.max(1, Number(e.target.value)))}
                className="w-full text-xs font-bold px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Live Score & Dynamic Risk Badge Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-blue-400" />
                <span>Kalkulator Live Skor Otomatis</span>
              </div>
              <p className="text-xs text-slate-400">
                Formula: (Internal × 35%) + (Eksternal × 35%) + (Eksper × 30%) − Faktor Koreksi
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div
                  className="text-4xl font-black font-mono tracking-tight"
                  style={{ color: liveTier.hex }}
                >
                  {formatScore(liveScore)}
                </div>
                <div className="flex items-center justify-end gap-1.5 text-[11px] mt-0.5">
                  <span className="text-slate-400">Tersimpan:</span>
                  <span className="font-mono text-slate-300">
                    {formatScore(Number(currentCity?.skor_total || 0))}
                  </span>
                  {scoreDelta !== 0 && (
                    <span
                      className={`flex items-center font-bold font-mono text-[10px] ${
                        scoreDelta > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {scoreDelta > 0 ? (
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                      ) : null}
                      {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                    </span>
                  )}
                </div>
              </div>

              <div
                className="px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm border"
                style={{
                  backgroundColor: liveTier.hex,
                  color: liveContrastColor,
                  borderColor: liveTier.hex,
                }}
              >
                {liveTier.label}
              </div>
            </div>
          </div>
        </div>

        {/* 4 DIMENSIONS & INDICATOR INPUT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {updatedDimensions.map((dim) => {
            const isKoreksi = dim.kode_dimensi === 'faktor_koreksi';

            return (
              <div
                key={dim.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isKoreksi
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 block">
                      {dim.nama_dimensi}
                    </h3>
                    <span className="text-[10px] text-slate-500">
                      {isKoreksi
                        ? 'Pengurang Langsung Skor Total'
                        : `Bobot: ${(dim.bobot * 100).toFixed(0)}%`}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                      isKoreksi
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}
                  >
                    Sub-skor: {formatScore(dim.skor_dimensi)}
                  </span>
                </div>

                <div className="space-y-4">
                  {dim.indicators.map((ind) => {
                    const val =
                      indicatorValues[ind.nama_indikator] !== undefined
                        ? indicatorValues[ind.nama_indikator]
                        : ind.skor_indikator;

                    return (
                      <div key={ind.id} className="space-y-1.5">
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
                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
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
                            className="w-18 text-center text-xs font-bold font-mono py-1 px-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
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

        {/* Action Buttons & Footer */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Tercatat atas nama: <strong>{currentUser?.full_name || 'Pegawai SPI'}</strong> (Audit Trail Supabase)
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Indikator</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan & Publikasikan ke Peta'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
