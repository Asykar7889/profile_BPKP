export type RiskTierKey = 'terjaga' | 'terawasi' | 'waspada' | 'rawan' | 'rentan';

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

export interface RegionData {
  id?: string;
  kode_wilayah: string;
  nama_wilayah: string;
  tipe_wilayah: 'Kabupaten' | 'Kota';
  skor_total: number;
  kategori_risiko: string;
  indikator_internal: number;
  indikator_eksternal: number;
  indikator_eksper: number;
  faktor_koreksi: number;
  jumlah_responden: number;
  tahun: number;
  rekomendasi_utama: string;
  updated_at?: string;
}

export interface GeoJsonFeature {
  type: 'Feature';
  properties: {
    kode_wilayah: string;
    nama_wilayah: string;
    tipe_wilayah?: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export interface ProvincialSummary {
  totalWilayah: number;
  rataRataSkor: number;
  skorTertinggi: RegionData;
  skorTerendah: RegionData;
  tierCounts: Record<RiskTierKey, number>;
  totalResponden: number;
}
