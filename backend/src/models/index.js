const { sequelize } = require('../config/database');

// ── Model factories ───────────────────────────────────────────────────────────
const defineUser               = require('./user.model');
const definePasswordResetToken = require('./passwordResetToken.model');
const defineCampus             = require('./campus.model');
const defineRole               = require('./role.model');
const defineUserRoleCampus     = require('./userRoleCampus.model');
const defineUserGlobalRole     = require('./userGlobalRole.model');
const defineAcademicSession    = require('./academicSession.model');
const defineStudent            = require('./student.model');
const defineStudentContact         = require('./studentContact.model');
const defineStudentRegisterEntry   = require('./studentRegisterEntry.model');
const defineStaff              = require('./staff.model');
const defineStaffPhone         = require('./staffPhone.model');
const defineStaffQualification = require('./staffQualification.model');
const defineStaffPosting       = require('./staffPosting.model');
const defineGuardian           = require('./guardian.model');
const defineGuardianStudent    = require('./guardianStudent.model');
const defineClassGroup         = require('./classGroup.model');
const defineSection            = require('./section.model');
const defineEnrollment         = require('./enrollment.model');
const defineClassTeacherAssignment = require('./classTeacherAssignment.model');
const defineInvitation         = require('./invitation.model');
const defineSchoolSettings     = require('./schoolSettings.model');
const defineCampusSettings     = require('./campusSettings.model');
const defineSubject            = require('./subject.model');
const defineTimetablePeriod       = require('./timetablePeriod.model');
const defineTimetablePeriodTiming = require('./timetablePeriodTiming.model');
const defineTimetableSlot         = require('./timetableSlot.model');
const defineAttendanceSession      = require('./attendanceSession.model');
const defineAttendanceRecord       = require('./attendanceRecord.model');
const defineFeeHead        = require('./feeHead.model');
const defineFeeStructure   = require('./feeStructure.model');
const defineFeeChallan     = require('./feeChallan.model');
const defineFeeChallanItem = require('./feeChallanItem.model');
const defineFeePayment     = require('./feePayment.model');

// ── Initialize models ─────────────────────────────────────────────────────────
const User               = defineUser(sequelize);
const PasswordResetToken = definePasswordResetToken(sequelize);
const Campus             = defineCampus(sequelize);
const Role               = defineRole(sequelize);
const UserRoleCampus     = defineUserRoleCampus(sequelize);
const UserGlobalRole     = defineUserGlobalRole(sequelize);
const AcademicSession    = defineAcademicSession(sequelize);
const Student            = defineStudent(sequelize);
const StudentContact         = defineStudentContact(sequelize);
const StudentRegisterEntry   = defineStudentRegisterEntry(sequelize);
const Staff              = defineStaff(sequelize);
const StaffPhone         = defineStaffPhone(sequelize);
const StaffQualification = defineStaffQualification(sequelize);
const StaffPosting       = defineStaffPosting(sequelize);
const Guardian           = defineGuardian(sequelize);
const GuardianStudent    = defineGuardianStudent(sequelize);
const ClassGroup         = defineClassGroup(sequelize);
const Section            = defineSection(sequelize);
const Enrollment         = defineEnrollment(sequelize);
const ClassTeacherAssignment = defineClassTeacherAssignment(sequelize);
const Invitation         = defineInvitation(sequelize);
const SchoolSettings     = defineSchoolSettings(sequelize);
const CampusSettings     = defineCampusSettings(sequelize);
const Subject            = defineSubject(sequelize);
const TimetablePeriod       = defineTimetablePeriod(sequelize);
const TimetablePeriodTiming = defineTimetablePeriodTiming(sequelize);
const TimetableSlot         = defineTimetableSlot(sequelize);
const AttendanceSession      = defineAttendanceSession(sequelize);
const AttendanceRecord       = defineAttendanceRecord(sequelize);
const FeeHead        = defineFeeHead(sequelize);
const FeeStructure   = defineFeeStructure(sequelize);
const FeeChallan     = defineFeeChallan(sequelize);
const FeeChallanItem = defineFeeChallanItem(sequelize);
const FeePayment     = defineFeePayment(sequelize);

// ── Register & export ─────────────────────────────────────────────────────────
const db = {
  sequelize,
  User,
  PasswordResetToken,
  Campus,
  Role,
  UserRoleCampus,
  UserGlobalRole,
  AcademicSession,
  Student,
  StudentContact,
  StudentRegisterEntry,
  Staff,
  StaffPhone,
  StaffQualification,
  StaffPosting,
  Guardian,
  GuardianStudent,
  ClassGroup,
  Section,
  Enrollment,
  ClassTeacherAssignment,
  Invitation,
  SchoolSettings,
  CampusSettings,
  Subject,
  TimetablePeriod,
  TimetablePeriodTiming,
  TimetableSlot,
  AttendanceSession,
  AttendanceRecord,
  FeeHead,
  FeeStructure,
  FeeChallan,
  FeeChallanItem,
  FeePayment,
};

// ── Wire up associations (runs after all models are loaded) ───────────────────
require('./associations/index')(db);

module.exports = db;
