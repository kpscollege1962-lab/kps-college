const bcrypt = require('bcryptjs');
const { User } = require('../models');
const deployment = require('../config/deployment');

const seedSuperAdminUser = async () => {
  const { firstName, lastName, username, email, password } = deployment.superAdmin;
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');

  const [, created] = await User.findOrCreate({
    where: { username },
    defaults: {
      first_name:    firstName,
      last_name:     lastName,
      username,
      email,
      password_hash: await bcrypt.hash(password, saltRounds),
      is_active:     1,
    },
  });

  if (created) {
    console.log(`  ✓ Super Admin user created: ${username}`);
  } else {
    console.log(`  → Super Admin user already exists, skipping`);
  }
};

module.exports = seedSuperAdminUser;
