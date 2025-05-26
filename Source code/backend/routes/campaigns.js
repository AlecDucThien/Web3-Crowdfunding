const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');

// Route: Lấy tất cả chiến dịch (getCampaigns)
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Route: Lấy chiến dịch của người dùng (getUserCampaigns)
router.get('/user', async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    const campaigns = await Campaign.find({ owner: address });
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch user campaigns' });
  }
});

// Route: Lấy danh sách quyên góp của chiến dịch (getDonations)
router.get('/:pId/donations', async (req, res) => {
  try {
    const { pId } = req.params;
    const campaign = await Campaign.findOne({ id: Number(pId) });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

     // Tổng hợp quyên góp theo donator, tương tự logic trong getDonations
    const aggregatedDonations = {};
    for (let i = 0; i < campaign.donators.length; i++) {
      const donator = campaign.donators[i];
      // Chuyển đổi donation từ Wei sang Ether
      const donation = (parseFloat(campaign.donations[i]) / 1e18).toString();
      
      if (!aggregatedDonations[donator]) {
        aggregatedDonations[donator] = { donator, donation: 0 };
      }
      aggregatedDonations[donator].donation = (
        parseFloat(aggregatedDonations[donator].donation) + parseFloat(donation)
      ).toString();
    }

    res.json(Object.values(aggregatedDonations));
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

module.exports = router;