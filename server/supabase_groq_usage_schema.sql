-- ==============================================================================
-- Sanjeevini Siddha & Ayurveda Medical Centre
-- Supabase PostgreSQL Database Schema: Groq Token Usage & Rate Limits
-- Run this script in your Supabase project's SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. Groq Key Tracking Periods Table
CREATE TABLE IF NOT EXISTS public.groq_key_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_version TEXT NOT NULL UNIQUE,
  key_fingerprint TEXT NOT NULL UNIQUE,
  key_hint TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  total_requests INTEGER DEFAULT 0,
  total_input_tokens INTEGER DEFAULT 0,
  total_output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  first_seen_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_used_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup by key fingerprint
CREATE INDEX IF NOT EXISTS idx_groq_key_periods_fingerprint ON public.groq_key_periods (key_fingerprint);
CREATE INDEX IF NOT EXISTS idx_groq_key_periods_is_active ON public.groq_key_periods (is_active);

-- 2. Groq Usage Request Logs Table (Audit trail without storing prompts)
CREATE TABLE IF NOT EXISTS public.groq_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_version TEXT NOT NULL,
  key_fingerprint TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success',
  http_status INTEGER DEFAULT 200,
  usage_source TEXT DEFAULT 'bot_chat',
  rate_limit_info JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for usage logs
CREATE INDEX IF NOT EXISTS idx_groq_usage_logs_key_version ON public.groq_usage_logs (key_version);
CREATE INDEX IF NOT EXISTS idx_groq_usage_logs_created_at ON public.groq_usage_logs (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.groq_key_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groq_usage_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admins full access to Groq usage tables
DROP POLICY IF EXISTS "Authenticated admins full access to groq_key_periods" ON public.groq_key_periods;
CREATE POLICY "Authenticated admins full access to groq_key_periods"
  ON public.groq_key_periods FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated admins full access to groq_usage_logs" ON public.groq_usage_logs;
CREATE POLICY "Authenticated admins full access to groq_usage_logs"
  ON public.groq_usage_logs FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
