const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const target = path.join(__dirname, '..', '.env');
if (fs.existsSync(target)) console.log('.env already exists; left unchanged.');
else {
  fs.writeFileSync(target, 'MONGODB_URI=mongodb://127.0.0.1:27017/travlr\nJWT_SECRET=' + crypto.randomBytes(48).toString('hex') + '\n', { mode: 0o600, flag: 'wx' });
  console.log('Created .env with a random local JWT secret.');
}
