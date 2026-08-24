const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Section', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    class_group_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'class_groups', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      comment: 'Parent class. Sections cascade-delete when a class is deleted.',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Section label e.g. Eagle, A, Blue. NULL = unsectioned (exactly one per class, invisible to admin).',
    },
  }, {
    tableName: 'sections',
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ['class_group_id', 'name'],
        name: 'uq_section_class_name',
        comment: 'Named sections must be unique per class. MySQL does not enforce NULL uniqueness — the null-section invariant is enforced at the service layer.',
      },
    ],
  });
};
