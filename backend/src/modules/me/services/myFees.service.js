const { Student, Enrollment, AcademicSession } = require('../../../models');
const { listChallans } = require('../../fees/services/feeChallans.service');
const ApiError = require('../../../utils/ApiError');

// ── Resolve the logged-in user's own active enrollment ────────────────────────
// Never trusts client input for identity — always derives from req.user.id.
const getMyActiveEnrollment = async (userId) => {
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) throw new ApiError(403, 'No student record is linked to this account');

  const activeSession = await AcademicSession.findOne({ where: { status: 'active' } });
  if (!activeSession) throw new ApiError(404, 'No active academic session is configured');

  const enrollment = await Enrollment.findOne({
    where: { student_id: student.id, session_id: activeSession.id, status: 'active' },
  });
  if (!enrollment) throw new ApiError(404, 'You are not actively enrolled in the current session');

  return { student, enrollment, activeSession };
};

// ── List my own fee challans (current active session, no cross-student leak) ──
const listMyFeeChallans = async (userId) => {
  const { enrollment, activeSession } = await getMyActiveEnrollment(userId);

  return listChallans({
    campusId: enrollment.campus_id,
    sessionId: activeSession.id,
    enrollmentId: enrollment.id,
    limit: 50,
  });
};

module.exports = { getMyActiveEnrollment, listMyFeeChallans };