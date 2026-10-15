const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');

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

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, uptime probes)
      if (!origin) return callback(null, true);

      // In development or if explicitly allowed all
      if (process.env.NODE_ENV !== 'production' || clientOriginEnv === '*') {
        return callback(null, true);
      }

      const normalized = origin.replace(/\/$/, '');

      // Check explicit origins or any vercel.app preview/production deployment
      if (
        explicitOrigins.includes(normalized) ||
        /\.vercel\.app$/.test(new URL(origin).hostname)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bot', botRoutes);

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
