const { Op } = require('sequelize');
const { Subject } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

// ── List ───────────────────────────────────────────────────────────────────────

const listSubjects = async ({ search, category, page = 1, limit = 20 }) => {
  const where = {};

  if (search) {
    where.name = { [Op.like]: `%${search}%` };
  }

  if (category) {
    where.category = category;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Subject.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit,
    offset,
  });

  return { data: rows, total: count, page, limit };
};

// ── Get one ────────────────────────────────────────────────────────────────────

const getSubjectById = async (subjectId) => {
  const subject = await Subject.findByPk(subjectId);
  if (!subject) throw new ApiError(404, 'Subject not found');
  return subject;
};

// ── Create ─────────────────────────────────────────────────────────────────────

const createSubject = async ({ name, name_initials, category }) => {
  const duplicate = await Subject.findOne({ where: { name } });
  if (duplicate) {
    throw new ApiError(409, 'A subject with this name already exists');
  }

  if (name_initials) {
    const initialsDuplicate = await Subject.findOne({ where: { name_initials } });
    if (initialsDuplicate) {
      throw new ApiError(409, 'A subject with these initials already exists');
    }
  }

  const subject = await Subject.create({ name, name_initials, category });

  return subject;
};

// ── Update ─────────────────────────────────────────────────────────────────────

const updateSubject = async (subjectId, { name, name_initials, category }) => {
  const subject = await getSubjectById(subjectId);

  if (name !== undefined) {
    const duplicate = await Subject.findOne({
      where: { name, id: { [Op.ne]: subjectId } },
    });
    if (duplicate) {
      throw new ApiError(409, 'A subject with this name already exists');
    }
  }

  if (name_initials !== undefined && name_initials !== null) {
    const initialsDuplicate = await Subject.findOne({
      where: { name_initials, id: { [Op.ne]: subjectId } },
    });
    if (initialsDuplicate) {
      throw new ApiError(409, 'A subject with these initials already exists');
    }
  }

  await subject.update({
    ...(name          !== undefined && { name }),
    ...(name_initials !== undefined && { name_initials }),
    ...(category      !== undefined && { category }),
  });

  return subject.reload();
};

// ── Delete ─────────────────────────────────────────────────────────────────────

const deleteSubject = async (subjectId) => {
  const subject = await getSubjectById(subjectId);
  await subject.destroy();
};

module.exports = { listSubjects, getSubjectById, createSubject, updateSubject, deleteSubject };
