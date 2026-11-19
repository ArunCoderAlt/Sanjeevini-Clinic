const { parsePdf, chunkText } = require('../utils/pdfParser');
const botKnowledgeService = require('../services/botKnowledgeService');
const { generateBotReply, testGroqConnection, updateGroqConfig, getGroqHealthStatus } = require('../services/groqService');
const logger = require('../utils/logger');

const MAX_MESSAGE_LENGTH = 1000;

/**
 * @desc    Process a chat message from patient / visitor
 * @route   POST /api/bot/chat
 * @access  Public
 */
exports.chat = async (req, res, next) => {
  try {
    const { message, history, language } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`
      });
    }

    const requestedLang = language === 'ta' ? 'ta' : 'en';

    // 1. Ensure knowledge base documents & chunks are loaded from Supabase
    await botKnowledgeService.ensureInitialized();

    // 2. Retrieve top matching chunks from knowledge base
    const relevantChunks = botKnowledgeService.searchRelevantChunks(trimmedMessage, 8, {
      language: requestedLang
    });

    // 3. Call Groq with strict PDF grounding and conversation history
    const botResult = await generateBotReply({
      userMessage: trimmedMessage,
      relevantChunks,
      conversationHistory: Array.isArray(history) ? history : [],
      language: requestedLang
    });

    // Internal API error details are logged server-side and shown in the admin status panel,
    // never returned to public visitors.
    res.status(200).json({
      success: true,
      data: {
        reply: botResult.reply,
        sources: botResult.sources || [],
        modelUsed: botResult.modelUsed,
        keyStatus: botResult.keyStatus || 'unknown'
      }
    });
  } catch (err) {
    logger.error(`Error in botController.chat: ${err.message}`);
    next(err);
  }
};

/**
 * @desc    Get all indexed knowledge base documents
 * @route   GET /api/bot/documents
 * @access  Private / Admin
 */
exports.getDocuments = async (req, res) => {
  try {
    await botKnowledgeService.ensureInitialized();
    const docs = await botKnowledgeService.getDocuments();
    return res.status(200).json({
      success: true,
      count: docs ? docs.length : 0,
      data: docs || []
    });
  } catch (err) {
    logger.error(`Error in getDocuments: ${err.message}`);
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
      warning: err.message
    });
  }
};

/**
 * @desc    Upload and index a new PDF document
 * @route   POST /api/bot/upload
 * @access  Private / Admin
 */
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file'
      });
    }

    // Verify MIME type or extension
    const isPdf = req.file.mimetype === 'application/pdf' || 
      (req.file.originalname && req.file.originalname.toLowerCase().endsWith('.pdf'));

    if (!isPdf) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF documents (.pdf) are supported'
      });
    }

    const originalName = req.file.originalname;
    const fileSize = req.file.size;
    const buffer = req.file.buffer;

    // 1. Extract text using pdf-parse
    const parsed = await parsePdf(buffer);

    if (!parsed.text || parsed.text.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded PDF appears to be empty or contains scanned images without extractable text.'
      });
    }

    // 2. Break into overlapping chunks
    const chunks = chunkText(parsed.text, 750, 150);

    if (chunks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not create searchable chunks from the document.'
      });
    }

    // 3. Persist document and chunks in knowledge store (upload directly to Supabase Storage)
    const result = await botKnowledgeService.addDocument({
      filename: `${Date.now()}_${originalName.replace(/\s+/g, '_')}`,
      originalName,
      fileBuffer: buffer,
      mimeType: req.file.mimetype || 'application/pdf',
      fileSize,
      pageCount: parsed.numPages || 1,
      chunks
    });

    logger.info(`Indexed "${originalName}" with ${result.chunkCount} chunks (database saved: ${result.dbSaved}).`);

    const warning = result.dbSaved
      ? null
      : 'Supabase is not configured, so this document is only held in server memory and will be lost when the server restarts.';

    return res.status(201).json({
      success: true,
      message: `Successfully indexed ${originalName} with ${result.chunkCount} knowledge chunks!`,
      warning,
      data: result.document,
      chunkCount: result.chunkCount,
      storageSaved: result.storageSaved,
      dbSaved: result.dbSaved
    });
  } catch (err) {
    logger.error(`Error in uploadDocument: ${err.message}`);
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to parse and index PDF.'
    });
  }
};

/**
 * @desc    Delete a knowledge document
 * @route   DELETE /api/bot/documents/:id
 * @access  Private / Admin
 */
exports.deleteDocument = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await botKnowledgeService.deleteDocument(id);
    if (!result.success) {
      return res.status(result.notFound ? 404 : 500).json({
        success: false,
        message: result.message || 'Could not remove the knowledge document'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Knowledge document removed successfully',
      data: result
    });
  } catch (err) {
    logger.error(`Error in deleteDocument: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: err.message || 'Could not remove the knowledge document'
    });
  }
};

