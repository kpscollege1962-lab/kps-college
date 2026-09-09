const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// backend/src/public/uploads/campus-settings — created on first run if missing.
const uploadDir = path.join(__dirname, '../../../public/uploads/campus-settings');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // req.body.field is only populated here if the client appends the "field"
    // form field BEFORE the "image" file in the FormData — multer parses
    // multipart data as a stream, in the order fields were appended.
    const campusId = req.params.campusId;
    const field = req.body.field || 'image';
    const ext = path.extname(file.originalname) || '';
    cb(null, `campus${campusId}-${field}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only PNG, JPEG, WEBP, or SVG images are allowed'));
  }
  cb(null, true);
};

// Expects the file under the form field name "image".
const uploadBrandingImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('image');

module.exports = { uploadBrandingImage };