const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const ApiError = require('../../../utils/ApiError');
const { listHomework, getHomeworkById, createHomework, updateHomework, deleteHomework } = require('../services/homework.service');
const { Staff } = require('../../../models');

// Resolve the acting teacher's Staff record from the JWT user — never trust a client-supplied staffId.
const resolveStaffId = async (userId) => {
  const staff = await Staff.findOne({ where: { user_id: userId } });
  if (!staff) throw new ApiError(403, 'No staff record is linked to this account');
  return staff.id;
};

const listCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const { sessionId, classGroupId, sectionId, dueDate, mine, page, limit } = matchedData(req, { locations: ['query'] });

  // Without `mine`, a class and section are still required, so nobody can
  // list every post in the campus.
  if (!mine && (!classGroupId || !sectionId)) {
    throw new ApiError(422, 'classGroupId and sectionId are required');
  }

  const staffId = mine ? await resolveStaffId(req.user.id) : undefined;
  const result = await listHomework({
    campusId,
    sessionId: parseInt(sessionId),
    classGroupId: classGroupId ? parseInt(classGroupId) : undefined,
    sectionId: sectionId ? parseInt(sectionId) : undefined,
    dueDate,
    staffId,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
  });
  res.json(ApiResponse.success('Homework fetched', result));
};

const getOneCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const homeworkId = parseInt(req.params.homeworkId);
  const homework = await getHomeworkById(homeworkId, campusId);
  res.json(ApiResponse.success('Homework fetched', { homework }));
};

const createCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const { sessionId, classGroupId, sectionId, subjectId, type, title, description, dueDate } =
    matchedData(req, { locations: ['body'] });
  const staffId = await resolveStaffId(req.user.id);
  const homework = await createHomework({
    campusId,
    sessionId: parseInt(sessionId),
    classGroupId: parseInt(classGroupId),
    sectionId: parseInt(sectionId),
    subjectId: parseInt(subjectId),
    staffId,
    type,
    title,
    description,
    dueDate,
    file: req.file,
  });
  res.status(201).json(ApiResponse.success('Homework posted', { homework }));
};

const updateCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const homeworkId = parseInt(req.params.homeworkId);
  const { title, description, dueDate, type } = matchedData(req, { locations: ['body'] });
  const homework = await updateHomework(homeworkId, campusId, { title, description, dueDate, type, file: req.file });
  res.json(ApiResponse.success('Homework updated', { homework }));
};

const deleteCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const homeworkId = parseInt(req.params.homeworkId);
  await deleteHomework(homeworkId, campusId);
  res.json(ApiResponse.success('Homework deleted'));
};

module.exports = { list: listCtrl, getOne: getOneCtrl, create: createCtrl, update: updateCtrl, delete: deleteCtrl };