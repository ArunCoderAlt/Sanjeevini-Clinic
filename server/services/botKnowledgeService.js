const { randomUUID } = require('crypto');
const { getSupabase } = require('../config/supabase');
const logger = require('../utils/logger');
const clinicSeedKnowledge = require('../data/clinicSeedKnowledge');

const BUCKET_NAME = 'rag-documents';

// Stop words to filter out during keyword scoring
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
  'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in',
  'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t',
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s',
  'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
  'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
  'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s',
  'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
  'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

class BotKnowledgeService {
  constructor() {
    this.runtimeDocuments = [];
    this.runtimeChunks = [];
    this.isInitialized = false;
    this._tableNames = null;
    this.indexSeedDocument();
    this.init();
  }

  /**
   * Determine available Supabase tables (rag_documents / bot_documents)
   */
  async getTableNames() {
    if (this._tableNames && this._tableNames.isReady) {
      return this._tableNames;
    }

    try {
      const supabase = getSupabase();
      if (!supabase) {
        return { docTable: 'rag_documents', chunkTable: 'rag_chunks', isReady: false };
      }

      // Check rag_documents first (preferred separate RAG table)
      const { error: ragErr } = await supabase.from('rag_documents').select('id').limit(1);
      if (!ragErr) {
        this._tableNames = { docTable: 'rag_documents', chunkTable: 'rag_chunks', isReady: true };
        return this._tableNames;
      }

      // Fallback: check bot_documents
      const { error: botErr } = await supabase.from('bot_documents').select('id').limit(1);
      if (!botErr) {
        this._tableNames = { docTable: 'bot_documents', chunkTable: 'bot_knowledge_chunks', isReady: true };
        return this._tableNames;
      }
    } catch {
      // Supabase unavailable or table not created yet
    }

    return { docTable: 'rag_documents', chunkTable: 'rag_chunks', isReady: false };
  }

  /**
   * Ensure the Supabase Storage bucket for RAG PDFs exists
   */
  async ensureBucketExists() {
    try {
      const supabase = getSupabase();
      if (!supabase) return false;

      const { data: buckets } = await supabase.storage.listBuckets();
      const hasBucket = buckets && buckets.some(b => b.name === BUCKET_NAME || b.id === BUCKET_NAME);

      if (!hasBucket) {
        const { error } = await supabase.storage.createBucket(BUCKET_NAME, { public: true });
        if (error && !error.message.includes('already exists')) {
          logger.warn(`Could not create ${BUCKET_NAME} storage bucket: ${error.message}`);
          return false;
        }
      }
      return true;
    } catch (err) {
      logger.warn(`Error ensuring ${BUCKET_NAME} bucket exists: ${err.message}`);
      return false;
    }
  }

  /**
   * Initialize knowledge service from Supabase
   */
  async init() {
    try {
      await this.ensureBucketExists();
      const loadedFromSupabase = await this.loadFromSupabase();

      if (!loadedFromSupabase && this.runtimeDocuments.length === 0) {
        this.indexSeedDocument();
      }

      this.isInitialized = true;
      logger.info(
        `BotKnowledgeService initialized: ${this.runtimeDocuments.length} docs, ${this.runtimeChunks.length} chunks (Supabase Storage: ${BUCKET_NAME})`
      );
    } catch (err) {
      logger.error(`Error initializing BotKnowledgeService: ${err.message}`);
    }
  }

  /**
   * Load active documents and chunks from Supabase
   */
  async loadFromSupabase() {
    try {
      const supabase = getSupabase();
      if (!supabase) return false;

      const { docTable, chunkTable, isReady } = await this.getTableNames();
      if (!isReady) return false;

      const { data: docs, error: docErr } = await supabase
        .from(docTable)
        .select('*')
        .order('created_at', { ascending: false });

      if (docErr || !Array.isArray(docs)) {
        return false;
      }

      this.runtimeDocuments = docs;

      // Load chunks for active documents
      const activeIds = docs.filter(d => d.is_active).map(d => d.id);
      if (activeIds.length > 0) {
        const { data: chunks, error: chunkErr } = await supabase
          .from(chunkTable)
          .select('*')
          .in('document_id', activeIds);

        if (!chunkErr && Array.isArray(chunks)) {
          this.runtimeChunks = chunks;
        }
      } else {
        this.runtimeChunks = [];
      }

      return true;
    } catch (err) {
      logger.warn(`Could not load RAG documents from Supabase: ${err.message}`);
      return false;
    }
  }

