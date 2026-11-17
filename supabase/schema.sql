-- ====================================================================
-- DASHBOARD PEMETAAN TINGKAT KORUPSI SUMATERA SELATAN (SPI SUMSEL)
-- Supabase PostgreSQL Schema & Seeding (17 Kabupaten/Kota)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.regions_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kode_wilayah VARCHAR(10) UNIQUE NOT NULL, -- Kode BPS/Kemendagri: '1601' s/d '1674'
  nama_wilayah VARCHAR(100) NOT NULL,
  tipe_wilayah VARCHAR(20) CHECK (tipe_wilayah IN ('Kabupaten', 'Kota')) NOT NULL,
  skor_total NUMERIC(5,2) NOT NULL CHECK (skor_total >= 0 AND skor_total <= 100),
  kategori_risiko VARCHAR(30) NOT NULL,
  indikator_internal NUMERIC(5,2) NOT NULL,
  indikator_eksternal NUMERIC(5,2) NOT NULL,
  indikator_eksper NUMERIC(5,2) NOT NULL,
  faktor_koreksi NUMERIC(5,2) DEFAULT 0.00,
  jumlah_responden INTEGER DEFAULT 150,
  tahun INTEGER DEFAULT 2026,
  rekomendasi_utama TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.regions_data ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access
CREATE POLICY "Allow public read access on regions_data"
  ON public.regions_data
  FOR SELECT
  TO public
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_regions_kode ON public.regions_data(kode_wilayah);
CREATE INDEX IF NOT EXISTS idx_regions_skor ON public.regions_data(skor_total);
CREATE INDEX IF NOT EXISTS idx_regions_kategori ON public.regions_data(kategori_risiko);

-- ====================================================================
-- SEED DATA: 17 KABUPATEN / KOTA SUMATERA SELATAN
-- ====================================================================

