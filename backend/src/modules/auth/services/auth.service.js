const bcrypt = require('bcryptjs');
const { Student, Staff, StaffPosting, Enrollment, AcademicSession, Role, UserRoleCampus } = require('../../../models');
const { ROLES } = require('../../../constants/roles');
const {
  getUserByIdentifier,
  createUser,
  updateLastLogin,
  getUserProfile,
  getUserRoleContexts,
} = require('../../users/services/users.service');
const { generateAccessToken, generateRefreshToken } = require('../../../utils/jwt');
const ApiError = require('../../../utils/ApiError');

// ── Internal helpers ───────────────────────────────────────────────────────────
const toDdmmyyyy = (dateOnlyString) => {
  const [year, month, day] = dateOnlyString.split('-');
  return `${day}${month}${year}`;
};

const splitFullName = (fullName) => {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') || firstName };
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

// ── First-login provisioning: Student ─────────────────────────────────────────
const provisionStudent = async (student, dob) => {
  const activeSession = await AcademicSession.findOne({ where: { status: 'active' } });
  if (!activeSession) throw new ApiError(500, 'No active academic session is configured');

  const enrollment = await Enrollment.findOne({
    where: { student_id: student.id, session_id: activeSession.id, status: 'active' },
  });
  if (!enrollment) throw new ApiError(403, 'You are not actively enrolled in the current session');

  const { firstName, lastName } = splitFullName(student.full_name);
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
};

// ── First-login provisioning: Teacher ─────────────────────────────────────────
const provisionTeacher = async (staff, dob) => {
  const activePostings = await StaffPosting.findAll({
    where: { staff_id: staff.id, is_active: 1 },
  });
  if (!activePostings.length) {
    throw new ApiError(403, 'You do not have an active posting at any campus');
  }

  const { firstName, lastName } = splitFullName(staff.full_name);
  const newUser = await createUser({
    first_name: firstName,
    last_name: lastName,
    username: staff.cnic,
    email: staff.email || null,
    password: dob,
  });

  const teacherRole = await Role.findOne({ where: { name: ROLES.TEACHER, layer: 'campus' } });
  if (!teacherRole) throw new ApiError(500, 'TEACHER role is not configured');

  await UserRoleCampus.bulkCreate(
    activePostings.map((posting) => ({
      user_id: newUser.id,
      role_id: teacherRole.id,
      campus_id: posting.campus_id,
      is_active: 1,
    }))
  );
  await staff.update({ user_id: newUser.id });

  return issueSession(newUser);
};

// ── Unified Login ──────────────────────────────────────────────────────────────
// Single entry point for staff/admin (username or email), returning students
// (username = GR No by then), returning teachers (username = CNIC by then),
// and first-time students/teachers (identified by GR No / CNIC directly,
// since they have no User account yet).
const login = async ({ login, password }) => {
  // 1) Existing User account — covers staff/admin AND already-provisioned
  //    students/teachers, since their username equals their GR No / CNIC.
  const existingUser = await getUserByIdentifier(login);
  if (existingUser) {
    if (!existingUser.is_active) throw new ApiError(403, 'Account is deactivated');
    const isMatch = await bcrypt.compare(password, existingUser.password_hash);
    if (!isMatch) throw new ApiError(401, 'Invalid credentials');
    return issueSession(existingUser);
  }

  // 2) First-time student login — identifier matches a GR No with no linked account yet.
  const student = await Student.findOne({ where: { gr_no: login } });
  if (student && !student.user_id) {
    if (!student.date_of_birth) throw new ApiError(401, 'Invalid credentials');
    if (!/^\d{8}$/.test(password)) throw new ApiError(401, 'Invalid credentials');
    if (toDdmmyyyy(student.date_of_birth) !== password) throw new ApiError(401, 'Invalid credentials');
    return provisionStudent(student, password);
  }

  // 3) First-time teacher login — identifier matches a CNIC with no linked account yet.
  const staff = await Staff.findOne({ where: { cnic: login } });
  if (staff && !staff.user_id) {
    if (!staff.date_of_birth) throw new ApiError(401, 'Invalid credentials');
    if (!/^\d{8}$/.test(password)) throw new ApiError(401, 'Invalid credentials');
    if (toDdmmyyyy(staff.date_of_birth) !== password) throw new ApiError(401, 'Invalid credentials');
    return provisionTeacher(staff, password);
  }

  throw new ApiError(401, 'Invalid credentials');
};

module.exports = { login };