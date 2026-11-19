-- ====================================================================
-- DASHBOARD PEMETAAN TINGKAT RISIKO KORUPSI (SPI) SUMATERA SELATAN
-- BPKP PERWAKILAN PROVINSI SUMATERA SELATAN (17 KABUPATEN / KOTA)
-- PostgreSQL DDL, Row Level Security (RLS), Audit Trail & Seed Data
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE: user_profiles (Multi-Role Authentication: Pegawai vs Admin)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('pegawai', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE: city_surveys (Primary Records for all 17 South Sumatra Regencies/Cities)
CREATE TABLE IF NOT EXISTS public.city_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_code VARCHAR(10) NOT NULL,
  kode_wilayah VARCHAR(10) GENERATED ALWAYS AS (city_code) STORED,
  city_name VARCHAR(100) NOT NULL,
  nama_wilayah VARCHAR(100) GENERATED ALWAYS AS (city_name) STORED,
  tipe_wilayah VARCHAR(20) NOT NULL DEFAULT 'Kabupaten' CHECK (tipe_wilayah IN ('Kabupaten', 'Kota')),
  year INTEGER NOT NULL DEFAULT 2026,
  tahun INTEGER GENERATED ALWAYS AS (year) STORED,
  total_score NUMERIC(5,2) NOT NULL DEFAULT 60.00 CHECK (total_score >= 0.00 AND total_score <= 100.00),
  skor_total NUMERIC(5,2) GENERATED ALWAYS AS (total_score) STORED,
  internal_score NUMERIC(5,2) NOT NULL DEFAULT 62.00 CHECK (internal_score >= 0.00 AND internal_score <= 100.00),
  external_score NUMERIC(5,2) NOT NULL DEFAULT 60.50 CHECK (external_score >= 0.00 AND external_score <= 100.00),
  expert_score NUMERIC(5,2) NOT NULL DEFAULT 59.00 CHECK (expert_score >= 0.00 AND expert_score <= 100.00),
  correction_factor NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (correction_factor >= 0.00 AND correction_factor <= 30.00),
  respondent_count INTEGER NOT NULL DEFAULT 150,
  jumlah_responden INTEGER GENERATED ALWAYS AS (respondent_count) STORED,
  risk_category VARCHAR(30) NOT NULL DEFAULT 'Waspada' CHECK (risk_category IN ('Terjaga', 'Terawasi', 'Waspada', 'Rawan', 'Rentan')),
  kategori_risiko VARCHAR(30) GENERATED ALWAYS AS (risk_category) STORED,
  recommendation TEXT NOT NULL DEFAULT 'Tingkatkan pengawasan dan kepatuhan sistem integritas.',
  rekomendasi_utama TEXT GENERATED ALWAYS AS (recommendation) STORED,
  updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_city_surveys_code_year UNIQUE (city_code, year)
);

