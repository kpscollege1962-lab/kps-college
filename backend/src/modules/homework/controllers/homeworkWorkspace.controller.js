const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { listMyAssignments, createHomeworkBatch } = require('../services/homeworkWorkspace.service');

const toInt = (value) => (value !== undefined && value !== null && value !== '' ? parseInt(value) : undefined);


const mineCtrl = async (req, res) => {
  const q = matchedData(req, { locations: ['query'] });
  const assignments = await listMyAssignments({
    campusId:     parseInt(req.params.campusId),
    userId:       req.user.id,
    sessionId:    parseInt(q.sessionId),
    assignedDate: q.assignedDate,
    dueDate:      q.dueDate,
    assignedFrom: q.assignedFrom,
    assignedTo:   q.assignedTo,
    classGroupId: toInt(q.classGroupId),
    sectionId:    toInt(q.sectionId),
    subjectId:    toInt(q.subjectId),
  });
  res.json(ApiResponse.success('Assignments fetched', { assignments }));
};


const batchCtrl = async (req, res) => {
  const body = matchedData(req, { locations: ['body'] });
  const result = await createHomeworkBatch({
    campusId:     parseInt(req.params.campusId),
    userId:       req.user.id,
    sessionId:    parseInt(body.sessionId),
    assignedDate: body.assignedDate,
    dueDate:      body.dueDate,
    classwork:    body.classwork,
    homework:     body.homework,
    targets: body.targets.map((t) => ({
      classGroupId: parseInt(t.classGroupId),
      sectionId:    parseInt(t.sectionId),
      subjectId:    parseInt(t.subjectId),
    })),
  });
  res.status(201).json(ApiResponse.success('Assignments posted', result));
};

module.exports = { mine: mineCtrl, batch: batchCtrl };