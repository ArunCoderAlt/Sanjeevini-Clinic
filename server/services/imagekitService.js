const path = require('path');
const fs = require('fs');
const env = require('../config/environment');
const logger = require('../utils/logger');
const { getSupabase } = require('../config/supabase');

/**
 * Checks whether ImageKit API credentials are configured.
 */
const isImageKitConfigured = () => {
  return Boolean(
    env.imagekitPrivateKey &&
    env.imagekitUrlEndpoint &&
    !env.imagekitPrivateKey.includes('your_imagekit')
  );
};

/**
 * Upload an image file buffer to ImageKit.io CDN via REST API.
 *
 * @param {Object} options
 * @param {Buffer} options.fileBuffer - File buffer to upload
 * @param {string} options.fileName - File name with extension
 * @param {string} [options.folder='/gallery'] - Destination folder in ImageKit Media Library
 * @param {string[]} [options.tags=[]] - Optional tags for asset indexing
 * @returns {Promise<{ success: boolean, url?: string, fileId?: string, thumbnailUrl?: string, error?: string }>}
 */
const uploadToImageKit = async ({ fileBuffer, fileName, folder = '/gallery', tags = ['gallery'] }) => {
  if (!isImageKitConfigured()) {
    return {
      success: false,
      error: 'ImageKit is not configured. Set IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT in server/.env.',
    };
  }

  try {
    const cleanFolder = folder.startsWith('/') ? folder : `/${folder}`;
    const base64File = fileBuffer.toString('base64');

    const formData = new FormData();
    formData.append('file', base64File);
    formData.append('fileName', fileName || `image-${Date.now()}`);
    formData.append('folder', cleanFolder);
    formData.append('useUniqueFileName', 'true');
    formData.append('isPrivateFile', 'false');
    if (tags && tags.length > 0) {
      formData.append('tags', tags.join(','));
    }

    const authHeader = `Basic ${Buffer.from(`${env.imagekitPrivateKey}:`).toString('base64')}`;

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      const errMsg = data.message || data.help || `HTTP ${response.status}`;
      logger.error(`ImageKit upload failed: ${errMsg}`);
      return { success: false, error: errMsg };
    }

    logger.info(`✅ Image uploaded to ImageKit.io CDN: ${data.url}`);
    return {
      success: true,
      url: data.url,
      fileId: data.fileId,
      thumbnailUrl: data.thumbnailUrl,
      height: data.height,
      width: data.width,
      size: data.size,
      filePath: data.filePath,
    };
  } catch (err) {
    logger.error(`ImageKit service error: ${err.message}`);
    return { success: false, error: err.message };
  }
};

/**
 * Delete a file from ImageKit.io by its fileId.
 *
 * @param {string} fileId
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
const deleteFromImageKit = async (fileId) => {
  if (!isImageKitConfigured() || !fileId) {
    return { success: false, error: 'ImageKit not configured or fileId missing' };
  }

  try {
    const authHeader = `Basic ${Buffer.from(`${env.imagekitPrivateKey}:`).toString('base64')}`;
    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: authHeader,
      },
    });

    if (response.ok || response.status === 404) {
      return { success: true };
    }

    const data = await response.json().catch(() => ({}));
    return { success: false, error: data.message || `HTTP ${response.status}` };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Resolves an ImageKit fileId from its CDN URL and deletes it from ImageKit.io storage.
 * Also cleans up local /uploads/ or Supabase Storage copies if applicable.
 *
 * @param {string} imageUrlOrId - Full CDN URL or direct fileId
 * @returns {Promise<{ success: boolean, deleted?: boolean, reason?: string }>}
 */
