const fs = require('fs');
const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { getSupabase } = require('../config/supabase');
const { isImageKitConfigured, uploadToImageKit } = require('../services/imagekitService');
const logger = require('../utils/logger');

exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return error(res, 'Please provide an image file to upload', 400);
  }

  const host = req.get('host');
  const baseUrl = host ? `${req.protocol}://${host}` : '';
  let finalUrl = baseUrl ? `${baseUrl}/uploads/${req.file.filename}` : `/uploads/${req.file.filename}`;
  let storageProvider = 'local';
  let extraData = {};

  const targetFolder = (req.body.folder || req.query.folder || '').toLowerCase();
  const isGallery = targetFolder === 'gallery' || req.originalUrl.includes('gallery');

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

  // 1. Attempt upload to ImageKit.io CDN (preferred for gallery & media CDN)
  if (isImageKitConfigured()) {
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const ikResult = await uploadToImageKit({
        fileBuffer,
        fileName: req.file.filename || req.file.originalname,
        folder: isGallery ? '/gallery' : `/${targetFolder || 'clinic'}`,
        tags: isGallery ? ['gallery', 'clinic'] : ['clinic'],
      });

      if (ikResult.success && ikResult.url) {
        finalUrl = ikResult.url;
        storageProvider = 'imagekit';
        extraData = {
          fileId: ikResult.fileId,
          thumbnailUrl: ikResult.thumbnailUrl,
        };
        logger.info(`Image uploaded to ImageKit CDN: ${finalUrl}`);
      } else {
        logger.warn(`ImageKit upload fallback to Supabase/local: ${ikResult.error}`);
      }
    } catch (ikErr) {
      logger.warn(`ImageKit upload error, falling back: ${ikErr.message}`);
    }
  }

  // 2. Attempt to upload to Supabase Storage if ImageKit did not handle it
  if (storageProvider === 'local') {
    try {
      const supabase = getSupabase();
      if (supabase) {
        const fileBuffer = fs.readFileSync(req.file.path);
        const storagePath = `uploads/${req.file.filename}`;

        // Check / auto-create public bucket clinic-media if it does not exist
        try {
          const { data: bucket, error: bucketErr } = await supabase.storage.getBucket('clinic-media');
          if (bucketErr || !bucket) {
            await supabase.storage.createBucket('clinic-media', {
              public: true,
              fileSizeLimit: 10485760, // 10MB
            });
            logger.info("Auto-created public Supabase Storage bucket: clinic-media");
          } else if (!bucket.public) {
            await supabase.storage.updateBucket('clinic-media', { public: true });
          }
        } catch (bErr) {
          // Bucket may already exist or handled by RLS
        }

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
  }

  return success(
    res,
    {
      url: finalUrl,
      filename: req.file.filename || req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      provider: storageProvider,
      ...extraData,
    },
    `Image uploaded successfully (${storageProvider})`,
    201
  );
});
