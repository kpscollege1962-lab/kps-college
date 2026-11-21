const { sequelize, Homework, HomeworkSubmission, Subject, ClassGroup, Section, Staff } = require('../../../models');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../../../utils/cloudinaryUpload');
const ApiError = require('../../../utils/ApiError');

const CLOUDINARY_FOLDER = 'homework/posts';

// 'YYYY-MM-DD' strings compare correctly as text; slice guards against full timestamps.
const day = (value) => String(value).slice(0, 10);

const assertDueNotBeforeAssigned = (assignedDate, dueDate) => {
  if (day(dueDate) < day(assignedDate)) {
    throw new ApiError(422, 'Due date cannot be before the assigned date');
  }
};

// Classwork is the work done in class on the assigned day, so it is due that same day.
const assertClassworkSameDay = (type, assignedDate, dueDate) => {
  if (type === 'classwork' && day(dueDate) !== day(assignedDate)) {
    throw new ApiError(422, 'Classwork is for the same day: its due date must be the assigned date');
  }
};

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
const createHomework = async ({ campusId, sessionId, classGroupId, sectionId, subjectId, staffId, type, title, description, assignedDate, dueDate, file }) => {
  assertDueNotBeforeAssigned(assignedDate, dueDate);

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
    assigned_date: assignedDate,
    due_date: dueDate,
    ...attachment,
  });

  return getHomeworkById(homework.id, campusId);
};

// ── Update homework (optionally replace the attachment) ─────────────────────
// Order: upload the new file, save the row, THEN remove the old file, so a
// failure part-way never leaves the row pointing at a deleted file.
// userId: who is editing (recorded in updated_by_user_id).
const updateHomework = async (homeworkId, campusId, { title, description, assignedDate, dueDate, type, file, userId }) => {
  const homework = await getHomeworkById(homeworkId, campusId);
  const oldPublicId = homework.attachment_public_id;

  const nextAssigned = assignedDate ?? homework.assigned_date;
  const nextDue      = dueDate ?? homework.due_date;
  assertDueNotBeforeAssigned(nextAssigned, nextDue);
  assertClassworkSameDay(type ?? homework.type, nextAssigned, nextDue);

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
    ...(title        !== undefined && { title }),
    ...(description  !== undefined && { description }),
    ...(assignedDate !== undefined && { assigned_date: assignedDate }),
    ...(dueDate      !== undefined && { due_date: dueDate }),
    ...(type         !== undefined && { type }),
    ...(userId       !== undefined && { updated_by_user_id: userId }),
    ...attachment,
  });

  if (file && oldPublicId) await deleteFromCloudinary(oldPublicId);

  return getHomeworkById(homeworkId, campusId);
};

// ── Delete homework (SOFT) ──────────────────────────────────────────────────
// Sets deleted_at (the model is paranoid), so the assignment disappears from every list and
// sheet. The row, its attachment and the students' submissions all stay, so an admin can
// restore it from "Recently deleted". Files are only removed by a permanent delete.
const deleteHomework = async (homeworkId, campusId, userId) => {
  const homework = await getHomeworkById(homeworkId, campusId);
  await sequelize.transaction(async (transaction) => {
    await homework.update({ deleted_by_user_id: userId ?? null }, { transaction, silent: true });
    await homework.destroy({ transaction });
  });
};

// A soft-deleted assignment in this campus (404 if it is not deleted or not here).
const getDeletedHomework = async (homeworkId, campusId) => {
  const homework = await Homework.findOne({
    where: { id: homeworkId, campus_id: campusId },
    paranoid: false,
  });
  if (!homework || !homework.deleted_at) throw new ApiError(404, 'Deleted assignment not found');
  return homework;
};

// ── Restore a soft-deleted assignment ───────────────────────────────────────
// Refused (409) when a live assignment of the same kind already exists for that class,
// section, subject and assigned date, so a restore never doubles up a day.
const restoreHomework = async (homeworkId, campusId) => {
  const homework = await getDeletedHomework(homeworkId, campusId);

  const clash = await Homework.findOne({
    where: {
      campus_id:      homework.campus_id,
      session_id:     homework.session_id,
      class_group_id: homework.class_group_id,
      section_id:     homework.section_id,
      subject_id:     homework.subject_id,
      assigned_date:  homework.assigned_date,
      type:           homework.type,
    },
  });
  if (clash) {
    throw new ApiError(409, 'A newer assignment already exists for this class and subject on this date. Edit or delete it first.');
  }

  await sequelize.transaction(async (transaction) => {
    await homework.restore({ transaction });
    await homework.update({ deleted_by_user_id: null }, { transaction, silent: true });
  });
  return getHomeworkById(homeworkId, campusId);
};

// ── Delete permanently (only an assignment that is already soft-deleted) ────
// Removes the row (submissions cascade at the DB level), then cleans up Cloudinary
// best-effort. Returns how many student submissions went with it.
const permanentlyDeleteHomework = async (homeworkId, campusId) => {
  const homework = await getDeletedHomework(homeworkId, campusId);

  const submissions = await HomeworkSubmission.findAll({
    where: { homework_id: homeworkId },
    attributes: ['file_public_id'],
  });
  const publicIds = [
    homework.attachment_public_id,
    ...submissions.map((s) => s.file_public_id),
  ].filter(Boolean);

  await homework.destroy({ force: true });

  await Promise.all(publicIds.map((id) => deleteFromCloudinary(id)));
  return { submissionsRemoved: submissions.length };
};

// Teachers may only change their own posts.
const assertOwnHomework = async (homeworkId, campusId, staffId) => {
  const homework = await getHomeworkById(homeworkId, campusId);
  if (homework.staff_id !== staffId) {
    throw new ApiError(403, 'You can only change assignments you posted');
  }
  return homework;
};

module.exports = {
  listHomework, getHomeworkById, createHomework, updateHomework, deleteHomework,
  getDeletedHomework, restoreHomework, permanentlyDeleteHomework, assertOwnHomework,
};