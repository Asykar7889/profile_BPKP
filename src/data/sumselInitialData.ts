// ====================================================================
// COMPLETE INITIAL SEED DATA FOR ALL 17 KABUPATEN/KOTA OF SOUTH SUMATRA
// Complete with 4 Dimensions, Child Indicators, and Audit History
// ====================================================================

import { CitySurvey, InputHistoryLog, SurveyDimension } from '@/types/spi';
import { calculateTotalSpiScore, getTierByScore } from '@/lib/scoringEngine';

function createDimensions(
  surveyId: string,
  internal: number,
  eksternal: number,
  eksper: number,
  koreksi: number
): SurveyDimension[] {
  return [
    {
      id: `${surveyId}-dim-1`,
      survey_id: surveyId,
      kode_dimensi: 'internal',
      nama_dimensi: 'Dimensi Internal (Pegawai/ASN)',
      skor_dimensi: internal,
      bobot: 0.35,
      indicators: [
        { id: `${surveyId}-ind-101`, nama_indikator: 'Integritas Pelaksanaan Tugas', skor_indikator: Math.min(100, internal + 1.5) },
        { id: `${surveyId}-ind-102`, nama_indikator: 'Transparansi Pengelolaan Anggaran', skor_indikator: internal },
        { id: `${surveyId}-ind-103`, nama_indikator: 'Pengelolaan SDM & Rekrutmen/Mutasi', skor_indikator: Math.max(0, internal - 2.0) },
        { id: `${surveyId}-ind-104`, nama_indikator: 'Pengadaan Barang & Jasa (PBJ)', skor_indikator: Math.max(0, internal - 3.2) },
      ],
    },
    {
      id: `${surveyId}-dim-2`,
      survey_id: surveyId,
      kode_dimensi: 'eksternal',
      nama_dimensi: 'Dimensi Eksternal (Masyarakat/Pengguna)',
      skor_dimensi: eksternal,
      bobot: 0.35,
      indicators: [
        { id: `${surveyId}-ind-201`, nama_indikator: 'Kualitas Pelayanan & Bebas Pungli', skor_indikator: Math.min(100, eksternal + 2.0) },
        { id: `${surveyId}-ind-202`, nama_indikator: 'Keterbukaan Informasi Publik', skor_indikator: eksternal },
        { id: `${surveyId}-ind-203`, nama_indikator: 'Efektivitas Kanal Pengaduan WBS', skor_indikator: Math.max(0, eksternal - 1.8) },
      ],
    },
    {
      id: `${surveyId}-dim-3`,
      survey_id: surveyId,
      kode_dimensi: 'eksper',
      nama_dimensi: 'Dimensi Eksper (Pakar/Auditor)',
      skor_dimensi: eksper,
      bobot: 0.30,
      indicators: [
        { id: `${surveyId}-ind-301`, nama_indikator: 'Kesesuaian Regulasi & Tata Kelola', skor_indikator: eksper },
        { id: `${surveyId}-ind-302`, nama_indikator: 'Mitigasi Risiko Suap/Gratifikasi', skor_indikator: Math.min(100, eksper + 1.2) },
        { id: `${surveyId}-ind-303`, nama_indikator: 'Independensi Pengawasan APIP', skor_indikator: Math.max(0, eksper - 2.0) },
      ],
    },
    {
      id: `${surveyId}-dim-4`,
      survey_id: surveyId,
      kode_dimensi: 'faktor_koreksi',
      nama_dimensi: 'Faktor Koreksi (LHKPN, Dumas, OTT)',
      skor_dimensi: koreksi,
      bobot: 1.00,
      indicators: [
        { id: `${surveyId}-ind-401`, nama_indikator: 'Kepatuhan Pelaporan LHKPN', skor_indikator: Math.min(10, koreksi * 0.4) },
        { id: `${surveyId}-ind-402`, nama_indikator: 'Tindak Lanjut Hasil Audit BPKP', skor_indikator: Math.min(10, koreksi * 0.6) },
      ],
    },
  ];
}

