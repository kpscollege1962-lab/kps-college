const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('SchoolSettings', {

    // ── Identity ──────────────────────────────────────────────────
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    school_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    short_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Abbreviated display name used in UI headers and reports where full name is too long',
    },
    tagline: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'School motto or tagline shown on printed documents and the login screen',
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Relative or absolute path to the uploaded school logo image',
    },
    registration_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Official government registration or charter number issued to the institution',
    },
    school_type: {
      type: DataTypes.ENUM('private', 'government', 'semi_government'),
      allowNull: true,
    },

    // ── Contact ───────────────────────────────────────────────────
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state_province: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    // ── Localization ──────────────────────────────────────────────
    timezone: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: 'Asia/Karachi',
      comment: 'IANA timezone identifier used for all date/time display and scheduling logic throughout the system',
    },
    date_format: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'DD/MM/YYYY',
      comment: 'Display format for dates in UI and printed documents. Does not affect how dates are stored in the database (always ISO)',
    },
    currency_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'PKR',
      comment: 'ISO 4217 currency code used in fee and finance modules',
    },
    currency_symbol: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: '₨',
    },
    currency_position: {
      type: DataTypes.ENUM('before', 'after'),
      allowNull: false,
      defaultValue: 'before',
      comment: 'Controls whether the currency symbol appears before or after the amount e.g. ₨500 vs 500₨',
    },
    academic_year_start_month: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 4,
      comment: 'Month number (1-12) when the academic year begins. Used as the default when creating new academic sessions. April = 4 is common in Pakistan.',
    },

    // ── Academic Defaults ─────────────────────────────────────────
    default_pass_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 40.00,
      comment: 'Minimum percentage a student must score to be considered passing. Used as the default in exam and result modules; can be overridden per exam.',
    },
    min_attendance_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 75.00,
      comment: 'Minimum attendance percentage required. Used in attendance reports and eligibility checks for exams.',
    },

  }, {
    tableName: 'school_settings',
    timestamps: true,
    paranoid: false,
  });
};
