// Dependency-free controller smoke test. Mocks database calls; this is NOT
// a substitute for the full MongoDB/browser integration test.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../app_api/controllers/trips.js'), 'utf8');
let collection = [];
const clone = obj => structuredClone(obj);
const Trip = {
  find: query => ({ exec: async () => clone(collection.filter(t =>
    !query.code || t.code === query.code)) }),
  exists: async query => collection.some(t => t.code === query.code),
  create: async trip => { collection.push(clone(trip)); return clone(trip); },
  findOneAndUpdate: (query, update) => ({ exec: async () => {
    const index = collection.findIndex(t => t.code === query.code);
    if (index < 0) return null;
    collection[index] = clone(update);
    return clone(collection[index]);
  } }),
  findOneAndDelete: query => ({ exec: async () => {
    const index = collection.findIndex(t => t.code === query.code);
    return index < 0 ? null : collection.splice(index, 1)[0];
  } })
};
const exportsMock = {};
vm.runInNewContext(source, {
  require: name => name.endsWith('/db') ? { ready: Promise.resolve() } : Trip,
  module: { exports: exportsMock },
  console
});
// Node's vm module.exports assignment replaces the property, so retrieve separately.
const moduleObject = { exports: {} };
vm.runInNewContext(source, { require: name => name.endsWith('/db') ?
  { ready: Promise.resolve() } : Trip, module: moduleObject, console });
const c = moduleObject.exports;
async function call(handler, params = {}, body = {}) {
  let status = 200, data;
  await handler({ params, body }, {
    status(code) { status = code; return this; },
    json(value) { data = value; return this; }
  });
  return { status, data };
}
(async () => {
  const trip = { code: 'TEST123', name: 'Trip', length: '5 days', start: '2026-12-12',
    resort: 'Reef', perPerson: '450.00', image: 'reef1.jpg', description: 'Demo' };
  assert.equal((await call(c.tripsList)).data.length, 0);
  assert.equal((await call(c.tripsAddTrip, {}, trip)).status, 201);
  assert.equal((await call(c.tripsAddTrip, {}, trip)).status, 409);
  assert.equal((await call(c.tripsAddTrip, {}, { code: 'BAD' })).status, 400);
  assert.equal((await call(c.tripsFindByCode, { tripCode: trip.code })).data[0].name, trip.name);
  assert.equal((await call(c.tripsUpdateTrip, { tripCode: trip.code }, { ...trip, name: 'Updated' })).status, 200);
  assert.equal((await call(c.tripsList)).data[0].name, 'Updated');
  assert.equal((await call(c.tripsDeleteTrip, { tripCode: trip.code })).status, 200);
  assert.equal((await call(c.tripsDeleteTrip, { tripCode: trip.code })).status, 404);
  assert.equal((await call(c.tripsList)).data.length, 0);
  console.log('PASS offline controller smoke test: GET, POST, PUT, DELETE, validation, duplicate and missing codes.');
})().catch(e => { console.error(e); process.exitCode = 1; });
