const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('CampusSettings', {

    // ── Identity ──────────────────────────────────────────────────
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    campus_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      comment: 'One settings row per campus. Auto-created when a campus is created.',
      references: {
        model: 'campuses',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    // ── Branding ──────────────────────────────────────────────────
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    tagline: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Campus-specific motto or tagline for letterheads and report cards',
    },

    // ── Academic Defaults ─────────────────────────────────────────
    academic_year_start_month: {
      type: DataTypes.TINYINT,
      allowNull: true,
      comment: 'Month number 1-12. NULL = inherit from school_settings.',
    },
    default_pass_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'NULL = inherit from school_settings.',
    },
    min_attendance_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'NULL = inherit from school_settings.',
    },

    // ── Operations ────────────────────────────────────────────────
    working_days: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of lowercase day names e.g. ["monday","tuesday","wednesday","thursday","friday"]. NULL = default Mon-Fri assumed by application.',
    },
    school_start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    school_end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    late_arrival_minutes: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true,
      comment: 'Minutes after school_start_time before a student is marked late. 0 = no grace period.',
    },
    max_students_per_section: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true,
      comment: 'Default section capacity pre-filled when creating sections. Can be overridden per section.',
    },

  }, {
    tableName: 'campus_settings',
    timestamps: true,
    paranoid: false,
  });
};
