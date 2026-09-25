const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const ApiError = require('../../../utils/ApiError');
const {
  listCampuses,
  getCampusById,
  createCampus,
  updateCampus,
  setBrandingImage,
  clearBrandingImage,
} = require('../services/campuses.service');

// ── GET /campuses ──────────────────────────────────────────────────────────────

const listCtrl = async (req, res) => {
  const { search, isActive, page, limit } = matchedData(req, { locations: ['query'] });
  const result = await listCampuses({
    search,
    isActive: isActive !== undefined ? parseInt(isActive) : undefined,
    page:     page  ? parseInt(page)  : 1,
    limit:    limit ? parseInt(limit) : 20,
  });
  res.json(ApiResponse.success('Campuses fetched', result));
};

// ── GET /campuses/:id ──────────────────────────────────────────────────────────

const getOneCtrl = async (req, res) => {
  const { id } = matchedData(req, { locations: ['params'] });
  const campus = await getCampusById(parseInt(id));
  res.json(ApiResponse.success('Campus fetched', { campus }));
};

// ── POST /campuses ─────────────────────────────────────────────────────────────

const createCtrl = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const campus = await createCampus(data);
  res.status(201).json(ApiResponse.success('Campus created', { campus }));
};

// ── PATCH /campuses/:id ────────────────────────────────────────────────────────

const updateCtrl = async (req, res) => {
  const { id, ...data } = matchedData(req, { locations: ['body', 'params'] });
  const campus = await updateCampus(parseInt(id), data);
  res.json(ApiResponse.success('Campus updated', { campus }));
};

// ── POST /campuses/:id/branding/:field ─────────────────────────────────────────

const uploadBrandingCtrl = async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image uploaded');
  const campus = await setBrandingImage(parseInt(req.params.id), req.params.field, req.file);
  res.json(ApiResponse.success('Image uploaded', { campus }));
};

// ── DELETE /campuses/:id/branding/:field ───────────────────────────────────────

const removeBrandingCtrl = async (req, res) => {
  const campus = await clearBrandingImage(parseInt(req.params.id), req.params.field);
  res.json(ApiResponse.success('Image removed', { campus }));
};

module.exports = {
  list: listCtrl,
  getOne: getOneCtrl,
  create: createCtrl,
  update: updateCtrl,
  uploadBranding: uploadBrandingCtrl,
  removeBranding: removeBrandingCtrl,
};