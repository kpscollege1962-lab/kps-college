const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const {
  getMyUser, getMyProfile, updateMyContact, updateMyPhoto, changeMyPassword,
} = require('../services/myAccount.service');

// ── GET /me/account ─────────────────────────────────────────────────────────────
// The signed-in account as it is NOW (name with its Mr./Miss title, photo, email...). The app
// reads it on every load, so the top bar never shows an old copy saved at login.
const accountCtrl = async (req, res) => {
  res.json(ApiResponse.success('Account fetched', { user: await getMyUser(req.user.id) }));
};

// ── GET /me/profile ─────────────────────────────────────────────────────────────
const profileCtrl = async (req, res) => {
  res.json(ApiResponse.success('Profile fetched', await getMyProfile(req.user.id)));
};

// ── PATCH /me/contact ───────────────────────────────────────────────────────────
const contactCtrl = async (req, res) => {
  const { email, phone } = matchedData(req, { locations: ['body'], includeOptionals: false });
  const user = await updateMyContact(req.user.id, { email, phone });
  res.json(ApiResponse.success('Contact details saved', { user }));
};

// ── POST /me/photo (multipart, field "photo") ───────────────────────────────────
const photoCtrl = async (req, res) => {
  const user = await updateMyPhoto(req.user.id, req.file);
  res.json(ApiResponse.success('Photo saved', { user }));
};

// ── POST /me/password ───────────────────────────────────────────────────────────
const passwordCtrl = async (req, res) => {
  const { currentPassword, newPassword } = matchedData(req, { locations: ['body'] });
  await changeMyPassword(req.user.id, { currentPassword, newPassword });
  res.json(ApiResponse.success('Password changed'));
};

module.exports = { account: accountCtrl, profile: profileCtrl, contact: contactCtrl, photo: photoCtrl, password: passwordCtrl };
