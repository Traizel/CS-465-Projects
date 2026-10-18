// Actual Express/Passport/JWT and Mongoose validation; persistence is mocked.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
process.env.JWT_SECRET = 'isolated-module7-mock-test-secret-32-characters';
const mongoose = require('mongoose');
mongoose.ready = Promise.resolve();
require.cache[require.resolve('../app_api/models/db')] = { exports: mongoose };
const User = require('../app_api/models/user');
const Trip = require('../app_api/models/travlr');
const users = [], trips = [];
User.prototype.save = async function() {
  await this.validate();
  if (users.some(u => u.email === this.email)) throw Object.assign(new Error('Duplicate'), { code: 11000 });
  users.push(this); return this;
};
User.findOne = query => ({ select: () => ({ exec: async () => users.find(u => u.email === query.email) || null }) });
Trip.find = query => ({ exec: async () => trips.filter(t => !query.code || t.code === query.code) });
Trip.exists = async query => trips.some(t => t.code === query.code);
Trip.create = async data => { const trip = new Trip(data); await trip.validate(); trips.push(trip); return trip; };
Trip.findOneAndUpdate = (query, update) => ({ exec: async () => {
  const trip = trips.find(t => t.code === query.code); if (!trip) return null;
  Object.assign(trip, update); await trip.validate(); return trip;
} });
Trip.findOneAndDelete = query => ({ exec: async () => {
  const index = trips.findIndex(t => t.code === query.code);
  return index < 0 ? null : trips.splice(index, 1)[0];
} });
const app = require('../app');
const server = app.listen(0, '127.0.0.1', () => {
  console.log('MOCK DATABASE TEST: actual HTTP routes, authentication and model validation.');
  const child = spawn(process.execPath, [path.join(__dirname, 'module7.js')], {
    env: { ...process.env, TEST_API_URL: `http://127.0.0.1:${server.address().port}/api` }, stdio: 'inherit'
  });
  child.on('exit', code => {
    try {
      assert.equal(users.length, 1);
      assert.notEqual(users[0].hash, 'Module7-Test-Password!');
      assert.equal(users[0].validPassword('Module7-Test-Password!'), true);
      assert.equal(users[0].validPassword('wrong'), false);
      const second = new User({ email: 'another@example.test', name: 'Another' });
      second.setPassword('Module7-Test-Password!');
      assert.notEqual(users[0].salt, second.salt);
      assert.notEqual(users[0].hash, second.hash);
      assert.equal(trips.length, 0);
      console.log('PASS salted password hashing, verification, and test-trip cleanup.');
    } catch (error) { console.error(error); code = 1; }
    server.close(() => { process.exitCode = code || 0; });
  });
});
