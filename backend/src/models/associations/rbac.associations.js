module.exports = ({ Role, User, UserRoleCampus, UserGlobalRole, Campus }) => {

  // Campus-scoped assignments (UserRoleCampus)
  User.belongsToMany(Role, { through: UserRoleCampus, foreignKey: 'user_id', otherKey: 'role_id', as: 'campusRoles' });
  Role.belongsToMany(User, { through: UserRoleCampus, foreignKey: 'role_id', otherKey: 'user_id', as: 'campusUsers' });
  UserRoleCampus.belongsTo(User,   { foreignKey: 'user_id',   as: 'user'   });
  UserRoleCampus.belongsTo(Role,   { foreignKey: 'role_id',   as: 'role'   });
  UserRoleCampus.belongsTo(Campus, { foreignKey: 'campus_id', as: 'campus' });
  Campus.hasMany(UserRoleCampus,   { foreignKey: 'campus_id', as: 'roleAssignments'      });
  User.hasMany(UserRoleCampus,     { foreignKey: 'user_id',     as: 'campusRoleAssignments' });

  // Global assignments (UserGlobalRole)
  User.belongsToMany(Role, { through: UserGlobalRole, foreignKey: 'user_id', otherKey: 'role_id', as: 'globalRoles' });
  Role.belongsToMany(User, { through: UserGlobalRole, foreignKey: 'role_id', otherKey: 'user_id', as: 'globalUsers' });
  UserGlobalRole.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  UserGlobalRole.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
  User.hasMany(UserGlobalRole,   { foreignKey: 'user_id', as: 'globalRoleAssignments' });

};
