const assert = require('node:assert/strict');
const mongoose = require('./db');
const Trip = require('./travlr');
const source = require('../../data/trips.json');

async function verify() {
  try {
    await mongoose.ready;
    const records = await Trip.find({}).sort({ code: 1 }).lean().exec();
    assert.equal(records.length, source.length, 'Unexpected trip count; run npm run seed first');
    for (const expected of source) {
      const actual = records.find(trip => trip.code === expected.code);
      assert(actual, `Missing trip ${expected.code}`);
      for (const field of Object.keys(expected)) {
        if (field === 'start') {
          assert(actual.start instanceof Date, 'start must be stored as a BSON Date');
          assert.equal(actual.start.toISOString(), new Date(expected.start).toISOString());
        } else assert.equal(actual[field], expected[field], `${expected.code}: ${field}`);
      }
    }
    const indexes = await Trip.collection.indexes();
    assert(indexes.some(index => index.key.code === 1), 'Missing code index');
    assert(indexes.some(index => index.key.name === 1), 'Missing name index');
    // This output demonstrates real Mongoose retrieval serialized to API-ready JSON.
    console.log(JSON.stringify(records, null, 2));
    console.log(`PASS: ${records.length} trips, all fields, BSON dates, indexes, and JSON retrieval.`);
  } catch (error) {
    console.error('Database verification failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
verify();
