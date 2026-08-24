const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { listStudents, getStudentById, createStudent, updateStudent } = require('../services/students.service');

// ── GET /students ──────────────────────────────────────────────────────────────

const listCtrl = async (req, res) => {
  const { search, registerLevel, page, limit } = matchedData(req, { locations: ['query'] });

  const result = await listStudents({
    search,
    registerLevel,
    page:  page  ? parseInt(page)  : 1,
    limit: limit ? parseInt(limit) : 20,
  });
  res.json(ApiResponse.success('Students fetched', result));
};

// ── GET /students/:studentId ───────────────────────────────────────────────────

const getOneCtrl = async (req, res) => {
  const { studentId } = matchedData(req, { locations: ['params'] });
  const student = await getStudentById(parseInt(studentId));
  res.json(ApiResponse.success('Student fetched', { student }));
};

// ── POST /students ─────────────────────────────────────────────────────────────

const createCtrl = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const student = await createStudent(data);
  res.status(201).json(ApiResponse.success('Student created', { student }));
};

// ── PATCH /students/:studentId ─────────────────────────────────────────────────

const updateCtrl = async (req, res) => {
  const { studentId, ...data } = matchedData(req, { locations: ['body', 'params'] });
  const student = await updateStudent(parseInt(studentId), data);
  res.json(ApiResponse.success('Student updated', { student }));
};

module.exports = { list: listCtrl, getOne: getOneCtrl, create: createCtrl, update: updateCtrl };
