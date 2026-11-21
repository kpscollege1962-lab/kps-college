const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { listHomeworkOverview, listDeletedHomework, getHomeworkStructure } = require('../services/homeworkOverview.service');
const { listCampusFormMasters } = require('../../teacher/utils/formMaster');

const toInt = (value) => (value !== undefined && value !== null && value !== '' ? parseInt(value) : undefined);

const overviewCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const q = matchedData(req, { locations: ['query'] });
  const result = await listHomeworkOverview({
    campusId,
    sessionId:    parseInt(q.sessionId),
    assignedFrom: q.assignedFrom,
    assignedTo:   q.assignedTo,
    classGroupId: toInt(q.classGroupId),
    sectionId:    toInt(q.sectionId),
    subjectId:    toInt(q.subjectId),
    staffId:      toInt(q.staffId),
  });
  res.json(ApiResponse.success('Assignments fetched', result));
};

const structureCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const { sessionId } = matchedData(req, { locations: ['query'] });
  const [structure, formMasters] = await Promise.all([
    getHomeworkStructure({ campusId, sessionId: parseInt(sessionId) }),
    listCampusFormMasters(campusId, parseInt(sessionId)),
  ]);
  res.json(ApiResponse.success('Assignment structure fetched', { structure, formMasters }));
};

const deletedCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const { sessionId } = matchedData(req, { locations: ['query'] });
  const assignments = await listDeletedHomework({ campusId, sessionId: parseInt(sessionId) });
  res.json(ApiResponse.success('Deleted assignments fetched', { assignments }));
};

module.exports = { overview: overviewCtrl, structure: structureCtrl, deleted: deletedCtrl };