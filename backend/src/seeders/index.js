require('dotenv').config();
require('../models'); // registers all models and associations before any seeder runs

const seedRoles          = require('./01-roles.seeder');
const seedSuperAdminUser = require('./02-super-admin-user.seeder');
const seedSuperAdminRole = require('./03-super-admin-role.seeder');
const seedSchoolSettings = require('./04-school-settings.seeder');
const seedSubjects       = require('./05-subjects.seeder');

const run = async () => {
  try {
    console.log('Starting database seeding...');

    console.log('\n[1/5] Seeding roles...');
    await seedRoles();

    console.log('\n[2/5] Seeding super admin user...');
    await seedSuperAdminUser();

    console.log('\n[3/5] Assigning super admin role...');
    await seedSuperAdminRole();

    console.log('\n[4/5] Seeding school settings...');
    await seedSchoolSettings();

    console.log('\n[5/5] Seeding subjects...');
    await seedSubjects();

    console.log('\nDatabase seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('\nSeeding failed:', err.message);
    process.exit(1);
  }
};

run();
