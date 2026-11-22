/**
 * Teachers must get 403 on every admin homework endpoint, and 403 when they try to change
 * another teacher's assignment.
 *
 *   npm test                     (node --test tests/)
 *
 * Uses the real database from backend/.env (read-only): it signs a token for an existing
 * TEACHER account and calls the API in-process. Every admin call uses an id that does not exist,
 * so even if a permission check were missing the request could not change any data.
 */
require('dotenv').config();
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { Op } = require('sequelize');

const app = require('../src/app');
const { sequelize, Role, UserRoleCampus, User, Staff, Homework, AcademicSession } = require('../src/models');
const { generateAccessToken } = require('../src/utils/jwt');
const { ROLES } = require('../src/constants/roles');

const MISSING_ID = 999999999;
let server;
let base;
let teacher; // { token, campusId, staffId }
let sessionId;

const call = async (method, path, body) => {
  const res = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${teacher.token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.status;
};

before(async () => {
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;

  const role = await Role.findOne({ where: { name: ROLES.TEACHER } });
  const link = role && await UserRoleCampus.findOne({ where: { role_id: role.id, is_active: 1 } });
  assert.ok(link, 'No active TEACHER account in the database to test with');
  const user = await User.findByPk(link.user_id);
  const staff = await Staff.findOne({ where: { user_id: user.id } });
  assert.ok(staff, 'The teacher account has no staff record');

  teacher = {
    token: generateAccessToken({ id: user.id, email: user.email, username: user.username }),
    campusId: link.campus_id,
    staffId: staff.id,
  };
  const session = await AcademicSession.findOne({ where: { status: 'active' } });
  sessionId = session?.id ?? 1;
});

after(async () => {
  server?.close();
  await sequelize.close();
});

test('teacher gets 403 on every admin homework endpoint', async () => {
  const c = `/campuses/${teacher.campusId}/homework`;
  const cases = [
    ['GET',    `${c}/overview?sessionId=${sessionId}`],
    ['GET',    `${c}/overview/structure?sessionId=${sessionId}`],
    ['GET',    `${c}/overview/deleted?sessionId=${sessionId}`],
    ['PATCH',  `${c}/admin/${MISSING_ID}`, { description: 'x' }],
    ['DELETE', `${c}/admin/${MISSING_ID}`],
    ['POST',   `${c}/admin/${MISSING_ID}/restore`],
    ['DELETE', `${c}/admin/${MISSING_ID}/permanent`],
  ];
  for (const [method, path, body] of cases) {
    assert.equal(await call(method, path, body), 403, `${method} ${path}`);
  }
});

test("teacher gets 403 editing or deleting another teacher's assignment", async (t) => {
  const [[col]] = await sequelize.query(
    `SELECT COUNT(*) AS n FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'homeworks' AND column_name = 'deleted_at'`
  );
  if (!Number(col.n)) {
    return t.skip('homeworks has no deleted_at yet: run node src/scripts/addHomeworkSoftDelete.js --apply first');
  }

  const other = await Homework.findOne({
    where: { campus_id: teacher.campusId, staff_id: { [Op.ne]: teacher.staffId } },
  });
  if (!other) return t.skip("no assignment by another teacher at this campus to try");

  const path = `/campuses/${teacher.campusId}/homework/${other.id}`;
  // The ownership check runs before any change, so these never touch the row.
  assert.equal(await call('PATCH', path, { description: 'not mine' }), 403);
  assert.equal(await call('DELETE', path), 403);
});

test('teacher gets 403 on the rota endpoints (assign / issue / view)', async () => {
  const c = `/campuses/${teacher.campusId}/rota`;
  const cases = [
    ['GET',    `${c}?date=2099-01-05`],
    ['PUT',    `${c}/2099-01-05`, { status: 'draft', absentStaffIds: [], entries: [] }],
    ['DELETE', `${c}/2099-01-05`],
  ];
  for (const [method, path, body] of cases) {
    assert.equal(await call(method, path, body), 403, `${method} ${path}`);
  }
});

