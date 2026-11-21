/**
 * Gender for every person record, so every name can read "Mr. NAME" / "Miss NAME".
 *
 *   node src/scripts/addPersonGender.js            -> DRY RUN (changes nothing at all)
 *   node src/scripts/addPersonGender.js --apply    -> full backup, then changes
 *
 * Staff and students already have `gender`. This adds a nullable `gender` ENUM('male','female')
 * to the tables that lack one, then fills the empty ones from data that already exists:
 *   users             <- the linked staff / student / guardian record (by user_id)
 *   student_contacts  <- the label ("Father", "Uncle" -> male; "Mother", "Aunt" -> female)
 *   guardians         <- the relationship (same words)
 * Nothing that already has a gender is changed. Unknown labels stay empty and are listed.
 * Login accounts with no linked person (the admin accounts) stay empty: no title.
 *
 * From then on the app keeps them filled by itself (utils/personTitle.js): new accounts copy the
 * person's gender, and contacts / guardians fill an empty gender from their label.
 *
 * IMPORTANT: run this BEFORE starting the backend whose models have these gender columns.
 * Safe to run twice: existing columns are skipped and only empty genders are filled.
 */
require('dotenv').config();
const { sequelize } = require('../models');
const { genderFromRelation } = require('../utils/personTitle');
const { backup } = require('./lib/dbBackup');

const APPLY = process.argv.includes('--apply');

const TABLES = [
  { table: 'users',            after: 'last_name', relation: null },
  { table: 'student_contacts', after: 'name',      relation: 'label' },
  { table: 'guardians',        after: 'last_name', relation: 'relationship' },
];

// users.gender from the person linked to the account
const USER_SOURCES = [
  { table: 'staff',     label: 'staff' },
  { table: 'students',  label: 'students' },
  { table: 'guardians', label: 'guardians', needsGender: true },
];

const hasColumn = async (table, column) => {
  const [[row]] = await sequelize.query(
    `SELECT COUNT(*) AS n FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = :table AND column_name = :column`,
    { replacements: { table, column } }
  );
  return Number(row.n) > 0;
};

const hasTable = async (table) => {
  const [[row]] = await sequelize.query(
    `SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = :table`,
    { replacements: { table } }
  );
  return Number(row.n) > 0;
};

const main = async () => {
  console.log(APPLY ? 'APPLYING changes...\n' : 'DRY RUN: showing what would happen. Nothing is saved.\n');

  // ── 1. Columns ────────────────────────────────────────────────────────────────
  const toAdd = [];
  for (const t of TABLES) {
    if (!(await hasTable(t.table))) { console.log(`table ${t.table} does not exist, skipped`); continue; }
    if (await hasColumn(t.table, 'gender')) console.log(`already there, skipped: ${t.table}.gender`);
    else toAdd.push(t);
  }
  for (const t of toAdd) {
    console.log(`  ALTER TABLE \`${t.table}\` ADD COLUMN \`gender\` ENUM('male','female') NULL DEFAULT NULL AFTER \`${t.after}\`;`);
  }

  // ── 2. What would be filled (works before the columns exist) ──────────────────
  const plan = [];

  // users from linked people
  for (const src of USER_SOURCES) {
    if (!(await hasTable(src.table)) || !(await hasColumn(src.table, 'user_id'))) continue;
    if (src.needsGender && !(await hasColumn(src.table, 'gender')) && !toAdd.some((t) => t.table === src.table)) continue;
    const usersHaveGender = await hasColumn('users', 'gender');
    const srcHasGender = await hasColumn(src.table, 'gender');
    if (!srcHasGender) continue; // guardians get theirs in this run; a second run copies them to users
    const [[row]] = await sequelize.query(
      `SELECT COUNT(*) AS n FROM users u JOIN \`${src.table}\` p ON p.user_id = u.id
       WHERE p.gender IS NOT NULL ${usersHaveGender ? 'AND u.gender IS NULL' : ''}`
    );
    plan.push({ what: `users <- ${src.label}`, rows: Number(row.n) });
  }

  // contacts / guardians from their label
  const relationUpdates = [];
  for (const t of TABLES.filter((x) => x.relation)) {
    if (!(await hasTable(t.table))) continue;
    const genderExists = await hasColumn(t.table, 'gender');
    const [rows] = await sequelize.query(
      `SELECT \`${t.relation}\` AS relation, COUNT(*) AS n FROM \`${t.table}\`
       ${genderExists ? 'WHERE gender IS NULL' : ''} GROUP BY \`${t.relation}\``
    );
    const unknown = [];
    for (const r of rows) {
      const gender = genderFromRelation(r.relation);
      if (gender) relationUpdates.push({ table: t.table, column: t.relation, relation: r.relation, gender, n: Number(r.n) });
      else unknown.push(`${r.relation ?? '(empty)'} x${r.n}`);
    }
    const filled = relationUpdates.filter((u) => u.table === t.table).reduce((s, u) => s + u.n, 0);
    plan.push({ what: `${t.table} <- ${t.relation}`, rows: filled, unknown: unknown.join(', ') || '-' });
  }

  const [[admins]] = await sequelize.query(
    `SELECT COUNT(*) AS n FROM users u
     WHERE NOT EXISTS (SELECT 1 FROM staff s WHERE s.user_id = u.id)
       AND NOT EXISTS (SELECT 1 FROM students st WHERE st.user_id = u.id)`
  );

  console.log('\nGenders that would be filled (only empty ones):');
  console.table(plan);
  console.log(`Login accounts with no linked staff/student (e.g. admin accounts) stay without a title: ${admins.n}`);

  if (!APPLY) {
    console.log('\nDry run only. Run again with --apply to back up and make these changes.');
    await sequelize.close();
    return;
  }

  // ── 3. Apply ──────────────────────────────────────────────────────────────────
  const { file, size } = backup('person-gender');
  console.log(`\nBackup written: ${file} (${size} bytes)`);

  for (const t of toAdd) {
    await sequelize.query(
      `ALTER TABLE \`${t.table}\` ADD COLUMN \`gender\` ENUM('male','female') NULL DEFAULT NULL AFTER \`${t.after}\``
    );
    console.log(`done: ${t.table}.gender column`);
  }

  for (const u of relationUpdates) {
    const [res] = await sequelize.query(
      `UPDATE \`${u.table}\` SET gender = :gender WHERE gender IS NULL AND \`${u.column}\` = :relation`,
      { replacements: { gender: u.gender, relation: u.relation } }
    );
    console.log(`done: ${u.table} "${u.relation}" -> ${u.gender} (${res.affectedRows ?? res} rows)`);
  }

  for (const src of USER_SOURCES) {
    if (!(await hasTable(src.table)) || !(await hasColumn(src.table, 'user_id')) || !(await hasColumn(src.table, 'gender'))) continue;
    const [res] = await sequelize.query(
      `UPDATE users u JOIN \`${src.table}\` p ON p.user_id = u.id
       SET u.gender = p.gender WHERE u.gender IS NULL AND p.gender IS NOT NULL`
    );
    console.log(`done: users <- ${src.label} (${res.affectedRows ?? res} rows)`);
  }

  console.log('\nFinished. Start the backend now.');
  await sequelize.close();
};

main().catch(async (err) => {
  console.error(`\nStopped: ${err.message}\nNothing after this point was changed.`);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
