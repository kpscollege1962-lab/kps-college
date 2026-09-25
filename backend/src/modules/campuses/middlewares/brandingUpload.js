const multer = require('multer');
const ApiError = require('../../../utils/ApiError');

const FIELD_KEYS = ['title_english', 'title_urdu', 'title_combined', 'watermark'];

// SVG is deliberately not allowed: an SVG can carry scripts.
const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp'];

const checkField = (req, res, next) =>
  FIELD_KEYS.includes(req.params.field)
    ? next()
    : next(new ApiError(400, 'Invalid branding field'));

// The file is kept in memory (req.file.buffer) and sent straight to Cloudinary —
// nothing is written to the server's disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) =>
    ALLOWED_MIME.includes(file.mimetype)
      ? cb(null, true)
      : cb(new ApiError(400, 'Only PNG, JPG or WEBP images are allowed')),
}).single('file'); // form-data field name must be "file"

const handleUpload = (req, res, next) =>
  upload(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return next(new ApiError(400, 'Image must be under 2 MB'));
    next(err instanceof ApiError ? err : new ApiError(400, err.message));
  });

module.exports = {
  brandingUpload: [checkField, handleUpload],
  checkField,
  FIELD_KEYS,
};