const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Enrollment', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    campus_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'campuses', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'Which campus this enrollment belongs to',
    },
    session_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'academic_sessions', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'Academic session this enrollment belongs to',
    },
    class_group_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'class_groups', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'Class (grade level) for this enrollment',
    },
    student_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'students', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    section_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'sections', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      comment: 'Section is always required — every class has at least one section',
    },
    class_no: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: 'Auto-assigned by service as MAX(class_no)+1 within class at enrollment time',
    },
    status: {
      type: DataTypes.ENUM('active', 'transferred', 'withdrawn'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'active = attending; transferred = moved to another campus mid-session; withdrawn = left school',
    },
  }, {
    tableName: 'enrollments',
    timestamps: true,
    paranoid: false,
    indexes: [
      { fields: ['campus_id'],      name: 'idx_enrollment_campus_id'      },
      { fields: ['session_id'],     name: 'idx_enrollment_session_id'     },
      { fields: ['student_id'],     name: 'idx_enrollment_student_id'     },
      { fields: ['section_id'],     name: 'idx_enrollment_section_id'     },
      { fields: ['class_group_id'], name: 'idx_enrollment_class_group_id' },
      {
        unique: true,
        fields: ['campus_id', 'session_id', 'class_group_id', 'section_id', 'class_no'],
        name: 'uq_enrollment_class_no',
      },
      {
        unique: true,
        fields: ['student_id', 'session_id', 'campus_id'],
        name: 'uq_student_session_campus',
        comment: 'One enrollment per student per campus per session; allows mid-session transfer (two records, different campus_ids)',
      },
    ],
  });
};
