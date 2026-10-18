const express = require('express');
const router = express.Router();
const tripsController = require('../controllers/trips');

const authenticateJWT = require('../middleware/authenticate');
const authentication = require('../controllers/authentication');
router.post('/register', authentication.register);
router.post('/login', authentication.login);

router.route('/trips')
  .get(tripsController.tripsList)
  .post(authenticateJWT, tripsController.tripsAddTrip);

router.route('/trips/:tripCode')
  .get(tripsController.tripsFindByCode)
  .put(authenticateJWT, tripsController.tripsUpdateTrip)
  .delete(authenticateJWT, tripsController.tripsDeleteTrip);

router.use((req, res) => res.status(404).json({ message: 'API endpoint not found.' }));
module.exports = router;
