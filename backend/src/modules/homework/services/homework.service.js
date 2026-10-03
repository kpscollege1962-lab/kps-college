const { Homework, HomeworkSubmission, Subject, ClassGroup, Section, Staff, Enrollment } = require('../../../models');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../../../utils/cloudinaryUpload');
const ApiError = require('../../../utils/ApiError');

const CLOUDINARY_FOLDER = 'homework/posts';

const getHomeworkById = async (homeworkId, campusId) => {
  const homework = await Homework.findOne({
    where: { id: homeworkId, campus_id: campusId },
    include: [
      { model: Subject, as: 'subject' },
      { model: ClassGroup, as: 'classGroup' },
      { model: Section, as: 'section' },
      { model: Staff, as: 'postedBy', attributes: ['id', 'full_name'] },
    ],
  });
  if (!homework) throw new ApiError(404, 'Homework not found');
  return homework;
};

// ── List homework for a class/section (teacher's own posts, or a student's class) ──
const listHomework = async ({ campusId, sessionId, classGroupId, sectionId, page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await Homework.findAndCountAll({
    where: { campus_id: campusId, session_id: sessionId, class_group_id: classGroupId, section_id: sectionId },
    include: [
      { model: Subject, as: 'subject' },
      { model: Staff, as: 'postedBy', attributes: ['id', 'full_name'] },
    ],
    order: [['due_date', 'DESC'], ['created_at', 'DESC']],
    limit,
    offset,
  });
  return { data: rows, total: count, page, limit };
};

// ── Create homework (optional file attachment) ──────────────────────────────
const createHomework = async ({ campusId, sessionId, classGroupId, sectionId, subjectId, staffId, title, description, dueDate, file }) => {
  let attachment = {};
  if (file) {
    const result = await uploadBufferToCloudinary(file.buffer, CLOUDINARY_FOLDER);
    attachment = {
      attachment_url: result.secure_url,
      attachment_public_id: result.public_id,
      attachment_original_name: file.originalname,
    };
  }

  const homework = await Homework.create({
    campus_id: campusId,
    session_id: sessionId,
    class_group_id: classGroupId,
    section_id: sectionId,
    subject_id: subjectId,
    staff_id: staffId,
    title,
    description,
    due_date: dueDate,
    ...attachment,
  });

  return getHomeworkById(homework.id, campusId);
};

// ── Update homework (optionally replace the attachment) ─────────────────────
const updateHomework = async (homeworkId, campusId, { title, description, dueDate, file }) => {
  const homework = await getHomeworkById(homeworkId, campusId);

  let attachment = {};
  if (file) {
    if (homework.attachment_public_id) {
      await deleteFromCloudinary(homework.attachment_public_id);
    }
    const result = await uploadBufferToCloudinary(file.buffer, CLOUDINARY_FOLDER);
    attachment = {
      attachment_url: result.secure_url,
      attachment_public_id: result.public_id,
      attachment_original_name: file.originalname,
    };
  }

  await homework.update({
    ...(title       !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(dueDate      !== undefined && { due_date: dueDate }),
    ...attachment,
  });

  return getHomeworkById(homeworkId, campusId);
};

// ── Delete homework (cleans up Cloudinary attachment + cascades submissions) ─
const deleteHomework = async (homeworkId, campusId) => {
  const homework = await getHomeworkById(homeworkId, campusId);

  // Also clean up every submission's file, since HomeworkSubmission cascades
  // at the DB level but Cloudinary assets are not cleaned up automatically.
  const submissions = await HomeworkSubmission.findAll({ where: { homework_id: homeworkId } });
  for (const sub of submissions) {
    await deleteFromCloudinary(sub.file_public_id);
  }
  if (homework.attachment_public_id) {
    await deleteFromCloudinary(homework.attachment_public_id);
  }

  await homework.destroy();
};

module.exports = { listHomework, getHomeworkById, createHomework, updateHomework, deleteHomework };