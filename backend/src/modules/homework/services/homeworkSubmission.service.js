const { Homework, HomeworkSubmission, Enrollment, Student } = require('../../../models');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../../../utils/cloudinaryUpload');
const ApiError = require('../../../utils/ApiError');

const CLOUDINARY_FOLDER = 'homework/submissions';

// ── List all submissions for one homework post (teacher's review view) ──────
const listSubmissionsForHomework = async (homeworkId, campusId) => {
  const homework = await Homework.findOne({ where: { id: homeworkId, campus_id: campusId } });
  if (!homework) throw new ApiError(404, 'Homework not found');

  return HomeworkSubmission.findAll({
    where: { homework_id: homeworkId },
    include: [{
      model: Enrollment, as: 'enrollment',
      include: [{ model: Student, as: 'student', attributes: ['id', 'full_name', 'gr_no'] }],
    }],
    order: [['submitted_at', 'DESC']],
  });
};

// ── Student submits (or resubmits) their homework ────────────────────────────
// Upsert on (homework_id, enrollment_id) — resubmitting before being marked
// 'done' replaces the file; old Cloudinary asset is cleaned up.
const submitHomework = async ({ homeworkId, enrollmentId, file }) => {
  if (!file) throw new ApiError(422, 'A file is required to submit homework');

  const homework = await Homework.findByPk(homeworkId);
  if (!homework) throw new ApiError(404, 'Homework not found');

  const existing = await HomeworkSubmission.findOne({ where: { homework_id: homeworkId, enrollment_id: enrollmentId } });
  if (existing && existing.status === 'done') {
    throw new ApiError(400, 'This homework has already been reviewed and cannot be resubmitted');
  }

  const result = await uploadBufferToCloudinary(file.buffer, CLOUDINARY_FOLDER);

  if (existing) {
    await deleteFromCloudinary(existing.file_public_id);
    await existing.update({
      file_url: result.secure_url,
      file_public_id: result.public_id,
      file_original_name: file.originalname,
      submitted_at: new Date(),
      status: 'submitted',
    });
    return existing;
  }

  return HomeworkSubmission.create({
    homework_id: homeworkId,
    enrollment_id: enrollmentId,
    file_url: result.secure_url,
    file_public_id: result.public_id,
    file_original_name: file.originalname,
    submitted_at: new Date(),
    status: 'submitted',
  });
};

// ── Teacher marks a submission as reviewed ────────────────────────────────────
const markSubmissionDone = async (submissionId, campusId, staffId) => {
  const submission = await HomeworkSubmission.findOne({
    where: { id: submissionId },
    include: [{ model: Homework, as: 'homework', where: { campus_id: campusId } }],
  });
  if (!submission) throw new ApiError(404, 'Submission not found');

  await submission.update({ status: 'done', reviewed_by: staffId, reviewed_at: new Date() });
  return submission;
};

module.exports = { listSubmissionsForHomework, submitHomework, markSubmissionDone };