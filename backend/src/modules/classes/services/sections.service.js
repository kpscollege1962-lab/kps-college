const { Op } = require('sequelize');
const { Section } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

// ── Internal helper ────────────────────────────────────────────────────────────
const getSectionById = async (sectionId) => {
  const section = await Section.findByPk(sectionId);
  if (!section) throw new ApiError(404, 'Section not found');
  return section;
};

// ── List named sections for a class ───────────────────────────────────────────
// NULL-named default section is always excluded from all listings.
const listSections = async (classGroupId) => {
  return Section.findAll({
    where: {
      class_group_id: classGroupId,
      name: { [Op.ne]: null },
    },
    order: [['name', 'ASC']],
  });
};

// ── Create the null default section (called only by createClass) ───────────────
// Enforces the invariant: exactly one null section per class.
// MySQL unique indexes do not constrain NULLs, so this check is done here.
const createDefaultSection = async (classGroupId, transaction) => {
  const existing = await Section.findOne({
    where: { class_group_id: classGroupId, name: null },
    transaction,
  });
  if (existing) {
    throw new ApiError(409, 'Default section already exists for this class');
  }
  return Section.create({ class_group_id: classGroupId, name: null }, { transaction });
};

// ── Add a named section to a class ────────────────────────────────────────────
// Business rules:
//   - If the only existing section is the null default, rename it (first named section).
//   - Otherwise insert a new row.
//   - Duplicate name within the same class is rejected.
const addSection = async (classGroupId, name) => {
  const trimmedName = name.trim().toUpperCase();

  // Check for duplicate named section within this class
  const duplicate = await Section.findOne({
    where: { class_group_id: classGroupId, name: trimmedName },
  });
  if (duplicate) {
    throw new ApiError(409, `A section named "${trimmedName}" already exists in this class`);
  }

  // Is this class currently unsectioned (only has the null default)?
  const nullSection = await Section.findOne({
    where: { class_group_id: classGroupId, name: null },
  });
  const namedCount = await Section.count({
    where: { class_group_id: classGroupId, name: { [Op.ne]: null } },
  });

  if (nullSection && namedCount === 0) {
    // First named section — rename the null default row
    await nullSection.update({ name: trimmedName });
    return nullSection.reload();
  }

  // Subsequent named section — insert a new row
  return Section.create({ class_group_id: classGroupId, name: trimmedName });
};

// ── Rename an existing named section ──────────────────────────────────────────
const updateSection = async (sectionId, name) => {
  const section = await getSectionById(sectionId);
  if (section.name === null) {
    throw new ApiError(400, 'Cannot rename the default section directly. Use addSection to start sectioning this class.');
  }
  const trimmedName = name.trim().toUpperCase();
  const duplicate = await Section.findOne({
    where: {
      class_group_id: section.class_group_id,
      name: trimmedName,
      id: { [Op.ne]: sectionId },
    },
  });
  if (duplicate) {
    throw new ApiError(409, `A section named "${trimmedName}" already exists in this class`);
  }
  await section.update({ name: trimmedName });
  return section.reload();
};

// ── Delete a named section ─────────────────────────────────────────────────────
// Rules:
//   - Cannot delete the null default section.
//   - If this is the last named section, revert to unsectioned by setting name = NULL
//     (rather than deleting the row — the class must always have exactly one section).
//   - If other named sections remain, delete the row directly.
//   - Downstream FK RESTRICT (enrollments → sections) prevents deletion of sections
//     with enrolled students — caught by the global Sequelize FK error handler.
const deleteSection = async (sectionId) => {
  const section = await getSectionById(sectionId);
  if (section.name === null) {
    throw new ApiError(400, 'Cannot delete the default section');
  }
  const namedCount = await Section.count({
    where: {
      class_group_id: section.class_group_id,
      name: { [Op.ne]: null },
    },
  });
  if (namedCount === 1) {
    // Last named section — revert class to unsectioned state
    await section.update({ name: null });
    return;
  }
  // Other named sections remain — safe to delete this row
  await section.destroy();
};

module.exports = {
  listSections,
  getSectionById,
  createDefaultSection,
  addSection,
  updateSection,
  deleteSection,
};
