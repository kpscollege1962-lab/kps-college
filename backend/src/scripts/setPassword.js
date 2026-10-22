/**
 * Sets the password of one or more accounts. For TESTING only.
 *
 *   node src/scripts/setPassword.js school-admin male-campus-admin --password=123456
 *
 * Accepts usernames or emails. Refuses to run when NODE_ENV=production (add --force to override).
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize, User } = require('../models');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

const args = process.argv.slice(2);
const password = (args.find((a) => a.startsWith('--password=')) ?? '').slice('--password='.length);
const force = args.includes('--force');
const logins = args.filter((a) => !a.startsWith('--'));

const main = async () => {
  if (!logins.length || !password) {
    console.error('Usage: node src/scripts/setPassword.js <username> [<username> ...] --password=<new password>');
    process.exit(1);
  }
  if (process.env.NODE_ENV === 'production' && !force) {
    console.error('Refusing to run with NODE_ENV=production. Add --force if you really mean it.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  for (const login of logins) {
    const user = await User.findOne({ where: { [Op.or]: [{ username: login }, { email: login }] } });
    if (!user) {
      console.log(`  not found: ${login}`);
      continue;
    }
    await user.update({ password_hash: hash });
    console.log(`  updated: ${user.username} (id ${user.id})`);
  }

  await sequelize.close();
  console.log('\nDone. These passwords are for testing. Change them before real use.');
};

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});