-- ==============================================================================
-- Sanjeevini Siddha & Ayurveda Medical Centre
-- Supabase PostgreSQL Database Schema
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically update 'updated_at' column
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 2. DOCTORS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  qualification TEXT NOT NULL,
  specialization TEXT NOT NULL,
  image TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  experience INTEGER DEFAULT 0 NOT NULL,
  languages JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  consultation_hours TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_doctors_updated_at ON public.doctors;
CREATE TRIGGER trg_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 3. SERVICES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  benefits JSONB DEFAULT '[]'::jsonb,
  procedures JSONB DEFAULT '[]'::jsonb,
  gallery JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_services_updated_at ON public.services;
CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 4. TREATMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  conditions JSONB DEFAULT '[]'::jsonb,
  symptoms JSONB DEFAULT '[]'::jsonb,
  approaches JSONB DEFAULT '[]'::jsonb,
  image TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_treatments_updated_at ON public.treatments;
CREATE TRIGGER trg_treatments_updated_at
  BEFORE UPDATE ON public.treatments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 5. APPOINTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  age INTEGER,
  service TEXT NOT NULL,
  preferred_date TEXT DEFAULT '',
  preferred_time TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON public.appointments;
CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 6. CONTACT MESSAGES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER trg_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 7. GALLERY TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image TEXT NOT NULL,
  category TEXT DEFAULT 'clinic' CHECK (category IN ('clinic', 'treatment', 'team', 'event')),
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_gallery_updated_at ON public.gallery;
CREATE TRIGGER trg_gallery_updated_at
  BEFORE UPDATE ON public.gallery
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 8. NEWSLETTERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_newsletters_updated_at ON public.newsletters;
CREATE TRIGGER trg_newsletters_updated_at
  BEFORE UPDATE ON public.newsletters
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 9. SITE SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name TEXT DEFAULT 'Sanjeevini Siddha & Ayurveda Medical Centre',
  address TEXT DEFAULT '123 Temple Street, Karaikal, Puducherry 609602',
  phone TEXT DEFAULT '+91 98400 00000',
  email TEXT DEFAULT 'info@sanjeevinisiddha.in',
  consultation_hours TEXT DEFAULT 'Monday – Saturday, 5:00 PM – 9:30 PM',
  map_url TEXT DEFAULT '',
  map_embed_url TEXT DEFAULT '',
  whatsapp_number TEXT DEFAULT '+919840000000',
  social_links JSONB DEFAULT '{"facebook":"","instagram":"","twitter":"","youtube":""}'::jsonb,
  about_text TEXT DEFAULT 'Providing authentic Siddha and Ayurvedic healthcare tailored to restore balance and vitality.',
  philosophy TEXT DEFAULT 'Treating the root cause through natural and time-tested ancient wisdom.',
  mission_statement TEXT DEFAULT 'To offer accessible, authentic, and compassionate traditional healthcare to all.',
  vision_statement TEXT DEFAULT 'To become a premier centre for holistic traditional medicine and wellness.',
  meta_title TEXT DEFAULT 'Sanjeevini Siddha & Ayurveda Medical Centre | Karaikal',
  meta_description TEXT DEFAULT 'Authentic Siddha and Ayurvedic healthcare services in Karaikal.',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 10. TESTIMONIALS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT DEFAULT '',
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  treatment TEXT DEFAULT '',
  image TEXT DEFAULT '',
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER trg_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_doctors_slug ON public.doctors (slug);
CREATE INDEX IF NOT EXISTS idx_doctors_active ON public.doctors (is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services (slug);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services (is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_treatments_slug ON public.treatments (slug);
CREATE INDEX IF NOT EXISTS idx_treatments_category ON public.treatments (category);
CREATE INDEX IF NOT EXISTS idx_treatments_active ON public.treatments (is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery (category, is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials (is_approved, created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Allow full access to service_role (used by Express backend)
CREATE POLICY "service_role full access users" ON public.users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role full access doctors" ON public.doctors FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role full access services" ON public.services FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role full access treatments" ON public.treatments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role full access appointments" ON public.appointments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role full access contact_messages" ON public.contact_messages FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role full access gallery" ON public.gallery FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role full access newsletters" ON public.newsletters FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role full access site_settings" ON public.site_settings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role full access testimonials" ON public.testimonials FOR ALL USING (auth.role() = 'service_role');

-- Allow public read access to active public records (and public submit for appointments/contacts)
CREATE POLICY "public read doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "public read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "public read treatments" ON public.treatments FOR SELECT USING (true);
CREATE POLICY "public read gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "public read approved testimonials" ON public.testimonials FOR SELECT USING (is_approved = true);

-- Allow public inserts for forms
CREATE POLICY "public insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "public insert contacts" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "public insert newsletters" ON public.newsletters FOR INSERT WITH CHECK (true);
CREATE POLICY "public insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- DEFAULT SEED DATA
-- ==============================================================================

-- 1. Default Admin user (password: admin123 hashed via bcrypt)
INSERT INTO public.users (name, email, password, role)
VALUES (
  'Admin',
  'admin@sanjeevinisiddha.in',
  '$2a$10$0jrs0SQ1AQc2JAgAg9fXcOSgb0Iy0P4LqFpyd9Jwq9iH/kp9pTmBe', -- bcrypt hash for admin123
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- 2. Default Site Settings
INSERT INTO public.site_settings (clinic_name, email, phone)
SELECT 'Sanjeevini Siddha & Ayurveda Medical Centre', 'info@sanjeevinisiddha.in', '+91 98400 00000'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- 3. Default Doctors
INSERT INTO public.doctors (name, slug, qualification, specialization, experience, bio, order_index)
VALUES 
  ('Dr. Thiagarajan Saminadane', 'thiagarajan-saminadane', 'MD (Siddha)', 'Siddha', 20, 'Expert in Siddha diagnostic methods and comprehensive health assessment.', 1),
  ('Dr. Subashini Ganesan', 'subashini-ganesan', 'BAMS (Ayurveda)', 'Ayurveda', 15, 'Expert in Ayurvedic treatments and holistic wellness.', 2)
ON CONFLICT (slug) DO NOTHING;

-- 4. Default Services
INSERT INTO public.services (title, slug, short_description, order_index)
VALUES
  ('Consultation', 'consultation', 'Comprehensive health assessment using Siddha diagnostic methods', 1),
  ('Varmam Therapy', 'varmam-therapy', 'Traditional therapeutic technique targeting vital energy points', 2),
  ('Thokkanam Therapy', 'thokkanam-therapy', 'Traditional Siddha massage therapy for healing', 3),
  ('Wellness Support', 'wellness-support', 'Holistic wellness and preventive care programs', 4)
ON CONFLICT (slug) DO NOTHING;

-- 5. Default Treatments
INSERT INTO public.treatments (name, slug, category, description, order_index)
VALUES
  ('Gastrointestinal Treatments', 'gastrointestinal', 'Gastrointestinal', 'Holistic treatments for Gastrointestinal conditions.', 1),
  ('Dermatology Treatments', 'dermatology', 'Dermatology', 'Holistic treatments for Dermatology conditions.', 2),
  ('Women''s Health Treatments', 'women-s-health', 'Women''s Health', 'Holistic treatments for Women''s Health conditions.', 3),
  ('Kidney Treatments', 'kidney', 'Kidney', 'Holistic treatments for Kidney conditions.', 4),
  ('Musculoskeletal Treatments', 'musculoskeletal', 'Musculoskeletal', 'Holistic treatments for Musculoskeletal conditions.', 5),
  ('Pediatrics Treatments', 'pediatrics', 'Pediatrics', 'Holistic treatments for Pediatrics conditions.', 6),
  ('Respiratory Treatments', 'respiratory', 'Respiratory', 'Holistic treatments for Respiratory conditions.', 7),
  ('Neurology Treatments', 'neurology', 'Neurology', 'Holistic treatments for Neurology conditions.', 8),
  ('Anorectal Treatments', 'anorectal', 'Anorectal', 'Holistic treatments for Anorectal conditions.', 9),
  ('Men''s Health Treatments', 'men-s-health', 'Men''s Health', 'Holistic treatments for Men''s Health conditions.', 10),
  ('Other Treatments', 'other', 'Other', 'Holistic treatments for Other conditions.', 11)
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- 11. SUPABASE STORAGE (CLINIC-MEDIA BUCKET)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-media', 'clinic-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to clinic-media images
DROP POLICY IF EXISTS "Public Access clinic-media" ON storage.objects;
CREATE POLICY "Public Access clinic-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'clinic-media');

-- Allow uploads to clinic-media
DROP POLICY IF EXISTS "Allow Uploads clinic-media" ON storage.objects;
CREATE POLICY "Allow Uploads clinic-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'clinic-media');

-- ==============================================================================
-- 11. SUPABASE STORAGE (CLINIC-MEDIA & RAG-DOCUMENTS BUCKETS)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('clinic-media', 'clinic-media', true),
  ('rag-documents', 'rag-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to clinic-media images
DROP POLICY IF EXISTS "Public Access clinic-media" ON storage.objects;
CREATE POLICY "Public Access clinic-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'clinic-media');

-- Allow uploads to clinic-media
DROP POLICY IF EXISTS "Allow Uploads clinic-media" ON storage.objects;
CREATE POLICY "Allow Uploads clinic-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'clinic-media');

-- Allow public read access to rag-documents
DROP POLICY IF EXISTS "Public Access rag-documents" ON storage.objects;
CREATE POLICY "Public Access rag-documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'rag-documents');

-- Allow uploads to rag-documents
DROP POLICY IF EXISTS "Allow Uploads rag-documents" ON storage.objects;
CREATE POLICY "Allow Uploads rag-documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'rag-documents');

-- Allow delete on rag-documents
DROP POLICY IF EXISTS "Allow Delete rag-documents" ON storage.objects;
CREATE POLICY "Allow Delete rag-documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'rag-documents');

-- ==============================================================================
-- 12. AI CHATBOT KNOWLEDGE BASE & RAG (DOCUMENTS & CHUNKS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'rag-documents',
  file_size INTEGER DEFAULT 0,
  page_count INTEGER DEFAULT 1,
  chunk_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_rag_documents_updated_at ON public.rag_documents;
CREATE TRIGGER trg_rag_documents_updated_at
  BEFORE UPDATE ON public.rag_documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.rag_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.rag_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  page_number INTEGER DEFAULT 1,
  section_title TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc_id ON public.rag_chunks(document_id);

-- Legacy/compatibility bot_documents tables
CREATE TABLE IF NOT EXISTS public.bot_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  storage_path TEXT,
  file_size INTEGER DEFAULT 0,
  page_count INTEGER DEFAULT 1,
  chunk_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_bot_documents_updated_at ON public.bot_documents;
CREATE TRIGGER trg_bot_documents_updated_at
  BEFORE UPDATE ON public.bot_documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS public.bot_knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.bot_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  page_number INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bot_chunks_doc_id ON public.bot_knowledge_chunks(document_id);

