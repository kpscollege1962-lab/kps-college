const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const ApiError = require('../../../utils/ApiError');
const {
  listHomework, getHomeworkById, createHomework, updateHomework, deleteHomework, assertOwnHomework,
} = require('../services/homework.service');
const { Staff } = require('../../../models');
const { assertFormMaster } = require('../../teacher/utils/formMaster');

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

  // A teacher account (manage Homework, but not Super Admin's manage all) may only list a whole
  // class this way if they are its form master, the same rule as the form-master report.
  // Other roles keep their current access.
  const isTeacherCall = req.ability.can('manage', 'Homework') && !req.ability.can('manage', 'all');
  if (!mine && isTeacherCall) {
    await assertFormMaster(req.user.id, campusId, parseInt(classGroupId), parseInt(sectionId));
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
  const { sessionId, classGroupId, sectionId, subjectId, type, title, description, assignedDate, dueDate } =
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
    assignedDate,
    dueDate,
    file: req.file,
  });
  res.status(201).json(ApiResponse.success('Homework posted', { homework }));
};

// Ownership: on these teacher routes a teacher may only change their own posts. Super Admin
// (manage all) is exempt. Admins change anyone's posts through the /admin routes instead.
const assertMayChange = async (req, homeworkId, campusId) => {
  if (req.ability.can('manage', 'all')) return;
  await assertOwnHomework(homeworkId, campusId, await resolveStaffId(req.user.id));
};

const updateCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const homeworkId = parseInt(req.params.homeworkId);
  await assertMayChange(req, homeworkId, campusId);
  const { title, description, assignedDate, dueDate, type } = matchedData(req, { locations: ['body'] });
  const homework = await updateHomework(homeworkId, campusId, {
    title, description, assignedDate, dueDate, type, file: req.file, userId: req.user.id,
  });
  res.json(ApiResponse.success('Homework updated', { homework }));
};

const deleteCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const homeworkId = parseInt(req.params.homeworkId);
  await assertMayChange(req, homeworkId, campusId);
  await deleteHomework(homeworkId, campusId, req.user.id); // soft delete
  res.json(ApiResponse.success('Homework deleted'));
};

module.exports = { list: listCtrl, getOne: getOneCtrl, create: createCtrl, update: updateCtrl, delete: deleteCtrl };