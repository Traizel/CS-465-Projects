const jwt = require('jsonwebtoken');
module.exports = function authenticateJWT(req, res, next) {
  const match = /^Bearer ([^\s]+)$/i.exec(req.get('Authorization') || '');
  if (!match) return res.status(401).json({ message: 'A Bearer token is required.' });
  try {
    req.auth = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (!req.auth._id || typeof req.auth.exp !== 'number') throw new Error('Invalid claims');
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
};
