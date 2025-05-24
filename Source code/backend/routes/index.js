const express = require('express');
const router = express.Router();
const campaignRoutes = require('./campaigns');

router.use('/campaigns', campaignRoutes);

module.exports = router;