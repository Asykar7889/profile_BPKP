'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSpiDashboard } from '@/context/SpiDashboardContext';
import {
  RiskThreshold,
  DEFAULT_RISK_THRESHOLDS,
  computeLinkedThresholds,
  validateThresholds,
  getContrastTextColor,
  roundTo2,
} from '@/lib/riskThresholds';
import {
  X,
  Sliders,
  Save,
  RotateCcw,
  Lock,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Palette,
  Info,
} from 'lucide-react';

export default function AdminRiskSettingsModal() {
  const {
    thresholds: globalThresholds,
    updateThresholds,
    isAdminRiskSettingsOpen,
    setIsAdminRiskSettingsOpen,
    userRole,
  } = useSpiDashboard();

  // Local state for editing to prevent partial saves
  const [formThresholds, setFormThresholds] = useState<RiskThreshold[]>(globalThresholds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync with global thresholds when opened
  useEffect(() => {
    if (isAdminRiskSettingsOpen) {
      setFormThresholds(globalThresholds);
      setValidationError(null);
      setSuccessToast(null);
      setShowResetConfirm(false);
    }
  }, [isAdminRiskSettingsOpen, globalThresholds]);

  // Guard: Only admins can view this modal
  if (!isAdminRiskSettingsOpen || userRole !== 'admin') {
    return null;
  }

  // Handle lower-bound changes with auto-linked anti-overlap
  const handleLowerBoundChange = (tierKey: string, rawVal: number) => {
    setValidationError(null);
    const val = isNaN(rawVal) ? 0 : roundTo2(rawVal);

    const currentMap = new Map(formThresholds.map((t) => [t.tier_key, t.min_score]));
    currentMap.set(tierKey as any, val);

    const bounds = {
      terjagaMin: currentMap.get('terjaga') ?? 80,
      terawasiMin: currentMap.get('terawasi') ?? 60,
      waspadaMin: currentMap.get('waspada') ?? 40,
      rawanMin: currentMap.get('rawan') ?? 20,
    };

    const recomputed = computeLinkedThresholds(bounds, formThresholds);
    setFormThresholds(recomputed);
  };

  // Handle label change
  const handleLabelChange = (tierKey: string, newLabel: string) => {
    setValidationError(null);
    setFormThresholds((prev) =>
      prev.map((t) => (t.tier_key === tierKey ? { ...t, label: newLabel } : t))
    );
  };

  // Handle color change (syncs color picker and text hex)
  const handleColorChange = (tierKey: string, newHex: string) => {
    setValidationError(null);
    let formatted = newHex.trim();
    if (!formatted.startsWith('#') && formatted.length > 0) {
      formatted = `#${formatted}`;
    }
    setFormThresholds((prev) =>
      prev.map((t) => (t.tier_key === tierKey ? { ...t, color_hex: formatted } : t))
    );
  };

  // Compute live proportional width for horizontal preview bar
  const proportionSegments = useMemo(() => {
    return formThresholds.map((tier) => {
      const rawSpan = Math.max(0, tier.max_score - tier.min_score);
      // Ensure positive span for visualization
      const span = tier.sort_order === 1 ? rawSpan : rawSpan + 0.01;
      const widthPct = Math.max(2, Math.min(100, span));
      const textColor = getContrastTextColor(tier.color_hex);

      return {
        ...tier,
        widthPct,
        textColor,
      };
    });
  }, [formThresholds]);

  // Submit Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateThresholds(formThresholds);
    if (!validation.valid) {
      setValidationError(validation.error || 'Konfigurasi tidak valid.');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    const ok = await updateThresholds(formThresholds);
    setIsSubmitting(false);

    if (ok) {
      setSuccessToast('Konfigurasi tingkat risiko berhasil disimpan dan dipublikasikan!');
      setTimeout(() => {
        setSuccessToast(null);
        setIsAdminRiskSettingsOpen(false);
      }, 1800);
    } else {
      setValidationError('Gagal menyimpan perubahan ke server. Silakan coba kembali.');
    }
  };

  // Reset to default
  const handleResetToDefault = async () => {
    setIsSubmitting(true);
    setShowResetConfirm(false);
    const ok = await updateThresholds(DEFAULT_RISK_THRESHOLDS);
    setIsSubmitting(false);

    if (ok) {
      setFormThresholds(DEFAULT_RISK_THRESHOLDS);
      setSuccessToast('Konfigurasi berhasil dikembalikan ke standar default BPKP/KPK!');
      setTimeout(() => {
        setSuccessToast(null);
      }, 2000);
    } else {
      setValidationError('Gagal mereset ke default.');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-5 sm:p-6 flex items-center justify-between relative flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Pengaturan Tingkat Risiko Dinamis (5-Tier SPI)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                  Admin Control
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Atur ambang batas skor, label kategori, dan palet warna peta secara terpusat tanpa redeploy
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminRiskSettingsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {successToast && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Validation Error Alert */}
        {validationError && (
          <div className="bg-rose-600 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
            <AlertTriangle className="w-4 h-4" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Content Body: Scrollable */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* ======================================================== */}
            {/* 1. LIVE PROPORTION BAR VISUALIZATION (0 - 100%)          */}
            {/* ======================================================== */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Visualisasi Proporsi Rentang Skor (0 s.d 100)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Update live real-time saat angka atau warna diubah
                </span>
              </div>

              {/* Single Horizontal Segmented Proportion Bar */}
              <div className="w-full h-11 sm:h-12 bg-slate-800 rounded-xl overflow-hidden flex shadow-inner border border-slate-700/80 p-0.5 gap-0.5">
                {proportionSegments.map((seg) => (
                  <div
                    key={seg.tier_key}
                    style={{
                      width: `${seg.widthPct}%`,
                      backgroundColor: seg.color_hex,
                      color: seg.textColor,
                    }}
                    className="h-full flex flex-col items-center justify-center px-1 text-center transition-all duration-200 min-w-[36px] overflow-hidden select-none first:rounded-l-lg last:rounded-r-lg"
                    title={`${seg.label}: ${seg.min_score.toFixed(1)} - ${seg.max_score.toFixed(1)}`}
                  >
                    <span className="text-[10px] sm:text-[11px] font-black truncate leading-tight">
                      {seg.label}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-mono opacity-90 truncate leading-none">
                      {seg.min_score.toFixed(0)}–{seg.max_score === 100 ? '100' : seg.max_score.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Ticks for 0, 50, 100 */}
              <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
                <span>0.00 (Minimal)</span>
                <span>50.00</span>
                <span>100.00 (Maksimal)</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 2. LINKED THRESHOLDS FORM (ANTI-OVERLAP ARCHITECTURE)     */}
            {/* ======================================================== */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    Form Konfigurasi Ambang Batas Terhubung (Anti-Gap / Overlap)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Batas atas kategori bawah otomatis terkunci di <strong>(Batas Bawah Kategori Atas - 0.01)</strong> untuk menjamin presisi matematis tanpa celah desimal.
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-bpkp-blue text-[11px] font-bold">
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Linked Logic Active</span>
                </div>
              </div>

              {/* Table / List of 5 Tiers */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-3 sm:px-4 w-12 text-center">Urutan</th>
                      <th className="py-3 px-3 sm:px-4">Kategori & Label</th>
                      <th className="py-3 px-3 sm:px-4 w-32">Batas Bawah (Min)</th>
                      <th className="py-3 px-3 sm:px-4 w-32">Batas Atas (Max)</th>
                      <th className="py-3 px-3 sm:px-4 w-44">Warna Representasi</th>
                      <th className="py-3 px-3 sm:px-4 text-center w-20">Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {formThresholds.map((tier) => {
                      const isTerjaga = tier.tier_key === 'terjaga';
                      const isRentan = tier.tier_key === 'rentan';
                      const textColor = getContrastTextColor(tier.color_hex);

                      return (
                        <tr key={tier.tier_key} className="hover:bg-slate-50/70 transition-colors">
                          {/* Sort Order */}
                          <td className="py-3 px-3 sm:px-4 text-center font-bold text-slate-400 text-xs">
                            #{tier.sort_order}
                          </td>

                          {/* Label input */}
                          <td className="py-3 px-3 sm:px-4">
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={tier.label}
                                onChange={(e) => handleLabelChange(tier.tier_key, e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Nama Label"
                              />
                              <span className="text-[10px] text-slate-400 font-mono block">
                                key: {tier.tier_key}
                              </span>
                            </div>
                          </td>

                          {/* Min Score (Editable except for Rentan = 0) */}
                          <td className="py-3 px-3 sm:px-4">
                            {isRentan ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono font-bold text-xs select-none">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                <span>0.00</span>
                              </div>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                max={isTerjaga ? 100 : 99.99}
                                step={0.01}
                                value={tier.min_score}
                                onChange={(e) =>
                                  handleLowerBoundChange(tier.tier_key, parseFloat(e.target.value))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                              />
                            )}
                          </td>

                          {/* Max Score (Locked: Terjaga = 100, Others = Upper Min - 0.01) */}
                          <td className="py-3 px-3 sm:px-4">
                            {isTerjaga ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono font-bold text-xs select-none">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                <span>100.00</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono font-bold text-xs select-none">
                                <LinkIcon className="w-3 h-3 text-blue-500" />
                                <span>{tier.max_score.toFixed(2)}</span>
                              </div>
                            )}
                          </td>

                          {/* Color Picker + Hex Input */}
                          <td className="py-3 px-3 sm:px-4">
                            <div className="flex items-center gap-2">
                              {/* Native Color Picker */}
                              <input
                                type="color"
                                value={tier.color_hex}
                                onChange={(e) => handleColorChange(tier.tier_key, e.target.value)}
                                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                                title="Pilih warna representasi"
                              />
                              {/* Hex Text Input */}
                              <input
                                type="text"
                                maxLength={7}
                                value={tier.color_hex}
                                onChange={(e) => handleColorChange(tier.tier_key, e.target.value)}
                                className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-xs text-slate-800 uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </td>

                          {/* Live Contrast Badge Preview */}
                          <td className="py-3 px-3 sm:px-4 text-center">
                            <span
                              className="inline-block px-2.5 py-1 rounded-md text-[11px] font-black shadow-2xs"
                              style={{
                                backgroundColor: tier.color_hex,
                                color: textColor,
                              }}
                            >
                              {tier.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Information Card */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-700 text-xs flex items-start gap-2.5 leading-relaxed">
              <Info className="w-4 h-4 text-bpkp-blue flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Sinkronisasi Instan Seluruh Komponen</strong>
                Setiap perubahan yang Anda simpan akan langsung disinkronkan ke: 
                (1) Poligon Peta GeoJSON 17 Kab/Kota Sumsel, 
                (2) 5 Kartu Legenda Interaktif, 
                (3) Gauge Chart & Detail Skor Wilayah, dan 
                (4) Live Preview pada Form Input Pegawai tanpa perlu deploy ulang.
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
            {/* Reset Button / Confirmation */}
            {showResetConfirm ? (
              <div className="flex items-center gap-2 bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                <span className="text-xs text-amber-900 font-bold px-1">
                  Kembalikan ke standar default?
                </span>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  disabled={isSubmitting}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition"
                >
                  Ya, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1 text-slate-600 text-xs hover:text-slate-900"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset ke Default Standar</span>
              </button>
            )}

            {/* Cancel & Save Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsAdminRiskSettingsOpen(false)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
