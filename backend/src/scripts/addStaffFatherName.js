/**
 * Father name for staff (students already have one).
 *
 *   node src/scripts/addStaffFatherName.js            -> DRY RUN (changes nothing at all)
 *   node src/scripts/addStaffFatherName.js --apply    -> full backup, then the change
 *
 * Adds `staff.father_name` VARCHAR(150) NULL after full_name. Existing staff get it empty; the office
 * fills it in from the staff form. It reads as "Mr. <name>" everywhere (utils/personTitle.js).
 *
 * IMPORTANT: run this BEFORE starting the backend whose Staff model has father_name.
 * Safe to run twice: an existing column is skipped.
 */
require('dotenv').config();
const { sequelize } = require('../models');
const { backup } = require('./lib/dbBackup');

const APPLY = process.argv.includes('--apply');
const SQL = 'ALTER TABLE `staff` ADD COLUMN `father_name` VARCHAR(150) NULL DEFAULT NULL AFTER `full_name`';

const main = async () => {
  console.log(APPLY ? 'APPLYING changes...\n' : 'DRY RUN: showing what would happen. Nothing is saved.\n');

  const [[col]] = await sequelize.query(
    `SELECT COUNT(*) AS n FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'staff' AND column_name = 'father_name'`
  );
  if (Number(col.n) > 0) {
    console.log('already there, skipped: staff.father_name\nNothing to do.');
    await sequelize.close();
    return;
  }

  const [[count]] = await sequelize.query('SELECT COUNT(*) AS n FROM staff');
  console.log(`Staff now: ${count.n}. They all get an empty father name (filled in later from the staff form).`);
  console.log(`Would run:\n  ${SQL};`);

  if (!APPLY) {
    console.log('\nDry run only. Run again with --apply to back up and make this change.');
    await sequelize.close();
    return;
  }

  const { file, size } = backup('staff-father-name');
  console.log(`\nBackup written: ${file} (${size} bytes)`);
  await sequelize.query(SQL);
  console.log('done: staff.father_name column\n\nFinished. Start the backend now.');
  await sequelize.close();
};

main().catch(async (err) => {
  console.error(`\nStopped: ${err.message}\nNothing after this point was changed.`);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
