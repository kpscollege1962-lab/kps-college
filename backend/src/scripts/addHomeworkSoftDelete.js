/**
 * Soft delete + audit columns for homework (assignments).
 *
 *   node src/scripts/addHomeworkSoftDelete.js            -> DRY RUN (changes nothing at all)
 *   node src/scripts/addHomeworkSoftDelete.js --apply    -> backs up, then changes the schema
 *
 * Adds to `homeworks`:
 *   deleted_at          DATETIME NULL   set when an assignment is deleted (soft delete); NULL = live
 *   updated_by_user_id  INT UNSIGNED    who last edited it      (users.id, SET NULL if the user goes)
 *   deleted_by_user_id  INT UNSIGNED    who deleted it          (users.id, SET NULL if the user goes)
 * plus an index on deleted_at.
 *
 * Existing rows are not changed: every one stays live (deleted_at NULL) with no editor recorded.
 *
 * Backup (with --apply only, BEFORE anything changes): a full mysqldump of the database (so it
 * includes `homeworks`, whose attachments are columns, and `homework_submissions`) into
 * backend/backups/ (git-ignored). The DB credentials come from backend/.env; the password is passed
 * to mysqldump through the MYSQL_PWD environment variable, never on the command line or into a file.
 * mysqldump is taken from PATH, else from the usual Windows install folders (MySQL, MariaDB, XAMPP,
 * WAMP, Laragon), else from MYSQLDUMP_PATH in .env. If the backup fails, nothing is changed.
 *
 * IMPORTANT: run this BEFORE starting the backend version whose Homework model is `paranoid`;
 * that model reads deleted_at in every homework query.
 *
 * Safe to run twice: columns, index and keys that already exist are skipped.
 */
require('dotenv').config();
const path = require('path');
const { sequelize } = require('../models');
const { BACKUP_DIR, findMysqldump, backup } = require('./lib/dbBackup');

const APPLY = process.argv.includes('--apply');
const TABLE = 'homeworks';

const COLUMNS = [
  { name: 'deleted_at',         sql: 'ADD COLUMN `deleted_at` DATETIME NULL DEFAULT NULL AFTER `updated_at`' },
  { name: 'updated_by_user_id', sql: 'ADD COLUMN `updated_by_user_id` INT UNSIGNED NULL DEFAULT NULL AFTER `deleted_at`' },
  { name: 'deleted_by_user_id', sql: 'ADD COLUMN `deleted_by_user_id` INT UNSIGNED NULL DEFAULT NULL AFTER `updated_by_user_id`' },
];
const INDEXES = [
  { name: 'idx_homework_deleted_at', sql: 'ADD INDEX `idx_homework_deleted_at` (`deleted_at`)' },
];
const FOREIGN_KEYS = [
  { name: 'fk_homework_updated_by_user', sql: 'ADD CONSTRAINT `fk_homework_updated_by_user` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE' },
  { name: 'fk_homework_deleted_by_user', sql: 'ADD CONSTRAINT `fk_homework_deleted_by_user` FOREIGN KEY (`deleted_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE' },
];

const names = async (query) => {
  const [rows] = await sequelize.query(query, { replacements: { table: TABLE } });
  return new Set(rows.map((r) => r.name));
};

const main = async () => {
  console.log(APPLY ? 'APPLYING changes...\n' : 'DRY RUN: showing what would happen. Nothing is saved.\n');

  const columns = await names(
    `SELECT column_name AS name FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = :table`
  );
  if (!columns.size) throw new Error(`Table ${TABLE} does not exist`);
  const indexes = await names(
    `SELECT DISTINCT index_name AS name FROM information_schema.statistics
     WHERE table_schema = DATABASE() AND table_name = :table`
  );
  const keys = await names(
    `SELECT constraint_name AS name FROM information_schema.table_constraints
     WHERE table_schema = DATABASE() AND table_name = :table AND constraint_type = 'FOREIGN KEY'`
  );

  const [[counts]] = await sequelize.query(
    `SELECT COUNT(*) AS homeworks,
            (SELECT COUNT(*) FROM homework_submissions) AS submissions,
            SUM(attachment_url IS NOT NULL) AS with_attachment
     FROM ${TABLE}`
  );
  console.log(`Rows now: ${counts.homeworks} assignments (${Number(counts.with_attachment ?? 0)} with an attachment), ${counts.submissions} submissions.`);
  console.log('Existing rows stay live (deleted_at NULL); no row data changes.\n');

  const steps = [
    ...COLUMNS.filter((c) => !columns.has(c.name)),
    ...INDEXES.filter((i) => !indexes.has(i.name)),
    ...FOREIGN_KEYS.filter((k) => !keys.has(k.name)),
  ];
  const skipped = [...COLUMNS, ...INDEXES, ...FOREIGN_KEYS].filter((s) => !steps.includes(s));
  for (const s of skipped) console.log(`already there, skipped: ${s.name}`);

  if (!steps.length) {
    console.log('Nothing to do: the soft-delete columns are already in place.');
    await sequelize.close();
    return;
  }

  console.log(`Would run on ${TABLE}:`);
  for (const s of steps) console.log(`  ALTER TABLE \`${TABLE}\` ${s.sql};`);
  console.log(`\nBackup first: full mysqldump of the database into ${path.relative(process.cwd(), BACKUP_DIR) || BACKUP_DIR}/`);

  if (!APPLY) {
    console.log('\nDry run only. Run again with --apply to back up and make these changes.');
    await sequelize.close();
    return;
  }

  const { file, size } = backup('homework-soft-delete');
  console.log(`\nBackup written: ${file} (${size} bytes)`);

  for (const s of steps) {
    await sequelize.query(`ALTER TABLE \`${TABLE}\` ${s.sql}`);
    console.log(`done: ${s.name}`);
  }
  console.log('\nFinished. Start the backend version with the paranoid Homework model now.');
  await sequelize.close();
};

if (require.main === module) {
  main().catch(async (err) => {
    console.error(`\nStopped: ${err.message}\nNothing after this point was changed.`);
    await sequelize.close().catch(() => {});
    process.exit(1);
  });
}

module.exports = { findMysqldump, backup };
