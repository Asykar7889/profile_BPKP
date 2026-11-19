// ====================================================================
// CENTRALIZED DYNAMIC RISK THRESHOLDS & SCORING CALCULATOR
// Anti-Overlap Linked Architecture, YIQ Contrast & Supabase Fetcher
// ====================================================================

import { SupabaseClient } from '@supabase/supabase-js';

export type RiskTierKey = 'terjaga' | 'terawasi' | 'waspada' | 'rawan' | 'rentan';

export interface RiskThreshold {
  id?: string;
  tier_key: RiskTierKey;
  label: string;
  min_score: number;
  max_score: number;
  color_hex: string;
  sort_order: number;
  updated_at?: string;
  updated_by?: string;
}

export interface ThresholdValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Fallback Standar Resmi SPI KPK / BPKP (100.00 s.d 0.00)
 */
export const DEFAULT_RISK_THRESHOLDS: RiskThreshold[] = [
  {
    tier_key: 'terjaga',
    label: 'Terjaga',
    min_score: 80.0,
    max_score: 100.0,
    color_hex: '#15803D', // Hijau Tua
    sort_order: 1,
  },
  {
    tier_key: 'terawasi',
    label: 'Terawasi',
    min_score: 60.0,
    max_score: 79.99,
    color_hex: '#4ADE80', // Hijau Muda
    sort_order: 2,
  },
  {
    tier_key: 'waspada',
    label: 'Waspada',
    min_score: 40.0,
    max_score: 59.99,
    color_hex: '#FACC15', // Kuning
    sort_order: 3,
  },
  {
    tier_key: 'rawan',
    label: 'Rawan',
    min_score: 20.0,
    max_score: 39.99,
    color_hex: '#FB923C', // Oren
    sort_order: 4,
  },
  {
    tier_key: 'rentan',
    label: 'Rentan',
    min_score: 0.0,
    max_score: 19.99,
    color_hex: '#EF4444', // Merah
    sort_order: 5,
  },
];

/**
 * Relative Luminance / YIQ formula to calculate text contrast
 * Returns dark '#0F172A' for light backgrounds and '#FFFFFF' for dark backgrounds
 */
export function getContrastTextColor(hexColor: string): '#0F172A' | '#FFFFFF' {
  if (!hexColor || typeof hexColor !== 'string') return '#FFFFFF';
  const cleanHex = hexColor.trim().replace('#', '');
  if (cleanHex.length !== 6 && cleanHex.length !== 3) return '#FFFFFF';

  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((c) => c + c)
          .join('')
      : cleanHex;

  const r = parseInt(fullHex.substring(0, 2), 16) || 0;
  const g = parseInt(fullHex.substring(2, 4), 16) || 0;
  const b = parseInt(fullHex.substring(4, 6), 16) || 0;

  // YIQ luminance formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 148 ? '#0F172A' : '#FFFFFF';
}

/**
 * Standard rounding to 2 decimal places to eliminate IEEE 754 floating point drift
 */
export function roundTo2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Given 4 editable lower bounds, locks Terjaga max to 100 and Rentan min to 0,
 * and auto-calculates each lower tier's max_score = (upperTierMin - 0.01)
 */
export function computeLinkedThresholds(
  bounds: {
    terjagaMin: number;
    terawasiMin: number;
    waspadaMin: number;
    rawanMin: number;
  },
  baseThresholds: RiskThreshold[] = DEFAULT_RISK_THRESHOLDS
): RiskThreshold[] {
  const tMap = new Map(baseThresholds.map((t) => [t.tier_key, t]));

  const terjagaMin = roundTo2(bounds.terjagaMin);
  const terawasiMin = roundTo2(bounds.terawasiMin);
  const waspadaMin = roundTo2(bounds.waspadaMin);
  const rawanMin = roundTo2(bounds.rawanMin);

  const tTerjaga = tMap.get('terjaga') || DEFAULT_RISK_THRESHOLDS[0];
  const tTerawasi = tMap.get('terawasi') || DEFAULT_RISK_THRESHOLDS[1];
  const tWaspada = tMap.get('waspada') || DEFAULT_RISK_THRESHOLDS[2];
  const tRawan = tMap.get('rawan') || DEFAULT_RISK_THRESHOLDS[3];
  const tRentan = tMap.get('rentan') || DEFAULT_RISK_THRESHOLDS[4];

  return [
    {
      ...tTerjaga,
      tier_key: 'terjaga',
      sort_order: 1,
      min_score: terjagaMin,
      max_score: 100.0,
    },
    {
      ...tTerawasi,
      tier_key: 'terawasi',
      sort_order: 2,
      min_score: terawasiMin,
      max_score: roundTo2(terjagaMin - 0.01),
    },
    {
      ...tWaspada,
      tier_key: 'waspada',
      sort_order: 3,
      min_score: waspadaMin,
      max_score: roundTo2(terawasiMin - 0.01),
    },
    {
      ...tRawan,
      tier_key: 'rawan',
      sort_order: 4,
      min_score: rawanMin,
      max_score: roundTo2(waspadaMin - 0.01),
    },
    {
      ...tRentan,
      tier_key: 'rentan',
      sort_order: 5,
      min_score: 0.0,
      max_score: roundTo2(rawanMin - 0.01),
    },
  ];
}

