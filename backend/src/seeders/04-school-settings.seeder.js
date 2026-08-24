const { SchoolSettings } = require('../models');
const deployment = require('../config/deployment');

const seedSchoolSettings = async () => {
  const s = deployment.schoolSettings;

  const [, created] = await SchoolSettings.findOrCreate({
    where:    { id: 1 },
    defaults: {
      id:                        1,
      school_name:               s.schoolName               ?? 'My School',
      timezone:                  s.timezone                 ?? 'Asia/Karachi',
      date_format:               s.dateFormat               ?? 'DD/MM/YYYY',
      currency_code:             s.currencyCode             ?? 'PKR',
      currency_symbol:           s.currencySymbol           ?? '₨',
      currency_position:         s.currencyPosition         ?? 'before',
      academic_year_start_month: s.academicYearStartMonth   ?? 4,
      default_pass_percentage:   s.defaultPassPercentage    ?? 40.00,
      min_attendance_percentage: s.minAttendancePercentage  ?? 75.00,
    },
  });

  if (created) {
    console.log(`  ✓ School settings seeded: ${s.schoolName ?? 'My School'}`);
  } else {
    console.log(`  → School settings already exist, skipping`);
  }
};

module.exports = seedSchoolSettings;