const rawCityConfigs = [
  { kode: '1601', nama: 'Kabupaten Ogan Komering Ulu', tipe: 'Kabupaten' as const, internal: 67.20, eksternal: 62.80, eksper: 65.10, koreksi: 1.20, responden: 210 },
  { kode: '1602', nama: 'Kabupaten Ogan Komering Ilir', tipe: 'Kabupaten' as const, internal: 59.40, eksternal: 56.50, eksper: 60.00, koreksi: 2.10, responden: 240 },
  { kode: '1603', nama: 'Kabupaten Muara Enim', tipe: 'Kabupaten' as const, internal: 74.00, eksternal: 69.80, eksper: 72.50, koreksi: 1.00, responden: 280 },
  { kode: '1604', nama: 'Kabupaten Lahat', tipe: 'Kabupaten' as const, internal: 56.10, eksternal: 53.40, eksper: 57.00, koreksi: 2.50, responden: 195 },
  { kode: '1605', nama: 'Kabupaten Musi Rawas', tipe: 'Kabupaten' as const, internal: 71.20, eksternal: 67.30, eksper: 70.00, koreksi: 1.40, responden: 205 },
  { kode: '1606', nama: 'Kabupaten Musi Banyuasin', tipe: 'Kabupaten' as const, internal: 38.00, eksternal: 35.10, eksper: 39.50, koreksi: 4.80, responden: 275 },
  { kode: '1607', 'nama': 'Kabupaten Banyuasin', tipe: 'Kabupaten' as const, internal: 64.00, eksternal: 60.20, eksper: 63.50, koreksi: 1.50, responden: 260 },
  { kode: '1608', nama: 'Kabupaten Ogan Komering Ulu Selatan', tipe: 'Kabupaten' as const, internal: 51.00, eksternal: 48.20, eksper: 50.80, koreksi: 3.20, responden: 180 },
  { kode: '1609', nama: 'Kabupaten Ogan Komering Ulu Timur', tipe: 'Kabupaten' as const, internal: 76.00, eksternal: 71.50, eksper: 74.20, koreksi: 0.80, responden: 230 },
  { kode: '1610', nama: 'Kabupaten Ogan Ilir', tipe: 'Kabupaten' as const, internal: 58.50, eksternal: 55.20, eksper: 58.00, koreksi: 2.40, responden: 220 },
  { kode: '1611', nama: 'Kabupaten Empat Lawang', tipe: 'Kabupaten' as const, internal: 35.50, eksternal: 32.80, eksper: 36.00, koreksi: 5.10, responden: 170 },
  { kode: '1612', nama: 'Kabupaten Penukal Abab Lematang Ilir (PALI)', tipe: 'Kabupaten' as const, internal: 46.80, eksternal: 42.50, eksper: 45.90, koreksi: 3.80, responden: 165 },
  { kode: '1613', nama: 'Kabupaten Musi Rawas Utara', tipe: 'Kabupaten' as const, internal: 21.00, eksternal: 17.50, eksper: 22.00, koreksi: 7.50, responden: 150 },
  { kode: '1671', nama: 'Kota Palembang', tipe: 'Kota' as const, internal: 85.00, eksternal: 80.80, eksper: 83.50, koreksi: 0.50, responden: 450 },
  { kode: '1672', nama: 'Kota Pagar Alam', tipe: 'Kota' as const, internal: 80.20, eksternal: 76.50, eksper: 78.40, koreksi: 0.70, responden: 190 },
  { kode: '1673', nama: 'Kota Lubuklinggau', tipe: 'Kota' as const, internal: 78.00, eksternal: 73.90, eksper: 76.10, koreksi: 0.90, responden: 215 },
  { kode: '1674', nama: 'Kota Prabumulih', tipe: 'Kota' as const, internal: 81.50, eksternal: 78.00, eksper: 80.00, koreksi: 0.60, responden: 225 },
];

export const INITIAL_CITY_SURVEYS_2026: CitySurvey[] = rawCityConfigs.map((c) => {
  const id = `survey-${c.kode}-2026`;
  const skorTotal = calculateTotalSpiScore(c.internal, c.eksternal, c.eksper, c.koreksi);
  const tier = getTierByScore(skorTotal);
  return {
    id,
    kode_wilayah: c.kode,
    nama_wilayah: c.nama,
    tipe_wilayah: c.tipe,
    tahun: 2026,
    skor_total: skorTotal,
    kategori_risiko: tier.label,
    jumlah_responden: c.responden,
    updated_at: new Date('2026-03-01T08:00:00Z').toISOString(),
    dimensions: createDimensions(id, c.internal, c.eksternal, c.eksper, c.koreksi),
  };
});

// Demo initial history logs
export const INITIAL_HISTORY_LOGS: InputHistoryLog[] = [
  {
    id: 'log-seed-1',
    survey_id: 'survey-1671-2026',
    kode_wilayah: '1671',
    nama_wilayah: 'Kota Palembang',
    tahun: 2026,
    pegawai_id: 'usr-pegawai-1',
    nama_pegawai: 'Ahmad Fauzi, S.E. (Inspektorat)',
    action_type: 'UPDATE',
    skor_lama: 80.15,
    kategori_lama: 'Terjaga',
    skor_baru: 82.40,
    kategori_baru: 'Terjaga',
    old_payload: { ...INITIAL_CITY_SURVEYS_2026[13], skor_total: 80.15 },
    new_payload: INITIAL_CITY_SURVEYS_2026[13],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'log-seed-2',
    survey_id: 'survey-1603-2026',
    kode_wilayah: '1603',
    nama_wilayah: 'Kabupaten Muara Enim',
    tahun: 2026,
    pegawai_id: 'usr-pegawai-2',
    nama_pegawai: 'Rina Kartika, M.Si. (BPKP Sumsel)',
    action_type: 'UPDATE',
    skor_lama: 69.80,
    kategori_lama: 'Terawasi',
    skor_baru: 71.40,
    kategori_baru: 'Terawasi',
    old_payload: { ...INITIAL_CITY_SURVEYS_2026[2], skor_total: 69.80 },
    new_payload: INITIAL_CITY_SURVEYS_2026[2],
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'log-seed-3',
    survey_id: 'survey-1606-2026',
    kode_wilayah: '1606',
    nama_wilayah: 'Kabupaten Musi Banyuasin',
    tahun: 2026,
    pegawai_id: 'usr-admin-1',
    nama_pegawai: 'Bambang Irawan (Admin BPKP)',
    action_type: 'EDIT_ADMIN',
    skor_lama: 34.50,
    kategori_lama: 'Rawan',
    skor_baru: 36.40,
    kategori_baru: 'Rawan',
    old_payload: { ...INITIAL_CITY_SURVEYS_2026[5], skor_total: 34.50 },
    new_payload: INITIAL_CITY_SURVEYS_2026[5],
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];
