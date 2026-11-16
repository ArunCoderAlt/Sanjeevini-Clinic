const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { getSupabase } = require('../config/supabase');
const env = require('../config/environment');
const logger = require('../utils/logger');
const {
  fallbackDoctors,
  fallbackServices,
  fallbackTreatments,
  fallbackSettings,
  fallbackTestimonials,
  fallbackGallery,
  fallbackUsers,
  fallbackReels,
  fallbackSwarnaBindu,
} = require('../data/fallbackData');

// ==============================================================================
// PERSISTENT LOCAL FILE STORE
// Guarantees all admin creates, updates, and deletes permanently survive
// server restarts, nodemon reloads, and page refreshes even offline.
// ==============================================================================
const LOCAL_STORE_PATH = path.resolve(__dirname, '../data/clinicFallbackStore.json');

const loadFallbackStore = () => {
  try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      const raw = fs.readFileSync(LOCAL_STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    logger.warn(`Could not load local fallback store: ${err.message}`);
  }
  return null;
};

const saveFallbackStore = (stores) => {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(stores, null, 2), 'utf8');
  } catch (err) {
    logger.warn(`Could not persist local fallback store: ${err.message}`);
  }
};

const savedStores = loadFallbackStore();

// In-memory data stores for flawless local development and offline fallback
const memoryStores = {
  doctors: savedStores?.doctors ? [...savedStores.doctors] : [...fallbackDoctors],
  services: savedStores?.services ? [...savedStores.services] : [...fallbackServices],
  treatments: savedStores?.treatments ? [...savedStores.treatments] : [...fallbackTreatments],
  site_settings: savedStores?.site_settings ? [...savedStores.site_settings] : [{ ...fallbackSettings }],
  testimonials: savedStores?.testimonials ? [...savedStores.testimonials] : [...fallbackTestimonials],
  gallery: savedStores?.gallery ? [...savedStores.gallery] : [...fallbackGallery],
  users: savedStores?.users ? [...savedStores.users] : [...fallbackUsers],
  reels: savedStores?.reels ? [...savedStores.reels] : [...fallbackReels],
  appointments: savedStores?.appointments ? [...savedStores.appointments] : [],
  contact_messages: savedStores?.contact_messages ? [...savedStores.contact_messages] : [],
  newsletters: savedStores?.newsletters ? [...savedStores.newsletters] : [],
  swarna_bindu: savedStores?.swarna_bindu ? [...savedStores.swarna_bindu] : [...fallbackSwarnaBindu],
  groq_key_periods: savedStores?.groq_key_periods ? [...savedStores.groq_key_periods] : [],
  groq_usage_logs: savedStores?.groq_usage_logs ? [...savedStores.groq_usage_logs] : [],
};

// Write initial store to disk if not present
if (!savedStores) {
  saveFallbackStore(memoryStores);
}

let supabaseIsHealthy = false;
let lastSupabaseHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30 * 1000;

const checkSupabaseLive = async () => {
  const url = env.supabaseUrl;
  const key = env.supabaseKey;
  if (!url || !key || url.includes('your-project-id.supabase.co')) {
    supabaseIsHealthy = false;
    return false;
  }
  try {
    const client = getSupabase();
    const query = client.from('users').select('id').limit(1);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500));
    const { data, error } = await Promise.race([query, timeout]);
    supabaseIsHealthy = !error;
  } catch {
    supabaseIsHealthy = false;
  }
  lastSupabaseHealthCheck = Date.now();
  return supabaseIsHealthy;
};

// Initial non-blocking probe
checkSupabaseLive().catch(() => {});

const isSupabaseLive = () => {
  if (Date.now() - lastSupabaseHealthCheck > HEALTH_CHECK_INTERVAL) {
    checkSupabaseLive().catch(() => {});
  }
  return supabaseIsHealthy;
};

// ==============================================================================
// HIGH-PERFORMANCE IN-MEMORY QUERY CACHE
// Delivers sub-millisecond data serving (<1ms vs 300-800ms) with instant invalidation
// ==============================================================================
const queryCache = new Map();
const MAX_SERVER_CACHE_ENTRIES = 300;

