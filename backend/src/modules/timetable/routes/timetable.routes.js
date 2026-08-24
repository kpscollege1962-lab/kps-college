const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');

const {
  campusIdParamRules,
  periodIdParamRules,
  classTimetableQueryRules,
  getTimetableQueryRules,
} = require('../validators/timetable.validator');
const { createPeriodRules, batchUpdateTimingsRules, deletePeriodRules, updateBreakRules } = require('../validators/period.validator');
const { upsertSlotRules, clearSlotRules, swapSlotsRules }                  = require('../validators/slot.validator');

const timetableCtrl = require('../controllers/timetable.controller');
const periodCtrl    = require('../controllers/period.controller');
const slotCtrl      = require('../controllers/slot.controller');

// mergeParams: true is required so req.params.campusId flows in from the parent campuses router
const router = Router({ mergeParams: true });

// ── Read / query ───────────────────────────────────────────────────────────────

router.get('/',
  authenticate,
  campusIdParamRules, getTimetableQueryRules, validate,
  timetableCtrl.getCampusTimetable);

router.get('/staff',
  authenticate,
  campusIdParamRules, validate,
  timetableCtrl.getTimetableStaff);

router.get('/class',
  authenticate,
  classTimetableQueryRules, validate,
  timetableCtrl.getClassTimetable);

// ── Period CRUD ────────────────────────────────────────────────────────────────

router.post('/periods',
  authenticate, loadAbility,
  createPeriodRules, validate,
  requirePermission('manage', 'Timetable'),
  periodCtrl.createPeriod);

router.patch('/timings/batch',
  authenticate, loadAbility,
  batchUpdateTimingsRules, validate,
  requirePermission('manage', 'Timetable'),
  periodCtrl.batchUpdateTimings);

router.patch('/periods/:periodId/breaks',
  authenticate, loadAbility,
  updateBreakRules, validate,
  requirePermission('manage', 'Timetable'),
  periodCtrl.updateBreaks);

router.delete('/periods/:periodId',
  authenticate, loadAbility,
  deletePeriodRules, validate,
  requirePermission('manage', 'Timetable'),
  periodCtrl.deletePeriod);

// ── Slot CRUD ──────────────────────────────────────────────────────────────────

router.put('/periods/:periodId/classes/:classGroupId/sections/:sectionId/slot',
  authenticate, loadAbility,
  upsertSlotRules, validate,
  requirePermission('manage', 'Timetable'),
  slotCtrl.upsertSlot);

router.delete('/periods/:periodId/classes/:classGroupId/sections/:sectionId/slot',
  authenticate, loadAbility,
  clearSlotRules, validate,
  requirePermission('manage', 'Timetable'),
  slotCtrl.clearSlot);

router.post('/slots/swap',
  authenticate, loadAbility,
  swapSlotsRules, validate,
  requirePermission('manage', 'Timetable'),
  slotCtrl.swapSlots);

module.exports = router;
