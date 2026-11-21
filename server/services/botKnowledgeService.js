const { randomUUID } = require('crypto');
const { getSupabase } = require('../config/supabase');
const logger = require('../utils/logger');
const clinicSeedKnowledge = require('../data/clinicSeedKnowledge');

const BUCKET_NAME = 'rag-documents';

// The built-in seed guide's admin state (active / inactive / deleted) is stored as a marker row in the
// documents table so it survives server restarts. The marker has no chunks and is never shown in lists.
const SEED_DOC_ID = 'seed-sanjeevini-guide-01';
const SEED_MARKER_ID = '5eed0000-0000-4000-8000-000000000001';
const SEED_STORAGE_PATH = 'seed://clinic-portfolio-guide';
const SEED_STATE_PREFIX = '__seed_state__:';
const CHUNK_PAGE_SIZE = 1000; // PostgREST returns at most 1000 rows per request by default
const INIT_WAIT_MS = 8000;
const RELOAD_RETRY_MS = 60 * 1000;

function safeGetSupabase() {
  try {
    return getSupabase();
  } catch {
    return null; // Supabase not configured
  }
}

function isSeedMarker(doc) {
  return Boolean(doc) && (
    doc.id === SEED_MARKER_ID ||
    String(doc.filename || '').startsWith(SEED_STATE_PREFIX)
  );
}

function seedStateFromMarker(marker) {
  const state = String(marker.filename || '').slice(SEED_STATE_PREFIX.length);
  if (state === 'deleted' || state === 'inactive' || state === 'active') return state;
  return marker.is_active === false ? 'inactive' : 'active';
}

// Stop words to filter out during keyword scoring (English)
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

// Tamil grammatical particles (excluding informative question words like எங்கு, நேரம், முகவரி)
const TAMIL_STOP_WORDS = new Set([
  'ஒரு', 'மற்றும்', 'இந்த', 'அந்த', 'இருந்து', 'உள்ள', 'செய்ய', 'பற்றி',
  'எனக்கு', 'உங்களுக்கு', 'வேண்டும்', 'முடியுமா', 'இருக்கு', 'இருக்கும்', 'ஆகுமா', 'கூறும்'
]);

// Cross-lingual bilingual dictionary for clinic & healthcare queries (Tamil <-> English)
const BILINGUAL_CLINIC_TERMS = {
  // Clinic, Hospital, Location, Doctor, Timings
  'மருத்துவமனை': ['hospital', 'clinic', 'sanjeevini', 'centre', 'center', 'location', 'karaikal'],
  'மருத்துவ': ['hospital', 'clinic', 'medical', 'medicine'],
  'ஆஸ்பத்திரி': ['hospital', 'clinic'],
  'அமைந்துள்ளது': ['located', 'location', 'address', 'situated', 'karaikal'],
  'எங்கு': ['where', 'location', 'address', 'located', 'situated', 'place', 'karaikal'],
  'முகவரி': ['address', 'location', 'karaikal', 'ambedkar'],
  'இடம்': ['location', 'address', 'karaikal', 'situated'],
  'நேரம்': ['timing', 'timings', 'hours', 'consultation'],
  'நேரங்கள்': ['timing', 'timings', 'hours', 'consultation'],
  'எப்போது': ['timing', 'timings', 'when', 'hours', 'open'],
  'மணி': ['pm', 'am', 'hours', 'time'],
  'மருத்துவர்': ['doctor', 'doctors', 'physician', 'dr', 'thiagarajan', 'subashini'],
  'மருத்துவர்கள்': ['doctor', 'doctors', 'physicians'],
  'டாக்டர்': ['doctor', 'dr'],
  'காரைக்கால்': ['karaikal'],
  'போன்': ['phone', 'contact', 'call'],
  'தொடர்பு': ['contact', 'phone', 'call', 'whatsapp'],
  'வாட்ஸ்அப்': ['whatsapp'],
  'முன்பதிவு': ['appointment', 'consultation', 'booking'],
  'கட்டணம்': ['fee', 'fees', 'cost', 'price', 'charges'],
  'விலை': ['cost', 'price', 'fee'],

  // Therapies & Diagnostics
  'வர்மம்': ['varmam', 'vital', 'pressure'],
  'வர்ம': ['varmam', 'vital'],
  'தொக்கணாம்': ['thokkanam', 'massage', 'manipulation'],
  'நாடி': ['nadi', 'pulse', 'diagnosis'],
  'பரிசோதனை': ['diagnosis', 'examination'],
  'சுவர்ண': ['swarna', 'bindu', 'drops', 'gold'],
  'பிந்து': ['bindu', 'prashana', 'drops'],
  'டிராப்ஸ்': ['drops', 'swarna', 'bindu'],
  'அமிர்த': ['amirtham', 'swarna', 'bindu', 'drops', 'pediatric'],
  'கனக': ['kanaka', 'swarna', 'gold', 'bindu', 'drops'],
  'புஷ்ய': ['pushya', 'nakshatra'],
  'பஞ்சகர்மா': ['panchakarma'],
  'பத்தியம்': ['diet', 'pathya', 'food'],

  // Diseases & Conditions
  'சிகிச்சை': ['treatment', 'treatments', 'therapy', 'therapies', 'care'],
  'சிகிச்சைகள்': ['treatment', 'treatments', 'therapies'],
  'மருந்து': ['medicine', 'medicines', 'herbal', 'kashayam', 'choornam', 'thailam'],
  'மருந்துகள்': ['medicines', 'herbal', 'formulations'],
  'வலி': ['pain', 'ache', 'arthritis', 'spondylosis', 'sciatica'],
  'மூட்டு': ['joint', 'arthritis', 'knee'],
  'முதுகு': ['back', 'lumbar', 'spine', 'disc'],
  'தோல்': ['skin', 'psoriasis', 'eczema', 'dermatology'],
  'சொரியாசிஸ்': ['psoriasis'],
  'ஆஸ்துமா': ['asthma', 'respiratory', 'wheezing', 'sinusitis'],
  'சளி': ['cold', 'sinus', 'cough', 'respiratory'],
  'வயிறு': ['stomach', 'ulcer', 'gastric', 'gerd', 'acidity'],
  'செரிமானம்': ['digestion', 'indigestion'],
  'பெண்கள்': ['women', 'pcod', 'pcos', 'menstrual', 'hormonal'],
  'குழந்தைகள்': ['pediatric', 'children', 'infant', 'immunity']
};

