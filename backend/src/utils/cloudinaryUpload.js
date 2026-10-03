const cloudinary = require('../config/cloudinary');

// Uploads a buffer (from multer memory storage) to Cloudinary via a stream.
// resource_type 'auto' lets Cloudinary correctly handle PDFs/docs as 'raw'
// and images as 'image'.
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

const deleteFromCloudinary = async (publicId, resourceType = 'auto') => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = { uploadBufferToCloudinary, deleteFromCloudinary };