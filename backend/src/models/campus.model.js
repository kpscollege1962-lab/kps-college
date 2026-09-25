const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Campus', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      comment: 'Short identifier e.g. CAMP-A',
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },

    // ── Printed timetable branding ──────────────────────────────────────────
    title_english_url:  { type: DataTypes.STRING(500), allowNull: true }, // Cloudinary URL
    title_urdu_url:     { type: DataTypes.STRING(500), allowNull: true },
    title_combined_url: { type: DataTypes.STRING(500), allowNull: true },
    watermark_url:       { type: DataTypes.STRING(500), allowNull: true },
    active_title_variant: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "'english' | 'urdu' | 'combined'",
    },
    footer_text: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Shown at the bottom of the printed timetable, e.g. "Principal\\nKPS & COLLEGE\\nKhwaza Khela Swat"',
    },
  }, {
    tableName: 'campuses',
    timestamps: true,
    paranoid: false,
  });
};