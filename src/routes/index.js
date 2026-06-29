const express = require('express');
const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);

module.exports = router;
