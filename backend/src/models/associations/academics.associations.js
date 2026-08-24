module.exports = ({ Campus, AcademicSession, ClassGroup, Section, Student, Enrollment }) => {
  // Campus <-> ClassGroup
  Campus.hasMany(ClassGroup,   { foreignKey: 'campus_id',      as: 'classGroups' });
  ClassGroup.belongsTo(Campus, { foreignKey: 'campus_id',      as: 'campus'      });

  // AcademicSession <-> ClassGroup
  AcademicSession.hasMany(ClassGroup,   { foreignKey: 'session_id', as: 'classGroups' });
  ClassGroup.belongsTo(AcademicSession, { foreignKey: 'session_id', as: 'session'     });

  // ClassGroup <-> Section (one class has many sections; sections owned by class)
  ClassGroup.hasMany(Section,   { foreignKey: 'class_group_id', as: 'sections' });
  Section.belongsTo(ClassGroup, { foreignKey: 'class_group_id', as: 'classGroup' });

  // AcademicSession <-> Enrollment
  AcademicSession.hasMany(Enrollment,   { foreignKey: 'session_id',     as: 'enrollments' });
  Enrollment.belongsTo(AcademicSession, { foreignKey: 'session_id',     as: 'session'     });

  // ClassGroup <-> Enrollment
  ClassGroup.hasMany(Enrollment,  { foreignKey: 'class_group_id', as: 'enrollments' });
  Enrollment.belongsTo(ClassGroup,{ foreignKey: 'class_group_id', as: 'classGroup'  });

  // Section <-> Enrollment
  Section.hasMany(Enrollment,   { foreignKey: 'section_id', as: 'enrollments' });
  Enrollment.belongsTo(Section, { foreignKey: 'section_id', as: 'section'     });

  // Student <-> Enrollment
  Student.hasMany(Enrollment,   { foreignKey: 'student_id', as: 'enrollments' });
  Enrollment.belongsTo(Student, { foreignKey: 'student_id', as: 'student'     });

  // Campus <-> Enrollment
  Campus.hasMany(Enrollment,   { foreignKey: 'campus_id', as: 'enrollments' });
  Enrollment.belongsTo(Campus, { foreignKey: 'campus_id', as: 'campus'      });
};
