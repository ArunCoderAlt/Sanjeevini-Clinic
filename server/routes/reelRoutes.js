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

router.route('/')
  .get(getReels)
  .post(protect, createReel);

router.route('/:id')
  .get(getReelById)
  .put(protect, updateReel)
  .delete(protect, deleteReel);

module.exports = router;
