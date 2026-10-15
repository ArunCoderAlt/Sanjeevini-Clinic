const crypto = require('crypto');
const GroqKeyPeriod = require('../models/GroqKeyPeriod');
const GroqUsageLog = require('../models/GroqUsageLog');
const logger = require('../utils/logger');
const env = require('../config/environment');

// Memory cache for active period and latest rate-limit telemetry
let cachedActivePeriod = null;
let latestRateLimits = null;

// Warning cooldown map: key -> timestamp of last warning
const warningCooldowns = new Map();
const WARNING_COOLDOWN_MS = 60 * 1000; // 60 seconds

/**
 * Generate a non-reversible cryptographic SHA-256 fingerprint of the API key
 * Plaintext API key is NEVER stored or logged.
 */
function generateKeyFingerprint(apiKey) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    return null;
  }
  const normalized = apiKey.trim();
  // Salted SHA-256 hash
  return crypto.createHash('sha256').update(`sanjeevini_groq_salt_v1:${normalized}`).digest('hex');
}

/**
 * Generate a safe, non-sensitive hint for the key (e.g. gsk_...1a2b)
 * Never exposes the key secret.
 */
function getMaskedKeyHint(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return 'none';
  const clean = apiKey.trim();
  if (clean.length < 8) return 'gsk_***';
  const prefix = clean.startsWith('gsk_') ? 'gsk_...' : clean.slice(0, 4) + '...';
  const suffix = clean.slice(-4);
  return `${prefix}${suffix}`;
}

/**
 * Parse Groq API rate-limit headers from response
 */
