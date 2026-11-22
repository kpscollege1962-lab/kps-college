const { Op } = require('sequelize');
const {
  sequelize, RotaDay, RotaAbsence, RotaEntry, TimetablePeriod, TimetableSlot,
  Staff, StaffPosting, User,
} = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { localToday } = require('../utils/localDate');

// ── Rota: the daily arrangement for absent teachers ──────────────────────────────
// A rota belongs to one campus and one date. It lists the absent teachers and, for each of
// their periods that day, the teacher who takes it (the substitute). While it is a DRAFT only
// the admins see it; once ISSUED it is in force for that date only (see rotaEffects.service).
// The regular timetable is never changed.

// The campus's teachers (same list as the timetable: active, timetable-eligible postings).
const campusTeacherIds = async (campusId, transaction) => {
  const rows = await StaffPosting.findAll({
    where: { campus_id: campusId, is_active: 1, is_timetable_eligible: 1 },
    attributes: ['staff_id'],
    transaction,
  });
  return new Set(rows.map((r) => r.staff_id));
};

const personName = (u) => (u ? [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username : null);

const toDto = (day, date) => {
  if (!day) return { date, status: null, issuedAt: null, issuedBy: null, absentStaffIds: [], entries: [] };
  return {
    id: day.id,
    date: day.rota_date,
    status: day.status,
    issuedAt: day.issued_at,
    issuedBy: personName(day.issuedBy),
    absentStaffIds: (day.absences ?? []).map((a) => a.staff_id),
    entries: (day.entries ?? []).map((e) => ({
      id: e.id,
      periodId: e.period_id,
      classGroupId: e.class_group_id,
      sectionId: e.section_id,
      absentStaffId: e.absent_staff_id,
      substituteStaffId: e.substitute_staff_id,
      forced: Boolean(e.forced),
      forceReason: e.force_reason,
    })),
  };
};

const loadDay = (campusId, date, transaction) =>
  RotaDay.findOne({
    where: { campus_id: campusId, rota_date: date },
    include: [
      { model: RotaAbsence, as: 'absences' },
      { model: RotaEntry, as: 'entries' },
      { model: User, as: 'issuedBy', attributes: ['id', 'first_name', 'last_name', 'username'] },
    ],
    transaction,
  });

// ── Read ───────────────────────────────────────────────────────────────────────
const getRotaDay = async ({ campusId, date }) => toDto(await loadDay(campusId, date), date);

// ── Save (draft or issue) ──────────────────────────────────────────────────────
// Replaces the day's absences and entries with what is sent. Checks:
//   - only today or a future date can be changed (a past rota is a record);
//   - absent teachers and substitutes are this campus's teachers;
//   - each entry is a real slot of the absent teacher in a TEACHING period (never assembly);
//   - a substitute who is busy that period (own class, another rota period that day, or absent)
//     needs `forced` (an admin's deliberate override), which is recorded.
const saveRotaDay = async ({ campusId, date, status, absentStaffIds, entries, userId }) => {
  if (date < localToday()) throw new ApiError(422, 'A past rota cannot be changed');

  return sequelize.transaction(async (transaction) => {
    const teachers = await campusTeacherIds(campusId, transaction);
    const absent = new Set(absentStaffIds);
    for (const id of absent) {
      if (!teachers.has(id)) throw new ApiError(422, 'An absent teacher is not a teacher of this campus');
    }

    const periods = await TimetablePeriod.findAll({ where: { campus_id: campusId }, transaction });
    const periodById = new Map(periods.map((p) => [p.id, p]));
    const periodIds = periods.map((p) => p.id);
    const slots = periodIds.length
      ? await TimetableSlot.findAll({ where: { period_id: { [Op.in]: periodIds } }, transaction })
      : [];
    const slotAt = (e) => slots.find((s) =>
      s.period_id === e.periodId && s.class_group_id === e.classGroupId && s.section_id === e.sectionId);
    const hasOwnClass = (staffId, periodId) => slots.some((s) =>
      s.period_id === periodId && (s.staff_id_1 === staffId || s.staff_id_2 === staffId));

    const seen = new Set();
    const taken = new Map(); // `${periodId}-${substituteId}` -> count in this rota
    for (const e of entries) {
      const key = `${e.periodId}-${e.classGroupId}-${e.sectionId}-${e.absentStaffId}`;
      if (seen.has(key)) throw new ApiError(422, 'The same period is listed twice');
      seen.add(key);

      const period = periodById.get(e.periodId);
      if (!period) throw new ApiError(422, 'A period does not belong to this campus');
      if (period.is_assembly) throw new ApiError(422, 'Assembly is not a teaching period: it has no rota');
      if (!absent.has(e.absentStaffId)) throw new ApiError(422, 'A covered period belongs to a teacher who is not marked absent');
      const slot = slotAt(e);
      if (!slot || (slot.staff_id_1 !== e.absentStaffId && slot.staff_id_2 !== e.absentStaffId)) {
        throw new ApiError(422, 'A covered period is not in the absent teacher\'s timetable');
      }

      if (e.substituteStaffId != null) {
        if (!teachers.has(e.substituteStaffId)) throw new ApiError(422, 'A substitute is not a teacher of this campus');
        if (e.substituteStaffId === e.absentStaffId) throw new ApiError(422, 'A teacher cannot cover their own period');
        const k = `${e.periodId}-${e.substituteStaffId}`;
        taken.set(k, (taken.get(k) ?? 0) + 1);
      }
    }

    // Busy check (after counting, so two rota periods at the same time are caught).
    for (const e of entries) {
      if (e.substituteStaffId == null || e.forced) continue;
      const reasons = [];
      if (absent.has(e.substituteStaffId)) reasons.push('is absent today');
      if (hasOwnClass(e.substituteStaffId, e.periodId)) reasons.push('has their own class in this period');
      if ((taken.get(`${e.periodId}-${e.substituteStaffId}`) ?? 0) > 1) reasons.push('already takes another rota period at this time');
      if (reasons.length) {
        const staff = await Staff.findByPk(e.substituteStaffId, { attributes: ['id', 'full_name', 'gender'], transaction });
        throw new ApiError(409, `${staff?.full_name ?? 'This teacher'} ${reasons.join(' and ')}. Choose another teacher or use Force.`);
      }
    }

    const [day] = await RotaDay.findOrCreate({
      where: { campus_id: campusId, rota_date: date },
      defaults: { status: 'draft', created_by_user_id: userId },
      transaction,
    });
    await day.update({
      status,
      ...(status === 'issued'
        ? { issued_by_user_id: userId, issued_at: new Date() }
        : { issued_by_user_id: null, issued_at: null }),
    }, { transaction });

    await RotaAbsence.destroy({ where: { rota_day_id: day.id }, transaction });
    await RotaEntry.destroy({ where: { rota_day_id: day.id }, transaction });
    if (absent.size) {
      await RotaAbsence.bulkCreate([...absent].map((staffId) => ({ rota_day_id: day.id, staff_id: staffId })), { transaction });
    }
    if (entries.length) {
      await RotaEntry.bulkCreate(entries.map((e) => ({
        rota_day_id: day.id,
        period_id: e.periodId,
        class_group_id: e.classGroupId,
        section_id: e.sectionId,
        absent_staff_id: e.absentStaffId,
        substitute_staff_id: e.substituteStaffId ?? null,
        forced: Boolean(e.forced && e.substituteStaffId != null),
        force_reason: e.forced && e.substituteStaffId != null ? (e.forceReason?.trim() || null) : null,
      })), { transaction });
    }

    return toDto(await loadDay(campusId, date, transaction), date);
  });
};

// ── Delete (cancel the whole day's rota) ───────────────────────────────────────
const deleteRotaDay = async ({ campusId, date }) => {
  if (date < localToday()) throw new ApiError(422, 'A past rota cannot be changed');
  const day = await RotaDay.findOne({ where: { campus_id: campusId, rota_date: date } });
  if (!day) throw new ApiError(404, 'There is no rota for this date');
  await day.destroy(); // absences and entries cascade
};

module.exports = { getRotaDay, saveRotaDay, deleteRotaDay };
