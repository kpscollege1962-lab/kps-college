const { Role } = require('../models');
const { ROLE_ENTRIES } = require('../constants/roles');

const seedRoles = async () => {
  for (const roleData of ROLE_ENTRIES) {
    const [, created] = await Role.findOrCreate({
      where: { name: roleData.name },
      defaults: roleData,
    });

    if (created) {
      console.log(`  ✓ Role created: ${roleData.name}`);
    } else {
      console.log(`  → Role already exists, skipping: ${roleData.name}`);
    }
  }
};

module.exports = seedRoles;
