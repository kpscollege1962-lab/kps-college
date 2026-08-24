const { Op } = require('sequelize');
const { StaffPosting, Staff } = require('../../../models');
const ApiError = require('../../../utils/ApiError');


// ── Create posting ─────────────────────────────────────────────────────────────
// Designed to be called from within an existing transaction.

const createStaffPosting = async (staffId, campusId, data, transaction = null) => {
  const { employee_no, joining_date, isTimetableEligible, allowConcurrentPeriods } = data;

  // Verify the staff identity exists
  const exists = await Staff.findByPk(staffId, { transaction });
  if (!exists) {
    throw new ApiError(404, 'Staff member not found');
  }

  const existing = await StaffPosting.findOne({
    where: { staff_id: staffId, campus_id: campusId },
    transaction,
  });
  if (existing) {
    throw new ApiError(409, 'This staff member already has a posting at this campus');
  }

  if (employee_no) {
    const empNoDuplicate = await StaffPosting.findOne({
      where: { campus_id: campusId, employee_no },
      transaction,
    });
    if (empNoDuplicate) {
      throw new ApiError(409, 'A staff member with this employee number already exists at this campus');
    }
  }

  await StaffPosting.create({
    staff_id:              staffId,
    campus_id:             campusId,
    employee_no:           employee_no || null,
    joining_date:          joining_date || null,
    is_active:                1,
    is_timetable_eligible:    isTimetableEligible ? 1 : 0,
    allow_concurrent_periods: allowConcurrentPeriods ? 1 : 0,
  }, { transaction });
};

// ── Update posting ─────────────────────────────────────────────────────────────

const updateStaffPosting = async (campusId, staffId, data) => {
  const posting = await StaffPosting.findOne({
    where: { staff_id: staffId, campus_id: campusId },
  });
  if (!posting) throw new ApiError(404, 'Staff posting not found at this campus');

  if (data.employee_no !== undefined && data.employee_no !== null && data.employee_no !== '') {
    const empNoDuplicate = await StaffPosting.findOne({
      where: {
        campus_id: campusId,
        employee_no: data.employee_no,
        staff_id: { [Op.ne]: staffId },
      },
    });
    if (empNoDuplicate) {
      throw new ApiError(409, 'A staff member with this employee number already exists at this campus');
    }
  }

  await posting.update({
    ...(data.employee_no !== undefined && { employee_no: data.employee_no || null }),
    ...(data.joining_date !== undefined && { joining_date: data.joining_date || null }),
    ...(data.is_active !== undefined && { is_active: parseInt(data.is_active) }),
    ...(data.isTimetableEligible !== undefined && {
      is_timetable_eligible: data.isTimetableEligible ? 1 : 0,
    }),
    ...(data.allowConcurrentPeriods !== undefined && {
      allow_concurrent_periods: data.allowConcurrentPeriods ? 1 : 0,
    }),
  });

  return posting.reload();
};

module.exports = { createStaffPosting, updateStaffPosting };
