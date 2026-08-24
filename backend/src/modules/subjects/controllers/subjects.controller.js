const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { listSubjects, getSubjectById, createSubject, updateSubject, deleteSubject } = require('../services/subjects.service');

// ── GET /subjects ──────────────────────────────────────────────────────────────

const listCtrl = async (req, res) => {
  const { search, category, page, limit } = matchedData(req, { locations: ['query'] });
  const result = await listSubjects({
    search,
    category,
    page:  page  ? parseInt(page)  : 1,
    limit: limit ? parseInt(limit) : 20,
  });
  res.json(ApiResponse.success('Subjects fetched', result));
};

// ── GET /subjects/:subjectId ───────────────────────────────────────────────────

const getOneCtrl = async (req, res) => {
  const { subjectId } = matchedData(req, { locations: ['params'] });
  const subject = await getSubjectById(parseInt(subjectId));
  res.json(ApiResponse.success('Subject fetched', { subject }));
};

// ── POST /subjects ─────────────────────────────────────────────────────────────

const createCtrl = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const subject = await createSubject(data);
  res.status(201).json(ApiResponse.success('Subject created', { subject }));
};

// ── PATCH /subjects/:subjectId ─────────────────────────────────────────────────

const updateCtrl = async (req, res) => {
  const { subjectId, ...data } = matchedData(req, { locations: ['body', 'params'] });
  const subject = await updateSubject(parseInt(subjectId), data);
  res.json(ApiResponse.success('Subject updated', { subject }));
};

// ── DELETE /subjects/:subjectId ────────────────────────────────────────────────

const deleteCtrl = async (req, res) => {
  const { subjectId } = matchedData(req, { locations: ['params'] });
  await deleteSubject(parseInt(subjectId));
  res.json(ApiResponse.success('Subject deleted successfully'));
};

module.exports = { list: listCtrl, getOne: getOneCtrl, create: createCtrl, update: updateCtrl, delete: deleteCtrl };
