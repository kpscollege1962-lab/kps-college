const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const {
  sequelize, User, Staff, StaffPhone, StaffQualification, StaffPosting, Campus,
  Student, StudentContact, Enrollment, ClassGroup, Section, AcademicSession,
} = require('../../../models');
const ApiError = require('../../../utils/ApiError');
const { uploadBufferToCloudinary } = require('../../../utils/cloudinaryUpload');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PHOTO_FOLDER = 'users/photos';

// Everything here is for the signed-in account only: the person is always found from
// req.user.id, never from anything the client sends.

const getMyUser = async (userId) => {
  const user = await User.findByPk(userId, { attributes: { exclude: ['password_hash'] } });
  if (!user) throw new ApiError(404, 'Your account was not found');
  return user;
};

const findMyStaff = (userId, transaction) =>
  Staff.findOne({
    where: { user_id: userId },
    include: [
      { model: StaffPhone, as: 'phones' },
      { model: StaffQualification, as: 'qualifications' },
      {
        model: StaffPosting, as: 'postings', required: false, where: { is_active: 1 },
        include: [{ model: Campus, as: 'campus', attributes: ['id', 'name'] }],
      },
    ],
    order: [[{ model: StaffPhone, as: 'phones' }, 'is_primary', 'DESC']],
    transaction,
  });

const findMyStudent = (userId) =>
  Student.findOne({
    where: { user_id: userId },
    include: [
      { model: StudentContact, as: 'contacts' },
      {
        model: Enrollment, as: 'enrollments', required: false, where: { status: 'active' },
        include: [
          { model: ClassGroup, as: 'classGroup', attributes: ['id', 'name', 'level'] },
          { model: Section, as: 'section', attributes: ['id', 'name'] },
          { model: AcademicSession, as: 'session', attributes: ['id', 'name'] },
        ],
      },
    ],
    order: [[{ model: StudentContact, as: 'contacts' }, 'is_primary', 'DESC']],
  });

// ── My Profile: the account plus the staff or student record behind it (read-only) ──
const getMyProfile = async (userId) => {
  const [user, staff, student] = await Promise.all([getMyUser(userId), findMyStaff(userId), findMyStudent(userId)]);
  return { user, staff, student };
};

// ── Settings: email and phone ───────────────────────────────────────────────────
// Kept the same on the staff record (email, primary phone) for staff accounts.
const updateMyContact = async (userId, { email, phone }) => {
  const user = await getMyUser(userId);
  const nextEmail = email === undefined ? undefined : (email || null);
  const nextPhone = phone === undefined ? undefined : (phone || null);

  if (nextEmail) {
    const taken = await User.findOne({ where: { email: nextEmail, id: { [Op.ne]: userId } } });
    if (taken) throw new ApiError(409, 'This email is already used by another account');
  }

  await sequelize.transaction(async (transaction) => {
    await user.update({
      ...(nextEmail !== undefined && { email: nextEmail }),
      ...(nextPhone !== undefined && { phone: nextPhone }),
    }, { transaction });

    const staff = await findMyStaff(userId, transaction);
    if (!staff) return;
    if (nextEmail !== undefined) await staff.update({ email: nextEmail }, { transaction });
    if (nextPhone) {
      const primary = staff.phones.find((p) => p.is_primary) ?? staff.phones[0];
      if (primary) await primary.update({ phone: nextPhone }, { transaction });
      else await StaffPhone.create({ staff_id: staff.id, label: 'Mobile', phone: nextPhone, is_primary: 1 }, { transaction });
    }
  });

  return getMyUser(userId);
};

// ── Settings: profile photo ─────────────────────────────────────────────────────
const updateMyPhoto = async (userId, file) => {
  if (!file) throw new ApiError(422, 'Choose a photo to upload');
  if (!PHOTO_TYPES.includes(file.mimetype)) throw new ApiError(422, 'The photo must be a JPG, PNG or WebP image');
  const user = await getMyUser(userId);
  const result = await uploadBufferToCloudinary(file.buffer, PHOTO_FOLDER);
  await user.update({ profile_photo: result.secure_url });
  return getMyUser(userId);
};

// ── Settings: password ──────────────────────────────────────────────────────────
const changeMyPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findByPk(userId);
  if (!user) throw new ApiError(404, 'Your account was not found');
  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) throw new ApiError(422, 'Your current password is not correct');
  if (currentPassword === newPassword) throw new ApiError(422, 'The new password must be different from the current one');
  await user.update({ password_hash: await bcrypt.hash(newPassword, SALT_ROUNDS) });
};

module.exports = { getMyUser, getMyProfile, updateMyContact, updateMyPhoto, changeMyPassword };
