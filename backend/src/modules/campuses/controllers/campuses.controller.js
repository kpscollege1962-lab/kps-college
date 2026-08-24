const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { listCampuses, getCampusById, createCampus, updateCampus } = require('../services/campuses.service');

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

module.exports = { list: listCtrl, getOne: getOneCtrl, create: createCtrl, update: updateCtrl };
