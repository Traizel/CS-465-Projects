const express = require('express');
const router = express.Router();
const tripsController = require('../controllers/trips');

router.get('/trips', tripsController.tripsList);
router.get('/trips/:tripCode', tripsController.tripsFindByCode);

// API clients always receive JSON, including unknown endpoint errors.
router.use((req, res) => res.status(404).json({ message: 'API endpoint not found.' }));
module.exports = router;
