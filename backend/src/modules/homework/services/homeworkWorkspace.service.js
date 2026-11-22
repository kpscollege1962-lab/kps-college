const { Op } = require('sequelize');
const {
  sequelize, Homework, TimetableSlot, ClassGroup, Section, Subject, Staff,
} = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { getMyStaffRecord } = require('../../teacher/utils/myStaff');
const { subjectsForTeacher } = require('../../teacher/utils/slotSubjects');
const { issuedCoverFor, issuedCoveredFrom } = require('../../rota/services/rotaEffects.service');

const TYPE_LABEL = { classwork: 'Classwork', homework: 'Homework' };

const day = (value) => String(value).slice(0, 10);
const nameOf = (info) => [info.className, info.sectionName, info.subjectName].filter(Boolean).join(' ');

const listMyAssignments = async ({
  campusId, userId, sessionId, assignedDate, dueDate, assignedFrom, assignedTo,
  classGroupId, sectionId, subjectId,
}) => {
  const staff = await getMyStaffRecord(userId);

  const where = { campus_id: campusId, session_id: sessionId, staff_id: staff.id };
  // An exact assigned date wins; otherwise [assignedFrom, assignedTo] is an inclusive range
  // on the ASSIGNED date, and either end may be left open.
  if (assignedDate) {
    where.assigned_date = assignedDate;
  } else if (assignedFrom || assignedTo) {
    where.assigned_date = {};
    if (assignedFrom) where.assigned_date[Op.gte] = day(assignedFrom);
    if (assignedTo)   where.assigned_date[Op.lte] = day(assignedTo);
  }
  if (dueDate)      where.due_date = dueDate;
  if (classGroupId) where.class_group_id = classGroupId;
  if (sectionId)    where.section_id = sectionId;
  if (subjectId)    where.subject_id = subjectId;

  return Homework.findAll({
    where,
    include: [
      { model: Subject,    as: 'subject',    attributes: ['id', 'name'] },
      { model: ClassGroup, as: 'classGroup', attributes: ['id', 'name', 'level'] },
      { model: Section,    as: 'section',    attributes: ['id', 'name'] },
    ],
    order: [['assigned_date', 'DESC'], ['due_date', 'DESC'], ['id', 'ASC']],
    limit: 500,
  });
};


// Every teacher's classwork and homework for one class + section: the form master's proforma.
// The caller must already have checked that the user may see this class.
const listClassReport = async ({ campusId, sessionId, classGroupId, sectionId }) =>
  Homework.findAll({
    where: {
      campus_id: campusId, session_id: sessionId,
      class_group_id: classGroupId, section_id: sectionId,
    },
    include: [
      { model: Subject,    as: 'subject',    attributes: ['id', 'name'] },
      { model: Staff,      as: 'postedBy',   attributes: ['id', 'full_name'] },
      { model: ClassGroup, as: 'classGroup', attributes: ['id', 'name', 'level'] },
      { model: Section,    as: 'section',    attributes: ['id', 'name'] },
    ],
    order: [['assigned_date', 'DESC'], ['due_date', 'DESC'], ['id', 'ASC']],
    limit: 500,
  });


