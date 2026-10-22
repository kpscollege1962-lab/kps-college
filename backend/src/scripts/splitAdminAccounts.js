/**
 * Gives every admin role its own account, so the workspace switcher is no longer needed.
 *
 *   node src/scripts/splitAdminAccounts.js                  -> DRY RUN (changes nothing)
 *   node src/scripts/splitAdminAccounts.js --apply          -> does it
 *
 * Passwords for the NEW accounts (pick one; the default is a random one per account):
 *   --password=Temp@12345      same temporary password for every new account
 *   --same-password            new accounts reuse the password of the account they were split from
 *
 * Later, for a campus that has no campus admin yet (e.g. the female campus):
 *   node src/scripts/splitAdminAccounts.js --create-campus-admin=2 --apply
 *
 * Rules:
 *  - An account holding more than one of SUPER_ADMIN / SCHOOL_ADMIN / CAMPUS_ADMIN keeps the
 *    first of them (in that order); every other one moves to a new account of its own.
 *  - Other roles (principal, teacher, ...) are never touched.
 *  - Nothing is deleted. Everything runs in one transaction.
 */
require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../constants/roles');
const {
  sequelize, User, Role, Campus, UserGlobalRole, UserRoleCampus,
} = require('../models');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
const ADMIN_PRIORITY = [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.CAMPUS_ADMIN];

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const SAME_PASSWORD = args.includes('--same-password');
const argValue = (name) => {
  const hit = args.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1) : undefined;
};
const FIXED_PASSWORD = argValue('--password');
const CREATE_FOR_CAMPUS = argValue('--create-campus-admin');

const slugify = (text) =>
  String(text ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// 12 characters, no look-alikes (0/O, 1/l/I)
const randomPassword = (length = 12) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from(crypto.randomBytes(length), (b) => alphabet[b % alphabet.length]).join('');
};

const created = []; 

const uniqueUsername = async (base, transaction) => {
  let candidate = base;
  for (let n = 2; ; n += 1) {
    const exists = await User.findOne({ where: { username: candidate }, paranoid: false, transaction });
    if (!exists) return candidate;
    candidate = `${base}-${n}`;
  }
};

const passwordFor = async (originalUserId, transaction) => {
  if (SAME_PASSWORD) {
    const original = await User.findByPk(originalUserId, { paranoid: false, transaction });
    return { hash: original.password_hash, shown: `(same as "${original.username}")` };
  }
  const plain = FIXED_PASSWORD ?? randomPassword();
  return { hash: await bcrypt.hash(plain, SALT_ROUNDS), shown: plain };
};

const createAccount = async ({ base, first, last, roleLabel }, originalUserId, transaction) => {
  const username = await uniqueUsername(base, transaction);
  const { hash, shown } = await passwordFor(originalUserId, transaction);

  const user = await User.create({
    first_name: String(first).slice(0, 80),
    last_name: last,
    username,
    email: null,
    password_hash: hash,
    is_active: 1,
  }, { transaction });

  created.push({ username, role: roleLabel, password: shown });
  return user;
};

const accountSpecFor = (a) => {
  if (a.kind === 'campus') {
    const slug = slugify(a.campus.name);
    return {
      base: slug ? `${slug}-admin` : `campus-${a.campus.id}-admin`,
      first: a.campus.name,
      last: 'Admin',
      roleLabel: `CAMPUS_ADMIN, ${a.campus.name}`,
    };
  }
  if (a.roleName === ROLES.SCHOOL_ADMIN) {
    return { base: 'school-admin', first: 'School', last: 'Admin', roleLabel: 'SCHOOL_ADMIN' };
  }
  return { base: 'super-admin-2', first: 'Super', last: 'Admin', roleLabel: 'SUPER_ADMIN' };
};

const labelOf = (a) => (a.kind === 'campus' ? `${a.roleName} (${a.campus.name})` : a.roleName);
const rankOf = (a) => ADMIN_PRIORITY.indexOf(a.roleName) * 1e6 + (a.campus?.id ?? 0);

const loadAssignments = async (transaction) => {
  const [globalRows, campusRows] = await Promise.all([
    UserGlobalRole.findAll({
      where: { is_active: 1 },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'layer'] }],
      transaction,
    }),
    UserRoleCampus.findAll({
      where: { is_active: 1 },
      include: [
        { model: Role, as: 'role', attributes: ['id', 'name', 'layer'] },
        { model: Campus, as: 'campus', attributes: ['id', 'name'] },
      ],
      transaction,
    }),
  ]);

  return [
    ...globalRows.map((row) => ({ kind: 'global', userId: row.user_id, roleName: row.role.name, row })),
    ...campusRows.map((row) => ({ kind: 'campus', userId: row.user_id, roleName: row.role.name, campus: row.campus, row })),
  ];
};

const usernamesById = async (ids, transaction) => {
  if (!ids.length) return new Map();
  const users = await User.findAll({ where: { id: ids }, attributes: ['id', 'username'], paranoid: false, transaction });
  return new Map(users.map((u) => [u.id, u.username]));
};

