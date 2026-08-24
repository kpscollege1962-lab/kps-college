const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { listEnrollments, getEnrollmentById, createEnrollment, deleteEnrollment, searchEligibleStudents } = require('../services/enrollments.service');

// ── GET /enrollments ───────────────────────────────────────────────────────────

const listCtrl = async (req, res) => {
  const { campusId, sessionId, classGroupId, sectionId, status, search, page, limit } = matchedData(req, { locations: ['query'] });
  const result = await listEnrollments({
    campusId,
    sessionId,
    classGroupId,
    sectionId,
    status,
    search,
    page:  page  ? parseInt(page)  : 1,
    limit: limit ? parseInt(limit) : 20,
  });
  res.json(ApiResponse.success('Enrollments fetched', result));
};

// ── GET /enrollments/:enrollmentId ─────────────────────────────────────────────

const getOneCtrl = async (req, res) => {
  const { enrollmentId } = matchedData(req, { locations: ['params'] });
  const enrollment = await getEnrollmentById(parseInt(enrollmentId));
  res.json(ApiResponse.success('Enrollment fetched', { enrollment }));
};

// ── POST /enrollments ──────────────────────────────────────────────────────────

const createCtrl = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const enrollment = await createEnrollment(data);
  res.status(201).json(ApiResponse.success('Enrollment created', { enrollment }));
};

// ── DELETE /enrollments/:enrollmentId ──────────────────────────────────────────

const deleteCtrl = async (req, res) => {
  const { enrollmentId } = matchedData(req, { locations: ['params'] });
  await deleteEnrollment(parseInt(enrollmentId));
  res.json(ApiResponse.success('Enrollment deleted'));
};

// ── GET /enrollments/eligible-students ────────────────────────────────────────

const searchEligibleStudentsCtrl = async (req, res) => {
  const { sessionId, q } = matchedData(req, { locations: ['query'] });
  const students = await searchEligibleStudents({ sessionId, q });
  res.json(ApiResponse.success('Eligible students fetched', { students }));
};

module.exports = { list: listCtrl, getOne: getOneCtrl, create: createCtrl, delete: deleteCtrl, searchEligibleStudents: searchEligibleStudentsCtrl };
