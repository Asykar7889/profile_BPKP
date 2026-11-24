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
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface RegionalStatsEditorProps {
  mode?: 'admin' | 'pegawai';
}

export default function RegionalStatsEditor({ mode }: RegionalStatsEditorProps) {
  const {
    surveys,
    thresholds,
    saveAndPublishSurvey,
    currentUser,
    userRole,
    selectedYear,
    setSelectedYear,
  } = useSpiDashboard();

  const activeRole = mode || (userRole === 'admin' ? 'admin' : 'pegawai');
  const isAdmin = activeRole === 'admin';

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
          activeCity.recommendation ||
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
          activeCity.recommendation ||
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

    const actorName = currentUser?.full_name || (isAdmin ? 'Administrator BPKP' : 'Pegawai SPI BPKP');

    const updatedCity: CitySurvey = {
      ...activeCity,
      skor_total: roundTo2Decimals(formData.skorTotal),
      kategori_risiko: liveTier.label,
      jumlah_responden: Math.round(formData.jumlahResponden),
      rekomendasi_utama: formData.rekomendasiUtama.trim() || 'Tingkatkan pengawasan dan kepatuhan sistem integritas.',
      dimensions: updatedDimensions,
      updated_by: actorName,
      updated_at: new Date().toISOString(),
    };

    const notes = formData.catatanPerubahan.trim()
      ? formData.catatanPerubahan.trim()
      : `Pembaruan statistik wilayah ${activeCity.nama_wilayah} oleh ${actorName}.`;

    const ok = await saveAndPublishSurvey(updatedCity, actorName, notes);
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
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isAdmin ? 'bg-indigo-50 border border-indigo-200 text-indigo-600' : 'bg-blue-50 border border-blue-200 text-blue-600'
            }`}>
              <FilePenLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Ubah Statistik Wilayah
                </h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {isAdmin ? 'Admin Portal' : 'Pegawai Portal'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAdmin
                  ? 'Pembaruan Langsung 17 Kabupaten/Kota Sumatera Selatan (Audit Trail & Rollback Tersedia)'
                  : 'Pembaruan Statistik 17 Kabupaten/Kota Sumatera Selatan (Tercatat dalam Audit Log BPKP)'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Year Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700">
          <Calendar className={`w-4 h-4 ${isAdmin ? 'text-indigo-600' : 'text-blue-600'}`} />
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

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: 17 Regions List & Search Filter (lg:col-span-4 xl:col-span-4) */}
        <div className="lg:col-span-4 xl:col-span-4 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Pilih Wilayah (17 Kab/Kota)
              </h2>
              <p className="text-[10px] text-slate-400">Pilih daerah untuk mengedit metrik</p>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredCities.length} Daerah
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau kode wilayah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-slate-800 font-medium placeholder-slate-400 transition"
            />
          </div>

          {/* Risk Tier Filter Pills */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedTierFilter('ALL')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                selectedTierFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            {thresholds.map((t) => {
              const isSelected = selectedTierFilter === t.tier_key;
              return (
                <button
                  key={t.tier_key}
                  onClick={() => setSelectedTierFilter(t.tier_key)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition border ${
                    isSelected ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? t.color_hex : `${t.color_hex}15`,
                    color: isSelected ? getContrastTextColor(t.color_hex) : t.color_hex,
                    borderColor: isSelected ? t.color_hex : `${t.color_hex}40`,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Scrollable Regions List */}
          <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
            {filteredCities.map((city) => {
              const isSelected = city.kode_wilayah === selectedCityCode;
              const tier = getRiskTier(Number(city.skor_total), thresholds);
              const contrastText = getContrastTextColor(tier.color_hex);

              return (
                <button
                  key={city.kode_wilayah}
                  onClick={() => setSelectedCityCode(city.kode_wilayah)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? isAdmin
                        ? 'bg-indigo-50/70 border-indigo-400 shadow-xs'
                        : 'bg-blue-50/70 border-blue-400 shadow-xs'
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {city.nama_wilayah}
                      </span>
                      {isSelected && (
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isAdmin ? 'bg-indigo-600' : 'bg-blue-600'}`} />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {city.tipe_wilayah} • Kode: {city.kode_wilayah}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {formatScore(Number(city.skor_total))}
                    </span>
                    <span
                      className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs"
                      style={{
                        backgroundColor: tier.color_hex,
                        color: contrastText,
                      }}
                    >
                      {tier.label}
                    </span>
                  </div>
                </button>
              );
            })}
            {filteredCities.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada wilayah yang cocok dengan pencarian.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Dedicated Editor Form (lg:col-span-8 xl:col-span-8) */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-5">
          {activeCity ? (
            <form onSubmit={handleSave} className="space-y-5">
              {/* Region Profile Header Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base ${
                    isAdmin ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {activeCity.tipe_wilayah === 'Kota' ? 'KT' : 'KB'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        {activeCity.nama_wilayah}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        Kode: {activeCity.kode_wilayah}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {activeCity.tipe_wilayah} Provinsi Sumatera Selatan • Terakhir diperbarui:{' '}
                      {activeCity.updated_by || (isAdmin ? 'Admin BPKP' : 'Pegawai SPI')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition"
                    title="Kembalikan form ke nilai tersimpan"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 ${
                      isAdmin ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </div>

              {/* Real-time Dynamic Score Preview Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Live Skor & Ambang Batas Risiko</span>
                    </div>
                    <p className="text-xs text-slate-400 max-w-md">
                      Skor dan kategori risiko bereaksi langsung terhadap perubahan formula dan ambang batas yang aktif.
                    </p>
                  </div>

                  {/* Score Value & Dynamic Badge */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className="text-4xl font-black font-mono tracking-tight"
                        style={{ color: liveTier.hex }}
                      >
                        {formatScore(formData.skorTotal)}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 text-[11px] mt-0.5">
                        <span className="text-slate-400">Tersimpan:</span>
                        <span className="font-mono text-slate-300">
                          {formatScore(Number(activeCity.skor_total))}
                        </span>
                        {scoreDelta !== 0 && (
                          <span
                            className={`flex items-center font-bold font-mono text-[10px] ${
                              scoreDelta > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {scoreDelta > 0 ? (
                              <TrendingUp className="w-3 h-3 mr-0.5" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-0.5" />
                            )}
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

              {/* Automatic Formula Assistant Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Hasil Kalkulasi Otomatis Berdasarkan Dimensi:
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      (Internal × 35%) + (Eksternal × 35%) + (Eksper × 30%) − Koreksi ={' '}
                      <strong className="text-slate-900 font-mono text-xs">
                        {formatScore(calculatedFormulaScore)}
                      </strong>
                    </span>
                  </div>
                </div>

                {roundTo2Decimals(formData.skorTotal) !== calculatedFormulaScore && (
                  <button
                    type="button"
                    onClick={handleApplyCalculated}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition shrink-0"
                  >
                    <span>Terapkan Hasil Dimensi ({formatScore(calculatedFormulaScore)})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Metrics & Dimension Input Grid */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
                  Formulir Metrik Skor & Dimensi Penilaian
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Skor Total SPI Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight flex items-center justify-between">
                      <span>Skor Total SPI (0 - 100)</span>
                      <span className="text-slate-400 font-mono text-[10px]">Total Score</span>
                    </label>
                    <input
                      type="number"
                      step={0.01}
                      min={0}
                      max={100}
                      value={formData.skorTotal}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          skorTotal: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                    />
                  </div>

                  {/* Jumlah Responden Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight flex items-center justify-between">
                      <span>Jumlah Sampel Responden</span>
                      <span className="text-slate-400 font-mono text-[10px]">Populasi Sampel</span>
                    </label>
                    <input
                      type="number"
                      step={1}
                      min={1}
                      value={formData.jumlahResponden}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          jumlahResponden: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                    />
                  </div>
                </div>

                {/* 4 Dimension Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Dimensi Internal */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Dimensi Internal (Pegawai)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono">
                        Bobot 35%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={0.1}
                        value={formData.dimInternal}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dimInternal: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={formData.dimInternal}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dimInternal: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-20 px-2 py-1 text-center font-mono text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Dimensi Eksternal */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Dimensi Eksternal (Masyarakat)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono">
                        Bobot 35%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={0.1}
                        value={formData.dimEksternal}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dimEksternal: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={formData.dimEksternal}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dimEksternal: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-20 px-2 py-1 text-center font-mono text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Dimensi Eksper */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Dimensi Eksper (Ahli)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-mono">
                        Bobot 30%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={0.1}
                        value={formData.dimEksper}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dimEksper: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={formData.dimEksper}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dimEksper: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-20 px-2 py-1 text-center font-mono text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Faktor Koreksi */}
                  <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                      <span>Faktor Koreksi (0 - 30.00)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-mono">
                        Pengurang
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={30}
                        step={0.1}
                        value={formData.dimKoreksi}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dimKoreksi: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full h-1.5 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                      />
                      <input
                        type="number"
                        min={0}
                        max={30}
                        step={0.01}
                        value={formData.dimKoreksi}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dimKoreksi: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-20 px-2 py-1 text-center font-mono text-xs font-bold bg-white border border-rose-300 rounded-lg text-rose-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Rekomendasi Utama Textarea */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                    Rekomendasi Utama Tindak Lanjut Wilayah
                  </label>
                  <textarea
                    rows={2}
                    value={formData.rekomendasiUtama}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, rekomendasiUtama: e.target.value }))
                    }
                    placeholder="Masukkan arahan strategis atau rekomendasi perbaikan untuk Pemda terkait..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                  />
                </div>

                {/* Audit Change Notes */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight flex items-center justify-between">
                    <span>Catatan Perubahan (Audit Trail Log)</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Disimpan di input_history_logs
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.catatanPerubahan}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, catatanPerubahan: e.target.value }))
                    }
                    placeholder={`Alasan modifikasi data statistik ${activeCity.nama_wilayah}...`}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                  />
                </div>

                {/* Form Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      Modifikasi akan dicatat atas nama{' '}
                      <strong>{currentUser?.full_name || (isAdmin ? 'Admin BPKP' : 'Pegawai SPI')}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition"
                    >
                      Batal / Reset
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 ${
                        isAdmin ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSubmitting ? 'Menyimpan...' : 'Simpan & Publikasikan'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400">
              Pilih salah satu daerah dari daftar sebelah kiri untuk memulai pengeditan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
