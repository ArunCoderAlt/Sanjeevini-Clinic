const fs = require('fs');
const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { getSupabase } = require('../config/supabase');
const logger = require('../utils/logger');

exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return error(res, 'Please provide an image file to upload', 400);
  }

  let finalUrl = `/uploads/${req.file.filename}`;
  let storageProvider = 'local';

  // Sync to client/public/uploads for direct Vite dev and preview access
  try {
    const clientUploadsDir = path.join(__dirname, '../../client/public/uploads');
    if (!fs.existsSync(clientUploadsDir)) {
      fs.mkdirSync(clientUploadsDir, { recursive: true });
    }
    if (req.file.path) {
      fs.copyFileSync(req.file.path, path.join(clientUploadsDir, req.file.filename));
    }
  } catch (_) {}

  // Attempt to upload to Supabase Storage if configured
  try {
    const supabase = getSupabase();
    if (supabase) {
      const fileBuffer = fs.readFileSync(req.file.path);
      const storagePath = `uploads/${req.file.filename}`;

      const { data, error: uploadErr } = await supabase.storage
        .from('clinic-media')
        .upload(storagePath, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (!uploadErr && data) {
        const { data: urlData } = supabase.storage
          .from('clinic-media')
          .getPublicUrl(storagePath);

        if (urlData && urlData.publicUrl) {
          finalUrl = urlData.publicUrl;
          storageProvider = 'supabase';
          logger.info(`Image uploaded to Supabase Storage: ${finalUrl}`);
        }
      } else if (uploadErr) {
        logger.warn(`Supabase Storage upload fallback to local disk: ${uploadErr.message}`);
      }
    }
  } catch (err) {
    logger.warn(`Supabase Storage unavailable, using local disk: ${err.message}`);
  }

  return success(
    res,
    {
      url: finalUrl,
      filename: req.file.filename || req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      provider: storageProvider,
    },
    `Image uploaded successfully (${storageProvider})`,
    201
  );
});
