const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const {
  listClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  seedDefaultClasses,
  cloneClassesFromSession,
} = require('../services/classes.service');

// ── GET /campuses/:campusId/classes ────────────────────────────────────────────
const listCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const { sessionId, search, academicLevel, page, limit } = matchedData(req, { locations: ['query'] });
  const result = await listClasses({
    campusId,
    sessionId: sessionId ? parseInt(sessionId) : undefined,
    search,
    academicLevel,
    page:  page  ? parseInt(page)  : 1,
    limit: limit ? parseInt(limit) : 20,
  });
  res.json(ApiResponse.success('Classes fetched', result));
};

// ── GET /campuses/:campusId/classes/:classGroupId ──────────────────────────────
const getOneCtrl = async (req, res) => {
  const campusId     = parseInt(req.params.campusId);
  const classGroupId = parseInt(req.params.classGroupId);
  const cls = await getClassById(classGroupId, campusId);
  res.json(ApiResponse.success('Class fetched', { class: cls }));
};

// ── POST /campuses/:campusId/classes ───────────────────────────────────────────
const createCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const data     = matchedData(req, { locations: ['body'] });
  const cls = await createClass({ campusId, ...data });
  res.status(201).json(ApiResponse.success('Class created', { class: cls }));
};

// ── PATCH /campuses/:campusId/classes/:classGroupId ────────────────────────────
const updateCtrl = async (req, res) => {
  const campusId     = parseInt(req.params.campusId);
  const classGroupId = parseInt(req.params.classGroupId);
  const data         = matchedData(req, { locations: ['body'] });
  const cls = await updateClass(classGroupId, campusId, data);
  res.json(ApiResponse.success('Class updated', { class: cls }));
};

// ── DELETE /campuses/:campusId/classes/:classGroupId ───────────────────────────
const deleteCtrl = async (req, res) => {
  const campusId     = parseInt(req.params.campusId);
  const classGroupId = parseInt(req.params.classGroupId);
  await deleteClass(classGroupId, campusId);
  res.json(ApiResponse.success('Class deleted successfully'));
};

// ── POST /campuses/:campusId/classes/seed-defaults ────────────────────────────
const seedDefaultsCtrl = async (req, res) => {
  const campusId  = parseInt(req.params.campusId);
  const { sessionId } = matchedData(req, { locations: ['body'] });
  await seedDefaultClasses({ campusId, sessionId: parseInt(sessionId) });
  res.status(201).json(ApiResponse.success('Default classes seeded successfully'));
};

// ── POST /campuses/:campusId/classes/clone ─────────────────────────────────────
const cloneCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const { sourceSessionId, targetSessionId } = matchedData(req, { locations: ['body'] });
  await cloneClassesFromSession({
    campusId,
    sourceSessionId: parseInt(sourceSessionId),
    targetSessionId: parseInt(targetSessionId),
  });
  res.status(201).json(ApiResponse.success('Classes cloned successfully'));
};

module.exports = { list: listCtrl, getOne: getOneCtrl, create: createCtrl, update: updateCtrl, delete: deleteCtrl, seedDefaults: seedDefaultsCtrl, clone: cloneCtrl };
