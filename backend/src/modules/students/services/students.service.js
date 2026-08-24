const { Op } = require('sequelize');
const { Student, StudentContact, StudentRegisterEntry, ClassGroup, sequelize } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { createEnrollment } = require('../../enrollments/services/enrollments.service');
const { upsertRegisterEntry } = require('./registerEntries.service');

// ── List ───────────────────────────────────────────────────────────────────────

const listStudents = async ({ search, registerLevel, page = 1, limit = 20 }) => {
  const where = {};

  if (search) {
    where[Op.or] = [
      { full_name: { [Op.like]: `%${search}%` } },
      { gr_no: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Student.findAndCountAll({
    where,
    include: [
      {
        model: StudentContact,
        as: 'contacts',
        required: false,
      },
      ...(registerLevel ? [{
        model: StudentRegisterEntry,
        as: 'registerEntries',
        attributes: [],
        where: { register_level: registerLevel },
        required: true,
      }] : []),
    ],
    order: [
      ['admission_date', 'DESC'],
      ['id', 'ASC'],
    ],
    distinct: true,
    limit,
    offset,
  });

  return { data: rows, total: count, page, limit };
};

// ── Get one ────────────────────────────────────────────────────────────────────

const getStudentById = async (studentId) => {
  const student = await Student.findByPk(studentId, {
    include: [
      {
        model: StudentContact,
        as: 'contacts',
        separate: false,
      },
    ],
    order: [
      [{ model: StudentContact, as: 'contacts' }, 'is_primary', 'DESC'],
      [{ model: StudentContact, as: 'contacts' }, 'id', 'ASC'],
    ],
  });
  if (!student) throw new ApiError(404, 'Student not found');
  return student;
};

// ── Create ─────────────────────────────────────────────────────────────────────

const createStudent = async (data) => {
  const {
    gr_no, full_name, gender, date_of_birth,
    b_form_no, religion, nationality, blood_group,
    address, admission_date,
    father_name, father_cnic, father_occupation, domicile_district,
    contacts, classGroupId, sectionId, admission_no,
    campusId, sessionId,
  } = data;

  if (!campusId) throw new ApiError(422, 'Campus is required');
  if (!sessionId) throw new ApiError(422, 'Session is required');

  const student = await sequelize.transaction(async (t) => {
    const admissionDuplicate = await Student.findOne({ where: { gr_no }, transaction: t });
    if (admissionDuplicate) {
      throw new ApiError(409, 'A student with this GR number already exists');
    }

    if (b_form_no) {
      const bFormDuplicate = await Student.findOne({ where: { b_form_no }, transaction: t });
      if (bFormDuplicate) {
        throw new ApiError(409, 'A student with this B-Form number already exists');
      }
    }

    const newStudent = await Student.create({
      gr_no,
      full_name,
      gender: gender || null,
      date_of_birth: date_of_birth || null,
      b_form_no: b_form_no || null,
      religion: religion || null,
      nationality: nationality || null,
      blood_group: blood_group || null,
      address: address || null,
      admission_date: admission_date || null,
      father_name,
      father_cnic: father_cnic || null,
      father_occupation: father_occupation || null,
      domicile_district: domicile_district || null,
    }, { transaction: t });

    if (contacts && contacts.length > 0) {
      await StudentContact.bulkCreate(
        contacts.map((c) => ({
          student_id: newStudent.id,
          name: c.name || null,
          label: c.label,
          phone: c.phone,
          is_primary: c.is_primary ?? 0,
        })),
        { transaction: t }
      );
    }

    await createEnrollment(
      {
        campusId: parseInt(campusId),
        sessionId: parseInt(sessionId),
        studentId: newStudent.id,
        classGroupId: parseInt(classGroupId),
        ...(sectionId !== undefined && sectionId !== null ? { sectionId: parseInt(sectionId) } : {}),
      },
      t
    );

    if (admission_no) {
      const classGroup = await ClassGroup.findByPk(parseInt(classGroupId), {
        attributes: ['academic_level'],
        transaction: t,
      });
      if (!classGroup) throw new ApiError(404, 'Class not found');
      await upsertRegisterEntry(newStudent.id, classGroup.academic_level, { admission_no }, t);
    }

    return newStudent;
  });

  return getStudentById(student.id);
};

// ── Update ─────────────────────────────────────────────────────────────────────

const updateStudent = async (studentId, data) => {
  await sequelize.transaction(async (t) => {
    const student = await Student.findByPk(studentId, { transaction: t });
    if (!student) throw new ApiError(404, 'Student not found');

    if (data.gr_no !== undefined) {
      const grNoDuplicate = await Student.findOne({
        where: { gr_no: data.gr_no, id: { [Op.ne]: studentId } },
        transaction: t,
      });
      if (grNoDuplicate) {
        throw new ApiError(409, 'A student with this GR number already exists');
      }
    }

    if (data.b_form_no !== undefined && data.b_form_no !== null && data.b_form_no !== '') {
      const bFormDuplicate = await Student.findOne({
        where: { b_form_no: data.b_form_no, id: { [Op.ne]: studentId } },
        transaction: t,
      });
      if (bFormDuplicate) {
        throw new ApiError(409, 'A student with this B-Form number already exists');
      }
    }

    await student.update({
      ...(data.gr_no !== undefined && { gr_no: data.gr_no }),
      ...(data.full_name !== undefined && { full_name: data.full_name }),
      ...(data.gender !== undefined && { gender: data.gender }),
      ...(data.date_of_birth !== undefined && { date_of_birth: data.date_of_birth }),
      ...(data.b_form_no !== undefined && { b_form_no: data.b_form_no }),
      ...(data.religion !== undefined && { religion: data.religion }),
      ...(data.nationality !== undefined && { nationality: data.nationality }),
      ...(data.blood_group !== undefined && { blood_group: data.blood_group }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.admission_date !== undefined && { admission_date: data.admission_date }),
      ...(data.father_name !== undefined && { father_name: data.father_name }),
      ...(data.father_cnic !== undefined && { father_cnic: data.father_cnic }),
      ...(data.father_occupation !== undefined && { father_occupation: data.father_occupation }),
      ...(data.domicile_district !== undefined && { domicile_district: data.domicile_district }),
    }, { transaction: t });

    if (data.contacts !== undefined) {
      await StudentContact.destroy({ where: { student_id: studentId }, transaction: t });
      if (data.contacts.length > 0) {
        await StudentContact.bulkCreate(
          data.contacts.map((c) => ({
            student_id: studentId,
            name: c.name || null,
            label: c.label,
            phone: c.phone,
            is_primary: c.is_primary ?? 0,
          })),
          { transaction: t }
        );
      }
    }
  });

  return getStudentById(studentId);
};

module.exports = { listStudents, getStudentById, createStudent, updateStudent };
