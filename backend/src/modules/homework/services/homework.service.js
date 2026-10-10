const { Homework, HomeworkSubmission, Subject, ClassGroup, Section, Staff } = require('../../../models');
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

// ── List homework. With no class/section given, returns everything matching the
// other filters (the controller only allows that for a teacher's own posts). ──
const listHomework = async ({ campusId, sessionId, classGroupId, sectionId, dueDate, staffId, page = 1, limit = 20 }) => {
  const where = { campus_id: campusId, session_id: sessionId };
  if (classGroupId) where.class_group_id = classGroupId;
  if (sectionId)    where.section_id = sectionId;
  if (dueDate)      where.due_date = dueDate;
  if (staffId)      where.staff_id = staffId;

  const offset = (page - 1) * limit;
  const { count, rows } = await Homework.findAndCountAll({
    where,
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
const createHomework = async ({ campusId, sessionId, classGroupId, sectionId, subjectId, staffId, type, title, description, dueDate, file }) => {
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
    type,
    title,
    description,
    due_date: dueDate,
    ...attachment,
  });

  return getHomeworkById(homework.id, campusId);
};

// ── Update homework (optionally replace the attachment) ─────────────────────
// Order: upload the new file, save the row, THEN remove the old file, so a
// failure part-way never leaves the row pointing at a deleted file.
const updateHomework = async (homeworkId, campusId, { title, description, dueDate, type, file }) => {
  const homework = await getHomeworkById(homeworkId, campusId);
  const oldPublicId = homework.attachment_public_id;

  let attachment = {};
  if (file) {
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
    ...(type          !== undefined && { type }),
    ...attachment,
  });

  if (file && oldPublicId) await deleteFromCloudinary(oldPublicId);

  return getHomeworkById(homeworkId, campusId);
};

// ── Delete homework ─────────────────────────────────────────────────────────
// Delete the DB row first (submissions cascade at the DB level), then clean up
// Cloudinary best-effort. A Cloudinary hiccup must never stop a teacher deleting.
const deleteHomework = async (homeworkId, campusId) => {
  const homework = await getHomeworkById(homeworkId, campusId);

  const submissions = await HomeworkSubmission.findAll({
    where: { homework_id: homeworkId },
    attributes: ['file_public_id'],
  });
  const publicIds = [
    homework.attachment_public_id,
    ...submissions.map((s) => s.file_public_id),
  ].filter(Boolean);

  await homework.destroy();

  await Promise.all(publicIds.map((id) => deleteFromCloudinary(id)));
};

module.exports = { listHomework, getHomeworkById, createHomework, updateHomework, deleteHomework };