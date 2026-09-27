const assert = require('node:assert/strict');
const Trip = require('../app_server/models/travlr');
const trips = require('../data/trips.json');
for (const trip of trips) assert.equal(new Trip(trip).validateSync(), undefined);
for (const field of ['code', 'name', 'length', 'start', 'resort', 'perPerson', 'image', 'description']) {
  const invalid = { ...trips[0] };
  delete invalid[field];
  assert(new Trip(invalid).validateSync().errors[field], `${field} must be required`);
}
assert(new Trip({ ...trips[0], start: 'invalid-date' }).validateSync().errors.start);
assert.equal(new Trip(trips[0]).toJSON().start.toISOString(), trips[0].start);
console.log('PASS: seed data validation, all required fields, invalid date rejection, and date serialization.');
