const { Op } = require('sequelize');
const { StudentRegisterEntry, Student } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

// ── List ───────────────────────────────────────────────────────────────────────

const listRegisterEntries = async (studentId) => {
  return StudentRegisterEntry.findAll({
    where: { student_id: studentId },
    order: [['register_level', 'ASC']],
  });
};

// ── Upsert ─────────────────────────────────────────────────────────────────────

const upsertRegisterEntry = async (studentId, level, data, transaction = null) => {
  const duplicate = await StudentRegisterEntry.findOne({
    where: {
      register_level: level,
      admission_no:   data.admission_no,
      student_id:     { [Op.ne]: studentId },
    },
    include: [{
      model: Student,
      as: 'student',
      attributes: ['full_name'],
    }],
    transaction,
  });
  if (duplicate) {
    const label = level.toUpperCase();
    const studentName = duplicate?.student?.full_name
    throw new ApiError(409, `This admission number is already assigned to ${studentName || 'Another Student'} in the ${label} register`);
  }

  await StudentRegisterEntry.upsert({
    student_id:         studentId,
    register_level:     level,
    admission_no:       data.admission_no,
    entry_date:         data.entry_date         || null,
    notes:              data.notes              || null,
    class_of_admission: data.class_of_admission || null,
  }, { transaction });

  return StudentRegisterEntry.findOne({
    where: { student_id: studentId, register_level: level },
  });
};

// ── Delete ─────────────────────────────────────────────────────────────────────

const deleteRegisterEntry = async (studentId, level) => {
  const entry = await StudentRegisterEntry.findOne({
    where: { student_id: studentId, register_level: level },
  });
  if (!entry) throw new ApiError(404, 'Register entry not found');
  await entry.destroy();
};

module.exports = { listRegisterEntries, upsertRegisterEntry, deleteRegisterEntry };
