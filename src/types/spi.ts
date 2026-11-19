// ====================================================================
// CORE TYPES: DASHBOARD PEMETAAN TINGKAT KORUPSI SUMATERA SELATAN (SPI)
// ====================================================================

export type RiskTierKey = 'terjaga' | 'terawasi' | 'waspada' | 'rawan' | 'rentan';

export type UserRole = 'pegawai' | 'admin' | 'public';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'pegawai' | 'admin';
  created_at?: string;
}

export interface TierInfo {
  key: RiskTierKey;
  label: string;
  minScore: number;
  maxScore: number;
  hex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeClass: string;
  description: string;
}

export interface SurveyIndicator {
  id: string;
  dimension_id?: string;
  nama_indikator: string;
  skor_indikator: number;
}

export type DimensionCode = 'internal' | 'eksternal' | 'eksper' | 'faktor_koreksi';

export interface SurveyDimension {
  id: string;
  survey_id?: string;
  kode_dimensi: DimensionCode;
  nama_dimensi: string;
  skor_dimensi: number;
  bobot: number;
  indicators: SurveyIndicator[];
}

export interface CitySurvey {
  id: string;
  kode_wilayah: string;
  nama_wilayah: string;
  tipe_wilayah: 'Kabupaten' | 'Kota';
  tahun: number;
  skor_total: number;
  kategori_risiko: string;
  jumlah_responden: number;
  updated_by?: string;
  updated_at?: string;
  dimensions: SurveyDimension[];
}

export type ActionType = 'CREATE' | 'UPDATE' | 'EDIT_ADMIN' | 'REVERT';
export type LogStatus = 'applied' | 'edited' | 'reverted';

export interface InputHistoryLog {
  id: string;
  survey_id?: string;
  city_id?: string;
  kode_wilayah: string;
  city_code?: string;
  nama_wilayah: string;
  city_name?: string;
  tahun: number;
  year?: number;
  pegawai_id?: string;
  nama_pegawai: string;
  submitted_by?: string;
  submitted_by_name?: string;
  action_type: ActionType;
  skor_lama: number;
  old_score?: number;
  kategori_lama: string;
  skor_baru: number;
  new_score?: number;
  kategori_baru: string;
  notes?: string;
  status?: LogStatus;
  old_payload?: CitySurvey;
  new_payload?: CitySurvey;
  created_at: string;
}

export interface ProvincialSummary {
  totalWilayah: number;
  rataRataSkor: number;
  tierRataRata: TierInfo;
  skorTertinggi: CitySurvey | null;
  skorTerendah: CitySurvey | null;
}
