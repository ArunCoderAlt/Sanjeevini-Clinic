-- ==============================================================================
-- SANJEEVINI SIDDHA & AYURVEDA MEDICAL CENTRE
-- SUPABASE RAG PDF STORAGE & KNOWLEDGE BASE SCHEMA
-- ==============================================================================

-- 1. Ensure Supabase Storage Bucket for RAG PDFs exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('rag-documents', 'rag-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy: Public Read for RAG documents
DROP POLICY IF EXISTS "Public Access rag-documents" ON storage.objects;
CREATE POLICY "Public Access rag-documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'rag-documents');

-- Storage Policy: Upload access for service role and authenticated users
DROP POLICY IF EXISTS "Allow Uploads rag-documents" ON storage.objects;
CREATE POLICY "Allow Uploads rag-documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'rag-documents');

-- Storage Policy: Delete access
DROP POLICY IF EXISTS "Allow Delete rag-documents" ON storage.objects;
CREATE POLICY "Allow Delete rag-documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'rag-documents');

-- ==============================================================================
-- 2. Dedicated Table for RAG Documents (Supabase Cloud Storage - Not Local)
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

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rag_documents_updated_at ON public.rag_documents;
CREATE TRIGGER trg_rag_documents_updated_at
  BEFORE UPDATE ON public.rag_documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 3. Dedicated Table for RAG Knowledge Chunks
-- ==============================================================================
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

-- ==============================================================================
-- 4. Compatibility Aliases (bot_documents & bot_knowledge_chunks)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bot_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  storage_path TEXT,
  storage_bucket TEXT DEFAULT 'rag-documents',
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
