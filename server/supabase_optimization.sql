-- ==============================================================================
-- Sanjeevini Siddha & Ayurveda Medical Centre
-- Supabase PostgreSQL Performance & Query Optimization Script
--
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/ushwpznzcrckupbjfyny
-- 2. Go to "SQL Editor" > "New query"
-- 3. Paste this script and click "RUN"
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. COMPOSITE INDEXES FOR FAST QUERYING & SORTING
-- Eliminates sequential table scans, enables Index-Only Scans, and accelerates
-- public queries (is_active = true + ORDER BY order_index / created_at).
-- ------------------------------------------------------------------------------

-- DOCTORS: Fast active doctors retrieval ordered by order_index
CREATE INDEX IF NOT EXISTS idx_doctors_active_order 
  ON public.doctors (is_active, order_index ASC);

-- SERVICES: Fast active services retrieval ordered by order_index
CREATE INDEX IF NOT EXISTS idx_services_active_order 
  ON public.services (is_active, order_index ASC);

-- TREATMENTS: Fast category filter + active status + order_index
CREATE INDEX IF NOT EXISTS idx_treatments_active_category_order 
  ON public.treatments (is_active, category, order_index ASC);

CREATE INDEX IF NOT EXISTS idx_treatments_active_order 
  ON public.treatments (is_active, order_index ASC);

-- GALLERY: Fast media filter by category + active + sorting
CREATE INDEX IF NOT EXISTS idx_gallery_cat_active_order 
  ON public.gallery (category, is_active, order_index ASC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gallery_active_order 
  ON public.gallery (is_active, order_index ASC, created_at DESC);

-- TESTIMONIALS: Fast retrieval of approved & featured patient reviews
CREATE INDEX IF NOT EXISTS idx_testimonials_approved_created 
  ON public.testimonials (is_approved, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_testimonials_featured_approved 
  ON public.testimonials (is_featured, is_approved, created_at DESC);

-- APPOINTMENTS: Admin status filter & chronological sorting
CREATE INDEX IF NOT EXISTS idx_appointments_status_created 
  ON public.appointments (status, created_at DESC);

-- CONTACT MESSAGES: Unread count & chronological sorting
CREATE INDEX IF NOT EXISTS idx_contact_messages_read_created 
  ON public.contact_messages (is_read, created_at DESC);


-- ------------------------------------------------------------------------------
-- 2. INSTAGRAM REELS TABLE & INDEXES (Ensure table and performance indexes exist)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  tag TEXT DEFAULT 'Panchakarma & Siddha',
  video_id TEXT NOT NULL DEFAULT '8oLZSitF20E',
  start_time INTEGER DEFAULT 0,
  thumbnail TEXT DEFAULT '',
  likes TEXT DEFAULT '2.4K',
  views TEXT DEFAULT '18.9K',
  description TEXT DEFAULT '',
  instagram_url TEXT DEFAULT 'https://www.instagram.com/sanjeevinisiddha?rpxt=aWZydDRmMXl3aWg4',
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for newest active reels first (Website Home & Gallery section)
CREATE INDEX IF NOT EXISTS idx_reels_active_created 
  ON public.reels (is_active, created_at DESC);

-- Index for tag filtered reels
CREATE INDEX IF NOT EXISTS idx_reels_tag_active 
  ON public.reels (tag, is_active, created_at DESC);

-- Enable RLS and public policies for reels
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active reels" ON public.reels;
CREATE POLICY "public read active reels" ON public.reels FOR SELECT USING (true);

DROP POLICY IF EXISTS "service_role full access reels" ON public.reels;
CREATE POLICY "service_role full access reels" ON public.reels FOR ALL USING (auth.role() = 'service_role');


-- ------------------------------------------------------------------------------
-- 3. SWARNA BINDU TABLE & PERFORMANCE INDEXES
-- Dedicated table for monthly Pushya Nakshatra camp schedules.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.swarna_bindu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL,
  date TEXT NOT NULL,
  day TEXT NOT NULL,
  nakshatra TEXT DEFAULT 'Pushya (Poosam)',
  timings TEXT DEFAULT 'All Day',
  venue TEXT DEFAULT 'Sanjeevini Medical Centre, Karaikal',
  status TEXT DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Completed', 'Cancelled', 'Rescheduled')),
  notes TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_swarna_bindu_active_date 
  ON public.swarna_bindu (is_active, date ASC, order_index ASC);

ALTER TABLE public.swarna_bindu ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read swarna_bindu" ON public.swarna_bindu;
CREATE POLICY "public read swarna_bindu" ON public.swarna_bindu FOR SELECT USING (true);

DROP POLICY IF EXISTS "service_role full access swarna_bindu" ON public.swarna_bindu;
CREATE POLICY "service_role full access swarna_bindu" ON public.swarna_bindu FOR ALL USING (auth.role() = 'service_role');


-- ------------------------------------------------------------------------------
-- 3.5. GROQ KEY PERIODS & USAGE LOGS TABLES (Token counter persistence)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groq_key_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_version TEXT NOT NULL,
  key_fingerprint TEXT UNIQUE NOT NULL,
  key_hint TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  total_requests INTEGER DEFAULT 0 NOT NULL,
  total_input_tokens INTEGER DEFAULT 0 NOT NULL,
  total_output_tokens INTEGER DEFAULT 0 NOT NULL,
  total_tokens INTEGER DEFAULT 0 NOT NULL,
  first_seen_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_used_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_groq_key_periods_fingerprint ON public.groq_key_periods(key_fingerprint);
CREATE INDEX IF NOT EXISTS idx_groq_key_periods_active ON public.groq_key_periods(is_active);

CREATE TABLE IF NOT EXISTS public.groq_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_version TEXT NOT NULL,
  key_fingerprint TEXT NOT NULL,
  model TEXT DEFAULT 'llama-3.3-70b-versatile',
  input_tokens INTEGER DEFAULT 0 NOT NULL,
  output_tokens INTEGER DEFAULT 0 NOT NULL,
  total_tokens INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'success',
  http_status INTEGER DEFAULT 200,
  usage_source TEXT DEFAULT 'bot_chat',
  rate_limit_info JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_groq_usage_logs_created ON public.groq_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_groq_usage_logs_key_version ON public.groq_usage_logs(key_version);

ALTER TABLE public.groq_key_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groq_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role full access groq_key_periods" ON public.groq_key_periods;
CREATE POLICY "service_role full access groq_key_periods" ON public.groq_key_periods FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role full access groq_usage_logs" ON public.groq_usage_logs;
CREATE POLICY "service_role full access groq_usage_logs" ON public.groq_usage_logs FOR ALL USING (auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- 4. UPDATE POSTGRES STATISTICS (ANALYZE)
-- Ensures the PostgreSQL query optimizer has fresh statistics to immediately
-- select index scans over full table scans for all queries.
-- ------------------------------------------------------------------------------
ANALYZE public.doctors;
ANALYZE public.services;
ANALYZE public.treatments;
ANALYZE public.gallery;
ANALYZE public.testimonials;
ANALYZE public.site_settings;
ANALYZE public.appointments;
ANALYZE public.contact_messages;
ANALYZE public.reels;
ANALYZE public.swarna_bindu;

-- Verification query
SELECT 
  tablename, 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
