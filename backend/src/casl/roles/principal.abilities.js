module.exports = (can, _cannot) => {
  // Teachers' assignments at this campus: view and proformas only.
  can('read', 'HomeworkOverview');
  // The daily rota (arrangement for absent teachers): view only.
  can('read', 'Rota');
};