/**
 * Format document record for Supabase insertion depending on target table schema
 */
function prepareDocPayload(docTable, docData) {
  if (docTable === 'rag_documents') {
    return {
      id: docData.id,
      filename: docData.filename,
      original_name: docData.original_name,
      file_url: docData.file_url || '',
      storage_path: docData.storage_path,
      storage_bucket: docData.storage_bucket || BUCKET_NAME,
      file_size: docData.file_size || 0,
      page_count: docData.page_count || 1,
      chunk_count: docData.chunk_count || 0,
      is_active: docData.is_active !== undefined ? docData.is_active : true,
      metadata: docData.metadata || {},
      created_at: docData.created_at,
      updated_at: docData.updated_at
    };
  }

  // bot_documents fallback schema (requires file_path)
  return {
    id: docData.id,
    filename: docData.filename,
    original_name: docData.original_name,
    file_path: docData.storage_path || docData.file_path || '',
    file_url: docData.file_url || '',
    storage_path: docData.storage_path || '',
    storage_bucket: docData.storage_bucket || BUCKET_NAME,
    file_size: docData.file_size || 0,
    page_count: docData.page_count || 1,
    chunk_count: docData.chunk_count || 0,
    is_active: docData.is_active !== undefined ? docData.is_active : true,
    created_at: docData.created_at,
    updated_at: docData.updated_at
  };
}

/**
 * Format chunk records for Supabase insertion depending on target table schema
 */
function prepareChunkPayload(chunkTable, chunkData) {
  if (chunkTable === 'rag_chunks') {
    return {
      id: chunkData.id,
      document_id: chunkData.document_id,
      chunk_index: chunkData.chunk_index,
      content: chunkData.content,
      page_number: chunkData.page_number || 1,
      section_title: chunkData.section_title || '',
      metadata: chunkData.metadata || {},
      created_at: chunkData.created_at
    };
  }

  // bot_knowledge_chunks fallback schema (no section_title column)
  return {
    id: chunkData.id,
    document_id: chunkData.document_id,
    chunk_index: chunkData.chunk_index,
    content: chunkData.content,
    page_number: chunkData.page_number || 1,
    metadata: chunkData.metadata || {},
    created_at: chunkData.created_at
  };
}

/**
 * Insert into Supabase table with automatic schema mismatch column stripping & retry
 */
async function insertWithSchemaRetry(supabase, table, payload) {
  let items = Array.isArray(payload) ? payload.map(p => ({ ...p })) : [{ ...payload }];
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await supabase.from(table).insert(items);
    if (!error) return { data, error: null };

    // PostgREST error: "Could not find the 'xyz' column of 'table' in the schema cache"
    const colMatch = error.message && error.message.match(/Could not find the '([^']+)' column/);
    if (colMatch && colMatch[1]) {
      const badCol = colMatch[1];
      logger.warn(`Removing unmapped column "${badCol}" from ${table} insert payload and retrying...`);
      items = items.map(item => {
        const copy = { ...item };
        delete copy[badCol];
        return copy;
      });
      continue;
    }
    return { data: null, error };
  }
  return { data: null, error: new Error(`Failed to insert into ${table} after schema retries`) };
}

class BotKnowledgeService {
  constructor() {
    this.runtimeDocuments = [];
    this.runtimeChunks = [];
    this.isInitialized = false;
    this._tableNames = null;
    this._seedExplicitlyDeleted = false;

    // Bind methods to preserve `this` context
    this.searchRelevantChunks = this.searchRelevantChunks.bind(this);
    this.addDocument = this.addDocument.bind(this);
    this.getDocuments = this.getDocuments.bind(this);
    this.deleteDocument = this.deleteDocument.bind(this);
    this.toggleDocument = this.toggleDocument.bind(this);
    this.getStatus = this.getStatus.bind(this);
    this.restoreSeedDocument = this.restoreSeedDocument.bind(this);
    this.ensureInitialized = this.ensureInitialized.bind(this);

    this.indexSeedDocument();
    this.initPromise = this.init();
  }

