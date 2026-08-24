module.exports = ({ Campus, CampusSettings }) => {
  Campus.hasOne(CampusSettings, { foreignKey: 'campus_id', as: 'settings' });
  CampusSettings.belongsTo(Campus, { foreignKey: 'campus_id', as: 'campus' });
};
