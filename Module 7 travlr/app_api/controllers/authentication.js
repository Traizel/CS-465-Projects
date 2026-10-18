const passport = require('passport');
const User = require('../models/user');
function credentials(body) {
  return typeof body?.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) &&
    typeof body.password === 'string' && body.password.length > 0 && body.password.length <= 128;
}
exports.register = async (req, res) => {
  if (!credentials(req.body) || typeof req.body.name !== 'string' || !req.body.name.trim() || req.body.password.length < 8) {
    return res.status(400).json({ message: 'Name, valid email, and a password of 8–128 characters are required.' });
  }
  try {
    const user = new User({ name: req.body.name.trim(), email: req.body.email.trim().toLowerCase() });
    user.setPassword(req.body.password);
    await user.save();
    return res.status(201).json({ token: user.generateJWT() });
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 500).json({ message: error.code === 11000 ? 'Email is already registered.' : 'Unable to register user.' });
  }
};
exports.login = (req, res, next) => {
  if (!credentials(req.body)) return res.status(400).json({ message: 'Valid email and password are required.' });
  passport.authenticate('local', { session: false }, (error, user, info) => {
    if (error) return res.status(500).json({ message: 'Unable to sign in.' });
    if (!user) return res.status(401).json(info);
    return res.status(200).json({ token: user.generateJWT() });
  })(req, res, next);
};
