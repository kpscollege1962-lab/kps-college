module.exports = ({ Campus, User, Student, StudentContact, StudentRegisterEntry, Staff, StaffPhone, StaffQualification, StaffPosting, Guardian, GuardianStudent, Invitation }) => {

  // Student <-> StudentContact
  Student.hasMany(StudentContact,   { foreignKey: 'student_id', as: 'contacts' });
  StudentContact.belongsTo(Student, { foreignKey: 'student_id', as: 'student'  });

  // Student <-> StudentRegisterEntry
  Student.hasMany(StudentRegisterEntry,        { foreignKey: 'student_id', as: 'registerEntries' });
  StudentRegisterEntry.belongsTo(Student,      { foreignKey: 'student_id', as: 'student'         });

  // Staff <-> StaffPhone
  Staff.hasMany(StaffPhone,    { foreignKey: 'staff_id', as: 'phones'         });
  StaffPhone.belongsTo(Staff,  { foreignKey: 'staff_id', as: 'staff'          });

  // Staff <-> StaffQualification
  Staff.hasMany(StaffQualification,        { foreignKey: 'staff_id', as: 'qualifications' });
  StaffQualification.belongsTo(Staff,      { foreignKey: 'staff_id', as: 'staff'          });

  // Staff <-> StaffPosting
  Staff.hasMany(StaffPosting,    { foreignKey: 'staff_id',  as: 'postings' });
  StaffPosting.belongsTo(Staff,  { foreignKey: 'staff_id',  as: 'staff'    });

  // Campus <-> StaffPosting
  Campus.hasMany(StaffPosting,   { foreignKey: 'campus_id', as: 'staffPostings' });
  StaffPosting.belongsTo(Campus, { foreignKey: 'campus_id', as: 'campus'        });

  // User <-> Guardian
  User.hasOne(Guardian,    { foreignKey: 'user_id', as: 'guardianProfile' });
  Guardian.belongsTo(User, { foreignKey: 'user_id', as: 'user'            });

  // Guardian <-> Student  (many-to-many through GuardianStudent)
  Guardian.belongsToMany(Student,  { through: GuardianStudent, foreignKey: 'guardian_id', otherKey: 'student_id',  as: 'students'  });
  Student.belongsToMany(Guardian,  { through: GuardianStudent, foreignKey: 'student_id',  otherKey: 'guardian_id', as: 'guardians' });
  GuardianStudent.belongsTo(Guardian, { foreignKey: 'guardian_id', as: 'guardian' });
  GuardianStudent.belongsTo(Student,  { foreignKey: 'student_id',  as: 'student'  });

  // Guardian <-> Invitation
  Guardian.hasMany(Invitation,    { foreignKey: 'guardian_id', as: 'invitations' });
  Invitation.belongsTo(Guardian,  { foreignKey: 'guardian_id', as: 'guardian'    });

};
