const { v2: cloudinary } = require('cloudinary');

// Configure lazily so .env is guaranteed to be loaded by the time we first upload.
let configured = false;
const client = () => {
  if (!configured) {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env');
    }
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key:    CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure:     true,
    });
    configured = true;
  }
  return cloudinary;
};

// Uploads an in-memory image. Using the same publicId again overwrites the old image,
// so "replace" never leaves an orphan behind.
const uploadImageBuffer = (buffer, publicId) =>
  new Promise((resolve, reject) => {
    client().uploader
      .upload_stream(
        { public_id: publicId, overwrite: true, invalidate: true, resource_type: 'image' },
        (err, result) => (err ? reject(err) : resolve(result)),
      )
      .end(buffer);
  });

// Deleting a publicId that doesn't exist is harmless (returns { result: 'not found' }).
const deleteImage = (publicId) =>
  client().uploader.destroy(publicId, { invalidate: true, resource_type: 'image' });

module.exports = { uploadImageBuffer, deleteImage };