  /**
   * Built-in fallback clinic guide seed document
   */
  indexSeedDocument() {
    const docId = 'seed-sanjeevini-guide-01';

    this.runtimeDocuments = this.runtimeDocuments.filter(d => d.id !== docId);
    this.runtimeChunks = this.runtimeChunks.filter(c => c.document_id !== docId);

    const seedDoc = {
      id: docId,
      filename: clinicSeedKnowledge.documentName,
      original_name: clinicSeedKnowledge.title,
      file_url: '',
      storage_path: 'seed://clinic-portfolio-guide',
      storage_bucket: BUCKET_NAME,
      file_path: 'seed://clinic-portfolio-guide',
      file_size: 45200,
      page_count: 5,
      chunk_count: clinicSeedKnowledge.sections.length,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const seedChunks = clinicSeedKnowledge.sections.map((sec, idx) => ({
      id: `seed-chunk-${idx + 1}`,
      document_id: docId,
      document_name: clinicSeedKnowledge.documentName,
      chunk_index: idx + 1,
      section_title: sec.title,
      content: `[Section: ${sec.title}]\n${sec.content}`,
      page_number: Math.floor(idx / 2) + 1,
      created_at: new Date().toISOString()
    }));

    this.runtimeDocuments.push(seedDoc);
    this.runtimeChunks.push(...seedChunks);
  }

  restoreSeedDocument() {
    this.indexSeedDocument();
    return this.runtimeDocuments.find(d => d.id === 'seed-sanjeevini-guide-01');
  }

  /**
   * Upload PDF to Supabase Storage and persist metadata and chunks in Supabase separate table
   */
  async addDocument({ filename, originalName, fileBuffer, mimeType, fileSize, pageCount, chunks }) {
    const docId = randomUUID();
    const now = new Date().toISOString();
    const cleanName = (originalName || 'document.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `pdfs/${Date.now()}_${cleanName}`;

    let fileUrl = '';
    let storageSaved = false;

    // 1. Upload raw PDF directly to Supabase Storage bucket
    try {
      const supabase = getSupabase();
      if (supabase && fileBuffer) {
        await this.ensureBucketExists();

        const { error: uploadErr } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileBuffer, {
            contentType: mimeType || 'application/pdf',
            upsert: true
          });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(storagePath);

          if (urlData && urlData.publicUrl) {
            fileUrl = urlData.publicUrl;
            storageSaved = true;
            logger.info(`PDF successfully stored in Supabase Storage (${BUCKET_NAME}): ${fileUrl}`);
          }
        } else {
          logger.warn(`Supabase Storage upload warning: ${uploadErr.message}`);
        }
      }
    } catch (storageErr) {
      logger.warn(`Could not upload PDF to Supabase Storage: ${storageErr.message}`);
    }

    const docRecord = {
      id: docId,
      filename: filename || `${Date.now()}_${cleanName}`,
      original_name: originalName,
      file_url: fileUrl,
      storage_path: storagePath,
      storage_bucket: BUCKET_NAME,
      file_path: storagePath, // for backward compatibility
      file_size: fileSize || 0,
      page_count: pageCount || 1,
      chunk_count: chunks.length,
      is_active: true,
      metadata: {
        storageSaved,
        uploadedAt: now
      },
      created_at: now,
      updated_at: now
    };

    const chunkRecords = chunks.map((c, i) => ({
      id: randomUUID(),
      document_id: docId,
      document_name: originalName || filename,
      chunk_index: c.chunkIndex || i + 1,
      content: c.content,
      page_number: c.pageNumber || 1,
      section_title: c.sectionTitle || '',
      metadata: {
        document_name: originalName,
        file_url: fileUrl,
        page_number: c.pageNumber || 1
      },
      created_at: now
    }));

    // 2. Persist in Supabase separate table
    let dbSaved = false;
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { docTable, chunkTable, isReady } = await this.getTableNames();
        if (isReady) {
          const { error: insertDocErr } = await supabase.from(docTable).insert([docRecord]);
          if (!insertDocErr) {
            // Insert chunks in chunks of 50 to respect payload limits
            for (let i = 0; i < chunkRecords.length; i += 50) {
              const batch = chunkRecords.slice(i, i + 50);
              await supabase.from(chunkTable).insert(batch);
            }
            dbSaved = true;
            logger.info(`Persisted document & chunks to Supabase table "${docTable}"`);
          } else {
            logger.warn(`Supabase table insert error (${docTable}): ${insertDocErr.message}`);
          }
        }
      }
    } catch (dbErr) {
      logger.warn(`Could not insert into Supabase table: ${dbErr.message}`);
    }

    // Update in-memory runtime cache
    this.runtimeDocuments.unshift(docRecord);
    this.runtimeChunks.push(...chunkRecords);

    return {
      document: docRecord,
      chunkCount: chunkRecords.length,
      storageSaved,
      dbSaved
    };
  }

  /**
   * Get all knowledge documents (Supabase is the primary source)
   */
  async getDocuments() {
    try {
      const supabase = getSupabase();
      const { docTable, isReady } = await this.getTableNames();
      if (supabase && isReady) {
        const { data, error } = await supabase
          .from(docTable)
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          this.runtimeDocuments = data;
          return data;
        }
      }
    } catch (err) {
      logger.warn(`Error reading documents from Supabase: ${err.message}`);
    }

    return this.runtimeDocuments;
  }

  /**
   * Delete a document, purge from Supabase Storage and remove from Supabase table
   */
  async deleteDocument(id) {
    if (!id) return { success: false, removed: null };
    const cleanId = decodeURIComponent(String(id).trim());

    // 1. Locate the document to get storage_path
    let targetDoc = this.runtimeDocuments.find(d => 
      String(d.id).trim() === cleanId || 
      String(d.filename).trim() === cleanId ||
      String(d.original_name).trim() === cleanId
    );

    // 2. Remove binary PDF file from Supabase Storage bucket
    try {
      const supabase = getSupabase();
      if (supabase && targetDoc && targetDoc.storage_path && !targetDoc.storage_path.startsWith('seed://')) {
        await supabase.storage.from(BUCKET_NAME).remove([targetDoc.storage_path]);
        logger.info(`Removed PDF "${targetDoc.storage_path}" from Supabase Storage bucket "${BUCKET_NAME}"`);
      }
    } catch (storageDelErr) {
      logger.warn(`Could not delete file from Supabase Storage: ${storageDelErr.message}`);
    }

    // 3. Remove from Supabase Database tables
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { docTable, chunkTable, isReady } = await this.getTableNames();
        if (isReady) {
          await supabase.from(chunkTable).delete().eq('document_id', cleanId);
          await supabase.from(docTable).delete().eq('id', cleanId);
        }
      }
    } catch (dbDelErr) {
      logger.warn(`Could not delete document from Supabase table: ${dbDelErr.message}`);
    }

    // 4. Update runtime cache
    const docIndex = this.runtimeDocuments.findIndex(d => 
      String(d.id).trim() === cleanId || 
      String(d.filename).trim() === cleanId ||
      String(d.original_name).trim() === cleanId
    );

    let removedDoc = null;
    if (docIndex !== -1) {
      removedDoc = this.runtimeDocuments.splice(docIndex, 1)[0];
    } else {
      removedDoc = { id: cleanId, notFoundInStore: true };
    }

    const removedIdentifiers = new Set(
      [cleanId, removedDoc?.id, removedDoc?.filename, removedDoc?.original_name]
        .filter(Boolean)
        .map(s => String(s).trim())
    );

    this.runtimeChunks = this.runtimeChunks.filter(c => 
      !removedIdentifiers.has(String(c.document_id).trim()) &&
      !removedIdentifiers.has(String(c.document_name).trim())
    );

    return {
      success: true,
      removedDocument: removedDoc,
      remainingCount: this.runtimeDocuments.length
    };
  }

  /**
   * Toggle document active state in Supabase
   */
  async toggleDocument(id, isActive) {
    const doc = this.runtimeDocuments.find(d => d.id === id);
    if (!doc) throw new Error('Document not found');

    const newStatus = typeof isActive === 'boolean' ? isActive : !doc.is_active;
    doc.is_active = newStatus;
    doc.updated_at = new Date().toISOString();

    try {
      const supabase = getSupabase();
      if (supabase) {
        const { docTable, isReady } = await this.getTableNames();
        if (isReady) {
          await supabase.from(docTable).update({ is_active: newStatus }).eq('id', id);
        }
      }
    } catch (err) {
      logger.warn(`Could not update document state in Supabase: ${err.message}`);
    }

    return doc;
  }

  /**
   * Search for top relevant chunks matching user query
   * Uses BM25-inspired term frequency + phrase matching
   */
  searchRelevantChunks(query, limit = 5) {
    if (!query || typeof query !== 'string') return [];

    const cleanQuery = query.toLowerCase().replace(/[^\w\s]/g, ' ');
    const queryTerms = cleanQuery
      .split(/\s+/)
      .filter(t => t.length > 1 && !STOP_WORDS.has(t));

    // Get active document IDs
    const activeDocIds = new Set(
      this.runtimeDocuments.filter(d => d.is_active).map(d => d.id)
    );

    const scoredChunks = [];

    for (const chunk of this.runtimeChunks) {
      if (!activeDocIds.has(chunk.document_id)) continue;

      const contentLower = chunk.content.toLowerCase();
      let score = 0;

      // Exact query match bonus
      if (contentLower.includes(cleanQuery.trim())) {
        score += 25;
      }

      // Individual term frequency with density
      for (const term of queryTerms) {
        const matches = (contentLower.match(new RegExp(`\\b${term}`, 'g')) || []).length;
        if (matches > 0) {
          score += matches * 4;
        }
      }

      // Check section title bonus if present
      if (chunk.section_title && cleanQuery.includes(chunk.section_title.toLowerCase())) {
        score += 15;
      }

      if (score > 0) {
        scoredChunks.push({
          ...chunk,
          score
        });
      }
    }

    // Sort descending by score
    scoredChunks.sort((a, b) => b.score - a.score);

    if (scoredChunks.length > 0) {
      return scoredChunks.slice(0, limit);
    }

    // Fallback: return first 3 key overview chunks
    return this.runtimeChunks
      .filter(c => activeDocIds.has(c.document_id))
      .slice(0, 3)
      .map(c => ({ ...c, score: 1 }));
  }

  /**
   * Get overall knowledge status
   */
  getStatus() {
    const activeDocs = this.runtimeDocuments.filter(d => d.is_active);
    const activeDocIds = new Set(activeDocs.map(d => d.id));
    const activeChunks = this.runtimeChunks.filter(c => activeDocIds.has(c.document_id));

    return {
      totalDocuments: this.runtimeDocuments.length,
      activeDocuments: activeDocs.length,
      totalChunks: this.runtimeChunks.length,
      activeChunks: activeChunks.length,
      hasSeedKnowledge: this.runtimeDocuments.some(d => d.id.startsWith('seed-')),
      storage: {
        provider: 'supabase',
        bucket: BUCKET_NAME,
        isLocal: false
      },
      database: {
        provider: 'supabase',
        table: this._tableNames?.docTable || 'rag_documents',
        isReady: Boolean(this._tableNames?.isReady)
      }
    };
  }
}

// Export singleton instance
const botKnowledgeService = new BotKnowledgeService();
module.exports = botKnowledgeService;
