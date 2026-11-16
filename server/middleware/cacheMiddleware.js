/**
 * Cache-Control and HTTP Caching Middleware
 *
 * Implements high-performance HTTP response caching for Supabase API requests:
 * - Browser Cache (max-age): Keeps responses in browser disk/memory cache for repeat visits.
 * - CDN/Proxy Cache (s-maxage): Allows reverse-proxies (Render, Vercel Edge, Cloudflare)
 *   to serve cached data close to the user in <15ms.
 * - Stale-While-Revalidate: Allows instant serving of cached content while refreshing
 *   in the background without blocking the user.
 * - ETag generation is enabled by default in Express, enabling 304 Not Modified responses (0 payload bytes).
 */

/**
 * Public Cache-Control middleware for read-only catalog data
 * @param {number} maxAge Browser cache TTL in seconds (default: 60)
 * @param {number} sMaxAge CDN edge cache TTL in seconds (default: 300)
 * @param {number} staleWhileRevalidate Background refresh window in seconds (default: 600)
 */
const cacheControl = (maxAge = 60, sMaxAge = 300, staleWhileRevalidate = 600) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return next();
    }

    // Never cache authenticated requests (e.g. logged-in admin)
    if (req.headers.authorization) {
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return next();
    }

    // Never cache admin queries with ?all=true or explicit ?nocache=true
    if (req.query.all === 'true' || req.query.nocache === 'true') {
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return next();
    }

    // Dynamic catalog data: Never store in browser or proxy cache; always fetch latest database state
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    next();
  };
};

/**
 * No-cache middleware for sensitive, user-specific, or state-changing routes
 */
const noCache = () => {
  return (req, res, next) => {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  };
};

module.exports = {
  cacheControl,
  noCache,
};
