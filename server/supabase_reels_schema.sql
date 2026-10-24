-- ==============================================================================
-- Sanjeevini Siddha & Ayurveda Medical Centre
-- Supabase PostgreSQL Database Schema: Instagram Reels Table
-- Run this script in your Supabase project's SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

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

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trg_reels_updated_at ON public.reels;
CREATE TRIGGER trg_reels_updated_at
  BEFORE UPDATE ON public.reels
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

-- Public can view active reels
DROP POLICY IF EXISTS "Public can view active reels" ON public.reels;
CREATE POLICY "Public can view active reels"
  ON public.reels FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to manage reels
DROP POLICY IF EXISTS "Authenticated users full access to reels" ON public.reels;
CREATE POLICY "Authenticated users full access to reels"
  ON public.reels FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
