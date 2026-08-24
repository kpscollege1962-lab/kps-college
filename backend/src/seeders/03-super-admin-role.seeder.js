const { User, Role, UserGlobalRole } = require('../models');
const { ROLES } = require('../constants/roles');
const deployment = require('../config/deployment');

const seedSuperAdminRole = async () => {
  const { username } = deployment.superAdmin;

  const user = await User.findOne({ where: { username } });
  if (!user) throw new Error(`Super Admin user '${username}' not found — run the user seeder first`);

  const role = await Role.findOne({ where: { name: ROLES.SUPER_ADMIN } });
  if (!role) throw new Error(`Role '${ROLES.SUPER_ADMIN}' not found — run the roles seeder first`);

  const [, created] = await UserGlobalRole.findOrCreate({
    where:    { user_id: user.id, role_id: role.id },
    defaults: { user_id: user.id, role_id: role.id, is_active: 1 },
  });

  if (created) {
    console.log(`  ✓ SUPER_ADMIN role assigned to user: ${username}`);
  } else {
    console.log(`  → SUPER_ADMIN role assignment already exists, skipping`);
  }
};

module.exports = seedSuperAdminRole;