-- 4. TABLE: input_history_logs (Survey Audit Trail & Rollback Engine)
CREATE TABLE IF NOT EXISTS public.input_history_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.city_surveys(id) ON DELETE CASCADE,
  city_code VARCHAR(10) NOT NULL,
  kode_wilayah VARCHAR(10) GENERATED ALWAYS AS (city_code) STORED,
  city_name VARCHAR(100) NOT NULL,
  nama_wilayah VARCHAR(100) GENERATED ALWAYS AS (city_name) STORED,
  year INTEGER NOT NULL DEFAULT 2026,
  tahun INTEGER GENERATED ALWAYS AS (year) STORED,
  submitted_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  submitted_by_name VARCHAR(100) NOT NULL DEFAULT 'Pegawai SPI',
  pegawai_id TEXT,
  nama_pegawai VARCHAR(100),
  old_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  skor_lama NUMERIC(5,2) GENERATED ALWAYS AS (old_score) STORED,
  new_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  skor_baru NUMERIC(5,2) GENERATED ALWAYS AS (new_score) STORED,
  kategori_lama VARCHAR(30) DEFAULT 'Waspada',
  kategori_baru VARCHAR(30) DEFAULT 'Waspada',
  notes TEXT DEFAULT 'Pembaruan data indikator SPI manual oleh pegawai.',
  old_payload JSONB,
  new_payload JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'edited', 'reverted')),
  action_type VARCHAR(20) NOT NULL DEFAULT 'UPDATE' CHECK (action_type IN ('CREATE', 'UPDATE', 'EDIT_ADMIN', 'REVERT')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INDEXES FOR HIGH-THROUGHPUT QUERIES
CREATE INDEX IF NOT EXISTS idx_city_surveys_code_year ON public.city_surveys(city_code, year);
CREATE INDEX IF NOT EXISTS idx_city_surveys_score ON public.city_surveys(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_history_logs_city ON public.input_history_logs(city_code, year);
CREATE INDEX IF NOT EXISTS idx_history_logs_created ON public.input_history_logs(created_at DESC);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.input_history_logs ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES
-- A. Public Read Policies
DROP POLICY IF EXISTS "Public Read user_profiles" ON public.user_profiles;
CREATE POLICY "Public Read user_profiles" ON public.user_profiles FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public Read city_surveys" ON public.city_surveys;
CREATE POLICY "Public Read city_surveys" ON public.city_surveys FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public Read input_history_logs" ON public.input_history_logs;
CREATE POLICY "Public Read input_history_logs" ON public.input_history_logs FOR SELECT TO public USING (true);

-- B. Authenticated Pegawai & Admin Write Policies
DROP POLICY IF EXISTS "Authenticated Insert input_history_logs" ON public.input_history_logs;
CREATE POLICY "Authenticated Insert input_history_logs"
  ON public.input_history_logs FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated Update city_surveys" ON public.city_surveys;
CREATE POLICY "Authenticated Update city_surveys"
  ON public.city_surveys FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- C. Service Role / Admin Full Management
DROP POLICY IF EXISTS "Admin All user_profiles" ON public.user_profiles;
CREATE POLICY "Admin All user_profiles" ON public.user_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All city_surveys" ON public.city_surveys;
CREATE POLICY "Admin All city_surveys" ON public.city_surveys FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All input_history_logs" ON public.input_history_logs;
CREATE POLICY "Admin All input_history_logs" ON public.input_history_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ====================================================================
-- 8. COMPLETE SEED DATA: 17 KABUPATEN / KOTA SUMATERA SELATAN (2026)
-- ====================================================================
INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin.bpkp@sumselprov.go.id', 'Ir. Bambang Irawan, M.Si (Admin BPKP)', 'admin'),
  ('a0000000-0000-0000-0000-000000000002', 'pegawai.spi@sumselprov.go.id', 'Ahmad Fauzi, S.E. (Verifikator Lapangan)', 'pegawai')
ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

INSERT INTO public.city_surveys (
  city_code, city_name, tipe_wilayah, year, total_score,
  internal_score, external_score, expert_score, correction_factor,
  respondent_count, risk_category, recommendation
) VALUES
  ('1601', 'Kabupaten Ogan Komering Ulu', 'Kabupaten', 2026, 68.42, 69.10, 68.20, 68.00, 0.00, 142, 'Terawasi', 'Pertahankan integritas layanan perizinan dan digitalisasi pengadaan barang dan jasa.'),
  ('1602', 'Kabupaten Ogan Komering Ilir', 'Kabupaten', 2026, 52.80, 54.00, 53.20, 51.50, 0.50, 168, 'Waspada', 'Perketat pengawasan penyaluran bansos pertanian dan cegah pungutan liar di tingkat desa.'),
  ('1603', 'Kabupaten Muara Enim', 'Kabupaten', 2026, 44.15, 45.30, 44.00, 43.50, 1.00, 195, 'Waspada', 'Audit menyeluruh perizinan tambang galian C dan belanja modal infrastruktur APBD.'),
  ('1604', 'Kabupaten Lahat', 'Kabupaten', 2026, 58.90, 60.10, 58.70, 57.80, 0.20, 150, 'Waspada', 'Tingkatkan transparansi seleksi jabatan ASN dan efektivitas unit pengendalian gratifikasi.'),
  ('1605', 'Kabupaten Musi Rawas', 'Kabupaten', 2026, 49.30, 50.20, 49.00, 48.50, 0.80, 138, 'Waspada', 'Optimalisasi e-katalog lokal dan perbaiki tindak lanjut rekomendasi BPKP atas dana desa.'),
  ('1606', 'Kabupaten Musi Banyuasin', 'Kabupaten', 2026, 38.65, 39.50, 38.80, 37.60, 2.50, 210, 'Rawan', 'Asistensi intensif KPK/BPKP pada PBJ dinas PU dan perketat mutasi serta promosi ASN.'),
  ('1607', 'Kabupaten Banyuasin', 'Kabupaten', 2026, 63.75, 64.80, 63.50, 62.80, 0.00, 175, 'Terawasi', 'Perkuat kanal aduan whistleblowing system masyarakat di wilayah perairan/pesisir.'),
  ('1608', 'Kabupaten Ogan Komering Ulu Timur', 'Kabupaten', 2026, 71.20, 72.00, 71.50, 70.00, 0.00, 155, 'Terawasi', 'Tingkatkan akuntabilitas tata kelola subsidi pupuk dan digitalisasi layanan publik desa.'),
  ('1609', 'Kabupaten Ogan Komering Ulu Selatan', 'Kabupaten', 2026, 55.40, 56.20, 55.00, 54.80, 0.50, 130, 'Waspada', 'Perbaiki keterbukaan informasi publik terkait dokumen lelang proyek strategis daerah.'),
  ('1610', 'Kabupaten Ogan Ilir', 'Kabupaten', 2026, 57.10, 58.00, 57.20, 56.00, 0.30, 160, 'Waspada', 'Penertiban aset daerah dan pengetatan verifikasi SPJ perjalanan dinas OPD.'),
  ('1611', 'Kabupaten Empat Lawang', 'Kabupaten', 2026, 31.80, 32.50, 31.80, 31.00, 3.00, 125, 'Rawan', 'Perombakan tata kelola birokrasi, pengetatan penerimaan honorer, dan audit investigatif PBJ.'),
  ('1612', 'Kabupaten Penukal Abab Lematang Ilir', 'Kabupaten', 2026, 47.95, 48.80, 47.50, 47.20, 1.20, 140, 'Waspada', 'Percepat integrasi sistem keuangan daerah dengan CMS bank dan perketat pengawasan dana BOS.'),
  ('1613', 'Kabupaten Musi Rawas Utara', 'Kabupaten', 2026, 18.40, 19.20, 18.50, 17.50, 5.00, 115, 'Rentan', 'Intervensi khusus BPKP/KPK: pengawalan menyeluruh PBJ, mutasi jabatan, dan pendampingan APIP.'),
  ('1671', 'Kota Palembang', 'Kabupaten', 2026, 78.85, 79.50, 79.00, 78.00, 0.00, 320, 'Terawasi', 'Wajib mempertahankan integritas PTSP dan memperluas digitalisasi pajak/retribusi daerah.'),
  ('1672', 'Kota Pagar Alam', 'Kota', 2026, 81.60, 82.50, 81.80, 80.50, 0.00, 135, 'Terjaga', 'Jadikan percontohan integritas pelayanan publik dan budaya kerja birokrasi anti gratifikasi.'),
  ('1673', 'Kota Lubuklinggau', 'Kota', 2026, 73.50, 74.20, 73.80, 72.50, 0.00, 165, 'Terawasi', 'Tingkatkan keterbukaan data anggaran per OPD dan kepatuhan penyampaian LHKPN tepat waktu.'),
  ('1674', 'Kota Prabumulih', 'Kota', 2026, 83.25, 84.00, 83.50, 82.20, 0.00, 145, 'Terjaga', 'Pertahankan kepatuhan LHKPN 100% dan transparansi rekrutmen pegawai BUMD/BLUD.')
ON CONFLICT (city_code, year) DO UPDATE SET
  total_score = EXCLUDED.total_score,
  internal_score = EXCLUDED.internal_score,
  external_score = EXCLUDED.external_score,
  expert_score = EXCLUDED.expert_score,
  risk_category = EXCLUDED.risk_category,
  recommendation = EXCLUDED.recommendation,
  updated_at = NOW();

-- 9. SEED INITIAL AUDIT LOGS
INSERT INTO public.input_history_logs (
  city_code, city_name, year, submitted_by_name, nama_pegawai,
  old_score, new_score, kategori_lama, kategori_baru, notes, status, action_type
) VALUES
  ('1607', 'Kabupaten Banyuasin', 2026, 'Ahmad Fauzi, S.E. (Verifikator)', 'Ahmad Fauzi, S.E.', 61.25, 63.75, 'Terawasi', 'Terawasi', 'Pembaruan data indikator SPI manual oleh pegawai.', 'applied', 'UPDATE'),
  ('1671', 'Kota Palembang', 2026, 'Ahmad Fauzi, S.E. (Verifikator)', 'Ahmad Fauzi, S.E.', 76.85, 78.85, 'Terawasi', 'Terawasi', 'Pembaruan data indikator SPI manual oleh pegawai.', 'applied', 'UPDATE'),
  ('1613', 'Kabupaten Musi Rawas Utara', 2026, 'Ahmad Fauzi, S.E. (Verifikator)', 'Ahmad Fauzi, S.E.', 23.40, 18.40, 'Rawan', 'Rentan', 'Pembaruan data indikator SPI manual oleh pegawai.', 'applied', 'UPDATE')
ON CONFLICT DO NOTHING;

-- ====================================================================
-- 10. TABLE & SEED: risk_thresholds (Pengaturan Tingkat Risiko Dinamis)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.risk_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_key TEXT UNIQUE NOT NULL CHECK (tier_key IN ('terjaga', 'terawasi', 'waspada', 'rawan', 'rentan')),
  label TEXT NOT NULL,
  min_score NUMERIC(5,2) NOT NULL,
  max_score NUMERIC(5,2) NOT NULL,
  color_hex TEXT NOT NULL,
  sort_order INTEGER NOT NULL UNIQUE CHECK (sort_order BETWEEN 1 AND 5),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  CONSTRAINT chk_score_range CHECK (min_score >= 0.00 AND max_score <= 100.00 AND min_score <= max_score)
);

CREATE INDEX IF NOT EXISTS idx_risk_thresholds_sort_order ON public.risk_thresholds(sort_order ASC);
ALTER TABLE public.risk_thresholds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and authenticated read risk_thresholds" ON public.risk_thresholds;
CREATE POLICY "Public and authenticated read risk_thresholds" ON public.risk_thresholds FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin update risk_thresholds" ON public.risk_thresholds;
CREATE POLICY "Admin update risk_thresholds" ON public.risk_thresholds
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.auth_user_id = auth.uid() AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.auth_user_id = auth.uid() AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role manage risk_thresholds" ON public.risk_thresholds;
CREATE POLICY "Service role manage risk_thresholds" ON public.risk_thresholds FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO public.risk_thresholds (tier_key, label, min_score, max_score, color_hex, sort_order)
VALUES
  ('terjaga', 'Terjaga', 80.00, 100.00, '#15803D', 1),
  ('terawasi', 'Terawasi', 60.00, 79.99, '#4ADE80', 2),
  ('waspada', 'Waspada', 40.00, 59.99, '#FACC15', 3),
  ('rawan', 'Rawan', 20.00, 39.99, '#FB923C', 4),
  ('rentan', 'Rentan', 0.00, 19.99, '#EF4444', 5)
ON CONFLICT (tier_key) DO NOTHING;

