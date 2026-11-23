'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSpiDashboard } from '@/context/SpiDashboardContext';
import { CitySurvey, SurveyDimension, RiskTierKey } from '@/types/spi';
import {
  calculateTotalSpiScore,
  roundTo2Decimals,
  formatScore,
  getTierByScore,
} from '@/lib/scoringEngine';
import { getRiskTier, getContrastTextColor } from '@/lib/riskThresholds';
import {
  Building2,
  Search,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FilePenLine,
  Calculator,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function AdminCityStatsEditor() {
  const {
    surveys,
    thresholds,
    saveAndPublishSurvey,
    currentUser,
    selectedYear,
    setSelectedYear,
  } = useSpiDashboard();

  // Search & Filter state for left sidebar
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<RiskTierKey | 'ALL'>('ALL');
  const [selectedCityCode, setSelectedCityCode] = useState<string>(
    surveys[0]?.kode_wilayah || '1671'
  );

  // Form field state
  const [formData, setFormData] = useState<{
    skorTotal: number;
    dimInternal: number;
    dimEksternal: number;
    dimEksper: number;
    dimKoreksi: number;
    jumlahResponden: number;
    rekomendasiUtama: string;
    catatanPerubahan: string;
  }>({
    skorTotal: 60,
    dimInternal: 60,
    dimEksternal: 60,
    dimEksper: 60,
    dimKoreksi: 0,
    jumlahResponden: 150,
    rekomendasiUtama: '',
    catatanPerubahan: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Find currently active city from surveys
  const activeCity = useMemo(() => {
    return surveys.find((s) => s.kode_wilayah === selectedCityCode) || surveys[0];
  }, [surveys, selectedCityCode]);

  // Load active city's values into form
  useEffect(() => {
    if (activeCity) {
      const internal =
        activeCity.dimensions?.find((d) => d.kode_dimensi === 'internal')?.skor_dimensi ??
        activeCity.skor_total;
      const eksternal =
        activeCity.dimensions?.find((d) => d.kode_dimensi === 'eksternal')?.skor_dimensi ??
        activeCity.skor_total;
      const eksper =
        activeCity.dimensions?.find((d) => d.kode_dimensi === 'eksper')?.skor_dimensi ??
        activeCity.skor_total;
      const koreksi =
        activeCity.dimensions?.find((d) => d.kode_dimensi === 'faktor_koreksi')?.skor_dimensi ?? 0;

      setFormData({
        skorTotal: Number(activeCity.skor_total),
        dimInternal: Number(internal),
        dimEksternal: Number(eksternal),
        dimEksper: Number(eksper),
        dimKoreksi: Number(koreksi),
        jumlahResponden: Number(activeCity.jumlah_responden || 150),
        rekomendasiUtama:
          activeCity.rekomendasi_utama ||
          'Tingkatkan pengawasan dan kepatuhan sistem integritas.',
        catatanPerubahan: '',
      });
      setValidationError(null);
    }
  }, [activeCity]);

  // Filtered list of 17 regions
  const filteredCities = useMemo(() => {
    return surveys.filter((city) => {
      const matchSearch =
        city.nama_wilayah.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.kode_wilayah.includes(searchQuery);

      if (!matchSearch) return false;
      if (selectedTierFilter === 'ALL') return true;

      const tier = getRiskTier(Number(city.skor_total), thresholds);
      return tier.tier_key === selectedTierFilter;
    });
  }, [surveys, searchQuery, selectedTierFilter, thresholds]);

  // Calculate live formula score from current dimensions
  const calculatedFormulaScore = useMemo(() => {
    return calculateTotalSpiScore(
      formData.dimInternal,
      formData.dimEksternal,
      formData.dimEksper,
      formData.dimKoreksi
    );
  }, [formData.dimInternal, formData.dimEksternal, formData.dimEksper, formData.dimKoreksi]);

  // Live dynamic risk tier for current form score
  const liveTier = useMemo(() => {
    return getTierByScore(formData.skorTotal, thresholds);
  }, [formData.skorTotal, thresholds]);

  const liveContrastColor = useMemo(() => {
    return getContrastTextColor(liveTier.hex);
  }, [liveTier.hex]);

  // Delta comparison with saved city score
  const scoreDelta = useMemo(() => {
    if (!activeCity) return 0;
    return roundTo2Decimals(formData.skorTotal - Number(activeCity.skor_total));
  }, [formData.skorTotal, activeCity]);

  // Apply auto-calculated score to form
  const handleApplyCalculated = () => {
    setFormData((prev) => ({
      ...prev,
      skorTotal: calculatedFormulaScore,
    }));
    setValidationError(null);
  };

  // Reset current form to saved city state
  const handleResetForm = () => {
    if (activeCity) {
      const internal =
        activeCity.dimensions?.find((d) => d.kode_dimensi === 'internal')?.skor_dimensi ??
        activeCity.skor_total;
      const eksternal =
        activeCity.dimensions?.find((d) => d.kode_dimensi === 'eksternal')?.skor_dimensi ??
        activeCity.skor_total;
      const eksper =
        activeCity.dimensions?.find((d) => d.kode_dimensi === 'eksper')?.skor_dimensi ??
        activeCity.skor_total;
      const koreksi =
        activeCity.dimensions?.find((d) => d.kode_dimensi === 'faktor_koreksi')?.skor_dimensi ?? 0;

      setFormData({
        skorTotal: Number(activeCity.skor_total),
        dimInternal: Number(internal),
        dimEksternal: Number(eksternal),
        dimEksper: Number(eksper),
        dimKoreksi: Number(koreksi),
        jumlahResponden: Number(activeCity.jumlah_responden || 150),
        rekomendasiUtama:
          activeCity.rekomendasi_utama ||
          'Tingkatkan pengawasan dan kepatuhan sistem integritas.',
        catatanPerubahan: '',
      });
      setValidationError(null);
    }
  };

  // Submit and save updated survey
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCity) return;

    // Strict numerical bounds validation
    if (isNaN(formData.skorTotal) || formData.skorTotal < 0 || formData.skorTotal > 100) {
      setValidationError('Skor Total SPI harus berada di antara 0.00 hingga 100.00.');
      return;
    }
    if (formData.dimInternal < 0 || formData.dimInternal > 100) {
      setValidationError('Skor Dimensi Internal harus berada di antara 0 hingga 100.');
      return;
    }
    if (formData.dimEksternal < 0 || formData.dimEksternal > 100) {
      setValidationError('Skor Dimensi Eksternal harus berada di antara 0 hingga 100.');
      return;
    }
    if (formData.dimEksper < 0 || formData.dimEksper > 100) {
      setValidationError('Skor Dimensi Eksper harus berada di antara 0 hingga 100.');
      return;
    }
    if (formData.dimKoreksi < 0 || formData.dimKoreksi > 30) {
      setValidationError('Faktor Koreksi harus berada di antara 0 hingga 30.00.');
      return;
    }
    if (isNaN(formData.jumlahResponden) || formData.jumlahResponden <= 0) {
      setValidationError('Jumlah responden harus berupa bilangan bulat positif.');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    // Build updated dimensions
    const baseDimensions: SurveyDimension[] = activeCity.dimensions && activeCity.dimensions.length > 0
      ? activeCity.dimensions
      : [
          {
            id: `dim-internal-${activeCity.kode_wilayah}`,
            kode_dimensi: 'internal',
            nama_dimensi: 'Dimensi Internal (Pegawai/ASN)',
            bobot: 0.35,
            skor_dimensi: formData.dimInternal,
            indicators: [],
          },
          {
            id: `dim-eksternal-${activeCity.kode_wilayah}`,
            kode_dimensi: 'eksternal',
            nama_dimensi: 'Dimensi Eksternal (Masyarakat)',
            bobot: 0.35,
            skor_dimensi: formData.dimEksternal,
            indicators: [],
          },
          {
            id: `dim-eksper-${activeCity.kode_wilayah}`,
            kode_dimensi: 'eksper',
            nama_dimensi: 'Dimensi Eksper / Ahli',
            bobot: 0.30,
            skor_dimensi: formData.dimEksper,
            indicators: [],
          },
          {
            id: `dim-koreksi-${activeCity.kode_wilayah}`,
            kode_dimensi: 'faktor_koreksi',
            nama_dimensi: 'Faktor Koreksi',
            bobot: 0,
            skor_dimensi: formData.dimKoreksi,
            indicators: [],
          },
        ];

    const updatedDimensions: SurveyDimension[] = baseDimensions.map((dim) => {
      let score = dim.skor_dimensi;
      if (dim.kode_dimensi === 'internal') score = formData.dimInternal;
      if (dim.kode_dimensi === 'eksternal') score = formData.dimEksternal;
      if (dim.kode_dimensi === 'eksper') score = formData.dimEksper;
      if (dim.kode_dimensi === 'faktor_koreksi') score = formData.dimKoreksi;

      return {
        ...dim,
        skor_dimensi: score,
        indicators: dim.indicators?.map((ind) => ({
          ...ind,
          skor_indikator: score,
        })) || [],
      };
    });

    const updatedCity: CitySurvey = {
      ...activeCity,
      skor_total: roundTo2Decimals(formData.skorTotal),
      kategori_risiko: liveTier.label,
      jumlah_responden: Math.round(formData.jumlahResponden),
      rekomendasi_utama: formData.rekomendasiUtama.trim() || 'Tingkatkan pengawasan dan kepatuhan sistem integritas.',
      dimensions: updatedDimensions,
      updated_by: currentUser?.full_name || 'Administrator BPKP',
      updated_at: new Date().toISOString(),
    };

    const notes = formData.catatanPerubahan.trim()
      ? formData.catatanPerubahan.trim()
      : `Pembaruan statistik wilayah ${activeCity.nama_wilayah} oleh Administrator.`;

    const ok = await saveAndPublishSurvey(updatedCity, currentUser?.full_name || 'Administrator BPKP', notes);
    setIsSubmitting(false);

    if (ok) {
      setSuccessToast(`Statistik ${activeCity.nama_wilayah} berhasil disimpan dan dipublikasikan!`);
      setTimeout(() => {
        setSuccessToast(null);
      }, 3500);
    } else {
      setValidationError('Gagal menyimpan perubahan ke server Supabase. Silakan coba kembali.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top Banner & Context Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <FilePenLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Ubah Statistik Wilayah
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-700">
                  Admin Control
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola dan perbarui skor indikator SPI serta rekomendasi untuk 17 Kabupaten/Kota Sumatera Selatan
              </p>
            </div>
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl shrink-0">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-600">Tahun Survei:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-xs font-black text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value={2026}>2026 (Aktif)</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successToast && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-md shadow-emerald-500/20 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Workspace: Left Regions List + Right Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ======================================================== */}
        {/* KOLOM KIRI (Col 1-4): Daftar 17 Wilayah & Search Filter */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Daftar Wilayah ({filteredCities.length}/17)</span>
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Kabupaten / Kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Tier Filter Pills */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedTierFilter('ALL')}
              className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition ${
                selectedTierFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            {thresholds.map((tier) => (
              <button
                key={tier.tier_key}
                onClick={() => setSelectedTierFilter(tier.tier_key)}
                className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition ${
                  selectedTierFilter === tier.tier_key
                    ? 'ring-2 ring-slate-900 shadow-2xs'
                    : 'opacity-85 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: `${tier.color_hex}22`,
                  color: tier.color_hex,
                }}
              >
                {tier.label}
              </button>
            ))}
          </div>

          {/* Scrollable Regions List */}
          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredCities.map((city) => {
              const score = Number(city.skor_total);
              const tier = getRiskTier(score, thresholds);
              const contrastColor = getContrastTextColor(tier.color_hex);
              const isSelected = city.kode_wilayah === selectedCityCode;

              return (
                <button
                  key={city.kode_wilayah}
                  onClick={() => {
                    setSelectedCityCode(city.kode_wilayah);
                    setValidationError(null);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-slate-800 block truncate">
                      {city.nama_wilayah}
                    </span>
                    <span className="text-[10.5px] text-slate-400 font-mono">
                      Kode: {city.kode_wilayah} • {city.tipe_wilayah}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-black text-xs text-slate-800">
                      {formatScore(score)}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0"
                      style={{
                        backgroundColor: tier.color_hex,
                        color: contrastColor,
                      }}
                    >
                      {tier.label}
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredCities.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                Tidak ada wilayah yang cocok dengan pencarian.
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* KOLOM KANAN (Col 5-12): Formulir Pengeditan Statistik    */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
          {activeCity ? (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Header Target Wilayah + Live Preview Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                      {activeCity.kode_wilayah}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      {activeCity.nama_wilayah}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tipe Wilayah: {activeCity.tipe_wilayah} • Terakhir diubah: {activeCity.updated_at ? new Date(activeCity.updated_at).toLocaleDateString('id-ID') : 'Belum pernah'}
                  </p>
                </div>

                {/* Live Dynamic Score & Tier Preview Badge */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Live Preview
                    </span>
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                        {formatScore(formData.skorTotal)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">/100</span>
                    </div>
                  </div>

                  <span
                    className="px-3 py-1.5 rounded-xl text-xs font-black uppercase shadow-xs shrink-0"
                    style={{
                      backgroundColor: liveTier.hex,
                      color: liveContrastColor,
                    }}
                  >
                    {liveTier.label}
                  </span>

                  {scoreDelta !== 0 && (
                    <div
                      className={`text-[11px] font-bold font-mono px-2 py-1 rounded-lg flex items-center gap-0.5 ${
                        scoreDelta > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                      title="Perubahan dibanding nilai tersimpan saat ini"
                    >
                      {scoreDelta > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{scoreDelta > 0 ? `+${scoreDelta.toFixed(2)}` : scoreDelta.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Validation Alert */}
              {validationError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-2xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Input Group 1: Skor Total & Responden */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Skor Total SPI */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Skor Total SPI (0 - 100) *</span>
                    <span className="text-[10.5px] font-semibold text-slate-400">
                      Auto-sync atau Manual
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.skorTotal}
                    onChange={(e) => {
                      setValidationError(null);
                      setFormData((prev) => ({
                        ...prev,
                        skorTotal: parseFloat(e.target.value) || 0,
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    Nilai akhir yang ditampilkan pada Peta Geospasial dan Tabel Peringkat SPI.
                  </p>
                </div>

                {/* 2. Jumlah Responden */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Jumlah Responden (Orang) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.jumlahResponden}
                    onChange={(e) => {
                      setValidationError(null);
                      setFormData((prev) => ({
                        ...prev,
                        jumlahResponden: parseInt(e.target.value, 10) || 0,
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    Total sampel responden (ASN internal, masyarakat eksternal, dan penilai ahli).
                  </p>
                </div>
              </div>

              {/* Section: 3 Dimensi Utama & Faktor Koreksi */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Rincian Indikator 3 Dimensi & Koreksi</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Formula SPI: (Internal × 35%) + (Eksternal × 35%) + (Eksper × 30%) - Koreksi = {formatScore(calculatedFormulaScore)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyCalculated}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition shrink-0"
                    title="Gunakan skor yang dihitung dari 3 dimensi ke Skor Total SPI"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sinkronkan Nilai ({formatScore(calculatedFormulaScore)})</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Internal (35%) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Internal (35%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.dimInternal}
                      onChange={(e) => {
                        setValidationError(null);
                        setFormData((prev) => ({
                          ...prev,
                          dimInternal: parseFloat(e.target.value) || 0,
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition"
                    />
                  </div>

                  {/* Eksternal (35%) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Eksternal (35%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.dimEksternal}
                      onChange={(e) => {
                        setValidationError(null);
                        setFormData((prev) => ({
                          ...prev,
                          dimEksternal: parseFloat(e.target.value) || 0,
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition"
                    />
                  </div>

                  {/* Eksper / Ahli (30%) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Eksper / Ahli (30%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.dimEksper}
                      onChange={(e) => {
                        setValidationError(null);
                        setFormData((prev) => ({
                          ...prev,
                          dimEksper: parseFloat(e.target.value) || 0,
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition"
                    />
                  </div>

                  {/* Faktor Koreksi */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Faktor Koreksi (0-30)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="30"
                      value={formData.dimKoreksi}
                      onChange={(e) => {
                        setValidationError(null);
                        setFormData((prev) => ({
                          ...prev,
                          dimKoreksi: parseFloat(e.target.value) || 0,
                        }));
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Rekomendasi Utama Tindak Lanjut */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Rekomendasi Utama Tindak Lanjut BPKP *
                </label>
                <textarea
                  rows={2}
                  value={formData.rekomendasiUtama}
                  onChange={(e) => {
                    setValidationError(null);
                    setFormData((prev) => ({
                      ...prev,
                      rekomendasiUtama: e.target.value,
                    }));
                  }}
                  placeholder="Contoh: Perketat audit pengadaan barang dan jasa, optimalkan whistleblowing system..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition resize-y"
                  required
                />
              </div>

              {/* Catatan Perubahan (Audit Trail Log) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Catatan Perubahan (Opsional untuk Audit Log)</span>
                  <span className="text-[10.5px] font-semibold text-slate-400">
                    Disimpan di tabel input_history_logs
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.catatanPerubahan}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      catatanPerubahan: e.target.value,
                    }));
                  }}
                  placeholder="Contoh: Penyesuaian nilai pasca-verifikasi dokumen PBJ triwulan III..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Form</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan ke Database...' : 'Simpan Perubahan Wilayah'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <Building2 className="w-12 h-12 mx-auto mb-2 stroke-1" />
              <p className="text-xs font-semibold">Pilih salah satu wilayah di sebelah kiri untuk mulai mengedit.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
