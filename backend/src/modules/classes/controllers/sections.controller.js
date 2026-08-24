const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const {
  listSections,
  getSectionById,
  addSection,
  updateSection,
  deleteSection,
} = require('../services/sections.service');

// ── GET /campuses/:campusId/classes/:classGroupId/sections ─────────────────────
const listCtrl = async (req, res) => {
  const classGroupId = parseInt(req.params.classGroupId);
  const sections = await listSections(classGroupId);
  res.json(ApiResponse.success('Sections fetched', { sections }));
};

// ── GET /campuses/:campusId/classes/:classGroupId/sections/:sectionId ──────────
const getOneCtrl = async (req, res) => {
  const sectionId = parseInt(req.params.sectionId);
  const section   = await getSectionById(sectionId);
  res.json(ApiResponse.success('Section fetched', { section }));
};

// ── POST /campuses/:campusId/classes/:classGroupId/sections ────────────────────
const createCtrl = async (req, res) => {
  const classGroupId = parseInt(req.params.classGroupId);
  const { name }     = matchedData(req, { locations: ['body'] });
  const section = await addSection(classGroupId, name);
  res.status(201).json(ApiResponse.success('Section added', { section }));
};

// ── PATCH /campuses/:campusId/classes/:classGroupId/sections/:sectionId ────────
const updateCtrl = async (req, res) => {
  const sectionId = parseInt(req.params.sectionId);
  const { name }  = matchedData(req, { locations: ['body'] });
  const section   = await updateSection(sectionId, name);
  res.json(ApiResponse.success('Section updated', { section }));
};

// ── DELETE /campuses/:campusId/classes/:classGroupId/sections/:sectionId ───────
const deleteCtrl = async (req, res) => {
  const sectionId = parseInt(req.params.sectionId);
  await deleteSection(sectionId);
  res.json(ApiResponse.success('Section deleted successfully'));
};

module.exports = { list: listCtrl, getOne: getOneCtrl, create: createCtrl, update: updateCtrl, delete: deleteCtrl };
