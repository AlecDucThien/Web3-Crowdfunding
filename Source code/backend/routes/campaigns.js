const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');

router.get('/', async (req, res) => {
  const campaigns = await Campaign.find().sort({ id: 1 });
  res.json(campaigns);
});

module.exports = router;