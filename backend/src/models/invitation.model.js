const { DataTypes } = require('sequelize');

// Used for the guardian invitation flow. Campus admin creates a
// guardian record and triggers an invitation email. Guardian clicks
// the link, sets their password, and their user account activates.

module.exports = (sequelize) => {
  return sequelize.define('Invitation', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'Hashed token embedded in the invitation link',
    },
    guardian_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'guardians', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      comment: 'The pre-created guardian record this invitation activates',
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'expired'),
      allowNull: false,
      defaultValue: 'pending',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    accepted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'invitations',
    timestamps: true,
    paranoid: false,
    indexes: [
      { unique: true, fields: ['token'],  name: 'uq_invitation_token'  },
      {               fields: ['email'],  name: 'idx_invitation_email'  },
      {               fields: ['status'], name: 'idx_invitation_status' },
    ],
  });
};
