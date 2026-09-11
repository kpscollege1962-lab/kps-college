const bcrypt = require('bcryptjs');
const { Student, Enrollment, AcademicSession, Role, UserRoleCampus } = require('../../../models');
const { ROLES } = require('../../../constants/roles');
const {
  getUserByIdentifier,
  getUserById,
  getUserProfile,
  createUser,
  updateLastLogin,
  getUserRoleContexts,
} = require('../../users/services/users.service');
const { generateAccessToken, generateRefreshToken } = require('../../../utils/jwt');
const ApiError = require('../../../utils/ApiError');

// ── Internal helper ────────────────────────────────────────────────────────────
// Formats a DATEONLY value (returned by Sequelize as 'YYYY-MM-DD') into DDMMYYYY,
// matching the login credential format.
const toDdmmyyyy = (dateOnlyString) => {
  const [year, month, day] = dateOnlyString.split('-');
  return `${day}${month}${year}`;
};

const issueSession = async (user) => {
  await updateLastLogin(user.id);

  const payload = { id: user.id, email: user.email, username: user.username };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user.id });

  const [profile, contexts] = await Promise.all([
    getUserProfile(user.id),
    getUserRoleContexts(user.id),
  ]);

  return { user: profile, contexts, accessToken, refreshToken };
};

// ── Login ──────────────────────────────────────────────────────────────────────
// Accepts email or username as the login identifier.
const login = async ({ login, password }) => {
  const user = await getUserByIdentifier(login);

  if (!user) throw new ApiError(401, 'Invalid credentials');
  if (!user.is_active) throw new ApiError(403, 'Account is deactivated');

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  return issueSession(user);
};

// ── Student Login ────────────────────────────────────────────────────────────
// Credential = GR Number (username) + DOB in DDMMYYYY (password).
// First successful login lazily provisions the User account, links it to the
// Student record, and grants a campus-scoped STUDENT role at whichever campus
// the student is actively enrolled in for the school's current active session.
const studentLogin = async ({ grNo, dob }) => {
  const student = await Student.findOne({ where: { gr_no: grNo } });
  if (!student) throw new ApiError(401, 'Invalid credentials');
  if (!student.date_of_birth) throw new ApiError(401, 'Invalid credentials');

  const expectedDob = toDdmmyyyy(student.date_of_birth);
  if (expectedDob !== dob) throw new ApiError(401, 'Invalid credentials');

  // ── First login: provision the account now ───────────────────────────────
  if (!student.user_id) {
    const activeSession = await AcademicSession.findOne({ where: { status: 'active' } });
    if (!activeSession) throw new ApiError(500, 'No active academic session is configured');

    const enrollment = await Enrollment.findOne({
      where: { student_id: student.id, session_id: activeSession.id, status: 'active' },
    });
    if (!enrollment) throw new ApiError(403, 'You are not actively enrolled in the current session');

    const [firstName, ...rest] = student.full_name.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName; // fallback if full_name has no space

    const newUser = await createUser({
      first_name: firstName,
      last_name: lastName,
      username: student.gr_no,
      email: null,
      password: dob,
    });

    const studentRole = await Role.findOne({ where: { name: ROLES.STUDENT, layer: 'campus' } });
    if (!studentRole) throw new ApiError(500, 'STUDENT role is not configured');

    await UserRoleCampus.create({
      user_id: newUser.id,
      role_id: studentRole.id,
      campus_id: enrollment.campus_id,
      is_active: 1,
    });
    await student.update({ user_id: newUser.id });

    return issueSession(newUser);
  }

  // ── Returning student: normal password check ──────────────────────────────
  const userWithHash = await getUserByIdentifier(student.gr_no);
  if (!userWithHash) throw new ApiError(401, 'Invalid credentials');
  if (!userWithHash.is_active) throw new ApiError(403, 'Account is deactivated');

  const isMatch = await bcrypt.compare(dob, userWithHash.password_hash);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  return issueSession(userWithHash);
};

module.exports = { login, studentLogin };