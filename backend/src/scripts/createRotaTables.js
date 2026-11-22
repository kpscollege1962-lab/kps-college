/**
 * Rota (daily arrangement for absent teachers): creates its three tables.
 *
 *   node src/scripts/createRotaTables.js            -> DRY RUN (changes nothing at all)
 *   node src/scripts/createRotaTables.js --apply    -> full backup, then creates the missing tables
 *
 *   rota_days      one campus's rota for one date (draft / issued, who issued it and when)
 *   rota_absences  teachers absent that day
 *   rota_entries   each covered period: class, section, absent teacher, substitute, forced
 *
 * Only creates tables that do not exist yet; existing tables and data are never touched.
 * Run it BEFORE starting the backend version that has the rota.
 */
require('dotenv').config();
const { sequelize, RotaDay, RotaAbsence, RotaEntry } = require('../models');
const { backup } = require('./lib/dbBackup');

const APPLY = process.argv.includes('--apply');
const MODELS = [RotaDay, RotaAbsence, RotaEntry]; // parents first (foreign keys)

const exists = async (table) => {
  const [[row]] = await sequelize.query(
    'SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = :table',
    { replacements: { table } }
  );
  return Number(row.n) > 0;
};

const main = async () => {
  console.log(APPLY ? 'APPLYING changes...\n' : 'DRY RUN: showing what would happen. Nothing is saved.\n');

  const missing = [];
  for (const Model of MODELS) {
    const table = Model.getTableName();
    if (await exists(table)) console.log(`already there, skipped: ${table}`);
    else missing.push(Model);
  }
  if (!missing.length) {
    console.log('Nothing to do: the rota tables already exist.');
    await sequelize.close();
    return;
  }
  for (const Model of missing) {
    console.log(`Would create table ${Model.getTableName()} (${Object.keys(Model.rawAttributes).join(', ')})`);
  }

  if (!APPLY) {
    console.log('\nDry run only. Run again with --apply to back up and create these tables.');
    await sequelize.close();
    return;
  }

  const { file, size } = backup('rota-tables');
  console.log(`\nBackup written: ${file} (${size} bytes)`);
  for (const Model of missing) {
    await Model.sync(); // CREATE TABLE IF NOT EXISTS, never alters or drops
    console.log(`done: ${Model.getTableName()}`);
  }
  console.log('\nFinished. Start the backend now.');
  await sequelize.close();
};

main().catch(async (err) => {
  console.error(`\nStopped: ${err.message}\nNothing after this point was changed.`);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
