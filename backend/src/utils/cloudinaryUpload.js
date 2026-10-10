const cloudinary = require('../config/cloudinary');

// Uploads a buffer (from multer memory storage) to Cloudinary via a stream.
// resource_type 'auto' lets Cloudinary classify the file on upload.
const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Cloudinary's destroy endpoint does NOT accept resource_type 'auto' (that only
// works for uploads), so the asset's real type has to be given. Files uploaded
// with 'auto' end up as 'image' (images, PDFs) or 'raw' (Word docs), so try each.
const DESTROY_RESOURCE_TYPES = ['image', 'raw', 'video'];

// Best-effort: never throws. A Cloudinary problem must not block a delete or
// replace in our own database. The worst case is an orphaned file, which is logged.
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return false;

  for (const resourceType of DESTROY_RESOURCE_TYPES) {
    try {
      const res = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      });
      if (res?.result === 'ok') return true;
    } catch (err) {
      console.error(`[cloudinary] destroy failed (${resourceType}) for ${publicId}:`, err?.message ?? err);
    }
  }

  console.error(`[cloudinary] could not delete asset ${publicId}`);
  return false;
};

module.exports = { uploadBufferToCloudinary, deleteFromCloudinary };