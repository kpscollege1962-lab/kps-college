const { Op } = require('sequelize');
const { Campus, CampusSettings } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { uploadImageBuffer, deleteImage } = require('../../../utils/cloudinary');

// ── List ───────────────────────────────────────────────────────────────────────

const listCampuses = async ({ search, isActive, page = 1, limit = 20 }) => {
  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { code: { [Op.like]: `%${search}%` } },
    ];
  }

  if (isActive !== undefined) {
    where.is_active = isActive;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Campus.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return { data: rows, total: count, page, limit };
};

// ── Get one ────────────────────────────────────────────────────────────────────

const getCampusById = async (id) => {
  const campus = await Campus.findByPk(id);
  if (!campus) throw new ApiError(404, 'Campus not found');
  return campus;
};

// ── Create ─────────────────────────────────────────────────────────────────────

const createCampus = async ({ name, code, address, phone, email, is_active }) => {
  const campus = await Campus.create({
    name,
    ...(code      !== undefined && { code }),
    ...(address   !== undefined && { address }),
    ...(phone     !== undefined && { phone }),
    ...(email     !== undefined && { email }),
    ...(is_active !== undefined && { is_active }),
  });

  await CampusSettings.create({ campus_id: campus.id });

  return campus;
};

// ── Update ─────────────────────────────────────────────────────────────────────

const updateCampus = async (id, { name, code, address, phone, email, is_active, active_title_variant, footer_text }) => {
  const campus = await Campus.findByPk(id);
  if (!campus) throw new ApiError(404, 'Campus not found');

  await campus.update({
    ...(name                 !== undefined && { name }),
    ...(code                 !== undefined && { code }),
    ...(address              !== undefined && { address }),
    ...(phone                !== undefined && { phone }),
    ...(email                !== undefined && { email }),
    ...(is_active            !== undefined && { is_active }),
    ...(active_title_variant !== undefined && { active_title_variant }),
    ...(footer_text          !== undefined && { footer_text }),
  });

  return getCampusById(id);
};

// ── Branding images (stored on Cloudinary) ─────────────────────────────────────

const BRANDING_COLUMNS = {
  title_english:  'title_english_url',
  title_urdu:     'title_urdu_url',
  title_combined: 'title_combined_url',
  watermark:      'watermark_url',
};

// One fixed Cloudinary id per campus + slot, so we never need to store it:
// re-uploading overwrites, deleting targets the same id.
const publicIdFor = (campusId, field) => `kps-college/campuses/${campusId}/${field}`;

const setBrandingImage = async (id, field, file) => {
  const campus = await getCampusById(id);
  const col = BRANDING_COLUMNS[field];

  let result;
  try {
    result = await uploadImageBuffer(file.buffer, publicIdFor(id, field));
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    throw new ApiError(502, 'Image upload failed. Please try again.');
  }

  // secure_url contains a version number, so a replaced image gets a fresh URL
  // and the browser never shows a stale cached copy.
  await campus.update({ [col]: result.secure_url });
  return campus;
};

const clearBrandingImage = async (id, field) => {
  const campus = await getCampusById(id);
  const col = BRANDING_COLUMNS[field];

  await campus.update({ [col]: null });
  // Best effort: if Cloudinary is unreachable the DB is already cleared, which is what matters.
  await deleteImage(publicIdFor(id, field)).catch((err) =>
    console.error('Cloudinary delete failed:', err),
  );
  return campus;
};

module.exports = {
  listCampuses,
  getCampusById,
  createCampus,
  updateCampus,
  setBrandingImage,
  clearBrandingImage,
};