const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { deleteImageByUrl } = require('../services/imagekitService');
const logger = require('../utils/logger');

exports.getServices = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.all !== 'true') {
    filter.isActive = true;
  }
  const services = await Service.find(filter).sort({ order: 1 });
  return success(res, services);
});

const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

exports.getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return error(res, 'Service not found', 404);
  return success(res, service);
});

exports.getServiceBySlug = asyncHandler(async (req, res) => {
  const param = req.params.slug;
  if (!param) return error(res, 'Service slug or ID required', 400);

  // 1. If param is a UUID, perform indexed direct primary key lookup
  if (isUUID(param)) {
    const service = await Service.findById(param);
    if (service) return success(res, service);
  }

  // 2. Direct indexed slug query with intelligent suffix fallback
  let service = await Service.findOne({ slug: param });
  if (!service) {
    const cleanParam = param.toLowerCase().trim();
    const candidates = [
      `${cleanParam}-therapy`,
      `${cleanParam}-support`,
      cleanParam.replace('-therapy', '').replace('-support', ''),
    ];
    for (const altSlug of candidates) {
      if (altSlug !== cleanParam) {
        service = await Service.findOne({ slug: altSlug });
        if (service) break;
      }
    }
  }

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
  const existing = await Service.findById(req.params.id);
  if (!existing) return error(res, 'Service not found', 404);

  const oldImage = existing.image;
  const newImage = req.body.image;

  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // If image was replaced or cleared, remove old image from ImageKit / storage
  if (oldImage && ((newImage !== undefined && newImage !== oldImage) || req.body.image === '' || req.body.image === null)) {
    deleteImageByUrl(oldImage).catch((err) => {
      logger.warn(`Could not delete replaced service image from ImageKit: ${err.message}`);
    });
  }

  return success(res, service, 'Service updated successfully');
});

exports.deleteService = asyncHandler(async (req, res) => {
  const existing = await Service.findById(req.params.id);
  if (!existing) return error(res, 'Service not found', 404);

  const oldImage = existing.image;
  const service = await Service.findByIdAndDelete(req.params.id);

  // If service had an image, remove from ImageKit / storage
  if (oldImage) {
    deleteImageByUrl(oldImage).catch((err) => {
      logger.warn(`Could not delete service image from ImageKit on delete: ${err.message}`);
    });
  }

  return success(res, null, 'Service deleted successfully');
});