const createHomeworkBatch = async ({
  campusId, userId, sessionId, assignedDate, dueDate, classwork, homework, targets,
}) => {
  const texts = { classwork: (classwork ?? '').trim(), homework: (homework ?? '').trim() };
  const types = Object.keys(texts).filter((type) => texts[type]);
  if (!types.length) throw new ApiError(422, 'Enter classwork, homework or both');
  if (day(dueDate) < day(assignedDate)) {
    throw new ApiError(422, 'Due date cannot be before the assigned date');
  }
  if (texts.classwork && day(dueDate) !== day(assignedDate)) {
    throw new ApiError(422, 'Classwork is for the same day: its due date must be the assigned date');
  }

  const staff = await getMyStaffRecord(userId);

  const unique = new Map(
    targets.map((t) => [`${t.classGroupId}-${t.sectionId}-${t.subjectId}`, t])
  );

  const classIds = [...new Set([...unique.values()].map((t) => t.classGroupId))];
  const slots = await TimetableSlot.findAll({
    where: {
      class_group_id: { [Op.in]: classIds },
      [Op.or]: [{ staff_id_1: staff.id }, { staff_id_2: staff.id }],
    },
    include: [
      {
        model: ClassGroup, as: 'classGroup',
        required: true,
        where: { campus_id: campusId, session_id: sessionId },
        attributes: ['id', 'name'],
      },
      { model: Section, as: 'section', attributes: ['id', 'name'] },
      { model: Subject, as: 'subject1', attributes: ['id', 'name'] },
      { model: Subject, as: 'subject2', attributes: ['id', 'name'] },
    ],
  });

  // What this teacher may post for on the assigned date: their timetable, adjusted by that
  // day's ISSUED rota. A class + subject they are absent for (every period of it covered) is
  // taken away for the day; a class + subject they cover for an absent teacher is added.
  const taught = new Map();
  const periodsOf = new Map(); // key -> how many of their periods teach it
  for (const slot of slots) {
    for (const subject of subjectsForTeacher(slot, staff.id)) {
      const key = `${slot.class_group_id}-${slot.section_id}-${subject.id}`;
      taught.set(key, {
        className:   slot.classGroup.name,
        sectionName: slot.section?.name ?? null,
        subjectName: subject.name,
      });
      periodsOf.set(key, (periodsOf.get(key) ?? 0) + 1);
    }
  }

  const [covered, cover] = await Promise.all([
    issuedCoveredFrom({ staffId: staff.id, date: day(assignedDate), campusId }),
    issuedCoverFor({ staffId: staff.id, date: day(assignedDate), campusId }),
  ]);
  const coveredCount = new Map();
  for (const { entry, subjects } of covered) {
    for (const subject of subjects) {
      const key = `${entry.class_group_id}-${entry.section_id}-${subject.id}`;
      coveredCount.set(key, (coveredCount.get(key) ?? 0) + 1);
    }
  }
  const awayFor = new Set([...coveredCount].filter(([key, n]) => n >= (periodsOf.get(key) ?? 0)).map(([key]) => key));
  for (const key of awayFor) taught.delete(key);
  for (const { entry, subjects } of cover) {
    if (entry.classGroup?.session_id !== sessionId) continue;
    for (const subject of subjects) {
      taught.set(`${entry.class_group_id}-${entry.section_id}-${subject.id}`, {
        className:   entry.classGroup.name,
        sectionName: entry.section?.name ?? null,
        subjectName: subject.name,
      });
    }
  }

  for (const key of unique.keys()) {
    if (awayFor.has(key) && !taught.has(key)) {
      throw new ApiError(403, 'You are marked absent on the rota for that day: the teacher covering this class posts its work');
    }
    if (!taught.has(key)) {
      throw new ApiError(403, 'You can only post assignments for the classes and subjects you teach');
    }
  }

  const existing = await Homework.findAll({
    where: {
      campus_id: campusId,
      session_id: sessionId,
      staff_id: staff.id,
      assigned_date: assignedDate,
      type: { [Op.in]: types },
      [Op.or]: [...unique.values()].map((t) => ({
        class_group_id: t.classGroupId, section_id: t.sectionId, subject_id: t.subjectId,
      })),
    },
  });
  if (existing.length) {
    const first = existing[0];
    const info = taught.get(`${first.class_group_id}-${first.section_id}-${first.subject_id}`);
    throw new ApiError(
      409,
      `${nameOf(info)} already has ${TYPE_LABEL[first.type].toLowerCase()} for this date. Edit it instead.`
    );
  }

  const transaction = await sequelize.transaction();
  try {
    let created = 0;
    for (const [key, target] of unique) {
      const info = taught.get(key);
      for (const type of types) {
        await Homework.create({
          campus_id:      campusId,
          session_id:     sessionId,
          class_group_id: target.classGroupId,
          section_id:     target.sectionId,
          subject_id:     target.subjectId,
          staff_id:       staff.id,
          type,
          title:          `${info.subjectName} ${TYPE_LABEL[type]}`,
          description:    texts[type],
          assigned_date:  assignedDate,
          due_date:       dueDate,
        }, { transaction });
        created += 1;
      }
    }
    await transaction.commit();
    return { created };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

module.exports = { listMyAssignments, listClassReport, createHomeworkBatch };