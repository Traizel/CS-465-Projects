const mongoose = require('../models/db');
const Trip = require('../models/travlr');

// GET /api/trips: retrieve the complete collection using Mongoose FIND.
const tripsList = async (req, res) => {
  try {
    await mongoose.ready;
    const trips = await Trip.find({}).exec();
    return res.status(200).json(trips);
  } catch (error) {
    console.error('Trip list query failed:', error.message);
    return res.status(500).json({ message: 'Unable to retrieve trips.' });
  }
};

// GET /api/trips/:tripCode: keep the guide's FIND array response contract.
const tripsFindByCode = async (req, res) => {
  try {
    await mongoose.ready;
    const trips = await Trip.find({ code: req.params.tripCode }).exec();
    // FIND returns [] for no match; testing truthiness would miss this case.
    if (trips.length === 0) {
      return res.status(404).json({ message: 'Trip not found.' });
    }
    return res.status(200).json(trips);
  } catch (error) {
    console.error('Trip code query failed:', error.message);
    return res.status(500).json({ message: 'Unable to retrieve trip.' });
  }
};

module.exports = { tripsList, tripsFindByCode };
