// ====================================================================
// 5-TIER STRICT DECIMAL SCORING ENGINE & FORMULA CALCULATOR
// ====================================================================

import { RiskTierKey, TierInfo } from '@/types/spi';
import {
  DEFAULT_RISK_THRESHOLDS,
  getRiskTier,
  RiskThreshold,
  getContrastTextColor,
} from './riskThresholds';

export {
  DEFAULT_RISK_THRESHOLDS,
  getRiskTier,
  getContrastTextColor,
  computeLinkedThresholds,
  validateThresholds,
  fetchRiskThresholds,
} from './riskThresholds';
export type { RiskThreshold, ThresholdValidationResult } from './riskThresholds';

/**
 * 5-Tier Klasifikasi Risiko Korupsi SPI Resmi KPK / BPKP
 */
export const SPI_TIERS: Record<RiskTierKey, TierInfo> = {
  terjaga: {
    key: 'terjaga',
    label: 'Terjaga',
    minScore: 80.0,
    maxScore: 100.0,
    hex: '#15803D',
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-600',
    badgeClass: 'bg-emerald-600 text-white',
    description: 'Sistem integritas kokoh, risiko korupsi sangat rendah dan terkendali dengan baik.',
  },
  terawasi: {
    key: 'terawasi',
    label: 'Terawasi',
    minScore: 60.0,
    maxScore: 79.99,
    hex: '#4ADE80',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
    borderClass: 'border-green-400',
    badgeClass: 'bg-green-500 text-slate-900',
    description: 'Pengendalian korupsi berjalan baik, diperlukan pengawasan rutin berkelanjutan.',
  },
  waspada: {
    key: 'waspada',
    label: 'Waspada',
    minScore: 40.0,
    maxScore: 59.99,
    hex: '#FACC15',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-900',
    borderClass: 'border-yellow-400',
    badgeClass: 'bg-yellow-400 text-slate-900',
    description: 'Terdapat celah integritas sedang, mitigasi risiko wajib segera ditingkatkan.',
  },
  rawan: {
    key: 'rawan',
    label: 'Rawan',
    minScore: 20.0,
    maxScore: 39.99,
    hex: '#FB923C',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-900',
    borderClass: 'border-orange-400',
    badgeClass: 'bg-orange-500 text-white',
    description: 'Risiko korupsi tinggi, diperlukan audit investigasi dan intervensi sistemik.',
  },
  rentan: {
    key: 'rentan',
    label: 'Rentan',
    minScore: 0.0,
    maxScore: 19.99,
    hex: '#EF4444',
    bgClass: 'bg-red-100',
    textClass: 'text-red-900',
    borderClass: 'border-red-500',
    badgeClass: 'bg-red-600 text-white',
    description: 'Kondisi darurat integritas, membutuhkan tindakan penegakan hukum dan pembenahan total.',
  },
};

/**
 * Standard rounding to 2 decimal places to prevent IEEE 754 floating-point gaps
 */
export function roundTo2Decimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Evaluasi 5-Tier Berdasarkan Skor Numerik & Konfigurasi Threshold Dinamis
 */
export function getTierByScore(
  score: number,
  customThresholds: RiskThreshold[] = DEFAULT_RISK_THRESHOLDS
): TierInfo {
  const matched = getRiskTier(score, customThresholds);
  const textContrast = getContrastTextColor(matched.color_hex);

  return {
    key: matched.tier_key,
    label: matched.label,
    minScore: matched.min_score,
    maxScore: matched.max_score,
    hex: matched.color_hex,
    bgClass: '',
    textClass: textContrast === '#FFFFFF' ? 'text-white' : 'text-slate-900',
    borderClass: '',
    badgeClass: '',
    description: `Kategori ${matched.label} (${matched.min_score.toFixed(0)} - ${
      matched.max_score === 100 ? '100' : matched.max_score.toFixed(2)
    })`,
  };
}

/**
 * Live Auto-Calculator Formula Total SPI Score:
 * (Internal * 0.35) + (Eksternal * 0.35) + (Eksper * 0.30) - Faktor_Koreksi
 * Mendukung pemanggilan dengan 4 parameter angka atau array dimensi SurveyDimension[]
 */
export function calculateTotalSpiScore(
  internalOrDimensions: number | { kode_dimensi: string; skor_dimensi: number }[],
  eksternal?: number,
  eksper?: number,
  faktorKoreksi: number = 0
): number {
  if (Array.isArray(internalOrDimensions)) {
    const internal = internalOrDimensions.find((d) => d.kode_dimensi === 'internal')?.skor_dimensi || 0;
    const ekst = internalOrDimensions.find((d) => d.kode_dimensi === 'eksternal')?.skor_dimensi || 0;
    const eksp = internalOrDimensions.find((d) => d.kode_dimensi === 'eksper')?.skor_dimensi || 0;
    const koreksi = internalOrDimensions.find((d) => d.kode_dimensi === 'faktor_koreksi')?.skor_dimensi || 0;
    const raw = (internal * 0.35) + (ekst * 0.35) + (eksp * 0.30) - koreksi;
    return roundTo2Decimals(Math.max(0, Math.min(100, raw)));
  }

  const internal = Number(internalOrDimensions) || 0;
  const ekst = Number(eksternal) || 0;
  const eksp = Number(eksper) || 0;
  const rawScore = (internal * 0.35) + (ekst * 0.35) + (eksp * 0.30) - (faktorKoreksi || 0);
  const clamped = Math.max(0, Math.min(100, rawScore));
  return roundTo2Decimals(clamped);
}

/**
 * Base Map Visual Tokens (Heatmap OFF)
 */
export const DEFAULT_MAP_FILL = '#F1F5F9'; // Slate 100 (Putih keabu-abuan)
export const DEFAULT_MAP_STROKE = '#94A3B8'; // Slate 400 (Garis batas abu-abu tegas)
export const HOVER_MAP_STROKE = '#1E293B'; // Slate 800 (Garis batas aktif tegas)

/**
 * Helper formatters
 */
export function formatScore(score: number): string {
  return roundTo2Decimals(score).toFixed(2);
}

export function formatDelta(newScore: number, oldScore: number): { text: string; isPositive: boolean } {
  const delta = roundTo2Decimals(newScore - oldScore);
  const isPositive = delta >= 0;
  return {
    text: `${isPositive ? '+' : ''}${delta.toFixed(2)}`,
    isPositive,
  };
}
