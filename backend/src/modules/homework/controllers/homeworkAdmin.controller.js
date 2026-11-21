const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const {
  updateHomework, deleteHomework, restoreHomework, permanentlyDeleteHomework,
} = require('../services/homework.service');

// Admin actions on any teacher's assignment in the campus of the URL. The routes check the
// HomeworkOverview permission (campus-scoped by the ability factory); the services check that
// the assignment belongs to this campus (404 otherwise).

const ids = (req) => ({
  campusId:   parseInt(req.params.campusId),
  homeworkId: parseInt(req.params.homeworkId),
});

const updateCtrl = async (req, res) => {
  const { campusId, homeworkId } = ids(req);
  const { description, assignedDate, dueDate } = matchedData(req, { locations: ['body'] });
  const homework = await updateHomework(homeworkId, campusId, {
    description, assignedDate, dueDate, userId: req.user.id,
  });
  res.json(ApiResponse.success('Assignment updated', { homework }));
};

const deleteCtrl = async (req, res) => {
  const { campusId, homeworkId } = ids(req);
  await deleteHomework(homeworkId, campusId, req.user.id);
  res.json(ApiResponse.success('Assignment deleted. It can be restored from Recently deleted.'));
};

const restoreCtrl = async (req, res) => {
  const { campusId, homeworkId } = ids(req);
  const homework = await restoreHomework(homeworkId, campusId);
  res.json(ApiResponse.success('Assignment restored', { homework }));
};

const permanentDeleteCtrl = async (req, res) => {
  const { campusId, homeworkId } = ids(req);
  const result = await permanentlyDeleteHomework(homeworkId, campusId);
  res.json(ApiResponse.success('Assignment deleted permanently', result));
};

module.exports = {
  update: updateCtrl, delete: deleteCtrl, restore: restoreCtrl, permanentDelete: permanentDeleteCtrl,
};
