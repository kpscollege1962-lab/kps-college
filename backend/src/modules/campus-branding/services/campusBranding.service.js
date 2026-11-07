const { Campus } = require('../../../models');
const ApiError = require('../../../utils/ApiError');

const TITLE_COLUMNS = {
  english:  'title_english_url',
  urdu:     'title_urdu_url',
  combined: 'title_combined_url',
};

const titleFor = (campus, variant) => {
  const column = TITLE_COLUMNS[variant];
  return column ? campus.get(column) ?? null : null;
};

// Everything the printed sheets need from a campus, in one small payload.
const getPrintBranding = async (campusId) => {
  const campus = await Campus.findByPk(campusId);
  if (!campus) throw new ApiError(404, 'Campus not found');

  return {
    timetableTitleUrl:  titleFor(campus, campus.get('active_title_variant')),
    assignmentTitleUrl: titleFor(campus, campus.get('assignment_title_variant')),
    watermarkUrl:       campus.get('watermark_url') ?? null,
    footerText:         campus.get('footer_text') || null,
  };
};

module.exports = { getPrintBranding };