function parseRateLimitHeaders(headers) {
  if (!headers) return null;

  const getHeader = (name) => {
    if (typeof headers.get === 'function') {
      return headers.get(name);
    }
    return headers[name] || headers[name.toLowerCase()] || null;
  };

  const parseNum = (name) => {
    const val = getHeader(name);
    if (val === null || val === undefined || val === '') return null;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? null : parsed;
  };

  const limitRequests = parseNum('x-ratelimit-limit-requests');
  const remainingRequests = parseNum('x-ratelimit-remaining-requests');
  const resetRequests = getHeader('x-ratelimit-reset-requests') || null;

  const limitTokens = parseNum('x-ratelimit-limit-tokens');
  const remainingTokens = parseNum('x-ratelimit-remaining-tokens');
  const resetTokens = getHeader('x-ratelimit-reset-tokens') || null;
  const retryAfter = parseNum('retry-after');

  const hasAny = limitRequests !== null || remainingRequests !== null || 
                 limitTokens !== null || remainingTokens !== null || retryAfter !== null;

  if (!hasAny) return null;

  return {
    limitRequests,
    remainingRequests,
    resetRequests,
    limitTokens,
    remainingTokens,
    resetTokens,
    retryAfter,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Check if usage approaches Groq rate limits and log warnings with cooldown
 */
function checkRateLimitWarnings(rateLimitInfo, model = 'unknown') {
  if (!rateLimitInfo) return;

  const now = Date.now();
  const shouldWarn = (tierKey) => {
    const last = warningCooldowns.get(tierKey) || 0;
    if (now - last > WARNING_COOLDOWN_MS) {
      warningCooldowns.set(tierKey, now);
      return true;
    }
    return false;
  };

  // 1. Check Request Limit
  if (rateLimitInfo.limitRequests && rateLimitInfo.remainingRequests !== null) {
    const used = rateLimitInfo.limitRequests - rateLimitInfo.remainingRequests;
    const ratio = used / rateLimitInfo.limitRequests;

    if (rateLimitInfo.remainingRequests <= 0) {
      const key = `req_100:${model}`;
      if (shouldWarn(key)) {
        logger.error(
          `[Groq Rate-Limit REACHED (100%)] Model "${model}": 0 requests remaining out of ${rateLimitInfo.limitRequests}. Resets in: ${rateLimitInfo.resetRequests || 'unknown'}.`
        );
      }
    } else if (ratio >= 0.95) {
      const key = `req_95:${model}`;
      if (shouldWarn(key)) {
        logger.warn(
          `[Groq Rate-Limit CRITICAL (95%+)] Model "${model}": only ${rateLimitInfo.remainingRequests} / ${rateLimitInfo.limitRequests} requests remaining (${(ratio * 100).toFixed(1)}% used). Resets in: ${rateLimitInfo.resetRequests || 'unknown'}.`
        );
      }
    } else if (ratio >= 0.80) {
      const key = `req_80:${model}`;
      if (shouldWarn(key)) {
        logger.warn(
          `[Groq Rate-Limit WARNING (80%+)] Model "${model}": ${rateLimitInfo.remainingRequests} / ${rateLimitInfo.limitRequests} requests remaining (${(ratio * 100).toFixed(1)}% used). Resets in: ${rateLimitInfo.resetRequests || 'unknown'}.`
        );
      }
    }
  }

  // 2. Check Token Limit
  if (rateLimitInfo.limitTokens && rateLimitInfo.remainingTokens !== null) {
    const used = rateLimitInfo.limitTokens - rateLimitInfo.remainingTokens;
    const ratio = used / rateLimitInfo.limitTokens;

    if (rateLimitInfo.remainingTokens <= 0) {
      const key = `token_100:${model}`;
      if (shouldWarn(key)) {
        logger.error(
          `[Groq Token-Limit REACHED (100%)] Model "${model}": 0 tokens remaining out of ${rateLimitInfo.limitTokens}. Resets in: ${rateLimitInfo.resetTokens || 'unknown'}.`
        );
      }
    } else if (ratio >= 0.95) {
      const key = `token_95:${model}`;
      if (shouldWarn(key)) {
        logger.warn(
          `[Groq Token-Limit CRITICAL (95%+)] Model "${model}": only ${rateLimitInfo.remainingTokens} / ${rateLimitInfo.limitTokens} tokens remaining (${(ratio * 100).toFixed(1)}% used). Resets in: ${rateLimitInfo.resetTokens || 'unknown'}.`
        );
      }
    } else if (ratio >= 0.80) {
      const key = `token_80:${model}`;
      if (shouldWarn(key)) {
        logger.warn(
          `[Groq Token-Limit WARNING (80%+)] Model "${model}": ${rateLimitInfo.remainingTokens} / ${rateLimitInfo.limitTokens} tokens remaining (${(ratio * 100).toFixed(1)}% used). Resets in: ${rateLimitInfo.resetTokens || 'unknown'}.`
        );
      }
    }
  }
}

/**
 * Retrieve or create active key tracking period
 * Ensures server restarts do NOT wipe or re-create an existing key's period.
 */
async function getOrCreateActivePeriod(apiKey) {
  const currentKey = apiKey || env.groqApiKey || process.env.GROQ_API_KEY;
  const fingerprint = generateKeyFingerprint(currentKey);

  if (!fingerprint) {
    return null;
  }

  // Check in-memory cache first if fingerprint matches
  if (cachedActivePeriod && cachedActivePeriod.keyFingerprint === fingerprint && cachedActivePeriod.isActive) {
    return cachedActivePeriod;
  }

  // Search database for an existing period with this fingerprint
  let existingPeriod = await GroqKeyPeriod.findOne({ keyFingerprint: fingerprint });

  if (existingPeriod) {
    // If found, ensure it is active and all other periods are inactive
    if (!existingPeriod.isActive) {
      const allOtherPeriods = await GroqKeyPeriod.find();
      for (const p of allOtherPeriods) {
        if (p.keyFingerprint !== fingerprint && p.isActive) {
          await GroqKeyPeriod.findByIdAndUpdate(p.id || p._id, { isActive: false, updatedAt: new Date().toISOString() });
        }
      }
      existingPeriod = await GroqKeyPeriod.findByIdAndUpdate(
        existingPeriod.id || existingPeriod._id,
        { isActive: true, updatedAt: new Date().toISOString() },
        { new: true }
      );
    }
    cachedActivePeriod = existingPeriod;
    return existingPeriod;
  }

  // If not found, a new key has been configured!
  // Start a new tracking period with counters starting at zero.
  const allPeriods = await GroqKeyPeriod.find();
  const nextVersionNumber = allPeriods.length + 1;
  const keyVersion = `key_v${nextVersionNumber}`;
  const keyHint = getMaskedKeyHint(currentKey);

  // Set all existing previous keys to isActive: false (preserving their historical stats)
  for (const p of allPeriods) {
    if (p.isActive) {
      await GroqKeyPeriod.findByIdAndUpdate(p.id || p._id, { isActive: false, updatedAt: new Date().toISOString() });
    }
  }

  const newPeriod = await GroqKeyPeriod.create({
    keyVersion,
    keyFingerprint: fingerprint,
    keyHint,
    isActive: true,
    totalRequests: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    firstSeenAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  cachedActivePeriod = newPeriod;
  logger.info(
    `[GroqUsageTracker] New Groq API key detected (${keyHint}). Started tracking period "${keyVersion}" with counters initialized to 0. Historical records for ${allPeriods.length} previous keys preserved.`
  );

  return newPeriod;
}

/**
 * Record token usage for a Groq API request
 */
async function recordUsage({
  apiKey,
  model,
  inputTokens = 0,
  outputTokens = 0,
  totalTokens = 0,
  status = 'success',
  httpStatus = 200,
  usageSource = 'bot_chat',
  headers = null,
}) {
  try {
    const activePeriod = await getOrCreateActivePeriod(apiKey);
    const rateLimitInfo = parseRateLimitHeaders(headers);

    if (rateLimitInfo) {
      latestRateLimits = {
        ...rateLimitInfo,
        model,
      };
      // Evaluate warning thresholds
      checkRateLimitWarnings(rateLimitInfo, model);
    }

    const safeInputTokens = Math.max(0, parseInt(inputTokens, 10) || 0);
    const safeOutputTokens = Math.max(0, parseInt(outputTokens, 10) || 0);
    const safeTotalTokens = Math.max(0, parseInt(totalTokens, 10) || (safeInputTokens + safeOutputTokens));

    const keyVersion = activePeriod?.keyVersion || 'unknown_key';
    const keyFingerprint = activePeriod?.keyFingerprint || 'unknown';

    // 1. Create Granular Audit Log (prompts and sensitive responses are NOT stored)
    await GroqUsageLog.create({
      keyVersion,
      keyFingerprint,
      model: model || 'llama-3.3-70b-versatile',
      inputTokens: safeInputTokens,
      outputTokens: safeOutputTokens,
      totalTokens: safeTotalTokens,
      status,
      httpStatus,
      usageSource,
      rateLimitInfo,
      createdAt: new Date().toISOString(),
    });

    // 2. Increment Active Key Counters (clean and reliable without assuming MongoDB-only $inc)
    if (activePeriod) {
      const periodId = activePeriod.id || activePeriod._id;
      const updatedRequests = (activePeriod.totalRequests || 0) + 1;
      const updatedInput = (activePeriod.totalInputTokens || 0) + safeInputTokens;
      const updatedOutput = (activePeriod.totalOutputTokens || 0) + safeOutputTokens;
      const updatedTotal = (activePeriod.totalTokens || 0) + safeTotalTokens;

      const updatedPeriod = await GroqKeyPeriod.findByIdAndUpdate(
        periodId,
        {
          totalRequests: updatedRequests,
          totalInputTokens: updatedInput,
          totalOutputTokens: updatedOutput,
          totalTokens: updatedTotal,
          lastUsedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { new: true }
      );

      if (updatedPeriod) {
        cachedActivePeriod = updatedPeriod;
      }
    }
  } catch (err) {
    logger.warn(`[GroqUsageTracker] Failed to record usage: ${err.message}`);
  }
}

/**
 * Handle API key change notification (e.g. from PUT /api/bot/settings)
 */
async function onApiKeyChanged(newApiKey) {
  cachedActivePeriod = null;
  return await getOrCreateActivePeriod(newApiKey);
}

/**
 * Retrieve complete usage summary for active key and historical previous keys
 * (Backend-only reporting endpoint for admin debugging / audit)
 */
async function getUsageSummary(apiKeyOverride = null) {
  const currentKey = apiKeyOverride || env.groqApiKey || process.env.GROQ_API_KEY;
  let activePeriod = null;
  if (currentKey) {
    activePeriod = await getOrCreateActivePeriod(currentKey);
  }
  if (!activePeriod) {
    activePeriod = await GroqKeyPeriod.findOne({ isActive: true });
  }
  const allPeriods = await GroqKeyPeriod.find().sort({ createdAt: -1 });

  // Sanitize periods: NEVER expose key fingerprints in output
  const sanitizePeriod = (p) => ({
    id: p.id || p._id,
    keyVersion: p.keyVersion,
    keyHint: p.keyHint,
    isActive: Boolean(p.isActive),
    totalRequests: p.totalRequests || 0,
    totalInputTokens: p.totalInputTokens || 0,
    totalOutputTokens: p.totalOutputTokens || 0,
    totalTokens: p.totalTokens || 0,
    firstSeenAt: p.firstSeenAt,
    lastUsedAt: p.lastUsedAt,
    createdAt: p.createdAt,
  });

  const active = activePeriod ? sanitizePeriod(activePeriod) : null;
  const activeId = activePeriod ? (activePeriod.id || activePeriod._id) : null;
  const activeFingerprint = activePeriod ? activePeriod.keyFingerprint : null;

  const historical = allPeriods
    .filter((p) => {
      const pid = p.id || p._id;
      if (activeId && pid === activeId) return false;
      if (activeFingerprint && p.keyFingerprint === activeFingerprint) return false;
      return true;
    })
    .map(sanitizePeriod);

  // Recent 15 logs
  const recentLogs = await GroqUsageLog.find().sort({ createdAt: -1 }).limit(15);
  const sanitizedLogs = recentLogs.map((l) => ({
    id: l.id || l._id,
    keyVersion: l.keyVersion,
    model: l.model,
    inputTokens: l.inputTokens,
    outputTokens: l.outputTokens,
    totalTokens: l.totalTokens,
    status: l.status,
    httpStatus: l.httpStatus,
    usageSource: l.usageSource,
    rateLimitInfo: l.rateLimitInfo,
    createdAt: l.createdAt,
  }));

  return {
    activeKeyUsage: active,
    historicalKeysUsage: historical,
    totalHistoricalKeysCount: historical.length,
    latestReportedRateLimits: latestRateLimits,
    verifiedScopeInfo: {
      rateLimitScope: 'Organization & Model Tier (Shared across all keys in the same Groq organization)',
      trackingResetScope: 'Application Key Tracking Period (Per-key counters reset to 0 when key changes)',
      importantNotice:
        'Notice: Rate limits (RPM/TPM) reported by Groq Cloud headers are enforced at the Organization level for each model. Switching API keys within the same Groq organization resets application-level usage tracking for that key, but does not reset Groq server-side organization quotas.',
    },
    recentRequests: sanitizedLogs,
  };
}

module.exports = {
  generateKeyFingerprint,
  getMaskedKeyHint,
  parseRateLimitHeaders,
  checkRateLimitWarnings,
  getOrCreateActivePeriod,
  recordUsage,
  onApiKeyChanged,
  getUsageSummary,
};