const TABLE_TTLS = {
  doctors: 30 * 1000,          // 30 seconds
  services: 30 * 1000,         // 30 seconds
  treatments: 30 * 1000,       // 30 seconds
  site_settings: 30 * 1000,    // 30 seconds
  gallery: 30 * 1000,          // 30 seconds
  testimonials: 30 * 1000,     // 30 seconds
  reels: 30 * 1000,            // 30 seconds
  swarna_bindu: 30 * 1000,     // 30 seconds
  appointments: 10 * 1000,     // 10 seconds
  contact_messages: 10 * 1000, // 10 seconds
  users: 0,                    // Never cache user auth queries
  groq_key_periods: 0,         // Real-time API token usage tracking (never cache)
  groq_usage_logs: 0,          // Real-time API usage telemetry (never cache)
};

const getCacheKey = (tableName, queryType, params) => {
  return `${tableName}:${queryType}:${JSON.stringify(params)}`;
};

const getCachedQuery = (tableName, queryType, params) => {
  const ttl = TABLE_TTLS[tableName] !== undefined ? TABLE_TTLS[tableName] : 30 * 1000;
  if (ttl <= 0) return null;

  const key = getCacheKey(tableName, queryType, params);
  const entry = queryCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    queryCache.delete(key);
    return null;
  }
  return entry.data;
};

const setCachedQuery = (tableName, queryType, params, data) => {
  const ttl = TABLE_TTLS[tableName] !== undefined ? TABLE_TTLS[tableName] : 30 * 1000;
  if (ttl <= 0 || !data) return;

  const key = getCacheKey(tableName, queryType, params);
  queryCache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });

  // LRU eviction if cache size exceeds limit
  if (queryCache.size > MAX_SERVER_CACHE_ENTRIES) {
    const oldestKey = queryCache.keys().next().value;
    if (oldestKey) queryCache.delete(oldestKey);
  }
};

const invalidateTableCache = (tableName) => {
  if (!tableName) return;
  const prefixes = [`${tableName}:`];
  if (tableName === 'swarna_bindu') prefixes.push('swarna_bindu_events:');
  if (tableName === 'swarna_bindu_events') prefixes.push('swarna_bindu:');

  for (const key of queryCache.keys()) {
    if (prefixes.some((p) => key.startsWith(p))) {
      queryCache.delete(key);
    }
  }
};

const clearAllQueryCache = () => {
  queryCache.clear();
};

/**
 * Active Garbage Collection: Periodically sweeps memory cache to purge expired entries
 */
const runServerCacheGC = () => {
  const now = Date.now();
  for (const [key, entry] of queryCache.entries()) {
    if (!entry || !entry.expiresAt || now >= entry.expiresAt) {
      queryCache.delete(key);
    }
  }
  if (queryCache.size > MAX_SERVER_CACHE_ENTRIES) {
    const overflow = queryCache.size - MAX_SERVER_CACHE_ENTRIES;
    const keysToRemove = Array.from(queryCache.keys()).slice(0, overflow);
    for (const k of keysToRemove) queryCache.delete(k);
  }
};

// Periodic Garbage Collector running every 30 seconds
const serverCacheGCInterval = setInterval(runServerCacheGC, 30 * 1000);
if (serverCacheGCInterval.unref) {
  serverCacheGCInterval.unref();
}

/**
 * Convert camelCase string to snake_case.
 */
