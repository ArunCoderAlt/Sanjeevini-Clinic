const SiteSettings = require('../models/SiteSettings');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { deleteImageByUrl } = require('../services/imagekitService');
const logger = require('../utils/logger');

exports.getSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  return success(res, settings);
});

exports.updateSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create(req.body);
  } else {
    const oldHero = settings.heroImage;
    const oldLogo = settings.logo;

    settings = await SiteSettings.findOneAndUpdate({}, req.body, { new: true });

    if (oldHero && req.body.heroImage && oldHero !== req.body.heroImage) {
      deleteImageByUrl(oldHero).catch((err) => {
        logger.warn(`Could not delete old hero image from ImageKit: ${err.message}`);
      });
    }
    if (oldLogo && req.body.logo && oldLogo !== req.body.logo) {
      deleteImageByUrl(oldLogo).catch((err) => {
        logger.warn(`Could not delete old logo from ImageKit: ${err.message}`);
      });
    }
  }
  return success(res, settings, 'Settings updated successfully');
});
