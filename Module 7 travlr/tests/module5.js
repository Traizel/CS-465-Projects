const assert = require('node:assert/strict');
const mongoose = require('mongoose');
// Use a separate database so testing never deletes the user's seeded trips.
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI ||
  'mongodb://127.0.0.1:27017/travlr_module5_test';
const app = require('../app');
const Trip = require('../app_api/models/travlr');
const seed = require('../data/trips.json');
const travel = require('../app_server/controllers/travel').travel;

async function main() {
  let server;
  try {
    await mongoose.ready;
    await Trip.deleteMany({});
    await Trip.insertMany(seed);
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    app.set('port', server.address().port);
    const origin = `http://127.0.0.1:${server.address().port}`;
    let response = await fetch(origin + '/api/trips');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /application\/json/);
    const list = await response.json();
    assert.equal(list.length, seed.length);
    for (const expected of seed) {
      const actual = list.find(trip => trip.code === expected.code);
      for (const key of Object.keys(expected)) assert.equal(actual[key], expected[key]);
      response = await fetch(origin + '/api/trips/' + expected.code);
      assert.equal(response.status, 200);
      const individual = await response.json();
      assert.equal(individual.length, 1);
      assert.equal(individual[0].code, expected.code);
    }
    console.log('PASS: list and all three trip-code endpoints return database JSON and HTTP 200.');
    for (const route of ['/api/trips/DOESNOTEXIST', '/api/unknown']) {
      response = await fetch(origin + route);
      assert.equal(response.status, 404);
      assert.equal(typeof (await response.json()).message, 'string');
    }
    console.log('PASS: missing trip and unknown API route return JSON with HTTP 404.');
    response = await fetch(origin + '/travel');
    assert.equal(response.status, 200);
    let html = await response.text();
    for (const trip of seed) {
      assert(html.includes(trip.description));
      assert(html.includes(`/api/trips/${trip.code}`));
      assert(html.includes(`/images/${trip.image}`));
    }
    assert(!html.includes('{{'));
    const assets = new Set([...html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)].map(m => m[1]));
    for (const path of assets) assert.equal((await fetch(origin + path)).status, 200, path);
    for (const path of ['/', '/travel.html', '/rooms.html', '/meals.html', '/about.html', '/news.html', '/contact.html']) {
      assert.equal((await fetch(origin + path)).status, 200, path);
    }
    console.log('PASS: Travel rendering, API image links, local assets, remaining pages, and legacy redirect.');
    await Trip.updateOne({ code: seed[0].code }, { $set: { name: 'Database Update Test' } });
    html = await (await fetch(origin + '/travel')).text();
    assert(html.includes('Database Update Test'));
    console.log('PASS: a database-only edit appears on Travel without editing trips.json.');
    await Trip.deleteMany({});
    response = await fetch(origin + '/api/trips');
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);
    html = await (await fetch(origin + '/travel')).text();
    assert(html.includes('No trips are currently available.'));
    console.log('PASS: empty collection returns 200 [] and a friendly Travel message.');
    // Exercise failures through the real Express routes, restoring FIND afterward.
    const originalFind = Trip.find;
    try {
      Trip.find = () => ({ exec: async () => { throw new Error('Simulated query failure'); } });
      for (const route of ['/api/trips', '/api/trips/' + seed[0].code]) {
        response = await fetch(origin + route);
        assert.equal(response.status, 500);
        assert.equal(typeof (await response.json()).message, 'string');
      }
      response = await fetch(origin + '/travel');
      assert.equal(response.status, 500);
      assert((await response.text()).includes('Unable to load trips.'));
    } finally { Trip.find = originalFind; }
    console.log('PASS: simulated database errors return JSON HTTP 500; Travel handles API failure.');
    const originalFetch = global.fetch;
    try {
      for (const payload of [{ message: 'invalid collection' }, null]) {
        global.fetch = async () => ({ ok: true, json: async () => payload });
        let status, context;
        await travel({ app }, { status(code) { status = code; return this; }, render(view, data) { context = data; } });
        assert.equal(status, 500);
        assert.deepEqual(context.trips, []);
      }
      global.fetch = async () => { throw new Error('Simulated network failure'); };
      let status;
      await travel({ app }, { status(code) { status = code; return this; }, render() {} });
      assert.equal(status, 500);
    } finally { global.fetch = originalFetch; }
    console.log('PASS: malformed collection and simulated network failure are handled.');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect();
  }
}
main();