/**
 * Validate thresholds strictly:
 * - 100 >= terjaga.min > terawasi.min > waspada.min > rawan.min > 0
 * - Labels cannot be empty
 * - Hex colors must match /^#([0-9A-Fa-f]{6})$/
 */
export function validateThresholds(thresholds: RiskThreshold[]): ThresholdValidationResult {
  if (!Array.isArray(thresholds) || thresholds.length !== 5) {
    return { valid: false, error: 'Jumlah konfigurasi kategori harus tepat 5 tingkat risiko.' };
  }

  const hexRegex = /^#([0-9A-Fa-f]{6})$/;

  for (const t of thresholds) {
    if (!t.label || t.label.trim().length === 0) {
      return { valid: false, error: `Label untuk kategori ${t.tier_key} tidak boleh kosong.` };
    }
    if (!hexRegex.test(t.color_hex)) {
      return {
        valid: false,
        error: `Format warna hex untuk "${t.label}" (${t.color_hex}) tidak valid. Gunakan format #RRGGBB.`,
      };
    }
    if (isNaN(t.min_score) || isNaN(t.max_score)) {
      return { valid: false, error: `Batas skor untuk "${t.label}" harus berupa angka valid.` };
    }
  }

  const sorted = [...thresholds].sort((a, b) => a.sort_order - b.sort_order);
  const [terjaga, terawasi, waspada, rawan, rentan] = sorted;

  if (terjaga.max_score !== 100.0) {
    return { valid: false, error: 'Batas maksimal kategori Terjaga harus terkunci di angka 100.00.' };
  }
  if (rentan.min_score !== 0.0) {
    return { valid: false, error: 'Batas minimal kategori Rentan harus terkunci di angka 0.00.' };
  }

  if (
    !(
      100 >= terjaga.min_score &&
      terjaga.min_score > terawasi.min_score &&
      terawasi.min_score > waspada.min_score &&
      waspada.min_score > rawan.min_score &&
      rawan.min_score > 0
    )
  ) {
    return {
      valid: false,
      error:
        'Urutan batas nilai harus strictly menurun: 100 ≥ Terjaga.min > Terawasi.min > Waspada.min > Rawan.min > 0.',
    };
  }

  return { valid: true };
}

/**
 * Evaluasi kategori risiko dinamis berdasarkan batas threshold yang aktif.
 * Mengurutkan batas secara descending sehingga tidak pernah ada celah/gap.
 */
export function getRiskTier(
  score: number,
  thresholds: RiskThreshold[] = DEFAULT_RISK_THRESHOLDS
): RiskThreshold {
  const safeScore = isNaN(score) ? 0 : Math.max(0, Math.min(100, roundTo2(score)));

  // Urutkan dari sort_order terkecil (tier tertinggi) ke terbesar
  const sorted = [...thresholds].sort((a, b) => a.sort_order - b.sort_order);

  for (const tier of sorted) {
    if (safeScore >= tier.min_score) {
      return tier;
    }
  }

  // Fallback ke tier terendah
  return sorted[sorted.length - 1] || DEFAULT_RISK_THRESHOLDS[4];
}

/**
 * Fetcher Supabase fail-safe murni yang dapat di-import oleh Client maupun Server Component
 */
export async function fetchRiskThresholds(
  client?: SupabaseClient | null
): Promise<RiskThreshold[]> {
  try {
    if (!client) return DEFAULT_RISK_THRESHOLDS;

    const { data, error } = await client
      .from('risk_thresholds')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length === 5) {
      const mapped = data.map((d: any) => ({
        id: d.id,
        tier_key: d.tier_key as RiskTierKey,
        label: d.label,
        min_score: Number(d.min_score),
        max_score: Number(d.max_score),
        color_hex: d.color_hex,
        sort_order: Number(d.sort_order),
        updated_at: d.updated_at,
        updated_by: d.updated_by,
      }));

      const check = validateThresholds(mapped);
      if (check.valid) {
        return mapped;
      }
    }
    return DEFAULT_RISK_THRESHOLDS;
  } catch (err) {
    console.warn('[fetchRiskThresholds] Gagal mengambil konfigurasi, menggunakan default:', err);
    return DEFAULT_RISK_THRESHOLDS;
  }
}
