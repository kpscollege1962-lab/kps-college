/**
 * Stores the assembly as its own period instead of "period number 1".
 *
 *   node src/scripts/migratePeriodNumbering.js            -> DRY RUN (changes nothing at all)
 *   node src/scripts/migratePeriodNumbering.js --apply    -> does it
 *
 * Before:  stored numbers are 1, 2, 3...; the one stored as 1 is the assembly and every screen
 *          shows the others as P(number - 1).
 * After:   timetable_periods has an is_assembly column. The assembly row has is_assembly = 1 and
 *          number 0; the teaching periods are 1, 2, 3... so the stored number IS the P-label.
 *
 * What it does, for every campus: every period's number goes down by one, and the period that was
 * number 1 becomes the assembly. So nothing changes on screen. A campus with no period numbered 1
 * simply gets no assembly (its periods keep the label the timetable page shows today).
 *
 * Slots and timings belong to a period by id, so they are not touched.
 * Safe to run twice: once the is_assembly column exists it does nothing.
 */
require('dotenv').config();
const { sequelize } = require('../models');

const APPLY = process.argv.includes('--apply');
const STAGING = 1000; 

// Pure: what would change. rows = [{ id, campus_id, period_number }]
const planMigration = (rows) => {
  const byCampus = new Map();
  for (const row of rows) {
    if (!byCampus.has(row.campus_id)) byCampus.set(row.campus_id, []);
    byCampus.get(row.campus_id).push({ ...row, period_number: Number(row.period_number) });
  }

  return [...byCampus]
    .sort(([a], [b]) => a - b)
    .map(([campusId, periods]) => {
      periods.sort((a, b) => a.period_number - b.period_number);
      if (periods.some((p) => p.period_number < 1)) {
        throw new Error(`Campus ${campusId} has a period numbered below 1, so it does not look like the old layout`);
      }
      if (periods.some((p) => p.period_number >= STAGING)) {
        throw new Error(`Campus ${campusId} has a period numbered ${STAGING} or more`);
      }
      return {
        campusId,
        before: periods.map((p) => p.period_number),
        after: periods.map((p) => p.period_number - 1),
        assemblyId: periods.find((p) => p.period_number === 1)?.id ?? null,
      };
    });
};

const main = async () => {
  console.log(APPLY ? 'APPLYING changes...\n' : 'DRY RUN: showing what would happen. Nothing is saved.\n');

  const [[col]] = await sequelize.query(
    `SELECT COUNT(*) AS n FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'timetable_periods' AND column_name = 'is_assembly'`
  );
  if (Number(col.n) > 0) {
    console.log('The is_assembly column already exists, so this was already done. Nothing to do.');
    const [rows] = await sequelize.query(
      `SELECT campus_id, id, period_number, is_assembly FROM timetable_periods ORDER BY campus_id, period_number`
    );
    console.table(rows);
    await sequelize.close();
    return;
  }

  const [rows] = await sequelize.query(`SELECT id, campus_id, period_number FROM timetable_periods`);
  const plan = planMigration(rows);

  for (const c of plan) {
    console.log(`campus ${c.campusId}: stored ${c.before.join(', ')}  ->  ${c.after.join(', ')}`);
    console.log(
      c.assemblyId
        ? `    period id ${c.assemblyId} (was number 1) becomes the assembly (number 0)`
        : '    no period was number 1, so this campus gets no assembly'
    );
  }
  if (!plan.length) console.log('There are no periods yet. Only the column will be added.');

  if (!APPLY) {
    console.log('\nThis was a dry run. To make the changes, run the same command with --apply added.');
    await sequelize.close();
    return;
  }

  // Adding a column cannot be rolled back, so if the renumbering fails the column is removed
  // again and the script can simply be run once more.
  await sequelize.query(
    `ALTER TABLE timetable_periods ADD COLUMN is_assembly TINYINT(1) NOT NULL DEFAULT 0 AFTER period_number`
  );
  const transaction = await sequelize.transaction();
  try {
    for (const c of plan) {
      const replacements = { campusId: c.campusId, staging: STAGING };
      // park every number above STAGING first, then bring it down: no clash on the unique key
      await sequelize.query(
        `UPDATE timetable_periods SET period_number = period_number + :staging WHERE campus_id = :campusId`,
        { transaction, replacements }
      );
      await sequelize.query(
        `UPDATE timetable_periods SET period_number = period_number - :staging - 1 WHERE campus_id = :campusId`,
        { transaction, replacements }
      );
      if (c.assemblyId) {
        await sequelize.query(
          `UPDATE timetable_periods SET is_assembly = 1 WHERE id = :id`,
          { transaction, replacements: { id: c.assemblyId } }
        );
      }
    }
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    await sequelize.query(`ALTER TABLE timetable_periods DROP COLUMN is_assembly`);
    console.error('\nFailed. Nothing was changed:', err.message);
    process.exit(1);
  }

  const [after] = await sequelize.query(
    `SELECT campus_id, id, period_number, is_assembly FROM timetable_periods ORDER BY campus_id, period_number`
  );
  console.log('\nPeriods after this run:');
  console.table(after);
  console.log('Done.');
  await sequelize.close();
};

if (require.main === module) main();
module.exports = { planMigration };