const deleteImageByUrl = async (imageUrlOrId) => {
  if (!imageUrlOrId || typeof imageUrlOrId !== 'string') {
    return { success: true, deleted: false, reason: 'No image URL provided' };
  }

  const rawUrl = imageUrlOrId.trim();

  // Guard: Never delete static clinic assets like /images/hero/..., /images/about/...
  if (
    rawUrl.startsWith('/images/') ||
    rawUrl.includes('/images/hero/') ||
    rawUrl.includes('/images/about/') ||
    rawUrl.includes('/images/gallery/') ||
    rawUrl.includes('/images/doctors/')
  ) {
    return { success: true, deleted: false, reason: 'Static theme asset, skipping delete' };
  }

  let deletedFromIK = false;

  // 1. Delete from ImageKit CDN if it is an ImageKit asset or fileId
  const isImageKit = rawUrl.includes('ik.imagekit.io') || rawUrl.includes('imagekit.io') || /^[0-9a-f]{24}$/i.test(rawUrl);
  if (isImageKit && isImageKitConfigured()) {
    try {
      let fileId = null;

      if (/^[0-9a-f]{24}$/i.test(rawUrl)) {
        fileId = rawUrl;
      } else {
        // Parse filename from URL
        // Example: https://ik.imagekit.io/npodwfrx7/services/photo_123.jpg?tr=q-80
        const cleanUrl = rawUrl.split('?')[0].split('#')[0];
        const segments = cleanUrl.split('/').filter(Boolean);
        const fileName = segments[segments.length - 1];

        if (fileName) {
          const authHeader = `Basic ${Buffer.from(`${env.imagekitPrivateKey}:`).toString('base64')}`;
          const searchUrl = `https://api.imagekit.io/v1/files?name=${encodeURIComponent(fileName)}`;
          
          const searchRes = await fetch(searchUrl, {
            headers: { Authorization: authHeader },
          });

          if (searchRes.ok) {
            const files = await searchRes.json();
            if (Array.isArray(files) && files.length > 0) {
              // Delete all matching files with this unique name
              for (const file of files) {
                if (file.fileId) {
                  const delRes = await deleteFromImageKit(file.fileId);
                  if (delRes.success) {
                    deletedFromIK = true;
                    logger.info(`🗑️ Successfully deleted old image from ImageKit: ${file.name} (ID: ${file.fileId})`);
                  }
                }
              }
            }
          } else {
            logger.warn(`ImageKit file search failed with status ${searchRes.status}`);
          }
        }
      }

      if (fileId && !deletedFromIK) {
        const delRes = await deleteFromImageKit(fileId);
        if (delRes.success) {
          deletedFromIK = true;
          logger.info(`🗑️ Deleted fileId from ImageKit: ${fileId}`);
        }
      }
    } catch (ikErr) {
      logger.warn(`ImageKit delete error: ${ikErr.message}`);
    }
  }

  // 2. Clean up from local backend /uploads/ directory if present
  try {
    if (rawUrl.includes('/uploads/')) {
      const filename = path.basename(rawUrl.split('?')[0]);
      if (filename) {
        const localPath = path.join(__dirname, '../uploads', filename);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
          logger.info(`🗑️ Deleted local server upload: ${filename}`);
        }
        const clientUploadsPath = path.join(__dirname, '../../client/public/uploads', filename);
        if (fs.existsSync(clientUploadsPath)) {
          fs.unlinkSync(clientUploadsPath);
        }
      }
    }
  } catch (_) {}

  // 3. Clean up from Supabase Storage bucket 'clinic-media' if present
  try {
    if (rawUrl.includes('/clinic-media/')) {
      const supabase = getSupabase();
      if (supabase) {
        const parts = rawUrl.split('/clinic-media/');
        if (parts[1]) {
          const storagePath = parts[1].split('?')[0];
          await supabase.storage.from('clinic-media').remove([storagePath]);
          logger.info(`🗑️ Deleted from Supabase Storage: ${storagePath}`);
        }
      }
    }
  } catch (_) {}

  return { success: true, deleted: deletedFromIK };
};

module.exports = {
  isImageKitConfigured,
  uploadToImageKit,
  deleteFromImageKit,
  deleteImageByUrl,
};