/**
 * @desc    Toggle active state of a document
 * @route   PATCH /api/bot/documents/:id/toggle
 * @access  Private / Admin
 */
exports.toggleDocument = async (req, res, next) => {
  try {
    const updated = await botKnowledgeService.toggleDocument(req.params.id, req.body ? req.body.isActive : undefined);
    res.status(200).json({
      success: true,
      message: `Document is now ${updated.is_active ? 'active' : 'inactive'}`,
      data: updated
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to update document status'
    });
  }
};

const groqUsageTracker = require('../services/groqUsageTracker');

/**
 * @desc    Get bot status, test Groq connection, and retrieve active key token usage
 * @route   GET /api/bot/status
 * @access  Public / Admin
 */
exports.getStatus = async (req, res, next) => {
  try {
    await botKnowledgeService.ensureInitialized();
    const knowledgeStatus = botKnowledgeService.getStatus();
    const groqStatus = await testGroqConnection();
    const usageSummary = await groqUsageTracker.getUsageSummary();
    const groqHealth = getGroqHealthStatus();

    res.status(200).json({
      success: true,
      data: {
        ...knowledgeStatus,
        groq: groqStatus,
        groqHealth,
        usage: {
          activeKeyUsage: usageSummary.activeKeyUsage,
          latestReportedRateLimits: usageSummary.latestReportedRateLimits,
          verifiedScopeInfo: usageSummary.verifiedScopeInfo,
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get complete Groq token usage, rate limits, and historical keys usage
 * @route   GET /api/bot/usage
 * @access  Private / Admin
 */
exports.getUsage = async (req, res, next) => {
  try {
    const summary = await groqUsageTracker.getUsageSummary();
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Groq API key and model settings
 * @route   PUT /api/bot/settings
 * @access  Private / Admin
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const { apiKey, model } = req.body || {};

    if (apiKey !== undefined && (typeof apiKey !== 'string' || /[\r\n\s]/.test(apiKey.trim()) || apiKey.trim().length < 10)) {
      return res.status(400).json({ success: false, message: 'Invalid Groq API key format.' });
    }
    if (model !== undefined && model !== null && model !== '' &&
        (typeof model !== 'string' || !/^[A-Za-z0-9._:\/-]{1,100}$/.test(model.trim()))) {
      return res.status(400).json({ success: false, message: 'Invalid model name.' });
    }

    const configResult = updateGroqConfig({ apiKey, model: typeof model === 'string' ? model.trim() : undefined });
    const groqTest = await testGroqConnection();

    const persistNote = configResult.persistedToEnvFile
      ? ''
      : ' This change is active now but will reset when the server restarts — also update GROQ_API_KEY / GROQ_MODEL in your hosting environment variables.';

    res.status(200).json({
      success: true,
      message: (groqTest.connected
        ? 'Groq API Key verified and saved successfully!'
        : 'Groq settings updated. Note: ' + groqTest.message) + persistNote,
      data: {
        ...configResult,
        groq: groqTest
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Restore the default clinic portfolio seed document
 * @route   POST /api/bot/restore-seed
 * @access  Private / Admin
 */
exports.restoreSeed = async (req, res, next) => {
  try {
    const doc = await botKnowledgeService.restoreSeedDocument();
    res.status(200).json({
      success: true,
      message: 'Default clinic guide restored to knowledge base',
      data: doc
    });
  } catch (err) {
    next(err);
  }
};
