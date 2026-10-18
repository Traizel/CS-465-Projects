const mongoose = require('./db');
const Trip = require('./travlr');
const trips = require('../../data/trips.json');

async function seed() {
  try {
    await mongoose.ready;
    // Validate all input before replacing the assignment's sample collection.
    await Promise.all(trips.map(trip => new Trip(trip).validate()));
    await Trip.init();
    await Trip.deleteMany({});
    const inserted = await Trip.insertMany(trips);
    console.log(`Seeded ${inserted.length} trips in ${mongoose.connection.name}.trips`);
  } catch (error) {
    console.error('Database seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
seed();
