const express = require('express');
const router = express.Router();
const {
  getReels,
  getReelById,
  createReel,
  updateReel,
  deleteReel,
} = require('../controllers/reelController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/')
  .get(getReels)
  .post(protect, admin, createReel);

router.route('/:id')
  .get(getReelById)
  .put(protect, admin, updateReel)
  .delete(protect, admin, deleteReel);

module.exports = router;
