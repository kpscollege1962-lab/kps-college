const { TimetablePeriod, TimetablePeriodTiming } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

// ── Shared helper (exported — used by slot.service) ───────────────────────────

const findPeriodOrFail = async ({ periodId, campusId }) => {
  const period = await TimetablePeriod.findOne({ where: { id: periodId, campus_id: campusId } });
  if (!period) throw new ApiError(404, 'Period not found');
  return period;
};

// ── Create period ──────────────────────────────────────────────────────────────

const createPeriod = async ({ campusId, periodNumber }) => {
  const existing = await TimetablePeriod.findOne({ where: { campus_id: campusId, period_number: periodNumber } });
  if (existing) throw new ApiError(409, 'Period number already exists for this campus');

  const period = await TimetablePeriod.create({ campus_id: campusId, period_number: periodNumber });

  await TimetablePeriodTiming.bulkCreate([
    { period_id: period.id, config: 'full_day', start_time: null, end_time: null },
    { period_id: period.id, config: 'half_day', start_time: null, end_time: null },
  ]);

  return TimetablePeriod.findByPk(period.id, {
    include: [{ model: TimetablePeriodTiming, as: 'timings' }],
  });
};

const toSeconds = (t) => {
  const [h, m, s = 0] = t.split(':').map(Number);
  return h * 3600 + m * 60 + s;
};

// ── Batch update timings (chain calculation result) ───────────────────────────
const batchUpdateTimings = async ({ campusId, timings }) => {
  const { sequelize } = require('../../../models');
  await sequelize.transaction(async (t) => {
    for (const { periodId, config, startTime, endTime } of timings) {
      await findPeriodOrFail({ periodId, campusId });
      const timing = await TimetablePeriodTiming.findOne({
        where: { period_id: periodId, config },
        transaction: t,
      });
      if (!timing) throw new ApiError(404, `Timing config not found for period ${periodId}`);
      if (startTime && endTime) {
        if (toSeconds(endTime) <= toSeconds(startTime)) {
          throw new ApiError(422, `End time must be after start time for period ${periodId}`);
        }
      }
      await timing.update({ start_time: startTime, end_time: endTime }, { transaction: t });
    }
  });
  const updatedTimings = await TimetablePeriodTiming.findAll({
    where: { period_id: timings.map((t) => t.periodId) },
  });
  return updatedTimings;
};

// ── Update breaks — batch update timing durations + slot break_positions ──────

const updateBreaks = async ({
  campusId,
  periodId,
  fdBreakDuration,
  hdBreakDuration,
  beforeSlots,
  afterSlots,
}) => {
  const { TimetableSlot } = require('../../../models');
  const { sequelize } = require('../../../models');
  await findPeriodOrFail({ periodId, campusId });
  await sequelize.transaction(async (t) => {
    // 1. Update full_day timing break duration
    const fdTiming = await TimetablePeriodTiming.findOne({
      where: { period_id: periodId, config: 'full_day' },
      transaction: t,
    });
    if (!fdTiming) throw new ApiError(404, 'Full day timing config not found');
    if (fdTiming.start_time && fdTiming.end_time && fdBreakDuration != null) {
      const durationMin = Math.round((toSeconds(fdTiming.end_time) - toSeconds(fdTiming.start_time)) / 60);
      if (durationMin > 0 && fdBreakDuration >= durationMin) {
        throw new ApiError(422, 'Full day break duration cannot exceed the period duration');
      }
    }
    await fdTiming.update({ break_duration: fdBreakDuration ?? null }, { transaction: t });
    // 2. Update half_day timing break duration
    const hdTiming = await TimetablePeriodTiming.findOne({
      where: { period_id: periodId, config: 'half_day' },
      transaction: t,
    });
    if (!hdTiming) throw new ApiError(404, 'Half day timing config not found');
    if (hdTiming.start_time && hdTiming.end_time && hdBreakDuration != null) {
      const durationMin = Math.round((toSeconds(hdTiming.end_time) - toSeconds(hdTiming.start_time)) / 60);
      if (durationMin > 0 && hdBreakDuration >= durationMin) {
        throw new ApiError(422, 'Half day break duration cannot exceed the period duration');
      }
    }
    await hdTiming.update({ break_duration: hdBreakDuration ?? null }, { transaction: t });
    // 3. Set break_position = 'before' for beforeSlots
    for (const { classGroupId, sectionId } of (beforeSlots ?? [])) {
      await TimetableSlot.upsert(
        { period_id: periodId, class_group_id: classGroupId, section_id: sectionId, break_position: 'before' },
        { transaction: t }
      );
    }
    // 4. Set break_position = 'after' for afterSlots
    for (const { classGroupId, sectionId } of (afterSlots ?? [])) {
      await TimetableSlot.upsert(
        { period_id: periodId, class_group_id: classGroupId, section_id: sectionId, break_position: 'after' },
        { transaction: t }
      );
    }
    // 5. Clear break_position for all slots in this period NOT in either list
    const assignedPairs = [
      ...(beforeSlots ?? []),
      ...(afterSlots  ?? []),
    ].map(({ classGroupId, sectionId }) => `${classGroupId}-${sectionId}`);
    const allSlots = await TimetableSlot.findAll({ where: { period_id: periodId }, transaction: t });
    for (const slot of allSlots) {
      const key = `${slot.class_group_id}-${slot.section_id}`;
      if (!assignedPairs.includes(key) && slot.break_position !== null) {
        await slot.update({ break_position: null }, { transaction: t });
      }
    }
  });
  const { TimetableSlot: Slot } = require('../../../models');
  const { slotIncludes } = require('./slot.service');
  return TimetablePeriod.findByPk(periodId, {
    include: [
      { model: TimetablePeriodTiming, as: 'timings' },
      { model: Slot, as: 'slots', include: slotIncludes },
    ],
  });
};

// ── Delete period ──────────────────────────────────────────────────────────────

const deletePeriod = async ({ campusId, periodId }) => {
  const period = await findPeriodOrFail({ periodId, campusId });
  await period.destroy();
};

module.exports = { findPeriodOrFail, createPeriod, batchUpdateTimings, updateBreaks, deletePeriod };