  /**
   * Wait for initial asynchronous loading of documents & chunks from Supabase
   */
  async ensureInitialized() {
    if (this.initPromise) {
      // Don't let a slow / unreachable database hang patient chat requests
      await Promise.race([
        this.initPromise,
        new Promise((resolve) => setTimeout(resolve, INIT_WAIT_MS))
      ]);
    }

    // If the knowledge base could not be loaded from Supabase (e.g. DB asleep at boot), retry in the background
    if (!this._loadedFromDb && !this._reloading && safeGetSupabase() &&
        Date.now() - (this._lastLoadAttempt || 0) > RELOAD_RETRY_MS) {
      this._reloading = true;
      this.initPromise = this.init().finally(() => { this._reloading = false; });
    }
    return this.isInitialized;
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

      // Only fall back to the legacy tables when rag_documents genuinely does not exist.
      // A transient error (database waking up, timeout) must not permanently switch tables.
      const missingTable = ['42P01', 'PGRST205', 'PGRST202'].includes(ragErr.code) ||
        /does not exist|could not find the table/i.test(ragErr.message || '');
      if (!missingTable) {
        return { docTable: 'rag_documents', chunkTable: 'rag_chunks', isReady: false };
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

      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      // If network is offline or sandboxed, do not attempt to recreate bucket
      if (listError) {
        if (listError.message && (listError.message.includes('fetch failed') || listError.message.includes('ENOTFOUND'))) {
          logger.warn(`Supabase Storage check deferred (network offline or sandboxed). Existing bucket "${BUCKET_NAME}" will be used when online.`);
          return false;
        }
        logger.warn(`Could not list storage buckets: ${listError.message}`);
        return false;
      }

      const hasBucket = buckets && buckets.some(b => b.name === BUCKET_NAME || b.id === BUCKET_NAME);

      if (!hasBucket) {
        const { error } = await supabase.storage.createBucket(BUCKET_NAME, { public: true });
        if (error && !error.message.includes('already exists') && !error.message.includes('Duplicate')) {
          logger.warn(`Could not create ${BUCKET_NAME} storage bucket: ${error.message}`);
          return false;
        }
      }
      return true;
    } catch (err) {
      if (err.message && (err.message.includes('fetch failed') || err.message.includes('ENOTFOUND'))) {
        logger.warn(`Supabase Storage check deferred (network offline or sandboxed). Existing bucket "${BUCKET_NAME}" will be used when online.`);
      } else {
        logger.warn(`Error ensuring ${BUCKET_NAME} bucket exists: ${err.message}`);
      }
      return false;
    }
  }

  /**
   * Initialize knowledge service from Supabase
   */
  async init() {
    this._lastLoadAttempt = Date.now();
    try {
      // Note: do not gate this on the model-layer health probe — at boot that probe has not finished yet,
      // which previously caused uploaded PDFs to never be loaded after a restart.
      const supabase = safeGetSupabase();
      if (supabase) {
        await this.ensureBucketExists();
        this._loadedFromDb = await this.loadFromSupabase();
        if (this._loadedFromDb) {
          await this.recoverStoragePdfs();
        }
      }

      // ALWAYS ensure clinic has at least the seed document if no docs exist
      if (this.runtimeDocuments.length === 0 && !this._seedExplicitlyDeleted) {
        this.indexSeedDocument();
      }

      logger.info(
        `BotKnowledgeService initialized: ${this.runtimeDocuments.length} docs, ${this.runtimeChunks.length} chunks ` +
        `(source: ${this._loadedFromDb ? `Supabase table + Storage ${BUCKET_NAME}` : 'built-in seed / memory only'})`
      );
    } catch (err) {
      logger.error(`Error initializing BotKnowledgeService: ${err.message}`);
    } finally {
      this.isInitialized = true;
    }
  }

  /**
   * Apply the persisted admin state of the built-in seed guide
   */
  applySeedState(state) {
    if (state === 'deleted') {
      this._seedExplicitlyDeleted = true;
      this.runtimeDocuments = this.runtimeDocuments.filter(d => d.id !== SEED_DOC_ID);
      this.runtimeChunks = this.runtimeChunks.filter(c => c.document_id !== SEED_DOC_ID);
      return;
    }
    this._seedExplicitlyDeleted = false;
    let seed = this.runtimeDocuments.find(d => d.id === SEED_DOC_ID);
    if (!seed) {
      this.indexSeedDocument();
      seed = this.runtimeDocuments.find(d => d.id === SEED_DOC_ID);
    }
    seed.is_active = state !== 'inactive';
  }

  /**
   * Persist the seed guide state (active / inactive / deleted) to the documents table
   */
  async persistSeedState(state) {
    const supabase = safeGetSupabase();
    if (!supabase) return false;
    try {
      const { docTable, isReady } = await this.getTableNames();
      if (!isReady) return false;
      const now = new Date().toISOString();
      const payload = prepareDocPayload(docTable, {
        id: SEED_MARKER_ID,
        filename: `${SEED_STATE_PREFIX}${state}`,
        original_name: clinicSeedKnowledge.title || 'Clinic Guide',
        file_url: '',
        storage_path: SEED_STORAGE_PATH,
        storage_bucket: BUCKET_NAME,
        file_size: 0,
        page_count: 0,
        chunk_count: 0,
        is_active: state === 'active',
        metadata: { seedMarker: true, state },
        created_at: now,
        updated_at: now
      });
      const { error } = await supabase.from(docTable).upsert(payload, { onConflict: 'id' });
      if (error) {
        logger.warn(`Could not persist seed guide state: ${error.message}`);
        return false;
      }
      return true;
    } catch (err) {
      logger.warn(`Could not persist seed guide state: ${err.message}`);
      return false;
    }
  }

