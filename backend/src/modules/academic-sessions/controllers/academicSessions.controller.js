const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { listSessions, getSessionById, createSession, updateSession, transitionSession, deleteSession } = require('../services/academicSessions.service');

// ── GET /academic-sessions ─────────────────────────────────────────────────────

const listCtrl = async (req, res) => {
  const { search, status, page, limit } = matchedData(req, { locations: ['query'] });
  const result = await listSessions({
    search,
    status,
    page:  page  ? parseInt(page)  : 1,
    limit: limit ? parseInt(limit) : 20,
  });
  res.json(ApiResponse.success('Academic sessions fetched', result));
};

// ── GET /academic-sessions/:id ─────────────────────────────────────────────────

const getOneCtrl = async (req, res) => {
  const { id } = matchedData(req, { locations: ['params'] });
  const session = await getSessionById(parseInt(id));
  res.json(ApiResponse.success('Academic session fetched', { session }));
};

// ── POST /academic-sessions ────────────────────────────────────────────────────

const createCtrl = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const session = await createSession(data);
  res.status(201).json(ApiResponse.success('Academic session created', { session }));
};

// ── PATCH /academic-sessions/:id ──────────────────────────────────────────────

const updateCtrl = async (req, res) => {
  const { id, ...data } = matchedData(req, { locations: ['body', 'params'] });
  const session = await updateSession(parseInt(id), data);
  res.json(ApiResponse.success('Academic session updated', { session }));
};

// ── PATCH /academic-sessions/:id/status ───────────────────────────────────────

const transitionCtrl = async (req, res) => {
  const { id } = matchedData(req, { locations: ['params'] });
  const session = await transitionSession(parseInt(id));
  res.json(ApiResponse.success('Academic session transitioned', { session }));
};

// ── DELETE /academic-sessions/:id ─────────────────────────────────────────────

const deleteCtrl = async (req, res) => {
  const { id } = matchedData(req, { locations: ['params'] });
  await deleteSession(parseInt(id));
  res.json(ApiResponse.success('Academic session deleted'));
};

module.exports = { list: listCtrl, getOne: getOneCtrl, create: createCtrl, update: updateCtrl, transition: transitionCtrl, delete: deleteCtrl };
