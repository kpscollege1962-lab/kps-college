/**
 * CASL Ability Factory
 *
 * Called in two distinct modes:
 *
 * MODE 1 — Enforcement (every module route via loadAbility middleware):
 *   defineAbilityFor(user, campusId)
 *   roleId is null. Merges abilities for ALL roles a user holds at the
 *   given campus so enforcement is correct when a user has multiple roles.
 *
 * MODE 2 — Frontend serialization (abilities endpoint only, called directly
 *   from roles.controller):
 *   defineAbilityFor(user, campusId, roleId)
 *   roleId scopes the result to exactly one role — reflecting the single
 *   context the user selected in the frontend. Mixing roles here would
 *   give the user a combined UI that does not match their chosen context.
 *
 * Other key design decisions:
 * - SUPER_ADMIN returns early with manage/all — no other checks run.
 * - All other roles are added incrementally as their modules are built.
 * - campusId comes from req.params (URL) for enforcement, or from req.query
 *   for the abilities endpoint. The factory does not care — it receives a
 *   parsed integer or null.
 * - ability.rules is a plain JSON-serializable array that can be sent to
 *   the frontend to reconstruct the same Ability object client-side.
 * - hasCampusRole: set true only when a campus-scoped role assignment is confirmed
 *   at campusId. Used to gate the base AcademicSession read ability.
 */

const { AbilityBuilder, createMongoAbility } = require('@casl/ability');
const { ROLES } = require('../constants/roles');
const { UserGlobalRole, UserRoleCampus, Role } = require('../models');

const schoolAdminAbilities    = require('./roles/schoolAdmin.abilities');
const campusAdminAbilities    = require('./roles/campusAdmin.abilities');
const principalAbilities      = require('./roles/principal.abilities');
const teacherAbilities        = require('./roles/teacher.abilities');
const examControllerAbilities = require('./roles/examController.abilities');
const accountantAbilities     = require('./roles/accountant.abilities');
const receptionistAbilities   = require('./roles/receptionist.abilities');
const guardianAbilities       = require('./roles/guardian.abilities');
const studentAbilities        = require('./roles/student.abilities');

/**
 * Build and return a CASL Ability for the given user and campus context.
 *
 * @param {{ id: number, username: string, email: string }} user     - Decoded JWT payload
 * @param {number|null} campusId - Integer campus ID, or null for global routes/roles
 * @param {number|null} roleId   - When provided, scopes the ability to this specific role
 *                                 only. Used by the abilities endpoint for frontend
 *                                 serialization. When null (all module routes), abilities
 *                                 for all roles at the campus are merged for enforcement.
 * @returns {Promise<import('@casl/ability').MongoAbility>}
 */
const defineAbilityFor = async (user, campusId, roleId = null) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility); // eslint-disable-line no-unused-vars

  let activeRoleNames = [];
  let hasCampusRole   = false; // true only when user holds a campus-scoped role at campusId

  if (roleId !== null) {
    // ── SERIALIZATION MODE — single role ──────────────────────────────────────
    const role = await Role.findByPk(roleId);
    if (!role) return build();

    if (role.layer === 'global') {
      const assignment = await UserGlobalRole.findOne({
        where: { user_id: user.id, role_id: roleId, is_active: 1 },
      });
      if (assignment) activeRoleNames = [role.name];

    } else {
      const assignment = await UserRoleCampus.findOne({
        where: { user_id: user.id, role_id: roleId, campus_id: campusId, is_active: 1 },
      });
      if (assignment) {
        activeRoleNames = [role.name];
        hasCampusRole   = true;
      }
    }

  } else {
    // ── ENFORCEMENT MODE — merge all applicable roles ─────────────────────────
    const globalAssignments = await UserGlobalRole.findAll({
      where: { user_id: user.id, is_active: 1 },
      include: [{ model: Role, as: 'role' }],
    });
    activeRoleNames = globalAssignments.map((a) => a.role.name);

    if (campusId) {
      const campusAssignments = await UserRoleCampus.findAll({
        where: { user_id: user.id, campus_id: campusId, is_active: 1 },
        include: [{ model: Role, as: 'role' }],
      });
      const campusRoleNames = campusAssignments.map((a) => a.role.name);
      if (campusRoleNames.length > 0) hasCampusRole = true;
      activeRoleNames = [...activeRoleNames, ...campusRoleNames];
    }
  }

  // ── Step 2: Apply abilities per role ──────────────────────────────────────────

  if (activeRoleNames.includes(ROLES.SUPER_ADMIN)) {
    can('manage', 'all');
    return build();
  }

  if (activeRoleNames.includes(ROLES.SCHOOL_ADMIN))     schoolAdminAbilities(can, cannot);
  if (activeRoleNames.includes(ROLES.CAMPUS_ADMIN))     campusAdminAbilities(can, cannot);
  if (activeRoleNames.includes(ROLES.PRINCIPAL))        principalAbilities(can, cannot);
  if (activeRoleNames.includes(ROLES.TEACHER))          teacherAbilities(can, cannot);
  if (activeRoleNames.includes(ROLES.EXAM_CONTROLLER))  examControllerAbilities(can, cannot);
  if (activeRoleNames.includes(ROLES.ACCOUNTANT))       accountantAbilities(can, cannot);
  if (activeRoleNames.includes(ROLES.RECEPTIONIST))     receptionistAbilities(can, cannot);
  if (activeRoleNames.includes(ROLES.GUARDIAN))         guardianAbilities(can, cannot);
  if (activeRoleNames.includes(ROLES.STUDENT))          studentAbilities(can, cannot);

  return build();
};

module.exports = { defineAbilityFor };
