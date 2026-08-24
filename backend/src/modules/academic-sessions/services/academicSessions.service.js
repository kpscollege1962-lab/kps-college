const { Op } = require('sequelize');
const { sequelize, AcademicSession } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

// ── List ───────────────────────────────────────────────────────────────────────

const listSessions = async ({ search, status, page = 1, limit = 20 }) => {
  const where = {};

  if (search) {
    where.name = { [Op.like]: `%${search}%` };
  }

  if (status !== undefined) {
    where.status = status;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await AcademicSession.findAndCountAll({
    where,
    order: [['start_date', 'DESC']],
    limit,
    offset,
  });

  return { data: rows, total: count, page, limit };
};

// ── Get one ────────────────────────────────────────────────────────────────────

const getSessionById = async (id) => {
  const session = await AcademicSession.findByPk(id);
  if (!session) throw new ApiError(404, 'Academic session not found');
  return session;
};

// ── Create ─────────────────────────────────────────────────────────────────────

const createSession = async ({ name, start_date, end_date }) => {
  const duplicate = await AcademicSession.findOne({ where: { name } });
  if (duplicate) throw new ApiError(409, 'A session with this name already exists');

  return AcademicSession.create({ name, start_date, end_date, status: 'upcoming' });
};

// ── Update (name / dates only) ─────────────────────────────────────────────────

const updateSession = async (id, { name, start_date, end_date }) => {
  const session = await getSessionById(id);

  if (session.status === 'completed') {
    throw new ApiError(409, 'Completed sessions cannot be modified');
  }

  if (name !== undefined) {
    const duplicate = await AcademicSession.findOne({
      where: { name, id: { [Op.ne]: id } },
    });
    if (duplicate) throw new ApiError(409, 'A session with this name already exists');
  }

  await session.update({
    ...(name       !== undefined && { name }),
    ...(start_date !== undefined && { start_date }),
    ...(end_date   !== undefined && { end_date }),
  });

  return getSessionById(id);
};

// ── Transition (advance lifecycle one step) ────────────────────────────────────

const NEXT_STATUS = { upcoming: 'active', active: 'closing', closing: 'completed' };

const transitionSession = async (id) => {
  const session = await getSessionById(id);

  const nextStatus = NEXT_STATUS[session.status];
  if (!nextStatus) {
    throw new ApiError(409, 'Completed sessions cannot be transitioned further');
  }

  if (nextStatus === 'active') {
    return sequelize.transaction(async (t) => {
      await AcademicSession.update(
        { status: 'closing' },
        { where: { status: 'active', id: { [Op.ne]: id } }, transaction: t }
      );
      await session.update({ status: 'active' }, { transaction: t });
      return getSessionById(id);
    });
  }

  await session.update({ status: nextStatus });
  return getSessionById(id);
};

// ── Delete ─────────────────────────────────────────────────────────────────────

const deleteSession = async (id) => {
  const session = await getSessionById(id);
  await session.destroy();
};

module.exports = { listSessions, getSessionById, createSession, updateSession, transitionSession, deleteSession };
