const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { cacheControl, noCache } = require('./middleware/cacheMiddleware');

// Route files
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const botRoutes = require('./routes/botRoutes');
const reelRoutes = require('./routes/reelRoutes');
const swarnaBinduRoutes = require('./routes/swarnaBinduRoutes');

const app = express();

// Trust reverse proxies (Render, Cloudflare, Vercel)
app.set('trust proxy', 1);

// Security middleware (allow cross-origin for static assets like uploaded images)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS middleware - supports CLIENT_URL, CLIENT_ORIGIN, and auto-permits Vercel domains
const clientOriginEnv = process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || '';
const explicitOrigins = clientOriginEnv
  ? clientOriginEnv.split(',').map((o) => o.trim().replace(/\/$/, ''))
  : ['http://localhost:5173', 'http://localhost:3000'];

// Bulletproof CORS options that support Vercel, Render, local dev, custom domains, and previews
const corsOptions = {
  origin: (origin, callback) => {
    // Requests with no origin (mobile apps, curl, uptime monitors)
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV !== 'production' || clientOriginEnv === '*') {
      return callback(null, true);
    }

    const normalized = origin.replace(/\/$/, '');
    if (explicitOrigins.includes(normalized)) {
      return callback(null, true);
    }

    try {
      const { hostname } = new URL(origin);
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.endsWith('.vercel.app') ||
        hostname.endsWith('.onrender.com') ||
        hostname.endsWith('sanjeevinisiddha.in') ||
        hostname.includes('sanjeevini')
      ) {
        return callback(null, true);
      }
    } catch (_) {}

    // Pass through origin gracefully rather than throwing 500 error
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'Expires',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Accept-Language',
    'Range',
  ],
  exposedHeaders: ['Content-Range', 'X-Total-Count', 'Content-Disposition'],
  optionsSuccessStatus: 200,
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Standard Permissions-Policy to suppress browser console warnings
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Gzip/deflate compression middleware to compress all responses (60-80% smaller payloads)
app.use(compression());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Root & Health check endpoints (essential for Render health probes and zero-downtime deployment)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    name: 'Sanjeevini Siddha & Ayurveda Medical Centre API',
    version: '1.0.0',
    documentation: '/api/bot/status'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Rate limiting
app.use('/api', apiLimiter);

// Disable ETags for dynamic API responses to guarantee fresh data without 304 stale caching
app.set('etag', false);

// High-performance HTTP caching: 60s browser, 300s CDN edge, 600s background revalidation
const publicCache = cacheControl(60, 300, 600);
const privateNoCache = noCache();

// Mount routers with optimized cache controls
app.use('/api/auth', privateNoCache, authRoutes);
app.use('/api/doctors', publicCache, doctorRoutes);
app.use('/api/services', publicCache, serviceRoutes);
app.use('/api/treatments', publicCache, treatmentRoutes);
app.use('/api/appointments', privateNoCache, appointmentRoutes);
app.use('/api/gallery', publicCache, galleryRoutes);
app.use('/api/reels', publicCache, reelRoutes);
app.use('/api/testimonials', publicCache, testimonialRoutes);
app.use('/api/contact', privateNoCache, contactRoutes);
app.use('/api/newsletter', privateNoCache, newsletterRoutes);
app.use('/api/settings', publicCache, settingsRoutes);
app.use('/api/upload', privateNoCache, uploadRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/swarna-bindu', publicCache, swarnaBinduRoutes);

// Static uploads folder with aggressive CDN and browser caching (1 year immutable)
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'public/uploads'), {
    maxAge: '365d',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Set CDN & browser caching headers for images, videos, audio, and documents
      if (/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (/\.(mp4|webm|mov|mkv)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Accept-Ranges', 'bytes');
      }
    },
  })
);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
