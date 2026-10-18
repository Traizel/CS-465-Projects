const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  name: { type: String, required: true, trim: true },
  hash: { type: String, required: true, select: false },
  salt: { type: String, required: true, select: false }
});
// Per-user salts; never store a plaintext password.
userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 210000, 64, 'sha512').toString('hex');
};
userSchema.methods.validPassword = function(password) {
  if (!this.hash || !this.salt) return false;
  const candidate = crypto.pbkdf2Sync(password, this.salt, 210000, 64, 'sha512');
  const stored = Buffer.from(this.hash, 'hex');
  return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate);
};
userSchema.methods.generateJWT = function() {
  return jwt.sign({ _id: this._id, email: this.email, name: this.name },
    process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
};
module.exports = mongoose.model('users', userSchema);
