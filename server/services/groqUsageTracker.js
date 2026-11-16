const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const GroqKeyPeriod = require('../models/GroqKeyPeriod');
const GroqUsageLog = require('../models/GroqUsageLog');
const logger = require('../utils/logger');
const env = require('../config/environment');

// Memory cache for active period and latest rate-limit telemetry
let cachedActivePeriod = null;
let latestRateLimits = null;

// Persistent file store path to guarantee counters survive server restarts, nodemon reloads, and container recycles
const USAGE_STORE_PATH = path.join(__dirname, '../data/groqUsageStore.json');

function readLocalStore() {
  try {
    if (fs.existsSync(USAGE_STORE_PATH)) {
      const raw = fs.readFileSync(USAGE_STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      return {
        periods: Array.isArray(parsed?.periods) ? parsed.periods : [],
        latestRateLimits: parsed?.latestRateLimits || null,
        logs: Array.isArray(parsed?.logs) ? parsed.logs : []
      };
    }
  } catch (err) {
    logger.warn(`[GroqUsageTracker] Failed to read ${USAGE_STORE_PATH}: ${err.message}`);
  }
  return { periods: [], latestRateLimits: null, logs: [] };
}

function writeLocalStore(data) {
  try {
    fs.writeFileSync(USAGE_STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    logger.warn(`[GroqUsageTracker] Failed to write ${USAGE_STORE_PATH}: ${err.message}`);
  }
}

function syncToLocalStore(activePeriod, storeData = readLocalStore()) {
  if (!activePeriod) return;
  const periods = storeData.periods || [];
  const idx = periods.findIndex(p => p.keyFingerprint === activePeriod.keyFingerprint);
  const plainObj = {
    id: activePeriod.id || activePeriod._id,
    keyVersion: activePeriod.keyVersion,
    keyFingerprint: activePeriod.keyFingerprint,
    keyHint: activePeriod.keyHint,
    isActive: Boolean(activePeriod.isActive),
    totalRequests: activePeriod.totalRequests || 0,
    totalInputTokens: activePeriod.totalInputTokens || 0,
    totalOutputTokens: activePeriod.totalOutputTokens || 0,
    totalTokens: activePeriod.totalTokens || 0,
    firstSeenAt: activePeriod.firstSeenAt,
    lastUsedAt: activePeriod.lastUsedAt,
    createdAt: activePeriod.createdAt,
    updatedAt: activePeriod.updatedAt || new Date().toISOString(),
  };

  if (idx !== -1) {
    periods[idx] = { ...periods[idx], ...plainObj };
  } else {
    periods.push(plainObj);
  }

  // Ensure other periods are marked inactive
  periods.forEach(p => {
    if (p.keyFingerprint !== activePeriod.keyFingerprint) {
      p.isActive = false;
    }
  });

  storeData.periods = periods;
  if (latestRateLimits) {
    storeData.latestRateLimits = latestRateLimits;
  }
  writeLocalStore(storeData);
}

// Hydrate initial memory state from persistent local store upon module load
try {
  const initialStore = readLocalStore();
  if (initialStore.latestRateLimits) {
    latestRateLimits = initialStore.latestRateLimits;
  }
  const currentKey = env.groqApiKey || process.env.GROQ_API_KEY;
  const currentFingerprint = generateKeyFingerprint(currentKey);
  if (currentFingerprint && Array.isArray(initialStore.periods)) {
    const matchingPeriod = initialStore.periods.find(p => p.keyFingerprint === currentFingerprint);
    if (matchingPeriod) {
      cachedActivePeriod = matchingPeriod;
    }
  }
} catch (_) {}

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
 * Ensures server restarts and page refreshes do NOT wipe or re-create an existing key's period.
 */
async function getOrCreateActivePeriod(apiKey) {
  const currentKey = apiKey || env.groqApiKey || process.env.GROQ_API_KEY;
  const fingerprint = generateKeyFingerprint(currentKey);

  if (!fingerprint) {
    return null;
  }

  // 1. Check in-memory cache first if fingerprint matches
  if (cachedActivePeriod && cachedActivePeriod.keyFingerprint === fingerprint && cachedActivePeriod.isActive) {
    return cachedActivePeriod;
  }

  // 2. Check persistent disk store
  const storeData = readLocalStore();
  const existingLocalPeriod = storeData.periods?.find(p => p.keyFingerprint === fingerprint);

  // 3. Search database for an existing period with this fingerprint
  let existingPeriod = await GroqKeyPeriod.findOne({ keyFingerprint: fingerprint });

  if (!existingPeriod && existingLocalPeriod) {
    try {
      existingPeriod = await GroqKeyPeriod.create(existingLocalPeriod);
    } catch {
      existingPeriod = existingLocalPeriod;
    }
  }

  if (existingPeriod) {
    // Preserve highest recorded values across local store and database
    if (existingLocalPeriod) {
      existingPeriod.totalRequests = Math.max(existingPeriod.totalRequests || 0, existingLocalPeriod.totalRequests || 0);
      existingPeriod.totalInputTokens = Math.max(existingPeriod.totalInputTokens || 0, existingLocalPeriod.totalInputTokens || 0);
      existingPeriod.totalOutputTokens = Math.max(existingPeriod.totalOutputTokens || 0, existingLocalPeriod.totalOutputTokens || 0);
      existingPeriod.totalTokens = Math.max(existingPeriod.totalTokens || 0, existingLocalPeriod.totalTokens || 0);
      existingPeriod.firstSeenAt = existingPeriod.firstSeenAt || existingLocalPeriod.firstSeenAt;
      existingPeriod.lastUsedAt = existingPeriod.lastUsedAt || existingLocalPeriod.lastUsedAt;
    }

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
    syncToLocalStore(existingPeriod, storeData);
    return existingPeriod;
  }

  // If not found anywhere, a new key has been configured!
  // Start a new tracking period with counters starting at zero.
  const allPeriods = await GroqKeyPeriod.find();
  const allKnown = [...(storeData.periods || []), ...allPeriods];
  const uniqueFingerprints = new Set(allKnown.map(p => p.keyFingerprint).filter(Boolean));
  const nextVersionNumber = uniqueFingerprints.size + 1;
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
  syncToLocalStore(newPeriod, storeData);

  logger.info(
    `[GroqUsageTracker] New Groq API key detected (${keyHint}). Started tracking period "${keyVersion}" with counters initialized to 0.`
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
    const logItem = {
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
    };

    try {
      await GroqUsageLog.create(logItem);
    } catch (_) {}

    // 2. Increment Active Key Counters and persist immediately to file store
    if (activePeriod) {
      const periodId = activePeriod.id || activePeriod._id;
      const updatedRequests = (activePeriod.totalRequests || 0) + 1;
      const updatedInput = (activePeriod.totalInputTokens || 0) + safeInputTokens;
      const updatedOutput = (activePeriod.totalOutputTokens || 0) + safeOutputTokens;
      const updatedTotal = (activePeriod.totalTokens || 0) + safeTotalTokens;

      const updatePayload = {
        totalRequests: updatedRequests,
        totalInputTokens: updatedInput,
        totalOutputTokens: updatedOutput,
        totalTokens: updatedTotal,
        lastUsedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        const updatedPeriod = await GroqKeyPeriod.findByIdAndUpdate(
          periodId,
          updatePayload,
          { new: true }
        );
        if (updatedPeriod) {
          cachedActivePeriod = updatedPeriod;
        } else {
          Object.assign(activePeriod, updatePayload);
          cachedActivePeriod = activePeriod;
        }
      } catch (_) {
        Object.assign(activePeriod, updatePayload);
        cachedActivePeriod = activePeriod;
      }

      // Write updated counters and latest log to persistent local file store
      const storeData = readLocalStore();
      if (!storeData.logs) storeData.logs = [];
      storeData.logs.unshift(logItem);
      if (storeData.logs.length > 50) storeData.logs = storeData.logs.slice(0, 50);

      if (latestRateLimits) {
        storeData.latestRateLimits = latestRateLimits;
      }
      syncToLocalStore(cachedActivePeriod, storeData);
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
 */
async function getUsageSummary(apiKeyOverride = null) {
  const storeData = readLocalStore();
  const currentKey = apiKeyOverride || env.groqApiKey || process.env.GROQ_API_KEY;
  let activePeriod = null;
  if (currentKey) {
    activePeriod = await getOrCreateActivePeriod(currentKey);
  }
  if (!activePeriod) {
    activePeriod = await GroqKeyPeriod.findOne({ isActive: true });
  }
  if (!activePeriod) {
    const localActive = storeData.periods?.find(p => p.isActive) || storeData.periods?.[0];
    if (localActive) {
      activePeriod = localActive;
    }
  }

  if (!latestRateLimits && storeData.latestRateLimits) {
    latestRateLimits = storeData.latestRateLimits;
  }

  // Merge database periods and local persistent file periods
  const mergedPeriodsMap = new Map();
  (storeData.periods || []).forEach(p => {
    if (p.keyFingerprint) mergedPeriodsMap.set(p.keyFingerprint, p);
  });

  try {
    const allDbPeriods = await GroqKeyPeriod.find().sort({ createdAt: -1 });
    allDbPeriods.forEach(p => {
      if (p.keyFingerprint) {
        const existing = mergedPeriodsMap.get(p.keyFingerprint);
        if (existing) {
          mergedPeriodsMap.set(p.keyFingerprint, {
            ...existing,
            ...p,
            totalRequests: Math.max(p.totalRequests || 0, existing.totalRequests || 0),
            totalInputTokens: Math.max(p.totalInputTokens || 0, existing.totalInputTokens || 0),
            totalOutputTokens: Math.max(p.totalOutputTokens || 0, existing.totalOutputTokens || 0),
            totalTokens: Math.max(p.totalTokens || 0, existing.totalTokens || 0),
          });
        } else {
          mergedPeriodsMap.set(p.keyFingerprint, p);
        }
      }
    });
  } catch (_) {}

  const allMergedPeriods = [...mergedPeriodsMap.values()];

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
  const activeFingerprint = activePeriod ? activePeriod.keyFingerprint : null;

  const historical = allMergedPeriods
    .filter((p) => {
      if (activeFingerprint && p.keyFingerprint === activeFingerprint) return false;
      return true;
    })
    .map(sanitizePeriod);

  // Recent 15 logs
  let recentLogs = [];
  try {
    recentLogs = await GroqUsageLog.find().sort({ createdAt: -1 }).limit(15);
  } catch {
    recentLogs = (storeData.logs || []).slice(0, 15);
  }

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
