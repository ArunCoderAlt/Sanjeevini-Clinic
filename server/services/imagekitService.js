const env = require('../config/environment');
const logger = require('../utils/logger');

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

module.exports = {
  isImageKitConfigured,
  uploadToImageKit,
  deleteFromImageKit,
};