INSERT INTO public.regions_data (
  kode_wilayah, nama_wilayah, tipe_wilayah, skor_total, kategori_risiko,
  indikator_internal, indikator_eksternal, indikator_eksper, faktor_koreksi,
  jumlah_responden, tahun, rekomendasi_utama
) VALUES
('1601', 'Kabupaten Ogan Komering Ulu', 'Kabupaten', 64.50, 'Terawasi', 67.20, 62.80, 65.10, -1.20, 210, 2026, 'Perketat pengawasan pengadaan barang dan jasa serta percepat digitalisasi layanan perizinan.'),
('1602', 'Kabupaten Ogan Komering Ilir', 'Kabupaten', 58.20, 'Waspada', 59.40, 56.50, 60.00, -2.10, 240, 2026, 'Tingkatkan transparansi alokasi dana hibah/bansos dan perbaiki sistem whistleblowing internal.'),
('1603', 'Kabupaten Muara Enim', 'Kabupaten', 71.40, 'Terawasi', 74.00, 69.80, 72.50, -1.00, 280, 2026, 'Pertahankan integritas perizinan sektor pertambangan dan optimalkan kepatuhan LHKPN pejabat daerah.'),
('1604', 'Kabupaten Lahat', 'Kabupaten', 54.80, 'Waspada', 56.10, 53.40, 57.00, -2.50, 195, 2026, 'Benahi sistem pengelolaan anggaran APBD di tingkat dinas teknis dan cegah benturan kepentingan tender.'),
('1605', 'Kabupaten Musi Rawas', 'Kabupaten', 68.90, 'Terawasi', 71.20, 67.30, 70.00, -1.40, 205, 2026, 'Dorong independensi inspektorat daerah dalam audit berkala proyek infrastruktur desa.'),
('1606', 'Kabupaten Musi Banyuasin', 'Kabupaten', 36.40, 'Rawan', 38.00, 35.10, 39.50, -4.80, 275, 2026, 'Audit investigatif menyeluruh terhadap pos belanja modal dan reformasi integritas birokrasi struktural.'),
('1607', 'Kabupaten Banyuasin', 'Kabupaten', 61.75, 'Terawasi', 64.00, 60.20, 63.50, -1.50, 260, 2026, 'Tingkatkan pengawasan distribusi pupuk subsidi dan cegah pungli pada pelayanan kependudukan keliling.'),
('1608', 'Kabupaten Ogan Komering Ulu Selatan', 'Kabupaten', 49.30, 'Waspada', 51.00, 48.20, 50.80, -3.20, 180, 2026, 'Tingkatkan akuntabilitas dana operasional pariwisata dan perkuat peran unit pengendali gratifikasi (UPG).'),
('1609', 'Kabupaten Ogan Komering Ulu Timur', 'Kabupaten', 73.10, 'Terawasi', 76.00, 71.50, 74.20, -0.80, 230, 2026, 'Optimalkan keterbukaan data penyaluran bantuan pertanian dan perluas integrasi SPBE desa.'),
('1610', 'Kabupaten Ogan Ilir', 'Kabupaten', 56.60, 'Waspada', 58.50, 55.20, 58.00, -2.40, 220, 2026, 'Perbaiki akuntabilitas perjalanan dinas ASN dan evaluasi berkala mekanisme rotasi/mutasi pegawai.'),
('1611', 'Kabupaten Empat Lawang', 'Kabupaten', 33.80, 'Rawan', 35.50, 32.80, 36.00, -5.10, 170, 2026, 'Pemberantasan pungutan liar dalam rekrutmen honorer/PPPK dan audit independen proyek jembatan/jalan.'),
('1612', 'Kabupaten Penukal Abab Lematang Ilir (PALI)', 'Kabupaten', 44.20, 'Waspada', 46.80, 42.50, 45.90, -3.80, 165, 2026, 'Tata ulang tata kelola keuangan daerah hasil migas dan publikasikan seluruh kontrak proyek publik.'),
('1613', 'Kabupaten Musi Rawas Utara', 'Kabupaten', 18.90, 'Rentan', 21.00, 17.50, 22.00, -7.50, 150, 2026, 'Intervensi darurat pencegahan korupsi oleh KPK/BPKP, perombakan sistem lelang pengadaan, dan pendampingan audit menyeluruh.'),
('1671', 'Kota Palembang', 'Kota', 82.40, 'Terjaga', 85.00, 80.80, 83.50, -0.50, 450, 2026, 'Pertahankan predikat WTP, perluas ekosistem Smart City anti-suap, dan pengawasan berkala PAD retribusi parkir.'),
('1672', 'Kota Prabumulih', 'Kota', 76.80, 'Terawasi', 79.20, 75.10, 78.00, -0.70, 190, 2026, 'Perkuat integrasi layanan PTSP dengan kanal pengaduan lapor.go.id dan pertahankan kepatuhan integritas gas rumah tangga.'),
('1673', 'Kota Pagar Alam', 'Kota', 81.15, 'Terjaga', 83.50, 79.80, 82.00, -0.60, 180, 2026, 'Lanjutkan kepatuhan tinggi pencegahan gratifikasi dan pertahankan transparansi dana hibah pariwisata.'),
('1674', 'Kota Lubuklinggau', 'Kota', 66.30, 'Terawasi', 68.50, 64.90, 67.20, -1.30, 215, 2026, 'Tingkatkan kualitas respons inspektorat terhadap aduan masyarakat dan perketat audit operasional BUMD.')
ON CONFLICT (kode_wilayah) DO UPDATE SET
  skor_total = EXCLUDED.skor_total,
  kategori_risiko = EXCLUDED.kategori_risiko,
  indikator_internal = EXCLUDED.indikator_internal,
  indikator_eksternal = EXCLUDED.indikator_eksternal,
  indikator_eksper = EXCLUDED.indikator_eksper,
  faktor_koreksi = EXCLUDED.faktor_koreksi,
  rekomendasi_utama = EXCLUDED.rekomendasi_utama,
  updated_at = NOW();
