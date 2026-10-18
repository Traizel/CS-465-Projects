// Integration test: run after starting local MongoDB and npm install.
// Uses its own database; NEVER modifies the real travlr collection.
const assert = require('node:assert/strict');
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI ||
  'mongodb://127.0.0.1:27017/travlr_module6_test';
const mongoose = require('../app_api/models/db');
const app = require('../app');
const Trip = require('../app_api/models/travlr');

const trip = {
  code: 'M6TEST261011', name: 'Module Six Reef Escape',
  length: '5 nights / 6 days', start: '2026-12-12T12:00:00.000Z',
  resort: 'Demo Reef, 4 stars', perPerson: '1250.00',
  image: 'reef1.jpg', description: '<p>Module Six test booking.</p>'
};

async function run() {
  let server;
  try {
    await mongoose.ready;
    await Trip.deleteMany({});
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const url = `http://127.0.0.1:${server.address().port}/api/trips`;
    const json = async (method, suffix = '', body) => {
      const response = await fetch(url + suffix, {
        method,
        headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:4200' },
        ...(body ? { body: JSON.stringify(body) } : {})
      });
      assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:4200');
      return { status: response.status, data: await response.json() };
    };
    let result = await json('GET');
    assert.equal(result.status, 200);
    assert.equal(result.data.length, 0);
    result = await json('POST', '', trip);
    assert.equal(result.status, 201);
    assert.equal(result.data.name, trip.name);
    console.log('PASS POST creates an additional trip (201)');
    result = await json('GET');
    assert.equal(result.data.length, 1);
    result = await json('GET', '/' + trip.code);
    assert.equal(result.status, 200);
    assert.equal(result.data[0].name, trip.name);
    console.log('PASS GET list and GET by code (200)');
    result = await json('POST', '', trip);
    assert.equal(result.status, 409);
    result = await json('POST', '', { code: 'INCOMPLETE' });
    assert.equal(result.status, 400);
    console.log('PASS duplicate and invalid POST are rejected (409, 400)');
    const changed = { ...trip, name: 'Module Six Updated Reef Escape', perPerson: '1399.00' };
    result = await json('PUT', '/' + trip.code, changed);
    assert.equal(result.status, 200);
    assert.equal(result.data.name, changed.name);
    result = await json('GET', '/' + trip.code);
    assert.equal(result.data[0].name, changed.name);
    console.log('PASS PUT updates persisted trip data (200)');
    result = await json('DELETE', '/' + trip.code);
    assert.equal(result.status, 200);
    result = await json('GET', '/' + trip.code);
    assert.equal(result.status, 404);
    result = await json('DELETE', '/' + trip.code);
    assert.equal(result.status, 404);
    console.log('PASS DELETE removes trip and missing trips return 404');
    const preflight = await fetch(url, { method: 'OPTIONS', headers: {
      Origin: 'http://localhost:4200', 'Access-Control-Request-Method': 'PUT' } });
    assert.equal(preflight.status, 204);
    assert.match(preflight.headers.get('access-control-allow-methods'), /DELETE/);
    console.log('PASS cross-origin preflight supports GET/POST/PUT/DELETE');
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.connection.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
