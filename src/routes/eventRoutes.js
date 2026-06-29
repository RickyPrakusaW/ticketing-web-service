const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Routes untuk Event
router.get('/', eventController.getAllEvents);
router.post('/', eventController.createEvent); // Idealnya ada upload & auth organizer

module.exports = router;
