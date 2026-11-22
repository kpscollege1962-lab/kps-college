/**
 * Timetable clean-up: assembly slots and missing break sides.
 *
 *   node src/scripts/fixTimetableSlots.js            -> DRY RUN (changes nothing at all)
 *   node src/scripts/fixTimetableSlots.js --apply    -> full backup, then the clean-up
 *
 * 1. Assembly is not a teaching period (the app now refuses to put anything in it). Empty slot
 *    rows left in assembly periods (no label, subject, teacher or break) are deleted.
 *    Assembly rows that DO hold something are only listed, never deleted: check them by hand.
 * 2. Classes with NO break side in a period that has a break are listed (nothing is changed):
 *    set them in the timetable with Manage breaks (the cup icon), which now refuses to save
 *    until every class has Before or After.
 *
 * Safe to run twice.
 */
require('dotenv').config();
const { sequelize } = require('../models');
const { backup } = require('./lib/dbBackup');

const APPLY = process.argv.includes('--apply');

const EMPTY = `s.label IS NULL AND s.subject_id_1 IS NULL AND s.subject_id_2 IS NULL
  AND s.staff_id_1 IS NULL AND s.staff_id_2 IS NULL AND s.break_position IS NULL`;

const main = async () => {
  console.log(APPLY ? 'APPLYING changes...\n' : 'DRY RUN: showing what would happen. Nothing is saved.\n');

  const [emptyAssembly] = await sequelize.query(
    `SELECT s.id, p.campus_id, cg.name AS class_name, se.name AS section_name
     FROM timetable_slots s
     JOIN timetable_periods p ON p.id = s.period_id
     JOIN class_groups cg ON cg.id = s.class_group_id
     LEFT JOIN sections se ON se.id = s.section_id
     WHERE p.is_assembly = 1 AND ${EMPTY}
     ORDER BY p.campus_id, cg.level`
  );
  const [filledAssembly] = await sequelize.query(
    `SELECT s.id, p.campus_id, cg.name AS class_name, se.name AS section_name, s.label, s.break_position
     FROM timetable_slots s
     JOIN timetable_periods p ON p.id = s.period_id
     JOIN class_groups cg ON cg.id = s.class_group_id
     LEFT JOIN sections se ON se.id = s.section_id
     WHERE p.is_assembly = 1 AND NOT (${EMPTY})`
  );

  // Classes (with any slot in the campus timetable) that have no break side in a break period.
  const [missingBreaks] = await sequelize.query(
    `SELECT p.campus_id, p.period_number, cg.name AS class_name, se.name AS section_name
     FROM timetable_periods p
     JOIN (SELECT DISTINCT period_id FROM timetable_period_timings WHERE break_duration > 0) b ON b.period_id = p.id
     JOIN (SELECT DISTINCT s2.class_group_id, s2.section_id, p2.campus_id
           FROM timetable_slots s2 JOIN timetable_periods p2 ON p2.id = s2.period_id) cls
       ON cls.campus_id = p.campus_id
     JOIN class_groups cg ON cg.id = cls.class_group_id
     LEFT JOIN sections se ON se.id = cls.section_id
     LEFT JOIN timetable_slots s
       ON s.period_id = p.id AND s.class_group_id = cls.class_group_id AND s.section_id = cls.section_id
     WHERE p.is_assembly = 0 AND (s.id IS NULL OR s.break_position IS NULL)
     ORDER BY p.campus_id, p.period_number, cg.level`
  );

  console.log(`1. Empty slot rows in assembly periods, to delete: ${emptyAssembly.length}`);
  if (emptyAssembly.length) console.table(emptyAssembly);
  console.log(`   Assembly rows that hold something (NOT deleted, check by hand): ${filledAssembly.length}`);
  if (filledAssembly.length) console.table(filledAssembly);

  console.log(`\n2. Classes with no break side in a break period (not changed): ${missingBreaks.length}`);
  if (missingBreaks.length) {
    console.table(missingBreaks);
    console.log('   Set them in Timetable -> Manage breaks (cup icon) on that period.');
  }

  if (!APPLY) {
    console.log('\nDry run only. Run again with --apply to back up and delete the empty assembly rows.');
    await sequelize.close();
    return;
  }
  if (!emptyAssembly.length) {
    console.log('\nNothing to delete.');
    await sequelize.close();
    return;
  }

  const { file, size } = backup('timetable-cleanup');
  console.log(`\nBackup written: ${file} (${size} bytes)`);
  const [res] = await sequelize.query(
    `DELETE s FROM timetable_slots s JOIN timetable_periods p ON p.id = s.period_id
     WHERE p.is_assembly = 1 AND ${EMPTY}`
  );
  console.log(`done: deleted ${res.affectedRows ?? 0} empty assembly rows\n\nFinished.`);
  await sequelize.close();
};

main().catch(async (err) => {
  console.error(`\nStopped: ${err.message}\nNothing after this point was changed.`);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
