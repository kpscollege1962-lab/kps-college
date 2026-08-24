const { Op, literal } = require('sequelize');
const { sequelize, Staff, StaffPhone, StaffQualification, StaffPosting } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { createStaffPosting } = require('./staffPosting.service');

// ── Shared include for full staff detail ───────────────────────────────────────

const buildStaffDetailInclude = (campusId) => [
  {
    model: StaffPhone,
    as:    'phones',
  },
  {
    model: StaffQualification,
    as:    'qualifications',
  },
  {
    model:    StaffPosting,
    as:       'postings',
    where:    { campus_id: campusId },
    required: true,
  },
];

// ── Primary phone helpers ──────────────────────────────────────────────────────

const resolvePrimaryFlags = (phones) => {
  const hasExplicit = phones.some(p => p.is_primary);
  return phones.map((p, idx) => ({
    ...p,
    is_primary: hasExplicit ? (p.is_primary ? 1 : 0) : (idx === 0 ? 1 : 0),
  }));
};

// ── List ───────────────────────────────────────────────────────────────────────

const listStaff = async ({ campusId, search, isActive, page = 1, limit = 20 }) => {
  const staffWhere = {};

  if (search) {
    staffWhere[Op.or] = [
      { full_name: { [Op.like]: `%${search}%` } },
      { cnic:      { [Op.like]: `%${search}%` } },
      literal(`EXISTS (
        SELECT 1 FROM \`staff_postings\`
        WHERE \`staff_postings\`.\`staff_id\` = \`Staff\`.\`id\`
          AND \`staff_postings\`.\`campus_id\` = ${parseInt(campusId)}
          AND \`staff_postings\`.\`employee_no\` LIKE ${sequelize.escape('%' + search + '%')}
      )`),
    ];
  }

  const postingWhere = { campus_id: campusId };
  if (isActive !== undefined) {
    postingWhere.is_active = parseInt(isActive);
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Staff.findAndCountAll({
    where: staffWhere,
    include: [
      {
        model:    StaffPosting,
        as:       'postings',
        where:    postingWhere,
        required: true,
      },
      {
        model:    StaffPhone,
        as:       'phones',
        where:    { is_primary: 1 },
        required: false,
      },
    ],
    order:    [['full_name', 'ASC']],
    distinct: true,
    limit,
    offset,
  });

  return { data: rows, total: count, page, limit };
};

// ── Get one ────────────────────────────────────────────────────────────────────

const getStaffById = async (campusId, staffId) => {
  const staff = await Staff.findOne({
    where:   { id: staffId },
    include: buildStaffDetailInclude(campusId),
  });
  if (!staff) throw new ApiError(404, 'Staff member not found at this campus');
  return staff;
};

// ── Create ─────────────────────────────────────────────────────────────────────

const createStaff = async (campusId, data) => {
  const {
    cnic, gender, full_name, name_initials, marital_status,
    address, email, date_of_birth,
    employee_no, joining_date, isTimetableEligible, allowConcurrentPeriods,
    phones         = [],
    qualifications = [],
  } = data;

  const staffId = await sequelize.transaction(async (t) => {
    // Hard block: CNIC must be unique school-wide.
    // An already-registered staff member being added to a new campus
    // goes through a separate endpoint, not this one.
    const cnicDuplicate = await Staff.findOne({ where: { cnic }, transaction: t });
    if (cnicDuplicate) {
      throw new ApiError(409, 'A staff member with this CNIC is already registered in the system');
    }

    if (name_initials) {
      const initialsDuplicate = await Staff.findOne({
        where: { name_initials },
        transaction: t,
      });
      if (initialsDuplicate) {
        throw new ApiError(409, 'A staff member with these initials is already registered in the system');
      }
    }

    const newStaff = await Staff.create({
      cnic,
      gender,
      full_name,
      name_initials:  name_initials  || null,
      marital_status: marital_status || null,
      address:        address        || null,
      email:          email          || null,
      date_of_birth:  date_of_birth  || null,
    }, { transaction: t });

    if (phones.length > 0) {
      await StaffPhone.bulkCreate(
        resolvePrimaryFlags(phones).map(p => ({
          staff_id:   newStaff.id,
          label:      p.label || null,
          phone:      p.phone,
          is_primary: p.is_primary,
        })),
        { transaction: t }
      );
    }

    if (qualifications.length > 0) {
      await StaffQualification.bulkCreate(
        qualifications.map(q => ({
          staff_id:        newStaff.id,
          type:            q.type,
          title:           q.title,
          completion_date: q.completion_date || null,
        })),
        { transaction: t }
      );
    }

    await createStaffPosting(
      newStaff.id,
      campusId,
      { employee_no, joining_date, isTimetableEligible, allowConcurrentPeriods },
      t
    );

    return newStaff.id;
  });

  return getStaffById(campusId, staffId);
};

// ── Update identity ────────────────────────────────────────────────────────────

const updateStaff = async (campusId, staffId, data) => {
  // Ownership guard: verify this staff member has a posting at this campus
  await getStaffById(campusId, staffId);

  if (data.cnic !== undefined) {
    const cnicDuplicate = await Staff.findOne({
      where: { cnic: data.cnic, id: { [Op.ne]: staffId } },
    });
    if (cnicDuplicate) throw new ApiError(409, 'A staff member with this CNIC already exists');
  }

  if (data.name_initials !== undefined && data.name_initials !== null) {
    const initialsDuplicate = await Staff.findOne({
      where: { name_initials: data.name_initials, id: { [Op.ne]: staffId } },
    });
    if (initialsDuplicate) {
      throw new ApiError(409, 'A staff member with these initials already exists');
    }
  }

  if (data.phones !== undefined && data.phones.filter(p => p.is_primary).length > 1) {
    throw new ApiError(422, 'Only one phone number can be marked as primary');
  }

  await sequelize.transaction(async (t) => {
    const staff = await Staff.findByPk(staffId, { transaction: t });

    await staff.update({
      ...(data.cnic           !== undefined && { cnic:           data.cnic           }),
      ...(data.gender         !== undefined && { gender:         data.gender         }),
      ...(data.full_name      !== undefined && { full_name:      data.full_name      }),
      ...(data.name_initials  !== undefined && { name_initials:  data.name_initials  }),
      ...(data.marital_status !== undefined && { marital_status: data.marital_status }),
      ...(data.address        !== undefined && { address:        data.address        }),
      ...(data.email          !== undefined && { email:          data.email          }),
      ...(data.date_of_birth  !== undefined && { date_of_birth:  data.date_of_birth  }),
    }, { transaction: t });

    if (data.phones !== undefined) {
      await StaffPhone.destroy({ where: { staff_id: staffId }, transaction: t });
      if (data.phones.length > 0) {
        await StaffPhone.bulkCreate(
          resolvePrimaryFlags(data.phones).map(p => ({
            staff_id:   staffId,
            label:      p.label || null,
            phone:      p.phone,
            is_primary: p.is_primary,
          })),
          { transaction: t }
        );
      }
    }

    if (data.qualifications !== undefined) {
      await StaffQualification.destroy({ where: { staff_id: staffId }, transaction: t });
      if (data.qualifications.length > 0) {
        await StaffQualification.bulkCreate(
          data.qualifications.map(q => ({
            staff_id:        staffId,
            type:            q.type,
            title:           q.title,
            completion_date: q.completion_date || null,
          })),
          { transaction: t }
        );
      }
    }
  });

  return getStaffById(campusId, staffId);
};

// ── Search eligible (registered staff not yet posted at this campus, for adding) ──

const searchEligibleStaff = async (campusId, search) => {
  // Find staff_ids already posted at this campus
  const existingPostings = await StaffPosting.findAll({
    where:      { campus_id: campusId },
    attributes: ['staff_id'],
  });
  const excludeIds = existingPostings.map(p => p.staff_id);

  const where = {};

  if (excludeIds.length > 0) {
    where.id = { [Op.notIn]: excludeIds };
  }

  if (search) {
    where[Op.or] = [
      { full_name: { [Op.like]: `%${search}%` } },
      { cnic:      { [Op.like]: `%${search}%` } },
    ];
  }

  const results = await Staff.findAll({
    where,
    order: [['full_name', 'ASC']],
    limit: 15,
  });

  return results;
};

module.exports = { listStaff, getStaffById, createStaff, updateStaff, searchEligibleStaff };
