const { Op } = require('sequelize');
const {
  Enrollment, FeeStructure, FeeChallan, FeeChallanItem, FeeHead,
  Student, ClassGroup, Section, FeePayment, sequelize,
} = require('../../../models');
const ApiError = require('../../../utils/ApiError');

// ── Internal helper ────────────────────────────────────────────────────────────
// Clamps due_day to the actual last day of the target month (e.g. due_day 31
// in February becomes the 28th/29th) instead of producing an invalid date.
const buildDueDate = (year, month, dueDay) => {
  const lastDay = new Date(year, month, 0).getDate();
  const day = Math.min(dueDay, lastDay);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const getChallanById = async (challanId, campusId) => {
  const challan = await FeeChallan.findOne({
    where: { id: challanId, campus_id: campusId },
    include: [
      {
        model: Enrollment,
        as: 'enrollment',
        include: [
          { model: Student, as: 'student' },
          { model: ClassGroup, as: 'classGroup' },
          { model: Section, as: 'section' },
        ],
      },
      { model: FeeChallanItem, as: 'items', include: [{ model: FeeHead, as: 'feeHead' }] },
      { model: FeePayment, as: 'payments' },
    ],
  });
  if (!challan) throw new ApiError(404, 'Fee challan not found');
  return challan;
};

// ── List challans, filterable by class/section/status/period/student search ───
const listChallans = async ({ campusId, sessionId, classGroupId, sectionId, status, month, year, search, page = 1, limit = 20 }) => {
  const where = { campus_id: campusId, session_id: sessionId };
  if (status) where.status = status;
  if (month)  where.month  = month;
  if (year)   where.year   = year;

  const enrollmentWhere = {};
  if (classGroupId) enrollmentWhere.class_group_id = classGroupId;
  if (sectionId)     enrollmentWhere.section_id     = sectionId;

  const studentWhere = {};
  if (search) {
    studentWhere[Op.or] = [
      { full_name: { [Op.like]: `%${search}%` } },
      { gr_no: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await FeeChallan.findAndCountAll({
    where,
    include: [
      {
        model: Enrollment,
        as: 'enrollment',
        where: enrollmentWhere,
        required: true,
        include: [
          { model: Student, as: 'student', where: studentWhere, required: !!search },
          { model: ClassGroup, as: 'classGroup' },
          { model: Section, as: 'section' },
        ],
      },
    ],
    distinct: true,
    order: [['due_date', 'ASC']],
    limit,
    offset,
  });
  return { data: rows, total: count, page, limit };
};

// ── Generate monthly challans for all active enrollments in a campus+session ──
// (optionally scoped to one class). Uses the class-level fee_structure as the
// default, with any section_id-specific row overriding per fee head. Safe to
// re-run — enrollments that already have a challan for this period are skipped.
const generateChallans = async ({ campusId, sessionId, classGroupId, month, year }) => {
  const enrollmentWhere = { campus_id: campusId, session_id: sessionId, status: 'active' };
  if (classGroupId) enrollmentWhere.class_group_id = classGroupId;

  const enrollments = await Enrollment.findAll({ where: enrollmentWhere });
  if (!enrollments.length) {
    throw new ApiError(404, 'No active enrollments found for this campus/session' + (classGroupId ? '/class' : ''));
  }

  const structures = await FeeStructure.findAll({
    where: { campus_id: campusId, session_id: sessionId },
    include: [{ model: FeeHead, as: 'feeHead', where: { is_active: true } }],
  });

  let created = 0;
  let skippedExisting = 0;
  let skippedNoStructure = 0;

  const transaction = await sequelize.transaction();
  try {
    for (const enrollment of enrollments) {
      // Class-level defaults (section_id null), then section-level overrides per fee head
      const classLevel   = structures.filter((s) => s.class_group_id === enrollment.class_group_id && s.section_id === null);
      const sectionLevel = structures.filter((s) => s.class_group_id === enrollment.class_group_id && s.section_id === enrollment.section_id);

      const byFeeHead = new Map();
      for (const s of classLevel)   byFeeHead.set(s.fee_head_id, s);
      for (const s of sectionLevel) byFeeHead.set(s.fee_head_id, s); // override

      if (byFeeHead.size === 0) { skippedNoStructure++; continue; }

      const existing = await FeeChallan.findOne({
        where: { enrollment_id: enrollment.id, session_id: sessionId, month, year },
        transaction,
      });
      if (existing) { skippedExisting++; continue; }

      const applicable  = [...byFeeHead.values()];
      const totalAmount = applicable.reduce((sum, s) => sum + parseFloat(s.amount), 0);
      const dueDay       = Math.min(...applicable.map((s) => s.due_day));
      const dueDate       = buildDueDate(year, month, dueDay);

      const challan = await FeeChallan.create({
        enrollment_id: enrollment.id,
        campus_id: campusId,
        session_id: sessionId,
        month,
        year,
        due_date: dueDate,
        total_amount: totalAmount,
        paid_amount: 0,
        status: 'unpaid',
      }, { transaction });

      await FeeChallanItem.bulkCreate(
        applicable.map((s) => ({ challan_id: challan.id, fee_head_id: s.fee_head_id, amount: s.amount })),
        { transaction }
      );

      created++;
    }
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  return { created, skippedExisting, skippedNoStructure, totalEnrollments: enrollments.length };
};

// ── Cancel a challan (soft — never hard-deletes financial records) ────────────
const cancelChallan = async (challanId, campusId) => {
  const challan = await getChallanById(challanId, campusId);
  if (challan.status === 'paid') throw new ApiError(400, 'Cannot cancel a fully paid challan');
  if (parseFloat(challan.paid_amount) > 0) {
    throw new ApiError(400, 'Cannot cancel a challan with recorded payments — void the payments first');
  }
  await challan.update({ status: 'cancelled' });
  return challan;
};

module.exports = { listChallans, getChallanById, generateChallans, cancelChallan };