// ── Mode 1: split accounts that hold several admin roles ───────────────────────
const splitAccounts = async (transaction) => {
  const all = await loadAssignments(transaction);

  const byUser = new Map();
  for (const a of all) {
    if (!byUser.has(a.userId)) byUser.set(a.userId, { admin: [], other: [] });
    byUser.get(a.userId)[ADMIN_PRIORITY.includes(a.roleName) ? 'admin' : 'other'].push(a);
  }

  const nameOf = await usernamesById([...byUser.keys()], transaction);

  let moved = 0;
  for (const [userId, { admin, other }] of byUser) {
    if (admin.length < 2) continue;

    admin.sort((x, y) => rankOf(x) - rankOf(y));
    const [keep, ...move] = admin;

    console.log(`Account "${nameOf.get(userId)}" (id ${userId}) keeps: ${labelOf(keep)}`);
    if (other.length) console.log(`  also holds other roles, left unchanged: ${other.map(labelOf).join(', ')}`);

    for (const a of move) {
      const spec = accountSpecFor(a);
      const user = await createAccount(spec, userId, transaction);
      await a.row.update({ user_id: user.id }, { transaction });
      console.log(`  + new account "${user.username}" gets ${spec.roleLabel}`);
      moved += 1;
    }
  }

  if (!moved) console.log('No account holds more than one admin role. Nothing to split.');
};

// ── Mode 2: brand-new campus admin account for a campus ────────────────────────
const createCampusAdmin = async (campusId, transaction) => {
  if (!Number.isInteger(campusId)) throw new Error('--create-campus-admin needs a campus id, e.g. --create-campus-admin=2');
  if (SAME_PASSWORD) throw new Error('--same-password only applies when splitting existing accounts. Use --password=... or leave it out.');

  const campus = await Campus.findByPk(campusId, { transaction });
  if (!campus) throw new Error(`No campus with id ${campusId}`);

  const role = await Role.findOne({ where: { name: ROLES.CAMPUS_ADMIN }, transaction });
  if (!role) throw new Error('The CAMPUS_ADMIN role is not configured');

  const existing = await UserRoleCampus.count({
    where: { role_id: role.id, campus_id: campus.id, is_active: 1 },
    transaction,
  });
  if (existing) {
    console.log(`${campus.name} already has a campus admin account. Nothing created.`);
    return;
  }

  const spec = accountSpecFor({ kind: 'campus', campus });
  const user = await createAccount(spec, undefined, transaction);
  await UserRoleCampus.create(
    { user_id: user.id, role_id: role.id, campus_id: campus.id, is_active: 1 },
    { transaction }
  );
  console.log(`+ new account "${user.username}" gets CAMPUS_ADMIN at ${campus.name}`);
};

// ── Who holds each admin role once this run is done ────────────────────────────
const printOverview = async (transaction) => {
  const all = (await loadAssignments(transaction)).filter((a) => ADMIN_PRIORITY.includes(a.roleName));
  const nameOf = await usernamesById([...new Set(all.map((a) => a.userId))], transaction);

  const holders = new Map();
  const add = (label, username) => holders.set(label, [...(holders.get(label) ?? []), username]);
  for (const a of all) add(a.kind === 'campus' ? `CAMPUS_ADMIN, ${a.campus.name}` : a.roleName, nameOf.get(a.userId));

  const campuses = await Campus.findAll({ attributes: ['id', 'name'], order: [['id', 'ASC']], transaction });
  for (const c of campuses) {
    const label = `CAMPUS_ADMIN, ${c.name}`;
    if (!holders.has(label)) holders.set(label, ['none yet']);
  }

  console.log('\nAdmin accounts after this run:');
  for (const [label, names] of holders) console.log(`  ${label}: ${names.join(', ')}`);
};

const main = async () => {
  if (FIXED_PASSWORD !== undefined && FIXED_PASSWORD.length < 8) {
    console.error('--password must be at least 8 characters.');
    process.exit(1);
  }
  if (FIXED_PASSWORD !== undefined && SAME_PASSWORD) {
    console.error('Use either --password=... or --same-password, not both.');
    process.exit(1);
  }

  const transaction = await sequelize.transaction();
  try {
    console.log(APPLY ? 'APPLYING changes...\n' : 'DRY RUN: showing what would happen. Nothing is saved.\n');

    if (CREATE_FOR_CAMPUS !== undefined) await createCampusAdmin(parseInt(CREATE_FOR_CAMPUS, 10), transaction);
    else await splitAccounts(transaction);

    await printOverview(transaction);

    if (APPLY) await transaction.commit();
    else await transaction.rollback();
  } catch (err) {
    await transaction.rollback();
    console.error('\nFailed. Nothing was changed:', err.message);
    process.exit(1);
  }

  if (!APPLY) {
    console.log('\nThis was a dry run. To make the changes, run the same command with --apply added.');
  } else if (created.length) {
    console.log('\nNew accounts. Copy the passwords now, they cannot be shown again:\n');
    console.table(created);
  }
  process.exit(0);
};

main();