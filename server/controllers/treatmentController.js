const Treatment = require('../models/Treatment');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

exports.getTreatments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.all !== 'true') {
    filter.isActive = true;
  }
  if (req.query.category && req.query.category.trim().toLowerCase() !== 'all') {
    filter.category = req.query.category.trim();
  }
  const treatments = await Treatment.find(filter).sort({ order: 1 });
  return success(res, treatments);
});

const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

exports.getTreatmentBySlug = asyncHandler(async (req, res) => {
  const param = req.params.slug;
  if (!param) return error(res, 'Treatment slug or ID required', 400);

  // 1. If param is a UUID, perform indexed direct primary key lookup
  if (isUUID(param)) {
    const treatment = await Treatment.findById(param);
    if (treatment) return success(res, treatment);
  }

  // 2. Direct indexed slug query
  const treatment = await Treatment.findOne({ slug: param });
  if (!treatment) return error(res, 'Treatment not found', 404);
  return success(res, treatment);
});

exports.getTreatmentById = asyncHandler(async (req, res) => {
  const treatment = await Treatment.findById(req.params.id);
  if (!treatment) return error(res, 'Treatment not found', 404);
  return success(res, treatment);
});

exports.getTreatmentCategories = asyncHandler(async (req, res) => {
  const categories = await Treatment.distinct('category');
  return success(res, categories);
});

exports.createTreatment = asyncHandler(async (req, res) => {
  const treatmentData = { ...req.body };
  if (!treatmentData.slug && treatmentData.name) {
    const baseSlug = treatmentData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let uniqueSlug = baseSlug || 'treatment';
    let counter = 1;
    while (await Treatment.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }
    treatmentData.slug = uniqueSlug;
  }
  const treatment = await Treatment.create(treatmentData);
  return success(res, treatment, 'Treatment created successfully', 201);
});

exports.updateTreatment = asyncHandler(async (req, res) => {
  const treatment = await Treatment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!treatment) return error(res, 'Treatment not found', 404);
  return success(res, treatment, 'Treatment updated successfully');
});

exports.deleteTreatment = asyncHandler(async (req, res) => {
  const treatment = await Treatment.findByIdAndDelete(req.params.id);
  if (!treatment) return error(res, 'Treatment not found', 404);
  return success(res, null, 'Treatment deleted successfully');
});