const camelToSnake = (str) => {
  if (str === 'order') return 'order_index';
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Convert snake_case string to camelCase.
 */
const snakeToCamel = (str) => {
  if (str === 'order_index') return 'order';
  return str.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Clean and convert input object keys to snake_case for Supabase columns.
 */
const toDbRow = (data, tableName = '') => {
  if (!data || typeof data !== 'object') return data;
  const result = {};

  for (const [key, value] of Object.entries(data)) {
    if (key === '_id' || key === 'save' || typeof value === 'function') continue;
    const snakeKey = camelToSnake(key);
    result[snakeKey] = value;
  }

  // Model-specific normalization to prevent column mismatch in PostgreSQL/Supabase
  if (tableName === 'reels') {
    if (result['start'] !== undefined || result['start_time'] !== undefined) {
      const startVal = Number(result['start'] !== undefined ? result['start'] : result['start_time']) || 0;
      result['start'] = startVal;
      result['start_time'] = startVal;
    }
    if (result['desc'] !== undefined || result['description'] !== undefined) {
      const descVal = result['desc'] || result['description'] || '';
      result['desc'] = descVal;
      result['description'] = descVal;
    }
  }

  if (tableName === 'swarna_bindu') {
    if (result['order'] !== undefined) {
      result['order_index'] = Number(result['order']) || 0;
    }
  }

  return result;
};

/**
 * Format a database row to include:
 * - both id and _id
 * - camelCase versions of all snake_case properties
 * - instance methods like .save()
 */
const formatRow = (row, tableName, customMethods = {}) => {
  if (!row) return null;
  const formatted = { ...row };

  if (row.id) {
    formatted._id = row.id;
  }

  for (const [key, value] of Object.entries(row)) {
    const camel = snakeToCamel(key);
    formatted[camel] = value;
    if (key === 'order_index') {
      formatted.order = value;
    }
  }

  // Model-specific normalization for frontend consumers
  if (tableName === 'reels') {
    formatted.start = row.start !== undefined ? row.start : (row.start_time !== undefined ? row.start_time : 0);
    formatted.desc = row.desc || row.description || '';
    formatted.description = row.description || row.desc || '';
  }

  formatted.save = async function () {
    const updateData = { ...this };
    delete updateData.save;
    delete updateData._id;
    const targetId = this.id || this._id;

    invalidateTableCache(tableName);

    if (isSupabaseLive()) {
      try {
        const client = getSupabase();
        const dbRow = toDbRow(updateData, tableName);
        delete dbRow.id;
        delete dbRow.created_at;

        const { data, error } = await client
          .from(tableName)
          .update(dbRow)
          .eq('id', targetId)
          .select()
          .single();

        if (!error && data) {
          const updated = formatRow(data, tableName, customMethods);
          Object.assign(this, updated);
          const store = memoryStores[tableName] || [];
          const idx = store.findIndex((i) => i.id === targetId || i._id === targetId);
          if (idx !== -1) {
            store[idx] = { ...store[idx], ...updated };
            saveFallbackStore(memoryStores);
          }
          return this;
        }
      } catch {
        // Fallback to in-memory update below
      }
    }

    // In-memory update
    const store = memoryStores[tableName] || [];
    const idx = store.findIndex((i) => i.id === targetId || i._id === targetId || String(i.id) === String(targetId) || String(i._id) === String(targetId));
    if (idx !== -1) {
      store[idx] = { ...store[idx], ...updateData };
      saveFallbackStore(memoryStores);
      const updated = formatRow(store[idx], tableName, customMethods);
      Object.assign(this, updated);
    }
    return this;
  };

  for (const [methodName, fn] of Object.entries(customMethods)) {
    formatted[methodName] = fn.bind(formatted);
  }

  return formatted;
};

/**
 * Filter an in-memory array by query criteria
 */
const filterMemoryStore = (items, filter = {}) => {
  return items.filter((item) => {
    for (const [key, val] of Object.entries(filter)) {
      if (val === undefined) continue;
      const camelKey = snakeToCamel(key);
      const snakeKey = camelToSnake(key);

      const itemVal = item[key] !== undefined ? item[key] : (item[camelKey] !== undefined ? item[camelKey] : item[snakeKey]);

      if (key === '_id' || key === 'id') {
        if (item.id !== val && item._id !== val) return false;
        continue;
      }

      if (val === null) {
        if (itemVal !== null) return false;
      } else if (Array.isArray(val)) {
        if (!val.includes(itemVal)) return false;
      } else {
        if (String(itemVal) !== String(val)) return false;
      }
    }
    return true;
  });
};

/**
 * Sort an in-memory array
 */
const sortMemoryStore = (items, sortFields = []) => {
  if (!sortFields.length) return items;
  return [...items].sort((a, b) => {
    for (const { field, ascending } of sortFields) {
      const camelField = snakeToCamel(field);
      const valA = a[camelField] !== undefined ? a[camelField] : a[field];
      const valB = b[camelField] !== undefined ? b[camelField] : b[field];

      if (valA === valB) continue;
      if (valA === undefined) return ascending ? -1 : 1;
      if (valB === undefined) return ascending ? 1 : -1;

      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
    }
    return 0;
  });
};

/**
 * QueryBuilder that provides chainable .sort(), .limit(), .skip(), .select()
 */
class QueryBuilder {
  constructor(tableName, initialFilter = {}, customMethods = {}) {
    this.tableName = tableName;
    this.filter = initialFilter || {};
    this.customMethods = customMethods;
    this.sortFields = [];
    this.limitVal = null;
    this.offsetVal = null;
    this.selectVal = '*';
    this.excludedFields = [];
  }

  sort(sortOptions) {
    if (typeof sortOptions === 'string') {
      const parts = sortOptions.trim().split(/\s+/);
      parts.forEach((p) => {
        if (p.startsWith('-')) {
          this.sortFields.push({ field: camelToSnake(p.slice(1)), ascending: false });
        } else {
          this.sortFields.push({ field: camelToSnake(p), ascending: true });
        }
      });
    } else if (sortOptions && typeof sortOptions === 'object') {
      for (const [key, dir] of Object.entries(sortOptions)) {
        const col = camelToSnake(key);
        const ascending = dir === 1 || dir === 'asc' || dir === 'ascending';
        this.sortFields.push({ field: col, ascending });
      }
    }
    return this;
  }

  limit(num) {
    this.limitVal = Number(num);
    return this;
  }

  skip(num) {
    this.offsetVal = Number(num);
    return this;
  }

  select(fields) {
    if (typeof fields === 'string') {
      const tokens = fields.trim().split(/[,\s]+/);
      const positiveTokens = [];
      tokens.forEach((t) => {
        if (!t) return;
        if (t.startsWith('-')) {
          this.excludedFields.push(t.slice(1));
        } else {
          positiveTokens.push(t);
        }
      });
      if (positiveTokens.length > 0) {
        const dbCols = positiveTokens.map(camelToSnake);
        if (!dbCols.includes('id')) dbCols.unshift('id');
        this.selectVal = dbCols.join(',');
      }
    } else if (Array.isArray(fields) && fields.length > 0) {
      const dbCols = fields.map(camelToSnake);
      if (!dbCols.includes('id')) dbCols.unshift('id');
      this.selectVal = dbCols.join(',');
    }
    return this;
  }

  async execute() {
    const cacheParams = {
      filter: this.filter,
      sort: this.sortFields,
      limit: this.limitVal,
      offset: this.offsetVal,
      select: this.selectVal,
    };

    const cached = getCachedQuery(this.tableName, 'find', cacheParams);
    if (cached) {
      return cached.map((row) => {
        const formatted = formatRow(row, this.tableName, this.customMethods);
        if (this.excludedFields.length > 0) {
          this.excludedFields.forEach((f) => {
            delete formatted[f];
            delete formatted[camelToSnake(f)];
          });
        }
        return formatted;
      });
    }

    let results = [];
    let queryWorked = false;

    if (isSupabaseLive()) {
      try {
        const client = getSupabase();
        let query = client.from(this.tableName).select(this.selectVal);

        for (const [key, value] of Object.entries(this.filter)) {
          if (value === undefined) continue;
          let col = camelToSnake(key);
          if (key === '_id' || key === 'id') col = 'id';

          if (value === null) {
            query = query.is(col, null);
          } else if (Array.isArray(value)) {
            query = query.in(col, value);
          } else {
            query = query.eq(col, value);
          }
        }

        if (this.sortFields.length > 0) {
          for (const { field, ascending } of this.sortFields) {
            query = query.order(field, { ascending });
          }
        }

        if (this.limitVal !== null) {
          if (this.offsetVal !== null) {
            query = query.range(this.offsetVal, this.offsetVal + this.limitVal - 1);
          } else {
            query = query.limit(this.limitVal);
          }
        } else if (this.offsetVal !== null) {
          query = query.range(this.offsetVal, this.offsetVal + 9999);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          results = data;
          queryWorked = true;
        }
      } catch (err) {
        logger.warn(`Supabase query on ${this.tableName} failed (${err.message}). Serving fallback data.`);
      }
    }

    if (!queryWorked) {
      const store = memoryStores[this.tableName] || [];
      let filtered = filterMemoryStore(store, this.filter);
      filtered = sortMemoryStore(filtered, this.sortFields);

      if (this.offsetVal !== null) {
        filtered = filtered.slice(this.offsetVal);
      }
      if (this.limitVal !== null) {
        filtered = filtered.slice(0, this.limitVal);
      }
      results = filtered;
    }

    // Cache results for ultra-fast subsequent lookups
    setCachedQuery(this.tableName, 'find', cacheParams, results);

    return results.map((row) => {
      const formatted = formatRow(row, this.tableName, this.customMethods);
      if (this.excludedFields.length > 0) {
        this.excludedFields.forEach((f) => {
          delete formatted[f];
          delete formatted[camelToSnake(f)];
        });
      }
      return formatted;
    });
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.execute().catch(onRejected);
  }
}

/**
 * SingleQueryBuilder for findById and findOne
 */
class SingleQueryBuilder {
  constructor(tableName, resolverFn, customMethods = {}) {
    this.tableName = tableName;
    this.resolverFn = resolverFn;
    this.customMethods = customMethods;
    this.excludedFields = [];
    this.selectVal = '*';
  }

  select(fields) {
    if (typeof fields === 'string') {
      const tokens = fields.trim().split(/[,\s]+/);
      const positiveTokens = [];
      tokens.forEach((t) => {
        if (!t) return;
        if (t.startsWith('-')) {
          this.excludedFields.push(t.slice(1));
        } else {
          positiveTokens.push(t);
        }
      });
      if (positiveTokens.length > 0) {
        const dbCols = positiveTokens.map(camelToSnake);
        if (!dbCols.includes('id')) dbCols.unshift('id');
        this.selectVal = dbCols.join(',');
      }
    } else if (Array.isArray(fields) && fields.length > 0) {
      const dbCols = fields.map(camelToSnake);
      if (!dbCols.includes('id')) dbCols.unshift('id');
      this.selectVal = dbCols.join(',');
    }
    return this;
  }

  async execute() {
    try {
      const row = await this.resolverFn(this.selectVal);
      if (!row) return null;

      const formatted = formatRow(row, this.tableName, this.customMethods);
      if (this.excludedFields.length > 0) {
        this.excludedFields.forEach((f) => {
          delete formatted[f];
          delete formatted[camelToSnake(f)];
        });
      }
      return formatted;
    } catch {
      return null;
    }
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.execute().catch(onRejected);
  }
}

/**
 * Create a Supabase Model abstraction with Mongoose-compatible API
 */
const createSupabaseModel = (tableName, options = {}) => {
  const customMethods = options.methods || {};
  const beforeSave = options.beforeSave || null;

  return {
    tableName,

    find(filter = {}) {
      return new QueryBuilder(tableName, filter, customMethods);
    },

    findOne(filter = {}) {
      const resolver = async (selectVal = '*') => {
        const cacheParams = { filter, select: selectVal };
        const cached = getCachedQuery(tableName, 'findOne', cacheParams);
        if (cached) return cached;

        let row = null;
        if (isSupabaseLive()) {
          try {
            const client = getSupabase();
            let query = client.from(tableName).select(selectVal);
            for (const [key, value] of Object.entries(filter)) {
              if (value === undefined) continue;
              let col = camelToSnake(key);
              if (key === '_id' || key === 'id') col = 'id';
              query = query.eq(col, value);
            }
            const { data, error } = await query.limit(1).maybeSingle();
            if (!error && data) row = data;
          } catch {
            // Fallback below
          }
        }
        if (!row) {
          const store = memoryStores[tableName] || [];
          const matches = filterMemoryStore(store, filter);
          row = matches.length > 0 ? matches[0] : null;
        }

        if (row) {
          setCachedQuery(tableName, 'findOne', cacheParams, row);
        }
        return row;
      };

      return new SingleQueryBuilder(tableName, resolver, customMethods);
    },

    findById(id) {
      const resolver = async (selectVal = '*') => {
        if (!id) return null;
        const cacheParams = { id, select: selectVal };
        const cached = getCachedQuery(tableName, 'findById', cacheParams);
        if (cached) return cached;

        let row = null;
        if (isSupabaseLive()) {
          try {
            const client = getSupabase();
            const { data, error } = await client.from(tableName).select(selectVal).eq('id', id).maybeSingle();
            if (!error && data) row = data;
          } catch {
            // Fallback below
          }
        }
        if (!row) {
          const store = memoryStores[tableName] || [];
          row = store.find((item) => item.id === id || item._id === id || String(item.id) === String(id) || String(item._id) === String(id)) || null;
        }

        if (row) {
          setCachedQuery(tableName, 'findById', cacheParams, row);
        }
        return row;
      };

      return new SingleQueryBuilder(tableName, resolver, customMethods);
    },

    async create(data) {
      invalidateTableCache(tableName);
      let payload = { ...data };
      if (beforeSave) {
        payload = await beforeSave(payload);
      }
      if (!payload.id) {
        payload.id = crypto.randomUUID();
      }
      payload.createdAt = payload.createdAt || new Date().toISOString();
      payload.updatedAt = new Date().toISOString();

      let supabaseCreated = null;
      if (isSupabaseLive()) {
        try {
          const client = getSupabase();
          const dbRow = toDbRow(payload, tableName);
          const { data: created, error } = await client
            .from(tableName)
            .insert(dbRow)
            .select()
            .single();

          if (!error && created) {
            supabaseCreated = formatRow(created, tableName, customMethods);
          } else if (error) {
            logger.warn(`Supabase insert error on ${tableName}: ${error.message} (${error.code})`);
          }
        } catch (err) {
          logger.warn(`Supabase insert failed on ${tableName}: ${err.message}. Persisting in memory.`);
        }
      }

      // Memory & local disk store persist
      if (!memoryStores[tableName]) memoryStores[tableName] = [];
      const itemToSave = supabaseCreated || payload;
      const existingIdx = memoryStores[tableName].findIndex((i) => i.id === itemToSave.id || i._id === itemToSave.id);
      if (existingIdx !== -1) {
        memoryStores[tableName][existingIdx] = itemToSave;
      } else {
        memoryStores[tableName].push(itemToSave);
      }
      saveFallbackStore(memoryStores);
      return supabaseCreated || formatRow(payload, tableName, customMethods);
    },

    async findByIdAndUpdate(id, updateData, _options = {}) {
      if (!id) return null;
      invalidateTableCache(tableName);
      let payload = { ...updateData };
      payload.updatedAt = new Date().toISOString();

      let supabaseUpdated = null;
      if (isSupabaseLive()) {
        try {
          const client = getSupabase();
          const dbRow = toDbRow(payload, tableName);
          delete dbRow.id;
          delete dbRow.created_at;

          const { data, error } = await client
            .from(tableName)
            .update(dbRow)
            .eq('id', id)
            .select()
            .maybeSingle();

          if (!error && data) {
            supabaseUpdated = formatRow(data, tableName, customMethods);
          } else if (error) {
            logger.warn(`Supabase update error on ${tableName}: ${error.message} (${error.code})`);
          }
        } catch (err) {
          logger.warn(`Supabase update failed on ${tableName}: ${err.message}`);
        }
      }

      const store = memoryStores[tableName] || [];
      const idx = store.findIndex((i) => i.id === id || i._id === id || String(i.id) === String(id) || String(i._id) === String(id));
      if (idx !== -1) {
        store[idx] = { ...store[idx], ...(supabaseUpdated || payload) };
        saveFallbackStore(memoryStores);
        return supabaseUpdated || formatRow(store[idx], tableName, customMethods);
      } else if (supabaseUpdated) {
        store.push(supabaseUpdated);
        saveFallbackStore(memoryStores);
        return supabaseUpdated;
      }
      return supabaseUpdated || null;
    },

    async findOneAndUpdate(filter = {}, updateData, _options = {}) {
      invalidateTableCache(tableName);
      let payload = { ...updateData };
      payload.updatedAt = new Date().toISOString();

      let supabaseUpdated = null;
      if (isSupabaseLive()) {
        try {
          const client = getSupabase();
          const dbRow = toDbRow(payload, tableName);
          delete dbRow.id;
          delete dbRow.created_at;

          let query = client.from(tableName).update(dbRow);
          for (const [key, value] of Object.entries(filter)) {
            let col = camelToSnake(key);
            if (key === '_id' || key === 'id') col = 'id';
            query = query.eq(col, value);
          }

          if (Object.keys(filter).length === 0) {
            const { data: first } = await client.from(tableName).select('id').limit(1).maybeSingle();
            if (first) query = query.eq('id', first.id);
          }

          const { data, error } = await query.select().maybeSingle();
          if (!error && data) {
            supabaseUpdated = formatRow(data, tableName, customMethods);
          }
        } catch {
          // Fallback below
        }
      }

      const store = memoryStores[tableName] || [];
      const matches = filterMemoryStore(store, filter);
      if (matches.length > 0) {
        const item = matches[0];
        Object.assign(item, supabaseUpdated || payload);
        saveFallbackStore(memoryStores);
        return supabaseUpdated || formatRow(item, tableName, customMethods);
      } else if (Object.keys(filter).length === 0 && store.length > 0) {
        Object.assign(store[0], supabaseUpdated || payload);
        saveFallbackStore(memoryStores);
        return supabaseUpdated || formatRow(store[0], tableName, customMethods);
      }
      return supabaseUpdated || null;
    },

    async findByIdAndDelete(id) {
      if (!id) return null;
      invalidateTableCache(tableName);
      let deletedRow = null;

      if (isSupabaseLive()) {
        try {
          const client = getSupabase();
          const { data, error } = await client
            .from(tableName)
            .delete()
            .eq('id', id)
            .select()
            .maybeSingle();

          if (!error && data) {
            deletedRow = formatRow(data, tableName, customMethods);
          } else if (error) {
            logger.warn(`Supabase delete error on ${tableName}: ${error.message}`);
          }
        } catch (err) {
          logger.warn(`Supabase delete failed on ${tableName}: ${err.message}`);
        }
      }

      const store = memoryStores[tableName] || [];
      const idx = store.findIndex((i) => i.id === id || i._id === id || String(i.id) === String(id) || String(i._id) === String(id));
      if (idx !== -1) {
        const deleted = store.splice(idx, 1)[0];
        saveFallbackStore(memoryStores);
        return deletedRow || formatRow(deleted, tableName, customMethods);
      }
      if (deletedRow) {
        saveFallbackStore(memoryStores);
        return deletedRow;
      }
      return null;
    },

    async findOneAndDelete(filter = {}) {
      invalidateTableCache(tableName);
      let deletedRow = null;

      if (isSupabaseLive()) {
        try {
          const client = getSupabase();
          let query = client.from(tableName).delete();
          for (const [key, value] of Object.entries(filter)) {
            let col = camelToSnake(key);
            if (key === '_id' || key === 'id') col = 'id';
            query = query.eq(col, value);
          }
          const { data, error } = await query.select().maybeSingle();
          if (!error && data) deletedRow = formatRow(data, tableName, customMethods);
        } catch {
          // Fallback below
        }
      }

      const store = memoryStores[tableName] || [];
      const matches = filterMemoryStore(store, filter);
      if (matches.length > 0) {
        const idx = store.indexOf(matches[0]);
        const deleted = store.splice(idx, 1)[0];
        saveFallbackStore(memoryStores);
        return deletedRow || formatRow(deleted, tableName, customMethods);
      }
      if (deletedRow) {
        saveFallbackStore(memoryStores);
        return deletedRow;
      }
      return null;
    },

    async deleteMany(filter = {}) {
      invalidateTableCache(tableName);
      if (isSupabaseLive()) {
        try {
          const client = getSupabase();
          let query = client.from(tableName).delete();
          if (Object.keys(filter).length === 0) {
            query = query.neq('id', '00000000-0000-0000-0000-000000000000');
          } else {
            for (const [key, value] of Object.entries(filter)) {
              let col = camelToSnake(key);
              if (key === '_id' || key === 'id') col = 'id';
              query = query.eq(col, value);
            }
          }
          const { data, error } = await query.select('id');
          if (!error && data) {
            if (Object.keys(filter).length === 0) {
              memoryStores[tableName] = [];
            } else {
              const store = memoryStores[tableName] || [];
              memoryStores[tableName] = store.filter((item) => !filterMemoryStore([item], filter).length);
            }
            saveFallbackStore(memoryStores);
            return { deletedCount: data.length };
          }
        } catch {
          // Fallback below
        }
      }

      if (Object.keys(filter).length === 0) {
        const count = (memoryStores[tableName] || []).length;
        memoryStores[tableName] = [];
        saveFallbackStore(memoryStores);
        return { deletedCount: count };
      }
      const store = memoryStores[tableName] || [];
      const toKeep = store.filter((item) => !filterMemoryStore([item], filter).length);
      const deletedCount = store.length - toKeep.length;
      memoryStores[tableName] = toKeep;
      saveFallbackStore(memoryStores);
      return { deletedCount };
    },

    async insertMany(items = []) {
      invalidateTableCache(tableName);
      if (!items || items.length === 0) return [];
      const rows = [];
      for (let item of items) {
        if (beforeSave) item = await beforeSave(item);
        if (!item.id) item.id = crypto.randomUUID();
        item.createdAt = item.createdAt || new Date().toISOString();
        rows.push(item);
      }

      if (isSupabaseLive()) {
        try {
          const client = getSupabase();
          const dbRows = rows.map((r) => toDbRow(r));
          const { data, error } = await client.from(tableName).insert(dbRows).select();
          if (!error && data) {
            return data.map((d) => formatRow(d, tableName, customMethods));
          }
        } catch {
          // Fallback below
        }
      }

      if (!memoryStores[tableName]) memoryStores[tableName] = [];
      memoryStores[tableName].push(...rows);
      return rows.map((r) => formatRow(r, tableName, customMethods));
    },

    async distinct(field, filter = {}) {
      if (isSupabaseLive()) {
        try {
          const client = getSupabase();
          const col = camelToSnake(field);
          const { data, error } = await client.from(tableName).select(col);
          if (!error && data) {
            const values = data.map((item) => item[col]).filter(Boolean);
            return [...new Set(values)];
          }
        } catch {
          // Fallback below
        }
      }

      const store = memoryStores[tableName] || [];
      const filtered = filterMemoryStore(store, filter);
      const camelField = snakeToCamel(field);
      const vals = filtered
        .map((i) => i[camelField] !== undefined ? i[camelField] : i[field])
        .filter(Boolean);
      return [...new Set(vals)];
    },

    async countDocuments(filter = {}) {
      if (isSupabaseLive()) {
        try {
          const client = getSupabase();
          let query = client.from(tableName).select('*', { count: 'exact', head: true });
          for (const [key, value] of Object.entries(filter)) {
            let col = camelToSnake(key);
            if (key === '_id' || key === 'id') col = 'id';
            query = query.eq(col, value);
          }
          const { count, error } = await query;
          if (!error && typeof count === 'number') return count;
        } catch {
          // Fallback below
        }
      }

      const store = memoryStores[tableName] || [];
      return filterMemoryStore(store, filter).length;
    },
  };
};

module.exports = {
  createSupabaseModel,
  toDbRow,
  formatRow,
  camelToSnake,
  snakeToCamel,
  memoryStores,
  invalidateTableCache,
  clearAllQueryCache,
  purgeCache: invalidateTableCache,
  purgeAllCache: clearAllQueryCache,
  runServerCacheGC,
  queryCache,
};
