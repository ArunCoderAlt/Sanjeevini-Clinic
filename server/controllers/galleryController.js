const Gallery = require('../models/Gallery');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { deleteImageByUrl } = require('../services/imagekitService');
const logger = require('../utils/logger');

exports.getGalleryItems = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.all !== 'true') {
    filter.isActive = true;
  }
  if (req.query.category && req.query.category !== 'all') {
    filter.category = req.query.category;
  }
  const items = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });
  return success(res, items);
});

exports.createGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.create(req.body);
  return success(res, item, 'Gallery item created successfully', 201);
});

exports.updateGalleryItem = asyncHandler(async (req, res) => {
  const existing = await Gallery.findById(req.params.id);
  if (!existing) return error(res, 'Gallery item not found', 404);

  const oldImage = existing.image || existing.url || existing.image_url;
  const newImage = req.body.image || req.body.url || req.body.image_url;

  const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (oldImage && ((newImage !== undefined && newImage !== oldImage) || newImage === '' || newImage === null)) {
    deleteImageByUrl(oldImage).catch((err) => {
      logger.warn(`Could not delete replaced gallery image from ImageKit: ${err.message}`);
    });
  }

  return success(res, item, 'Gallery item updated');
});

exports.deleteGalleryItem = asyncHandler(async (req, res) => {
  const existing = await Gallery.findById(req.params.id);
  if (!existing) return error(res, 'Gallery item not found', 404);

  const oldImage = existing.image || existing.url || existing.image_url;
  const item = await Gallery.findByIdAndDelete(req.params.id);

  if (oldImage) {
    deleteImageByUrl(oldImage).catch((err) => {
      logger.warn(`Could not delete gallery image from ImageKit on delete: ${err.message}`);
    });
  }

  return success(res, null, 'Gallery item deleted');
});
