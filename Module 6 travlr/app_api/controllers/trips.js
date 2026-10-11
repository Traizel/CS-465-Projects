const mongoose = require('../models/db');
const Trip = require('../models/travlr');

const tripFields = ['code', 'name', 'length', 'start', 'resort', 'perPerson', 'image', 'description'];

function tripFromBody(body) {
  const trip = {};
  for (const field of tripFields) {
    const value = body?.[field];
    if (typeof value !== 'string' || !value.trim()) {
      return { error: `${field} is required.` };
    }
    trip[field] = value.trim();
  }
  if (Number.isNaN(Date.parse(trip.start))) return { error: 'start must be a valid date.' };
  if (!Number.isFinite(Number(trip.perPerson)) || Number(trip.perPerson) < 0) {
    return { error: 'perPerson must be a nonnegative amount.' };
  }
  return { trip };
}

const tripsList = async (req, res) => {
  try {
    await mongoose.ready;
    return res.status(200).json(await Trip.find({}).exec());
  } catch (error) {
    console.error('Trip list failed:', error.message);
    return res.status(500).json({ message: 'Unable to retrieve trips.' });
  }
};

// Maintain the Module 5 GET contract: a one-item array on success.
const tripsFindByCode = async (req, res) => {
  try {
    await mongoose.ready;
    const trips = await Trip.find({ code: req.params.tripCode }).exec();
    if (!trips.length) return res.status(404).json({ message: 'Trip not found.' });
    return res.status(200).json(trips);
  } catch (error) {
    console.error('Find trip failed:', error.message);
    return res.status(500).json({ message: 'Unable to retrieve trip.' });
  }
};

const tripsAddTrip = async (req, res) => {
  const { trip, error } = tripFromBody(req.body);
  if (error) return res.status(400).json({ message: error });
  try {
    await mongoose.ready;
    if (await Trip.exists({ code: trip.code })) {
      return res.status(409).json({ message: 'That trip code already exists.' });
    }
    return res.status(201).json(await Trip.create(trip));
  } catch (err) {
    console.error('Add trip failed:', err.message);
    return res.status(err.code === 11000 ? 409 : 500).json({ message: 'Unable to add trip.' });
  }
};

const tripsUpdateTrip = async (req, res) => {
  const { trip, error } = tripFromBody(req.body);
  if (error) return res.status(400).json({ message: error });
  if (trip.code !== req.params.tripCode) {
    return res.status(400).json({ message: 'Trip code cannot be changed.' });
  }
  try {
    await mongoose.ready;
    const updated = await Trip.findOneAndUpdate(
      { code: req.params.tripCode }, trip,
      { new: true, runValidators: true }
    ).exec();
    if (!updated) return res.status(404).json({ message: 'Trip not found.' });
    return res.status(200).json(updated);
  } catch (err) {
    console.error('Update trip failed:', err.message);
    return res.status(500).json({ message: 'Unable to update trip.' });
  }
};

const tripsDeleteTrip = async (req, res) => {
  try {
    await mongoose.ready;
    const removed = await Trip.findOneAndDelete({ code: req.params.tripCode }).exec();
    if (!removed) return res.status(404).json({ message: 'Trip not found.' });
    return res.status(200).json({ message: 'Trip deleted.', code: removed.code });
  } catch (err) {
    console.error('Delete trip failed:', err.message);
    return res.status(500).json({ message: 'Unable to delete trip.' });
  }
};

module.exports = { tripsList, tripsFindByCode, tripsAddTrip, tripsUpdateTrip, tripsDeleteTrip };
