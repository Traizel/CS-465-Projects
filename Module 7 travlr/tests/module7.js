// Run against a local running Express + MongoDB instance; only creates unique test data.
const assert = require('node:assert/strict');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const base = process.env.TEST_API_URL || 'http://localhost:3000/api';
const suffix = Date.now();
const credentials = { name: 'Module Seven Test', email: `module7-${suffix}@example.test`, password: 'Module7-Test-Password!' };
const trip = { code: `M7${suffix}`, name: 'Security Test Trip', length: '5 days', start: '2027-01-10', resort: 'Test Resort', perPerson: '500', image: 'reef1.jpg', description: 'Temporary test record.' };
let token;
async function request(label, method, path, body, expected, bearer) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  assert.equal(response.status, expected, label + ': ' + JSON.stringify(data));
  console.log(`PASS ${label} (${expected})`);
  return data;
}
(async () => {
  await request('Public trip listing', 'GET', '/trips', null, 200);
  for (const [method, path] of [['POST','/trips'], ['PUT',`/trips/${trip.code}`], ['DELETE',`/trips/${trip.code}`]]) {
    await request(`Reject anonymous ${method}`, method, path, trip, 401);
  }
  await request('Reject invalid registration', 'POST', '/register', {}, 400);
  token = (await request('Register test user', 'POST', '/register', credentials, 201)).token;
  const claims = jwt.decode(token);
  assert.equal(claims.email, credentials.email);
  assert.equal(claims.exp - claims.iat, 3600);
  assert.equal(claims.hash, undefined); assert.equal(claims.password, undefined);
  await request('Duplicate email', 'POST', '/register', credentials, 409);
  await request('Wrong password', 'POST', '/login', { ...credentials, password: 'incorrect' }, 401);
  await request('Missing login fields', 'POST', '/login', {}, 400);
  token = (await request('Valid login', 'POST', '/login', credentials, 200)).token;
  await request('Malformed token', 'POST', '/trips', trip, 401, 'not-a-token');
  const forged = jwt.sign({ _id: claims._id }, 'incorrect-signing-secret', { expiresIn: '1h' });
  await request('Forged token', 'POST', '/trips', trip, 401, forged);
  if (process.env.JWT_SECRET) {
    const expired = jwt.sign({ _id: claims._id }, process.env.JWT_SECRET, { expiresIn: -1 });
    await request('Expired token', 'POST', '/trips', trip, 401, expired);
  } else console.log('SKIP expired token: JWT_SECRET must match server.');
  await request('Authenticated create', 'POST', '/trips', trip, 201, token);
  await request('Public read single trip', 'GET', `/trips/${trip.code}`, null, 200);
  const update = await request('Authenticated update', 'PUT', `/trips/${trip.code}`, { ...trip, name: 'Updated Security Trip' }, 200, token);
  assert.equal(update.name, 'Updated Security Trip');
  await request('Authenticated delete', 'DELETE', `/trips/${trip.code}`, null, 200, token);
  await request('Deleted trip is absent', 'GET', `/trips/${trip.code}`, null, 404);
  console.log('All Module Seven API checks passed. Test user retained: ' + credentials.email);
})().catch(error => { console.error(error); process.exitCode = 1; });
