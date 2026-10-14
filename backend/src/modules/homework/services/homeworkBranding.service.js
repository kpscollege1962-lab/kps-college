const { Campus } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

const TITLE_COLUMNS = {
  english:  'title_english_url',
  urdu:     'title_urdu_url',
  combined: 'title_combined_url',
};

const getSheetBranding = async (campusId) => {
  const campus = await Campus.findByPk(campusId);
  if (!campus) throw new ApiError(404, 'Campus not found');

  const column = TITLE_COLUMNS[campus.get('assignment_title_variant')];

  return {
    titleUrl: column ? campus.get(column) ?? null : null,
    watermarkUrl: campus.get('watermark_url') ?? null,
  };
};

module.exports = { getSheetBranding };