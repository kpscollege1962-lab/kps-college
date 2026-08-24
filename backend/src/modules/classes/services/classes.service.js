const { Op } = require('sequelize');
const { ClassGroup, Section, AcademicSession, sequelize } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { createDefaultSection } = require('./sections.service');

// ── Deployment defaults ────────────────────────────────────────────────────────
// Default class templates are sourced from deployment.json, not the database.
// This keeps template management out of the app UI entirely.
let deploymentDefaults = null;
const getDeploymentDefaults = () => {
  if (!deploymentDefaults) {
    try {
      deploymentDefaults = require('../../../../config/deployment.json').defaultClasses;
    } catch {
      throw new ApiError(500, 'deployment.json not found or missing defaultClasses key');
    }
  }
  return deploymentDefaults;
};

// ── Internal helper ────────────────────────────────────────────────────────────
const getClassById = async (classGroupId, campusId) => {
  const cls = await ClassGroup.findOne({
    where: { id: classGroupId, campus_id: campusId },
    include: [{ model: Section, as: 'sections', where: { name: { [Op.ne]: null } }, required: false }],
  });
  if (!cls) throw new ApiError(404, 'Class not found');
  return cls;
};

// ── List classes for a campus+session (with named sections) ───────────────────
const listClasses = async ({ campusId, sessionId, search, academicLevel, page = 1, limit = 20 }) => {
  const where = { campus_id: campusId };
  if (sessionId)     where.session_id    = sessionId;
  if (search)        where.name          = { [Op.like]: `%${search}%` };
  if (academicLevel) where.academic_level = academicLevel;

  const offset = (page - 1) * limit;
  const { count, rows } = await ClassGroup.findAndCountAll({
    where,
    include: [
      {
        model: Section,
        as: 'sections',
        where: { name: { [Op.ne]: null } },
        required: false,
      },
    ],
    distinct: true,
    order: [
      ['level', 'ASC'],
      ['name', 'ASC'],
      [{ model: Section, as: 'sections' }, 'name', 'ASC'],
    ],
    limit,
    offset,
  });
  return { data: rows, total: count, page, limit };
};

// ── Create a single class ──────────────────────────────────────────────────────
// Always auto-creates a null-named default section via the section service.
const createClass = async ({ campusId, sessionId, name, level, academic_level }) => {
  const duplicate = await ClassGroup.findOne({
    where: { campus_id: campusId, session_id: sessionId, name: name.trim() },
  });
  if (duplicate) {
    throw new ApiError(409, `A class named "${name.trim()}" already exists for this campus and session`);
  }

  const transaction = await sequelize.transaction();
  try {
    const cls = await ClassGroup.create(
      { campus_id: campusId, session_id: sessionId, name: name.trim(), level, academic_level },
      { transaction }
    );
    await createDefaultSection(cls.id, transaction);
    await transaction.commit();
    return ClassGroup.findByPk(cls.id, {
      include: [{ model: Section, as: 'sections', where: { name: { [Op.ne]: null } }, required: false }],
    });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// ── Update a class name / level / academic_level ───────────────────────────────
const updateClass = async (classGroupId, campusId, { name, level, academic_level }) => {
  const cls = await getClassById(classGroupId, campusId);
  if (name !== undefined) {
    const trimmed = name.trim();
    const duplicate = await ClassGroup.findOne({
      where: {
        campus_id: campusId,
        session_id: cls.session_id,
        name: trimmed,
        id: { [Op.ne]: classGroupId },
      },
    });
    if (duplicate) throw new ApiError(409, `A class named "${trimmed}" already exists for this campus and session`);
  }
  await cls.update({
    ...(name          !== undefined && { name: name.trim() }),
    ...(level         !== undefined && { level }),
    ...(academic_level !== undefined && { academic_level }),
  });
  return cls.reload({
    include: [{ model: Section, as: 'sections', where: { name: { [Op.ne]: null } }, required: false }],
  });
};

// ── Delete a class ─────────────────────────────────────────────────────────────
// Sections cascade-delete via DB (onDelete: CASCADE on sections.class_group_id).
// If any section has enrolled students (or other downstream FK RESTRICT),
// the DB will throw a FK constraint error caught by the global error handler.
const deleteClass = async (classGroupId, campusId) => {
  const cls = await getClassById(classGroupId, campusId);
  await cls.destroy();
};

// ── Seed default classes from deployment.json ──────────────────────────────────
// Guard: rejected if any class already exists for this campus+session.
const seedDefaultClasses = async ({ campusId, sessionId }) => {
  const existing = await ClassGroup.findOne({ where: { campus_id: campusId, session_id: sessionId } });
  if (existing) {
    throw new ApiError(409, 'Classes already exist for this campus and session. Seeding is only allowed on an empty session.');
  }
  const defaults = getDeploymentDefaults();
  const transaction = await sequelize.transaction();
  try {
    for (const item of defaults) {
      const cls = await ClassGroup.create(
        {
          campus_id:      campusId,
          session_id:     sessionId,
          name:           item.name,
          level:          item.level,
          academic_level: item.academic_level,
        },
        { transaction }
      );
      await createDefaultSection(cls.id, transaction);
    }
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// ── Clone classes from another session ────────────────────────────────────────
const cloneClassesFromSession = async ({ campusId, sourceSessionId, targetSessionId }) => {
  if (sourceSessionId === targetSessionId) {
    throw new ApiError(400, 'Source and target sessions must be different');
  }

  const sourceSession = await AcademicSession.findByPk(sourceSessionId);
  if (!sourceSession) throw new ApiError(404, 'Source session not found');

  const existing = await ClassGroup.findOne({ where: { campus_id: campusId, session_id: targetSessionId } });
  if (existing) {
    throw new ApiError(409, 'Classes already exist for the target session. Cloning is only allowed into an empty session.');
  }

  const sourceClasses = await ClassGroup.findAll({
    where: { campus_id: campusId, session_id: sourceSessionId },
    include: [{ model: Section, as: 'sections' }],
    order: [['level', 'ASC']],
  });

  if (!sourceClasses.length) {
    throw new ApiError(404, 'No classes found in the source session to clone from');
  }

  const transaction = await sequelize.transaction();
  try {
    for (const srcClass of sourceClasses) {
      const newClass = await ClassGroup.create(
        {
          campus_id:      campusId,
          session_id:     targetSessionId,
          name:           srcClass.name,
          level:          srcClass.level,
          academic_level: srcClass.academic_level,
        },
        { transaction }
      );

      // Straight copy — source sections are already valid by the service invariant.
      // Each class has either one null section (unsectioned) or one-or-more named
      // sections. Copy them as-is; no create-then-rename dance needed.
      for (const section of srcClass.sections) {
        await Section.create(
          { class_group_id: newClass.id, name: section.name },
          { transaction }
        );
      }
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

module.exports = {
  listClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  seedDefaultClasses,
  cloneClassesFromSession,
};
