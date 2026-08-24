module.exports = ({ Campus, ClassGroup, Section, Subject, Staff,
                    TimetablePeriod, TimetablePeriodTiming, TimetableSlot }) => {

  // Campus -> Periods
  Campus.hasMany(TimetablePeriod,         { foreignKey: 'campus_id', as: 'timetablePeriods' });
  TimetablePeriod.belongsTo(Campus,       { foreignKey: 'campus_id', as: 'campus' });

  // Period -> Timings
  TimetablePeriod.hasMany(TimetablePeriodTiming,   { foreignKey: 'period_id', as: 'timings' });
  TimetablePeriodTiming.belongsTo(TimetablePeriod, { foreignKey: 'period_id', as: 'period' });

  // Period -> Slots
  TimetablePeriod.hasMany(TimetableSlot,   { foreignKey: 'period_id', as: 'slots' });
  TimetableSlot.belongsTo(TimetablePeriod, { foreignKey: 'period_id', as: 'period' });

  // ClassGroup -> Slots
  ClassGroup.hasMany(TimetableSlot,       { foreignKey: 'class_group_id', as: 'timetableSlots' });
  TimetableSlot.belongsTo(ClassGroup,     { foreignKey: 'class_group_id', as: 'classGroup' });

  // Section -> Slots
  Section.hasMany(TimetableSlot,          { foreignKey: 'section_id', as: 'timetableSlots' });
  TimetableSlot.belongsTo(Section,        { foreignKey: 'section_id', as: 'section' });

  // Subject -> Slots (two associations — subject_id_1 and subject_id_2)
  Subject.hasMany(TimetableSlot,          { foreignKey: 'subject_id_1', as: 'primarySlots' });
  TimetableSlot.belongsTo(Subject,        { foreignKey: 'subject_id_1', as: 'subject1' });

  Subject.hasMany(TimetableSlot,          { foreignKey: 'subject_id_2', as: 'secondarySlots' });
  TimetableSlot.belongsTo(Subject,        { foreignKey: 'subject_id_2', as: 'subject2' });

  // Staff -> Slots (two associations — staff_id_1 and staff_id_2)
  Staff.hasMany(TimetableSlot,            { foreignKey: 'staff_id_1', as: 'primaryTimetableSlots' });
  TimetableSlot.belongsTo(Staff,          { foreignKey: 'staff_id_1', as: 'staff1' });

  Staff.hasMany(TimetableSlot,            { foreignKey: 'staff_id_2', as: 'secondaryTimetableSlots' });
  TimetableSlot.belongsTo(Staff,          { foreignKey: 'staff_id_2', as: 'staff2' });

};
