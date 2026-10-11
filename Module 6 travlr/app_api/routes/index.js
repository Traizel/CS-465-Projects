const express = require('express');
const router = express.Router();
const tripsController = require('../controllers/trips');

router.route('/trips')
  .get(tripsController.tripsList)
  .post(tripsController.tripsAddTrip);

router.route('/trips/:tripCode')
  .get(tripsController.tripsFindByCode)
  .put(tripsController.tripsUpdateTrip)
  .delete(tripsController.tripsDeleteTrip);

router.use((req, res) => res.status(404).json({ message: 'API endpoint not found.' }));
module.exports = router;
