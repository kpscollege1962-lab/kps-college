const ApiResponse = require('../../../utils/ApiResponse');
const ApiError = require('../../../utils/ApiError');
const { listSubmissionsForHomework, submitHomework, markSubmissionDone } = require('../services/homeworkSubmission.service');
const { Staff, Student, Enrollment, AcademicSession } = require('../../../models');

const resolveStaffId = async (userId) => {
  const staff = await Staff.findOne({ where: { user_id: userId } });
  if (!staff) throw new ApiError(403, 'No staff record is linked to this account');
  return staff.id;
};

// Resolve the acting student's own current enrollment — never trust a client-supplied enrollmentId.
const resolveMyEnrollmentId = async (userId) => {
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) throw new ApiError(403, 'No student record is linked to this account');

  const activeSession = await AcademicSession.findOne({ where: { status: 'active' } });
  if (!activeSession) throw new ApiError(404, 'No active academic session is configured');

  const enrollment = await Enrollment.findOne({
    where: { student_id: student.id, session_id: activeSession.id, status: 'active' },
  });
  if (!enrollment) throw new ApiError(403, 'You are not actively enrolled in the current session');

  return enrollment.id;
};

const listCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const homeworkId = parseInt(req.params.homeworkId);
  const submissions = await listSubmissionsForHomework(homeworkId, campusId);
  res.json(ApiResponse.success('Submissions fetched', { submissions }));
};

const submitCtrl = async (req, res) => {
  const homeworkId = parseInt(req.params.homeworkId);
  const enrollmentId = await resolveMyEnrollmentId(req.user.id);
  const submission = await submitHomework({ homeworkId, enrollmentId, file: req.file });
  res.status(201).json(ApiResponse.success('Homework submitted', { submission }));
};

const markDoneCtrl = async (req, res) => {
  const campusId = parseInt(req.params.campusId);
  const submissionId = parseInt(req.params.submissionId);
  const staffId = await resolveStaffId(req.user.id);
  const submission = await markSubmissionDone(submissionId, campusId, staffId);
  res.json(ApiResponse.success('Submission marked as done', { submission }));
};

module.exports = { list: listCtrl, submit: submitCtrl, markDone: markDoneCtrl };