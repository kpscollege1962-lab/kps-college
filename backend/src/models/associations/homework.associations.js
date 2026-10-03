module.exports = (db) => {
  const {
    Campus, AcademicSession, ClassGroup, Section, Subject, Staff, Enrollment,
    Homework, HomeworkSubmission,
  } = db;

  // ── Homework ──────────────────────────────────────────────────────────────
  Campus.hasMany(Homework, { foreignKey: 'campus_id', as: 'homeworks' });
  Homework.belongsTo(Campus, { foreignKey: 'campus_id', as: 'campus' });

  AcademicSession.hasMany(Homework, { foreignKey: 'session_id', as: 'homeworks' });
  Homework.belongsTo(AcademicSession, { foreignKey: 'session_id', as: 'session' });

  ClassGroup.hasMany(Homework, { foreignKey: 'class_group_id', as: 'homeworks' });
  Homework.belongsTo(ClassGroup, { foreignKey: 'class_group_id', as: 'classGroup' });

  Section.hasMany(Homework, { foreignKey: 'section_id', as: 'homeworks' });
  Homework.belongsTo(Section, { foreignKey: 'section_id', as: 'section' });

  Subject.hasMany(Homework, { foreignKey: 'subject_id', as: 'homeworks' });
  Homework.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

  Staff.hasMany(Homework, { foreignKey: 'staff_id', as: 'postedHomeworks' });
  Homework.belongsTo(Staff, { foreignKey: 'staff_id', as: 'postedBy' });

  // ── HomeworkSubmission ────────────────────────────────────────────────────
  Homework.hasMany(HomeworkSubmission, { foreignKey: 'homework_id', as: 'submissions' });
  HomeworkSubmission.belongsTo(Homework, { foreignKey: 'homework_id', as: 'homework' });

  Enrollment.hasMany(HomeworkSubmission, { foreignKey: 'enrollment_id', as: 'homeworkSubmissions' });
  HomeworkSubmission.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });

  Staff.hasMany(HomeworkSubmission, { foreignKey: 'reviewed_by', as: 'reviewedSubmissions' });
  HomeworkSubmission.belongsTo(Staff, { foreignKey: 'reviewed_by', as: 'reviewedByStaff' });
};