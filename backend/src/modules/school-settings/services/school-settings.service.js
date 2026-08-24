const { SchoolSettings } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

// ── Get singleton ──────────────────────────────────────────────────────────────

const getSettings = async () => {
  const settings = await SchoolSettings.findByPk(1);
  if (!settings) throw new ApiError(404, 'School settings not found');
  return settings;
};

// ── Update singleton ───────────────────────────────────────────────────────────

const updateSettings = async (data) => {
  const settings = await getSettings();
  await settings.update(data);
  return getSettings();
};

module.exports = { getSettings, updateSettings };
