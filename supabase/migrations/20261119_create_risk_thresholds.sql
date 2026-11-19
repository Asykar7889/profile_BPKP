-- ====================================================================
-- MIGRATION: DYNAMIC RISK THRESHOLDS (PENGATURAN TINGKAT RISIKO DINAMIS)
-- Table: risk_thresholds, Idempotent Seeds, & Row Level Security (RLS)
-- ====================================================================

-- 1. CREATE TABLE risk_thresholds
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

-- 2. INDEX FOR FAST ORDERED RETRIEVAL
CREATE INDEX IF NOT EXISTS idx_risk_thresholds_sort_order ON public.risk_thresholds(sort_order ASC);

-- 3. IDEMPOTENT SEED DATA (5 STANDAR RESMI KPK/BPKP TIER)
INSERT INTO public.risk_thresholds (tier_key, label, min_score, max_score, color_hex, sort_order)
VALUES
  ('terjaga', 'Terjaga', 80.00, 100.00, '#15803D', 1),
  ('terawasi', 'Terawasi', 60.00, 79.99, '#4ADE80', 2),
  ('waspada', 'Waspada', 40.00, 59.99, '#FACC15', 3),
  ('rawan', 'Rawan', 20.00, 39.99, '#FB923C', 4),
  ('rentan', 'Rentan', 0.00, 19.99, '#EF4444', 5)
ON CONFLICT (tier_key) DO NOTHING;

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.risk_thresholds ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
-- A. Public & Pegawai: SELECT only
DROP POLICY IF EXISTS "Public and authenticated read risk_thresholds" ON public.risk_thresholds;
CREATE POLICY "Public and authenticated read risk_thresholds"
  ON public.risk_thresholds
  FOR SELECT
  TO public
  USING (true);

-- B. Admin: SELECT and UPDATE based on user_profiles.role = 'admin'
DROP POLICY IF EXISTS "Admin update risk_thresholds" ON public.risk_thresholds;
CREATE POLICY "Admin update risk_thresholds"
  ON public.risk_thresholds
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

-- C. Service Role: Full management
DROP POLICY IF EXISTS "Service role manage risk_thresholds" ON public.risk_thresholds;
CREATE POLICY "Service role manage risk_thresholds"
  ON public.risk_thresholds
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
