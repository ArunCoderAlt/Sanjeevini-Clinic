const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { isImageKitConfigured, uploadToImageKit } = require('../services/imagekitService');

async function testImageKit() {
  console.log('🔍 Checking ImageKit.io configuration...');

  if (!isImageKitConfigured()) {
    console.log('⚠️ ImageKit is not configured in server/.env.');
    console.log('To activate ImageKit for Gallery storage:');
    console.log('1. Sign up for free at https://imagekit.io');
    console.log('2. Copy your keys from Dashboard -> Developer -> API Keys:');
    console.log('   IMAGEKIT_PUBLIC_KEY=your_public_key');
    console.log('   IMAGEKIT_PRIVATE_KEY=your_private_key');
    console.log('   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id');
    console.log('3. Paste them into server/.env and re-run this script.');
    return;
  }

  console.log('🚀 ImageKit credentials detected!');
  console.log('Testing upload of a 1x1 test image to /gallery folder...');

  // 1x1 transparent PNG buffer
  const sampleBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const result = await uploadToImageKit({
    fileBuffer: sampleBuffer,
    fileName: `test-gallery-ping-${Date.now()}.png`,
    folder: '/gallery',
    tags: ['test', 'gallery'],
  });

  if (result.success) {
    console.log('🎉 SUCCESS! ImageKit is fully connected and ready.');
    console.log('CDN URL:', result.url);
    console.log('File ID:', result.fileId);
  } else {
    console.error('❌ Upload test failed:', result.error);
  }
}

testImageKit();
