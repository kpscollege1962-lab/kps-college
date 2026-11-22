module.exports = (db) => {
  const { RotaDay, RotaAbsence, RotaEntry, Campus, User, Staff, TimetablePeriod, ClassGroup, Section } = db;

  Campus.hasMany(RotaDay, { foreignKey: 'campus_id', as: 'rotaDays' });
  RotaDay.belongsTo(Campus, { foreignKey: 'campus_id', as: 'campus' });
  RotaDay.belongsTo(User, { foreignKey: 'issued_by_user_id', as: 'issuedBy', constraints: false });

  RotaDay.hasMany(RotaAbsence, { foreignKey: 'rota_day_id', as: 'absences', onDelete: 'CASCADE' });
  RotaAbsence.belongsTo(RotaDay, { foreignKey: 'rota_day_id', as: 'rotaDay' });
  RotaAbsence.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staff' });

  RotaDay.hasMany(RotaEntry, { foreignKey: 'rota_day_id', as: 'entries', onDelete: 'CASCADE' });
  RotaEntry.belongsTo(RotaDay, { foreignKey: 'rota_day_id', as: 'rotaDay' });
  RotaEntry.belongsTo(TimetablePeriod, { foreignKey: 'period_id', as: 'period' });
  RotaEntry.belongsTo(ClassGroup, { foreignKey: 'class_group_id', as: 'classGroup' });
  RotaEntry.belongsTo(Section, { foreignKey: 'section_id', as: 'section' });
  RotaEntry.belongsTo(Staff, { foreignKey: 'absent_staff_id', as: 'absentStaff' });
  RotaEntry.belongsTo(Staff, { foreignKey: 'substitute_staff_id', as: 'substituteStaff' });
};
