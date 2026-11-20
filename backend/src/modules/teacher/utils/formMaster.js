const { TimetablePeriod } = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { listMyTimetable } = require('../services/myTimetable.service');

// A teacher is the FORM MASTER of a class + section when they have Period 1 there.
// Period 1 is the campus's first TEACHING period: assembly (is_assembly, stored as
// period_number 0) never counts. The period grid is the same on every weekday, so
// "Period 1 on any weekday" is simply "has the Period 1 slot".

const firstTeachingPeriodNumber = async (campusId) =>
  TimetablePeriod.min('period_number', { where: { campus_id: campusId, is_assembly: false } });

// The classes (class + section) the signed-in teacher is form master of at a campus.
// Built from their own timetable (same staff lookup and subject rules as "My timetable").
const listMyFormMasterClasses = async (userId, campusId) => {
  const [entries, firstPeriod] = await Promise.all([
    listMyTimetable(userId, campusId),
    firstTeachingPeriodNumber(campusId),
  ]);
  if (firstPeriod == null) return [];

  const classes = new Map();
  for (const e of entries) {
    if (e.isAssembly || e.periodNumber !== firstPeriod || e.sectionId == null) continue;
    const key = `${e.classGroupId}-${e.sectionId}`;
    if (!classes.has(key)) {
      classes.set(key, {
        key,
        classGroupId: e.classGroupId,
        className:    e.className,
        level:        e.level,
        sectionId:    e.sectionId,
        sectionName:  e.sectionName,
      });
    }
  }
  return [...classes.values()];
};

const isMyFormMasterClass = async (userId, campusId, classGroupId, sectionId) => {
  const classes = await listMyFormMasterClasses(userId, campusId);
  return classes.some((c) => c.classGroupId === classGroupId && c.sectionId === sectionId);
};

// Server-side guard: 403 unless the signed-in teacher has Period 1 in that class + section.
const assertFormMaster = async (userId, campusId, classGroupId, sectionId) => {
  if (!(await isMyFormMasterClass(userId, campusId, classGroupId, sectionId))) {
    throw new ApiError(403, 'Only the form master (Period 1 teacher) of this class can view its report');
  }
};

module.exports = { listMyFormMasterClasses, isMyFormMasterClass, assertFormMaster };
