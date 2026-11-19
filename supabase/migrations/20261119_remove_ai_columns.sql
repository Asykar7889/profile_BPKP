-- ====================================================================
-- MIGRATION: REMOVE AI COLUMNS & EXPAND MANUAL SURVEY AUDIT TRAIL
-- Project: Dashboard Pemetaan Tingkat Risiko Korupsi (SPI) Sumatera Selatan
-- ====================================================================

-- 1. Hapus kolom-kolom khusus AI dari tabel input_history_logs jika ada
ALTER TABLE public.input_history_logs 
  DROP COLUMN IF EXISTS report_text,
  DROP COLUMN IF EXISTS delta_score,
  DROP COLUMN IF EXISTS category_impact,
  DROP COLUMN IF EXISTS ai_reasoning,
  DROP COLUMN IF EXISTS recommendation;

-- 2. Pastikan kolom-kolom pendukung audit log manual tersedia
ALTER TABLE public.input_history_logs
  ADD COLUMN IF NOT EXISTS pegawai_id TEXT,
  ADD COLUMN IF NOT EXISTS nama_pegawai VARCHAR(100),
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT 'Pembaruan data indikator SPI manual oleh pegawai.',
  ADD COLUMN IF NOT EXISTS old_payload JSONB,
  ADD COLUMN IF NOT EXISTS new_payload JSONB;

-- 3. Pastikan RLS tetap aktif dan aman
ALTER TABLE public.input_history_logs ENABLE ROW LEVEL SECURITY;
