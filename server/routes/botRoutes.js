const express = require('express');
const multer = require('multer');
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

// Public Chat endpoint
router.post('/chat', botController.chat);

// Bot status, Groq testing and Token Usage telemetry
router.get('/status', botController.getStatus);
router.get('/usage', protect, admin, botController.getUsage);

// Admin Knowledge Base management
router.get('/documents', protect, admin, botController.getDocuments);
router.post('/upload', protect, admin, upload.single('pdf'), botController.uploadDocument);
router.delete('/documents/:id', protect, admin, botController.deleteDocument);
router.patch('/documents/:id/toggle', protect, admin, botController.toggleDocument);
router.put('/settings', protect, admin, botController.updateSettings);
router.post('/restore-seed', protect, admin, botController.restoreSeed);

module.exports = router;
