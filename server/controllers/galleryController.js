const Gallery = require('../models/Gallery');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

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
  const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) return error(res, 'Gallery item not found', 404);
  return success(res, item, 'Gallery item updated');
});

exports.deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.findByIdAndDelete(req.params.id);
  if (!item) return error(res, 'Gallery item not found', 404);
  return success(res, null, 'Gallery item deleted');
});
