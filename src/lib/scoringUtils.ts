import { RiskTierKey, TierInfo } from '@/types/dashboard';
import {
  DEFAULT_RISK_THRESHOLDS,
  getRiskTier,
  RiskThreshold,
  getContrastTextColor,
} from './riskThresholds';

export const RISK_TIERS: Record<RiskTierKey, TierInfo> = {
  terjaga: {
    key: 'terjaga',
    label: 'Terjaga',
    minScore: 80.00,
    maxScore: 100.00,
    hex: '#15803D',
    bgClass: 'bg-emerald-700',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-700',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Risiko Sangat Rendah / Integritas Sangat Tinggi',
  },
  terawasi: {
    key: 'terawasi',
    label: 'Terawasi',
    minScore: 60.00,
    maxScore: 79.99,
    hex: '#4ADE80',
    bgClass: 'bg-green-400',
    textClass: 'text-green-700',
    borderClass: 'border-green-400',
    badgeClass: 'bg-green-100 text-green-800 border-green-300',
    description: 'Risiko Rendah / Cukup Terjaga',
  },
  waspada: {
    key: 'waspada',
    label: 'Waspada',
    minScore: 40.00,
    maxScore: 59.99,
    hex: '#FACC15',
    bgClass: 'bg-yellow-400',
    textClass: 'text-yellow-700',
    borderClass: 'border-yellow-400',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    description: 'Risiko Sedang / Perlu Perhatian',
  },
  rawan: {
    key: 'rawan',
    label: 'Rawan',
    minScore: 20.00,
    maxScore: 39.99,
    hex: '#FB923C',
    bgClass: 'bg-orange-400',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-400',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    description: 'Risiko Tinggi / Rawan Korupsi',
  },
  rentan: {
    key: 'rentan',
    label: 'Rentan',
    minScore: 0.00,
    maxScore: 19.99,
    hex: '#EF4444',
    bgClass: 'bg-red-500',
    textClass: 'text-red-700',
    borderClass: 'border-red-500',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    description: 'Risiko Sangat Tinggi / Sangat Rentan',
  },
};

export const DEFAULT_MAP_FILL = '#E2E8F0'; // Slate 200
export const DEFAULT_MAP_STROKE = '#FFFFFF';
export const HOVER_MAP_STROKE = '#1E293B'; // Slate 800

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
    description: `Kategori ${matched.label}`,
  };
}

export function getTierColor(score: number): string {
  return getTierByScore(score).hex;
}

export function formatScore(num: number): string {
  return num.toFixed(2);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}
