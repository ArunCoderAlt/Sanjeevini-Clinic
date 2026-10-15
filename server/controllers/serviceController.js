const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

exports.getServices = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.all !== 'true') {
    filter.isActive = true;
  }
  const services = await Service.find(filter).sort({ order: 1 });
  return success(res, services);
});

exports.getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return error(res, 'Service not found', 404);
  return success(res, service);
});

exports.getServiceBySlug = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug, isActive: true });
  if (!service) return error(res, 'Service not found', 404);
  return success(res, service);
});

exports.createService = asyncHandler(async (req, res) => {
  const serviceData = { ...req.body };
  if (!serviceData.slug && serviceData.title) {
    const baseSlug = serviceData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let uniqueSlug = baseSlug || 'service';
    let counter = 1;
    while (await Service.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }
    serviceData.slug = uniqueSlug;
  }
  const service = await Service.create(serviceData);
  return success(res, service, 'Service created successfully', 201);
});

exports.updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!service) return error(res, 'Service not found', 404);
  return success(res, service, 'Service updated successfully');
});

exports.deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) return error(res, 'Service not found', 404);
  return success(res, null, 'Service deleted successfully');
});
