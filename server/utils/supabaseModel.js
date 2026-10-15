const crypto = require('crypto');
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
} = require('../data/fallbackData');

// In-memory data stores for flawless local development and offline fallback
const memoryStores = {
  doctors: [...fallbackDoctors],
  services: [...fallbackServices],
  treatments: [...fallbackTreatments],
  site_settings: [{ ...fallbackSettings }],
  testimonials: [...fallbackTestimonials],
  gallery: [...fallbackGallery],
  users: [...fallbackUsers],
  reels: [...fallbackReels],
  appointments: [],
  contact_messages: [],
  newsletters: [],
  groq_key_periods: [],
  groq_usage_logs: [],
};

const isSupabaseLive = () => {
  const url = env.supabaseUrl;
  const key = env.supabaseKey;
  if (!url || !key) return false;
  if (url.includes('your-project-id.supabase.co')) return false;
  return true;
};

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
const toDbRow = (data) => {
  if (!data || typeof data !== 'object') return data;
  const result = {};

  for (const [key, value] of Object.entries(data)) {
    if (key === '_id' || key === 'save' || typeof value === 'function') continue;
    const snakeKey = camelToSnake(key);
    result[snakeKey] = value;
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

  formatted.save = async function () {
    const updateData = { ...this };
    delete updateData.save;
    delete updateData._id;
    const targetId = this.id || this._id;

    if (isSupabaseLive()) {
      try {
        const client = getSupabase();
        const dbRow = toDbRow(updateData);
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
          return this;
        }
      } catch {
        // Fallback to in-memory update below
      }
    }

    // In-memory update
    const store = memoryStores[tableName] || [];
    const idx = store.findIndex((i) => i.id === targetId || i._id === targetId);
    if (idx !== -1) {
      store[idx] = { ...store[idx], ...updateData };
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
      const tokens = fields.trim().split(/\s+/);
      tokens.forEach((t) => {
        if (t.startsWith('-')) {
          this.excludedFields.push(t.slice(1));
        }
      });
    }
    return this;
  }

  async execute() {
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
  }

  select(fields) {
    if (typeof fields === 'string') {
      const tokens = fields.trim().split(/\s+/);
      tokens.forEach((t) => {
        if (t.startsWith('-')) {
          this.excludedFields.push(t.slice(1));
        }
      });
    }
    return this;
  }

  async execute() {
    try {
      const row = await this.resolverFn();
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
      const resolver = async () => {
        if (isSupabaseLive()) {
          try {
            const client = getSupabase();
            let query = client.from(tableName).select('*');
            for (const [key, value] of Object.entries(filter)) {
              if (value === undefined) continue;
              let col = camelToSnake(key);
              if (key === '_id' || key === 'id') col = 'id';
              query = query.eq(col, value);
            }
            const { data, error } = await query.limit(1).maybeSingle();
            if (!error && data) return data;
          } catch {
            // Fallback below
          }
        }
        const store = memoryStores[tableName] || [];
        const matches = filterMemoryStore(store, filter);
        return matches.length > 0 ? matches[0] : null;
      };

      return new SingleQueryBuilder(tableName, resolver, customMethods);
    },

    findById(id) {
      const resolver = async () => {
        if (!id) return null;
        if (isSupabaseLive()) {
          try {
            const client = getSupabase();
            const { data, error } = await client.from(tableName).select('*').eq('id', id).maybeSingle();
            if (!error && data) return data;
          } catch {
            // Fallback below
          }
        }
        const store = memoryStores[tableName] || [];
        return store.find((item) => item.id === id || item._id === id) || null;
      };

      return new SingleQueryBuilder(tableName, resolver, customMethods);
    },

    async create(data) {
      let payload = { ...data };
      if (beforeSave) {
        payload = await beforeSave(payload);
      }
      if (!payload.id) {
        payload.id = crypto.randomUUID();
      }
      payload.createdAt = payload.createdAt || new Date().toISOString();
      payload.updatedAt = new Date().toISOString();

      if (isSupabaseLive()) {
        try {
          const client = getSupabase();
          const dbRow = toDbRow(payload);
          const { data: created, error } = await client
            .from(tableName)
            .insert(dbRow)
            .select()
            .single();

          if (!error && created) {
            return formatRow(created, tableName, customMethods);
          }
        } catch (err) {
          logger.warn(`Supabase insert failed on ${tableName}: ${err.message}. Persisting in memory.`);
        }
      }

      // Memory fallback persist
      if (!memoryStores[tableName]) memoryStores[tableName] = [];
      memoryStores[tableName].push(payload);
      return formatRow(payload, tableName, customMethods);
    },

    async findByIdAndUpdate(id, updateData, _options = {}) {
      if (!id) return null;
      let payload = { ...updateData };
      payload.updatedAt = new Date().toISOString();

      if (isSupabaseLive()) {
        try {
          const client = getSupabase();
          const dbRow = toDbRow(payload);
          delete dbRow.id;
          delete dbRow.created_at;

          const { data, error } = await client
            .from(tableName)
            .update(dbRow)
            .eq('id', id)
            .select()
            .maybeSingle();

          if (!error && data) {
            return formatRow(data, tableName, customMethods);
          }
        } catch {
          // Fallback below
        }
      }

      const store = memoryStores[tableName] || [];
      const idx = store.findIndex((i) => i.id === id || i._id === id);
      if (idx !== -1) {
        store[idx] = { ...store[idx], ...payload };
        return formatRow(store[idx], tableName, customMethods);
      }
      return null;
    },

    async findOneAndUpdate(filter = {}, updateData, _options = {}) {
      let payload = { ...updateData };
      payload.updatedAt = new Date().toISOString();

      if (isSupabaseLive()) {
        try {
          const client = getSupabase();
          const dbRow = toDbRow(payload);
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
            return formatRow(data, tableName, customMethods);
          }
        } catch {
          // Fallback below
        }
      }

      const store = memoryStores[tableName] || [];
      const matches = filterMemoryStore(store, filter);
      if (matches.length > 0) {
        const item = matches[0];
        Object.assign(item, payload);
        return formatRow(item, tableName, customMethods);
      } else if (Object.keys(filter).length === 0 && store.length > 0) {
        Object.assign(store[0], payload);
        return formatRow(store[0], tableName, customMethods);
      }
      return null;
    },

    async findByIdAndDelete(id) {
      if (!id) return null;
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
            return formatRow(data, tableName, customMethods);
          }
        } catch {
          // Fallback below
        }
      }

      const store = memoryStores[tableName] || [];
      const idx = store.findIndex((i) => i.id === id || i._id === id);
      if (idx !== -1) {
        const deleted = store.splice(idx, 1)[0];
        return formatRow(deleted, tableName, customMethods);
      }
      return null;
    },

    async findOneAndDelete(filter = {}) {
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
          if (!error && data) return formatRow(data, tableName, customMethods);
        } catch {
          // Fallback below
        }
      }

      const store = memoryStores[tableName] || [];
      const matches = filterMemoryStore(store, filter);
      if (matches.length > 0) {
        const idx = store.indexOf(matches[0]);
        const deleted = store.splice(idx, 1)[0];
        return formatRow(deleted, tableName, customMethods);
      }
      return null;
    },

    async deleteMany(filter = {}) {
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
          if (!error && data) return { deletedCount: data.length };
        } catch {
          // Fallback below
        }
      }

      if (Object.keys(filter).length === 0) {
        const count = (memoryStores[tableName] || []).length;
        memoryStores[tableName] = [];
        return { deletedCount: count };
      }
      const store = memoryStores[tableName] || [];
      const toKeep = store.filter((item) => !filterMemoryStore([item], filter).length);
      const deletedCount = store.length - toKeep.length;
      memoryStores[tableName] = toKeep;
      return { deletedCount };
    },

    async insertMany(items = []) {
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
};
