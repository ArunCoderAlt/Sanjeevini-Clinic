const { randomUUID } = require('crypto');
const { getSupabase } = require('../config/supabase');
const logger = require('../utils/logger');
const clinicSeedKnowledge = require('../data/clinicSeedKnowledge');

const BUCKET_NAME = 'rag-documents';

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

// Tamil stop words & conversational particles
const TAMIL_STOP_WORDS = new Set([
  'என்ன', 'எப்படி', 'எங்கு', 'எப்போது', 'எந்த', 'யாரு', 'யார்', 'ஒரு', 'மற்றும்',
  'இந்த', 'அந்த', 'இருந்து', 'உள்ள', 'செய்ய', 'பற்றி', 'எனக்கு', 'உங்களுக்கு',
  'வேண்டும்', 'முடியுமா', 'இருக்கு', 'இருக்கும்', 'ஆகுமா', 'கூறும்'
]);

// Cross-lingual bilingual dictionary for clinic & healthcare queries (Tamil <-> English)
const BILINGUAL_CLINIC_TERMS = {
  // Clinic, Doctor, Timings
  'நேரம்': ['timing', 'timings', 'hours', 'consultation'],
  'நேரங்கள்': ['timing', 'timings', 'hours', 'consultation'],
  'மணி': ['pm', 'am', 'hours', 'time'],
  'மருத்துவர்': ['doctor', 'doctors', 'physician', 'dr', 'thiagarajan', 'subashini'],
  'மருத்துவர்கள்': ['doctor', 'doctors', 'physicians'],
  'டாக்டர்': ['doctor', 'dr'],
  'முகவரி': ['address', 'location', 'karaikal', 'ambedkar'],
  'இடம்': ['location', 'address', 'karaikal'],
  'எங்கு': ['location', 'address', 'where'],
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
      await this.loadFromSupabase();
      await this.recoverStoragePdfs();

      // ALWAYS ensure clinic has at least the seed document if no docs exist
      if (this.runtimeDocuments.length === 0 && !this._seedExplicitlyDeleted) {
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

      // Preserve or index seed document
      let seedDoc = this.runtimeDocuments.find(d => String(d.id).startsWith('seed-'));
      if (!seedDoc && !this._seedExplicitlyDeleted) {
        this.indexSeedDocument();
        seedDoc = this.runtimeDocuments.find(d => String(d.id).startsWith('seed-'));
      }
      const seedChunks = this.runtimeChunks.filter(c => String(c.document_id).startsWith('seed-'));

      // Preserve any in-memory runtime custom documents that are not yet in Supabase
      const runtimeCustomDocs = this.runtimeDocuments.filter(
        rd => !String(rd.id).startsWith('seed-') && !docs.some(d => d.id === rd.id)
      );

      const mergedDocs = [...docs, ...runtimeCustomDocs];
      if (seedDoc && !mergedDocs.some(d => d.id === seedDoc.id)) {
        mergedDocs.push(seedDoc);
      }

      this.runtimeDocuments = mergedDocs;

      // Load chunks for active database documents
      const activeIds = docs.filter(d => d.is_active).map(d => d.id);
      let loadedChunks = [];
      if (activeIds.length > 0) {
        const { data: chunks, error: chunkErr } = await supabase
          .from(chunkTable)
          .select('*')
          .in('document_id', activeIds);

        if (!chunkErr && Array.isArray(chunks)) {
          const docMap = new Map(docs.map(d => [d.id, d]));
          loadedChunks = chunks.map(c => ({
            ...c,
            document_name: c.document_name || c.metadata?.document_name || docMap.get(c.document_id)?.original_name || 'Clinic Document'
          }));
        }
      }

      // Preserve chunks for runtime custom documents
      const runtimeCustomDocIds = new Set(runtimeCustomDocs.map(d => d.id));
      const preservedRuntimeChunks = this.runtimeChunks.filter(c => runtimeCustomDocIds.has(c.document_id));

      // If seed doc is active, preserve seed chunks alongside loaded chunks
      if (seedDoc && seedDoc.is_active) {
        this.runtimeChunks = [...loadedChunks, ...preservedRuntimeChunks, ...seedChunks];
      } else {
        this.runtimeChunks = [...loadedChunks, ...preservedRuntimeChunks];
      }

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
    this._seedExplicitlyDeleted = false;
    this.indexSeedDocument();
    return this.runtimeDocuments.find(d => String(d.id).startsWith('seed-'));
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

    // 2. Persist in Supabase separate table with schema-aware payload & retry
    let dbSaved = false;
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { docTable, chunkTable, isReady } = await this.getTableNames();
        if (isReady) {
          const docPayload = prepareDocPayload(docTable, docRecord);
          const { error: insertDocErr } = await insertWithSchemaRetry(supabase, docTable, docPayload);
          if (!insertDocErr) {
            // Insert chunks in batches of 50 to respect payload limits
            for (let i = 0; i < chunkRecords.length; i += 50) {
              const rawBatch = chunkRecords.slice(i, i + 50);
              const batch = rawBatch.map(c => prepareChunkPayload(chunkTable, c));
              await insertWithSchemaRetry(supabase, chunkTable, batch);
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
    try {
      const supabase = getSupabase();
      const { docTable, isReady } = await this.getTableNames();
      if (supabase && isReady) {
        const { data, error } = await supabase
          .from(docTable)
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          // If seed doc was in runtime, preserve it; or if runtime is empty, ensure seed is present
          let seedDoc = this.runtimeDocuments.find(d => String(d.id).startsWith('seed-'));
          if (!seedDoc && !this._seedExplicitlyDeleted) {
            this.indexSeedDocument();
            seedDoc = this.runtimeDocuments.find(d => String(d.id).startsWith('seed-'));
          }

          // Preserve any in-memory custom documents that haven't synced yet
          const runtimeCustomDocs = this.runtimeDocuments.filter(
            rd => !String(rd.id).startsWith('seed-') && !data.some(d => d.id === rd.id)
          );

          const merged = [...data, ...runtimeCustomDocs];
          if (seedDoc && !merged.some(d => d.id === seedDoc.id)) {
            merged.push(seedDoc);
          }

          this.runtimeDocuments = merged;
          return merged;
        }
      }
    } catch (err) {
      logger.warn(`Error reading documents from Supabase: ${err.message}`);
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
    if (!id) return { success: false, removed: null };
    const cleanId = decodeURIComponent(String(id).trim());

    // 1. Locate the document to get storage_path and actual db ID
    let targetDoc = this.runtimeDocuments.find(d => 
      String(d.id).trim() === cleanId || 
      String(d.filename).trim() === cleanId ||
      String(d.original_name).trim() === cleanId
    );

    const actualDbId = targetDoc?.id || cleanId;
    const isSeedDoc = String(actualDbId).startsWith('seed-');

    if (isSeedDoc) {
      this._seedExplicitlyDeleted = true;
    }

    // 2. Remove binary PDF file from Supabase Storage bucket (if not seed doc)
    try {
      const supabase = getSupabase();
      if (supabase && targetDoc && targetDoc.storage_path && !targetDoc.storage_path.startsWith('seed://')) {
        await supabase.storage.from(BUCKET_NAME).remove([targetDoc.storage_path]);
        logger.info(`Removed PDF "${targetDoc.storage_path}" from Supabase Storage bucket "${BUCKET_NAME}"`);
      }
    } catch (storageDelErr) {
      logger.warn(`Could not delete file from Supabase Storage: ${storageDelErr.message}`);
    }

    // 3. Remove from Supabase Database tables (if not seed doc)
    if (!isSeedDoc) {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { docTable, chunkTable, isReady } = await this.getTableNames();
          if (isReady) {
            await supabase.from(chunkTable).delete().eq('document_id', actualDbId);
            await supabase.from(docTable).delete().eq('id', actualDbId);
          }
        }
      } catch (dbDelErr) {
        logger.warn(`Could not delete document from Supabase table: ${dbDelErr.message}`);
      }
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
      [cleanId, actualDbId, removedDoc?.id, removedDoc?.filename, removedDoc?.original_name]
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
    const cleanId = decodeURIComponent(String(id).trim());
    const doc = this.runtimeDocuments.find(d => 
      String(d.id).trim() === cleanId || 
      String(d.filename).trim() === cleanId
    );
    if (!doc) throw new Error('Document not found');

    const newStatus = typeof isActive === 'boolean' ? isActive : !doc.is_active;
    doc.is_active = newStatus;
    doc.updated_at = new Date().toISOString();

    // Only update Supabase if not a built-in seed doc
    if (!String(doc.id).startsWith('seed-')) {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { docTable, isReady } = await this.getTableNames();
          if (isReady) {
            await supabase.from(docTable).update({ is_active: newStatus }).eq('id', doc.id);
          }
        }
      } catch (err) {
        logger.warn(`Could not update document state in Supabase: ${err.message}`);
      }
    }

    return doc;
  }

  /**
   * Search for top relevant chunks matching user query in English or Tamil
   * Uses BM25-inspired term frequency + phrase matching + cross-lingual expansion + stemming + bigrams
   */
  searchRelevantChunks(query, limit = 8) {
    if (!query || typeof query !== 'string') return [];

    const effectiveLimit = typeof limit === 'number' 
      ? Math.max(1, limit) 
      : (limit && typeof limit.topK === 'number' ? Math.max(1, limit.topK) : (parseInt(limit, 10) || 8));

    // Support Unicode letters, marks (combining vowels/virama for Tamil), numbers and whitespace
    const cleanQuery = query.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ').trim();
    const rawTerms = cleanQuery
      .split(/\s+/)
      .filter(t => t.length > 1 && !STOP_WORDS.has(t) && !TAMIL_STOP_WORDS.has(t));

    if (rawTerms.length === 0) {
      // Pure stop-word query — return overview chunks from all active docs
      const activeDocIds = new Set(
        this.runtimeDocuments.filter(d => d.is_active).map(d => d.id)
      );
      return this.runtimeChunks
        .filter(c => activeDocIds.has(c.document_id))
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
      // Also check reverse English -> Tamil
      for (const [tam, engList] of Object.entries(BILINGUAL_CLINIC_TERMS)) {
        if (engList.includes(term)) {
          expandedTermSet.add(tam);
        }
      }
    }
    const queryTerms = [...expandedTermSet];

    // Generate stemmed variants (simple suffix stripping for better recall on English words)
    const stemTerm = (term) => {
      if (term.length <= 3) return [term];
      const variants = [term];
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

    // Get active document IDs
    const activeDocIds = new Set(
      this.runtimeDocuments.filter(d => d.is_active).map(d => d.id)
    );

    // Total active chunks count for IDF-like weighting
    const activeChunks = this.runtimeChunks.filter(c => activeDocIds.has(c.document_id));
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
        scoredChunks.push({
          ...chunk,
          score: Math.round(score * 100) / 100
        });
      }
    }

    // Sort descending by score
    scoredChunks.sort((a, b) => b.score - a.score);

    if (scoredChunks.length > 0) {
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
