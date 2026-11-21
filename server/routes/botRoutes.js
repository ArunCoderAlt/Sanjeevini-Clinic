const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const botController = require('../controllers/botController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Configure multer for PDF in-memory processing
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are allowed'), false);
    }
  }
});

// Wrap multer so file errors (wrong type / too large) return a clear 400 instead of a generic 500
const uploadPdf = (req, res, next) => {
  upload.single('pdf')(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File size exceeds the 15MB limit'
      : (err.message || 'Invalid PDF upload');
    return res.status(400).json({ success: false, message });
  });
};

// Per-IP limit for the public chat endpoint (each message can trigger a paid LLM call)
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: process.env.NODE_ENV === 'development' ? 1000 : 40,
  skip: (req) => req.method === 'OPTIONS',
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You are sending messages too quickly. Please wait a few minutes and try again, or call us at +91 98430 66362.'
  },
});

// Public Chat endpoint
router.post('/chat', chatLimiter, botController.chat);

// Bot status (pings Groq), token usage telemetry — admin only
router.get('/status', protect, admin, botController.getStatus);
router.get('/usage', protect, admin, botController.getUsage);

// Admin Knowledge Base management
router.get('/documents', protect, admin, botController.getDocuments);
router.post('/upload', protect, admin, uploadPdf, botController.uploadDocument);
router.delete('/documents/:id', protect, admin, botController.deleteDocument);
router.patch('/documents/:id/toggle', protect, admin, botController.toggleDocument);
router.put('/settings', protect, admin, botController.updateSettings);
router.post('/restore-seed', protect, admin, botController.restoreSeed);

module.exports = router;