  /**
   * Fetch all chunks for the given documents, paging past the PostgREST 1000-row limit
   */
  async fetchChunks(supabase, chunkTable, docIds) {
    const all = [];
    if (!docIds || docIds.length === 0) return all;
    for (let from = 0; ; from += CHUNK_PAGE_SIZE) {
      const { data, error } = await supabase
        .from(chunkTable)
        .select('*')
        .in('document_id', docIds)
        .order('document_id', { ascending: true })
        .order('chunk_index', { ascending: true })
        .range(from, from + CHUNK_PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      if (!Array.isArray(data) || data.length === 0) break;
      all.push(...data);
      if (data.length < CHUNK_PAGE_SIZE) break;
    }
    return all;
  }

  /**
   * Load active documents and chunks from Supabase
   */
  async loadFromSupabase() {
    try {
      const supabase = safeGetSupabase();
      if (!supabase) return false;

      const { docTable, chunkTable, isReady } = await this.getTableNames();
      if (!isReady) return false;

      const { data: rows, error: docErr } = await supabase
        .from(docTable)
        .select('*')
        .order('created_at', { ascending: false });

      if (docErr || !Array.isArray(rows)) {
        return false;
      }

      // Apply the persisted seed-guide state and keep the marker row out of the document list
      const marker = rows.find(isSeedMarker);
      const docs = rows.filter(d => !isSeedMarker(d));
      if (marker) {
        this.applySeedState(seedStateFromMarker(marker));
      } else if (!this._seedExplicitlyDeleted && !this.runtimeDocuments.some(d => d.id === SEED_DOC_ID)) {
        this.indexSeedDocument();
      }

      const seedDoc = this.runtimeDocuments.find(d => d.id === SEED_DOC_ID);
      const seedChunks = this.runtimeChunks.filter(c => c.document_id === SEED_DOC_ID);

      // Preserve any in-memory runtime custom documents that are not in Supabase (memory-only mode)
      const runtimeCustomDocs = this.runtimeDocuments.filter(
        rd => rd.id !== SEED_DOC_ID && !docs.some(d => d.id === rd.id)
      );
      const runtimeCustomDocIds = new Set(runtimeCustomDocs.map(d => d.id));
      const preservedRuntimeChunks = this.runtimeChunks.filter(c => runtimeCustomDocIds.has(c.document_id));

      // Load chunks for ALL database documents (inactive ones too) so re-activating a document works
      // immediately; search only uses chunks of active documents.
      const docMap = new Map(docs.map(d => [d.id, d]));
      const rawChunks = await this.fetchChunks(supabase, chunkTable, docs.map(d => d.id));
      const loadedChunks = rawChunks.map(c => ({
        ...c,
        document_name: c.document_name || c.metadata?.document_name || docMap.get(c.document_id)?.original_name || 'Clinic Document'
      }));

      const mergedDocs = [...docs, ...runtimeCustomDocs];
      if (seedDoc) mergedDocs.push(seedDoc);

      this.runtimeDocuments = mergedDocs;
      this.runtimeChunks = [...loadedChunks, ...preservedRuntimeChunks, ...seedChunks];
      return true;
    } catch (err) {
      logger.warn(`Could not load RAG documents from Supabase: ${err.message}`);
      return false;
    }
  }

  /**
   * Scan Supabase Storage (rag-documents/pdfs) and auto-index any PDFs that
   * were uploaded to cloud storage but didn't make it into database tables.
   */
  async recoverStoragePdfs() {
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      const { docTable, chunkTable, isReady } = await this.getTableNames();
      if (!isReady) return;

      const { data: storageFiles, error: listErr } = await supabase.storage
        .from(BUCKET_NAME)
        .list('pdfs', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (listErr || !Array.isArray(storageFiles) || storageFiles.length === 0) {
        return;
      }

      // Check which storage files are already in runtimeDocuments
      const existingPaths = new Set(
        this.runtimeDocuments.map(d => (d.storage_path || '').replace(/^pdfs\//, ''))
      );

      for (const sFile of storageFiles) {
        if (!sFile.name || !sFile.name.toLowerCase().endsWith('.pdf')) continue;
        if (existingPaths.has(sFile.name)) continue;

        const fullStoragePath = `pdfs/${sFile.name}`;
        logger.info(`Found unindexed PDF in Supabase Storage: "${fullStoragePath}". Auto-recovering...`);

        // Download binary PDF from Supabase Storage
        const { data: blob, error: dlErr } = await supabase.storage
          .from(BUCKET_NAME)
          .download(fullStoragePath);

        if (dlErr || !blob) {
          logger.warn(`Could not download ${fullStoragePath} for recovery: ${dlErr?.message}`);
          continue;
        }

        const arrayBuf = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);

        // Parse text & chunks
        const { parsePdf, chunkText } = require('../utils/pdfParser');
        const parsed = await parsePdf(buffer);

        if (!parsed.text || parsed.text.trim().length < 20) {
          logger.warn(`Storage PDF ${sFile.name} has no extractable text. Skipping.`);
          continue;
        }

        const chunks = chunkText(parsed.text, 750, 150);
        if (chunks.length === 0) continue;

        const rawOriginalName = sFile.name.replace(/^\d+_/, '').replace(/_/g, ' ');

        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fullStoragePath);
        const fileUrl = urlData?.publicUrl || '';

        const docId = randomUUID();
        const now = new Date().toISOString();

        const docRecord = {
          id: docId,
          filename: sFile.name,
          original_name: rawOriginalName,
          file_url: fileUrl,
          storage_path: fullStoragePath,
          storage_bucket: BUCKET_NAME,
          file_size: sFile.metadata?.size || buffer.length || 0,
          page_count: parsed.numPages || 1,
          chunk_count: chunks.length,
          is_active: true,
          metadata: { storageSaved: true, uploadedAt: now, autoRecovered: true },
          created_at: now,
          updated_at: now
        };

        const chunkRecords = chunks.map((c, i) => ({
          id: randomUUID(),
          document_id: docId,
          document_name: rawOriginalName,
          chunk_index: c.chunkIndex || i + 1,
          content: c.content,
          page_number: c.pageNumber || 1,
          section_title: c.sectionTitle || '',
          metadata: {
            document_name: rawOriginalName,
            file_url: fileUrl,
            page_number: c.pageNumber || 1
          },
          created_at: now
        }));

        // Insert into Supabase table with schema retry
        const docPayload = prepareDocPayload(docTable, docRecord);
        const { error: insErr } = await insertWithSchemaRetry(supabase, docTable, docPayload);

        if (!insErr) {
          for (let i = 0; i < chunkRecords.length; i += 50) {
            const batch = chunkRecords.slice(i, i + 50).map(c => prepareChunkPayload(chunkTable, c));
            await insertWithSchemaRetry(supabase, chunkTable, batch);
          }
          logger.info(`Successfully auto-recovered and indexed "${rawOriginalName}" with ${chunks.length} chunks into "${docTable}"!`);
        }

        this.runtimeDocuments.unshift(docRecord);
        this.runtimeChunks.push(...chunkRecords);
        existingPaths.add(sFile.name);
      }
    } catch (err) {
      logger.warn(`Storage PDF recovery check failed: ${err.message}`);
    }
  }

  /**
   * Built-in fallback clinic guide seed document
   */
  indexSeedDocument() {
    const docId = SEED_DOC_ID;

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

  async restoreSeedDocument() {
    this._seedExplicitlyDeleted = false;
    this.indexSeedDocument();
    await this.persistSeedState('active');
    return this.runtimeDocuments.find(d => d.id === SEED_DOC_ID);
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

    const supabaseClient = safeGetSupabase();

    // 1. Upload raw PDF directly to Supabase Storage bucket
    try {
      const supabase = supabaseClient;
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

    // 2. Persist in Supabase separate table with schema-aware payload & retry.
    //    If Supabase is configured, the upload only succeeds when the document AND all its chunks are saved —
    //    otherwise the document would silently disappear from the chatbot after the next restart.
    let dbSaved = false;
    if (supabaseClient) {
      const supabase = supabaseClient;
      const { docTable, chunkTable, isReady } = await this.getTableNames();
      const rollbackStorage = async () => {
        if (storageSaved) {
          await supabase.storage.from(BUCKET_NAME).remove([storagePath]).catch(() => {});
        }
      };

      if (!isReady) {
        await rollbackStorage();
        throw new Error('Knowledge base tables were not found in Supabase. Run server/supabase_rag_schema.sql in the Supabase SQL editor, then upload again.');
      }

      let failure = null;
      try {
        const docPayload = prepareDocPayload(docTable, docRecord);
        const { error: insertDocErr } = await insertWithSchemaRetry(supabase, docTable, docPayload);
        if (insertDocErr) {
          failure = `Could not save the document record: ${insertDocErr.message}`;
        } else {
          // Insert chunks in batches of 50 to respect payload limits
          for (let i = 0; i < chunkRecords.length; i += 50) {
            const batch = chunkRecords.slice(i, i + 50).map(c => prepareChunkPayload(chunkTable, c));
            const { error: chunkErr } = await insertWithSchemaRetry(supabase, chunkTable, batch);
            if (chunkErr) {
              failure = `Could not save knowledge chunks: ${chunkErr.message}`;
              break;
            }
          }
          if (failure) {
            await supabase.from(chunkTable).delete().eq('document_id', docId);
            await supabase.from(docTable).delete().eq('id', docId);
          }
        }
      } catch (dbErr) {
        failure = `Could not save to Supabase: ${dbErr.message}`;
      }

      if (failure) {
        await rollbackStorage();
        logger.warn(`PDF indexing aborted: ${failure}`);
        throw new Error(failure);
      }
      dbSaved = true;
      logger.info(`Persisted document & ${chunkRecords.length} chunks to Supabase table "${docTable}"`);
    }

    // Always update in-memory runtime cache
    this.runtimeDocuments = this.runtimeDocuments.filter(d => d.id !== docRecord.id);
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
   * Get all knowledge documents (Supabase is the primary source, preserved with runtime cache)
   */
  async getDocuments() {
    // Re-sync from Supabase so the admin list reflects the database (and the chat index stays in step)
    if (safeGetSupabase()) {
      const loaded = await this.loadFromSupabase();
      if (loaded) this._loadedFromDb = true;
    }

    if (this.runtimeDocuments.length === 0 && !this._seedExplicitlyDeleted) {
      this.indexSeedDocument();
    }

    return this.runtimeDocuments;
  }

  /**
   * Delete a document, purge from Supabase Storage and remove from Supabase table
   */
  async deleteDocument(id) {
    if (!id) return { success: false, notFound: true, message: 'Document id is required' };
    const cleanId = decodeURIComponent(String(id).trim());

    const targetDoc = this.runtimeDocuments.find(d =>
      String(d.id).trim() === cleanId || String(d.filename).trim() === cleanId
    );
    const actualDbId = targetDoc?.id || cleanId;

    // Built-in seed guide: hide it and remember that choice across restarts
    if (actualDbId === SEED_DOC_ID) {
      this.applySeedState('deleted');
      await this.persistSeedState('deleted');
      return { success: true, removedDocument: targetDoc || { id: SEED_DOC_ID }, remainingCount: this.runtimeDocuments.length };
    }

    const supabase = safeGetSupabase();
    if (supabase) {
      const { docTable, chunkTable, isReady } = await this.getTableNames();
      if (isReady) {
        // Remove the database rows first; only report success if they are really gone
        const { error: chunkErr } = await supabase.from(chunkTable).delete().eq('document_id', actualDbId);
        if (chunkErr) return { success: false, message: `Could not delete document chunks: ${chunkErr.message}` };
        const { data: deletedRows, error: docErr } = await supabase.from(docTable).delete().eq('id', actualDbId).select('id');
        if (docErr) return { success: false, message: `Could not delete document: ${docErr.message}` };
        if ((!deletedRows || deletedRows.length === 0) && !targetDoc) {
          return { success: false, notFound: true, message: 'Document not found' };
        }

        // Then remove the binary PDF from Storage
        if (targetDoc && targetDoc.storage_path && !String(targetDoc.storage_path).startsWith('seed://')) {
          const { error: storageErr } = await supabase.storage.from(BUCKET_NAME).remove([targetDoc.storage_path]);
          if (storageErr) {
            logger.warn(`Could not delete file from Supabase Storage: ${storageErr.message}`);
          } else {
            logger.info(`Removed PDF "${targetDoc.storage_path}" from Supabase Storage bucket "${BUCKET_NAME}"`);
          }
        }
      }
    } else if (!targetDoc) {
      return { success: false, notFound: true, message: 'Document not found' };
    }

    // Update runtime cache — remove only this document and its own chunks (by id, not by name,
    // so another document with the same file name is not affected)
    this.runtimeDocuments = this.runtimeDocuments.filter(d => d.id !== actualDbId);
    this.runtimeChunks = this.runtimeChunks.filter(c => c.document_id !== actualDbId);

    return {
      success: true,
      removedDocument: targetDoc || { id: actualDbId },
      remainingCount: this.runtimeDocuments.length
    };
  }

  /**
   * Toggle document active state in Supabase
   */
  async toggleDocument(id, isActive) {
    const cleanId = decodeURIComponent(String(id).trim());
    const doc = this.runtimeDocuments.find(d =>
      String(d.id).trim() === cleanId ||
      String(d.filename).trim() === cleanId
    );
    if (!doc) {
      const err = new Error('Document not found');
      err.statusCode = 404;
      throw err;
    }

    const newStatus = typeof isActive === 'boolean' ? isActive : !doc.is_active;

    if (doc.id === SEED_DOC_ID) {
      this.applySeedState(newStatus ? 'active' : 'inactive');
      await this.persistSeedState(newStatus ? 'active' : 'inactive');
      return this.runtimeDocuments.find(d => d.id === SEED_DOC_ID);
    }

    const supabase = safeGetSupabase();
    if (supabase) {
      const { docTable, chunkTable, isReady } = await this.getTableNames();
      if (isReady) {
        const { error } = await supabase.from(docTable).update({ is_active: newStatus }).eq('id', doc.id);
        if (error) {
          const err = new Error(`Could not update document state: ${error.message}`);
          err.statusCode = 500;
          throw err;
        }
        // Make sure the document's chunks are in memory when it is (re)activated
        if (newStatus && !this.runtimeChunks.some(c => c.document_id === doc.id)) {
          const chunks = await this.fetchChunks(supabase, chunkTable, [doc.id]);
          this.runtimeChunks.push(...chunks.map(c => ({
            ...c,
            document_name: c.document_name || c.metadata?.document_name || doc.original_name || 'Clinic Document'
          })));
        }
      }
    }

    doc.is_active = newStatus;
    doc.updated_at = new Date().toISOString();
    return doc;
  }

  /**
   * Search for top relevant chunks matching user query in English or Tamil
   * Uses BM25-inspired term frequency + phrase matching + cross-lingual expansion + stemming + bigrams
   */
  searchRelevantChunks(query, limit = 8, options = {}) {
    if (!query || typeof query !== 'string') return [];

    const isTamilMode = Boolean(options && options.language === 'ta');

    const effectiveLimit = typeof limit === 'number' 
      ? Math.max(1, limit) 
      : (limit && typeof limit.topK === 'number' ? Math.max(1, limit.topK) : (parseInt(limit, 10) || 8));

    // Active documents & Tamil document detection (used only when Tamil mode is active)
    const activeDocs = this.runtimeDocuments.filter(d => d.is_active);
    const activeDocIds = new Set(activeDocs.map(d => d.id));
    const activeChunks = this.runtimeChunks.filter(c => activeDocIds.has(c.document_id));

    const tamilDocIds = new Set();
    if (isTamilMode) {
      for (const doc of activeDocs) {
        const nameBlob = `${doc.original_name || ''} ${doc.filename || ''}`;
        if (/tamil|தமிழ்/i.test(nameBlob)) {
          tamilDocIds.add(doc.id);
        }
      }
      for (const chunk of activeChunks) {
        if (/[\u0B80-\u0BFF]/.test(chunk.content || '')) {
          tamilDocIds.add(chunk.document_id);
        }
      }
    }
    const isTamilChunk = (chunk) =>
      isTamilMode && (tamilDocIds.has(chunk.document_id) || /[\u0B80-\u0BFF]/.test(chunk.content || ''));

    // Support Unicode letters, marks (combining vowels/virama for Tamil), numbers and whitespace
    const cleanQuery = query.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ').trim();
    const rawTerms = cleanQuery
      .split(/\s+/)
      .filter(t => t.length > 1 && !STOP_WORDS.has(t) && !TAMIL_STOP_WORDS.has(t));

    if (rawTerms.length === 0) {
      // Pure stop-word query — in Tamil mode, prioritize uploaded Tamil Q&A PDF chunks first
      if (isTamilMode && tamilDocIds.size > 0) {
        const tamilFirst = activeChunks.filter(c => isTamilChunk(c));
        const others = activeChunks.filter(c => !isTamilChunk(c));
        return [...tamilFirst, ...others]
          .slice(0, effectiveLimit)
          .map(c => ({ ...c, score: 1 }));
      }
      return activeChunks
        .slice(0, effectiveLimit)
        .map(c => ({ ...c, score: 1 }));
    }

    // Cross-lingual bilingual expansion: if query has Tamil terms, also include English counterparts
    // and if query has English terms, include Tamil counterparts
    const expandedTermSet = new Set(rawTerms);
    for (const term of rawTerms) {
      if (BILINGUAL_CLINIC_TERMS[term]) {
        for (const exp of BILINGUAL_CLINIC_TERMS[term]) {
          expandedTermSet.add(exp);
        }
      }
      // In Tamil mode, also match inflected Tamil words by prefix/root against bilingual terms
      if (isTamilMode && /[\u0B80-\u0BFF]/.test(term) && term.length >= 3) {
        for (const [tam, engList] of Object.entries(BILINGUAL_CLINIC_TERMS)) {
          if (term !== tam && (term.startsWith(tam) || (tam.length >= 4 && tam.startsWith(term)))) {
            expandedTermSet.add(tam);
            for (const exp of engList) {
              expandedTermSet.add(exp);
            }
          }
        }
      }
      // Also check reverse English -> Tamil
      for (const [tam, engList] of Object.entries(BILINGUAL_CLINIC_TERMS)) {
        if (engList.includes(term)) {
          expandedTermSet.add(tam);
        }
      }
    }
    const queryTerms = [...expandedTermSet];

    // Generate stemmed variants (English suffixes + Tamil inflectional suffixes in Tamil mode)
    const stemTerm = (term) => {
      if (term.length <= 3) return [term];
      const variants = [term];
      if (isTamilMode && /[\u0B80-\u0BFF]/.test(term)) {
        const tamilSuffixes = [
          'களுக்கு', 'களில்', 'களின்', 'களை', 'ங்கள்', 'த்தில்', 'த்திற்கு', 'த்தின்', 'த்தை',
          'யுடன்', 'யின்', 'யில்', 'யை', 'கள்', 'க்கு', 'இல்', 'உடன்', 'உம்', 'ஆல்', 'ஆக'
        ];
        for (const suffix of tamilSuffixes) {
          if (term.endsWith(suffix) && term.length - suffix.length >= 3) {
            variants.push(term.slice(0, -suffix.length));
          }
        }
        return [...new Set(variants)];
      }
      // Strip common English suffixes to find root
      const suffixes = ['tion', 'sion', 'ment', 'ness', 'ous', 'ive', 'ful', 'less', 'able', 'ible', 'ing', 'ings', 'ated', 'ates', 'tion', 'ed', 'er', 'es', 'ly', 's'];
      for (const suffix of suffixes) {
        if (term.endsWith(suffix) && term.length - suffix.length >= 3) {
          variants.push(term.slice(0, -suffix.length));
        }
      }
      // Also add the term with a trailing 's' for singular→plural matching
      if (!term.endsWith('s')) variants.push(term + 's');
      return [...new Set(variants)];
    };

    const stemmedTermSets = queryTerms.map(t => stemTerm(t));

    // Build bigrams from query for phrase proximity scoring
    const queryBigrams = [];
    for (let i = 0; i < rawTerms.length - 1; i++) {
      queryBigrams.push(rawTerms[i] + ' ' + rawTerms[i + 1]);
    }

    // Total active chunks count for IDF-like weighting
    const totalChunks = activeChunks.length || 1;

    // Pre-compute document frequency for each stem (how many chunks contain it)
    const docFrequency = {};
    for (const stemSet of stemmedTermSets) {
      const key = stemSet[0]; // use original term as the key
      if (docFrequency[key] !== undefined) continue;
      let df = 0;
      for (const chunk of activeChunks) {
        const contentLower = chunk.content.toLowerCase();
        if (stemSet.some(variant => contentLower.includes(variant))) {
          df++;
        }
      }
      docFrequency[key] = df || 1;
    }

    const scoredChunks = [];

    for (const chunk of activeChunks) {
      const contentLower = chunk.content.toLowerCase();
      const contentLength = contentLower.length || 1;
      let score = 0;
      let matchedTermCount = 0;

      // 1. Exact full-query substring match (strong signal)
      if (cleanQuery.length > 3 && contentLower.includes(cleanQuery)) {
        score += 30;
      }

      // 2. Per-term scoring with IDF weighting and stemmed matching
      for (let ti = 0; ti < queryTerms.length; ti++) {
        const originalTerm = queryTerms[ti];
        const stemSet = stemmedTermSets[ti];
        const idf = Math.log(1 + totalChunks / docFrequency[originalTerm]);

        let termMatches = 0;
        for (const variant of stemSet) {
          // Use a broader match: substring rather than strict word boundary
          const regex = new RegExp(variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          const matches = contentLower.match(regex);
          if (matches) {
            termMatches += matches.length;
          }
        }

        if (termMatches > 0) {
          matchedTermCount++;
          // TF-IDF-like scoring: tf * idf, with diminishing returns on high tf
          const tf = Math.min(termMatches, 10); // cap tf
          const density = tf / (contentLength / 100); // normalize by chunk length
          score += (tf * idf * 3) + (density * 2);
        }
      }

      // 3. Bigram proximity bonus (adjacent query terms found together)
      for (const bigram of queryBigrams) {
        if (contentLower.includes(bigram)) {
          score += 12;
        }
      }

      // 4. Term coverage bonus: reward chunks that match more distinct query terms
      if (queryTerms.length > 1 && matchedTermCount > 0) {
        const coverageRatio = matchedTermCount / queryTerms.length;
        score += coverageRatio * 15;
      }

      // 5. Section title relevance bonus
      if (chunk.section_title) {
        const sectionLower = chunk.section_title.toLowerCase();
        for (const term of queryTerms) {
          if (sectionLower.includes(term)) {
            score += 8;
          }
        }
        // Full query in section title is very strong
        if (sectionLower.includes(cleanQuery)) {
          score += 20;
        }
      }

      if (score > 0) {
        // In Tamil mode, strongly boost chunks from the uploaded Tamil Q&A PDF
        const boostedScore = isTamilChunk(chunk) ? (score * 1.8) + 15 : score;
        scoredChunks.push({
          ...chunk,
          score: Math.round(boostedScore * 100) / 100
        });
      }
    }

    // Sort descending by score
    scoredChunks.sort((a, b) => b.score - a.score);

    if (scoredChunks.length > 0) {
      // In Tamil mode, prioritize uploaded Tamil Q&A PDF chunks first (without artificially capping them)
      if (isTamilMode && tamilDocIds.size > 0) {
        const tamilMatches = scoredChunks.filter(c => isTamilChunk(c));
        const otherMatches = scoredChunks.filter(c => !isTamilChunk(c));

        if (tamilMatches.length > 0) {
          const result = [...tamilMatches.slice(0, effectiveLimit)];
          // If space remains, include top supplementary chunks for completeness
          for (const chunk of otherMatches) {
            if (result.length >= effectiveLimit) break;
            result.push(chunk);
          }
          return result;
        }

        // If user asked in English/Tanglish terms that didn't directly match Tamil words,
        // still include top overview chunks from the uploaded Tamil Q&A PDF alongside matches
        const tamilOverview = activeChunks
          .filter(c => isTamilChunk(c))
          .slice(0, Math.min(3, effectiveLimit))
          .map(c => ({ ...c, score: 0.5 }));
        const combined = [...otherMatches.slice(0, Math.max(1, effectiveLimit - tamilOverview.length)), ...tamilOverview];
        return combined.slice(0, effectiveLimit);
      }

      // Ensure diversity: don't return only chunks from one document
      const result = [];
      const docChunkCount = {};
      const maxPerDoc = Math.max(Math.ceil(effectiveLimit * 0.7), 3); // at most 70% from one doc

      for (const chunk of scoredChunks) {
        if (result.length >= effectiveLimit) break;
        const docCount = docChunkCount[chunk.document_id] || 0;
        if (docCount < maxPerDoc) {
          result.push(chunk);
          docChunkCount[chunk.document_id] = docCount + 1;
        }
      }

      // If we didn't fill the limit due to diversity constraints, add remaining top chunks
      if (result.length < effectiveLimit) {
        for (const chunk of scoredChunks) {
          if (result.length >= effectiveLimit) break;
          if (!result.some(r => r.id === chunk.id)) {
            result.push(chunk);
          }
        }
      }

      return result;
    }

    // Fallback: in Tamil mode, prioritize chunks from the uploaded Tamil Q&A PDF
    if (isTamilMode && tamilDocIds.size > 0) {
      const tamilFallback = activeChunks.filter(c => isTamilChunk(c));
      if (tamilFallback.length > 0) {
        return tamilFallback.slice(0, effectiveLimit).map(c => ({ ...c, score: 0.2 }));
      }
    }

    // Fallback: return overview chunks from ALL active docs (not just seed)
    // Distribute evenly across documents
    const fallbackChunks = [];
    const docsArray = this.runtimeDocuments.filter(d => d.is_active);
    const chunksPerDoc = Math.max(1, Math.ceil(effectiveLimit / (docsArray.length || 1)));

    for (const doc of docsArray) {
      const docChunks = this.runtimeChunks
        .filter(c => c.document_id === doc.id)
        .slice(0, chunksPerDoc);
      fallbackChunks.push(...docChunks);
    }

    return fallbackChunks.slice(0, effectiveLimit).map(c => ({ ...c, score: 0.1 }));
  }

  /**
   * Get overall knowledge status
   */
  getStatus() {
    // Only count chunks that belong to known documents
    const validDocIds = new Set(this.runtimeDocuments.map(d => d.id));
    const validChunks = this.runtimeChunks.filter(c => validDocIds.has(c.document_id));

    const activeDocs = this.runtimeDocuments.filter(d => d.is_active);
    const activeDocIds = new Set(activeDocs.map(d => d.id));
    const activeChunks = validChunks.filter(c => activeDocIds.has(c.document_id));

    return {
      totalDocuments: this.runtimeDocuments.length,
      activeDocuments: activeDocs.length,
      totalChunks: validChunks.length,
      activeChunks: activeChunks.length,
      hasSeedKnowledge: this.runtimeDocuments.some(d => String(d.id).startsWith('seed-')),
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
