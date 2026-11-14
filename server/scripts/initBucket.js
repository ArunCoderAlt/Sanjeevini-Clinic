const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { getSupabase } = require('../config/supabase');
const logger = require('../utils/logger');

async function initBucket() {
  console.log('🚀 Checking Supabase Storage configuration...');

  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.error('❌ Supabase client could not be initialized. Check your server/.env file.');
      process.exit(1);
    }

    console.log('📦 Fetching storage buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      process.exit(1);
    }

    const bucketName = 'clinic-media';
    const existing = buckets.find((b) => b.name === bucketName || b.id === bucketName);

    if (existing) {
      console.log(`✅ Bucket '${bucketName}' already exists.`);
      if (!existing.public) {
        console.log(`⚠️ Bucket '${bucketName}' is private. Updating to public...`);
        const { error: updateError } = await supabase.storage.updateBucket(bucketName, { public: true });
        if (updateError) {
          console.error('❌ Failed to set bucket to public:', updateError.message);
        } else {
          console.log(`✅ Bucket '${bucketName}' is now PUBLIC.`);
        }
      } else {
        console.log(`✅ Bucket '${bucketName}' is already public.`);
      }
    } else {
      console.log(`⚙️ Creating public bucket '${bucketName}'...`);
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'],
      });

      if (createError) {
        console.error(`❌ Failed to create bucket '${bucketName}':`, createError.message);
        console.log('\n💡 Tip: You can also create it via Supabase Dashboard -> Storage -> New Bucket -> "clinic-media" (toggle Public ON).');
        process.exit(1);
      }

      console.log(`🎉 Successfully created public bucket '${bucketName}'!`);
    }

    console.log('\n✨ Supabase Storage is configured and ready for image uploads.');
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

initBucket();
