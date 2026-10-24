const Reel = require('../models/Reel');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

/**
 * @desc    Get all reels (Newest posted first)
 * @route   GET /api/reels
 * @access  Public
 */
exports.getReels = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.all !== 'true') {
    filter.isActive = true;
  }
  if (req.query.tag && req.query.tag !== 'all') {
    filter.tag = req.query.tag;
  }

  // Always order by createdAt: -1 (Newest posted first)
  const reels = await Reel.find(filter).sort({ createdAt: -1 });
  return success(res, reels);
});

/**
 * @desc    Get single reel by ID
 * @route   GET /api/reels/:id
 * @access  Public
 */
exports.getReelById = asyncHandler(async (req, res) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) {
    return error(res, 'Reel not found', 404);
  }
  return success(res, reel);
});

/**
 * @desc    Create new reel (Will automatically appear first)
 * @route   POST /api/reels
 * @access  Private/Admin
 */
exports.createReel = asyncHandler(async (req, res) => {
  const {
    title,
    tag,
    videoId,
    videoUrl,
    start,
    thumbnail,
    likes,
    views,
    desc,
    description,
    instagramUrl,
    isActive,
    order,
  } = req.body;

  if (!title) {
    return error(res, 'Title is required', 400);
  }

  // Extract clean videoId from YouTube URLs if full URL was pasted
  let cleanVideoId = videoId || '8oLZSitF20E';
  if (videoUrl) {
    const ytMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      cleanVideoId = ytMatch[1];
    } else if (!videoId) {
      cleanVideoId = videoUrl;
    }
  }

  const newReel = await Reel.create({
    title: title.trim(),
    tag: tag ? tag.trim() : 'Siddha Wellness',
    videoId: cleanVideoId,
    start: Number(start) || 0,
    thumbnail: thumbnail || `https://i.ytimg.com/vi/${cleanVideoId}/hq720.jpg`,
    likes: likes || '1.5K',
    views: views || '10.2K',
    desc: desc || description || 'Clinical insights and healing care at Sanjeevini Siddha.',
    instagramUrl: instagramUrl || 'https://www.instagram.com/sanjeevinisiddha?rpxt=aWZydDRmMXl3aWg4',
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    order: Number(order) || 0,
    createdAt: new Date().toISOString(),
  });

  return success(res, newReel, 'Reel published successfully! It is now positioned first in the carousel.', 201);
});

/**
 * @desc    Update reel
 * @route   PUT /api/reels/:id
 * @access  Private/Admin
 */
exports.updateReel = asyncHandler(async (req, res) => {
  const reel = await Reel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!reel) {
    return error(res, 'Reel not found', 404);
  }

  return success(res, reel, 'Reel updated successfully');
});

/**
 * @desc    Delete reel
 * @route   DELETE /api/reels/:id
 * @access  Private/Admin
 */
exports.deleteReel = asyncHandler(async (req, res) => {
  const reel = await Reel.findByIdAndDelete(req.params.id);
  if (!reel) {
    return error(res, 'Reel not found', 404);
  }
  return success(res, null, 'Reel deleted successfully');
});
