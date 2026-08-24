const { CampusSettings, SchoolSettings, Campus } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

// ── Safety net: get or create the settings row for a campus ───────────────────

const ensureExists = async (campusId) => {
  const [instance] = await CampusSettings.findOrCreate({
    where: { campus_id: campusId },
    defaults: { campus_id: campusId },
  });
  return instance;
};

// ── Get raw campus settings (campus existence verified) ───────────────────────

const getRaw = async (campusId) => {
  const campus = await Campus.findByPk(campusId);
  if (!campus) throw new ApiError(404, 'Campus not found');
  return ensureExists(campusId);
};

// ── Resolve settings with school_settings fallback ────────────────────────────

const resolveSettings = async (campusId) => {
  const [raw, school] = await Promise.all([
    getRaw(campusId),
    SchoolSettings.findByPk(1),
  ]);

  return {
    // Branding — campus only
    logo_url:                  raw.logo_url,
    tagline:                   raw.tagline,
    // Academic defaults — fall back to school_settings
    academic_year_start_month: raw.academic_year_start_month ?? school.academic_year_start_month,
    default_pass_percentage:   raw.default_pass_percentage   ?? school.default_pass_percentage,
    min_attendance_percentage: raw.min_attendance_percentage ?? school.min_attendance_percentage,
    // Operational — campus only, no school equivalent
    working_days:              raw.working_days,
    school_start_time:         raw.school_start_time,
    school_end_time:           raw.school_end_time,
    late_arrival_minutes:      raw.late_arrival_minutes,
    max_students_per_section:  raw.max_students_per_section,
  };
};

// ── Update campus settings ────────────────────────────────────────────────────

const updateSettings = async (campusId, data) => {
  const instance = await getRaw(campusId);
  await instance.update(data);
  return resolveSettings(campusId);
};

module.exports = { ensureExists, getRaw, resolveSettings, updateSettings };
