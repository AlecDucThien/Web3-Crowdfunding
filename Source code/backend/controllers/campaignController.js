const Campaign = require('../models/Campaign');
const { getCampaigns } = require('../services/blockchain');

// Đồng bộ dữ liệu từ hợp đồng
const syncCampaigns = async (req, res) => {
    try {
        const campaigns = await getCampaigns();
        await Campaign.deleteMany({ pending: { $ne: true } });
        await Campaign.insertMany(campaigns);
        res.json({ message: 'Campaigns synced successfully', campaigns });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy danh sách chiến dịch từ cache
const getCachedCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find();
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Tạo chiến dịch tạm thời (chờ kiểm duyệt)
const createPendingCampaign = async (req, res) => {
    try {
        const { owner, title, description, target, deadline, image } = req.body;
        const campaign = new Campaign({
            owner,
            title,
            description,
            target,
            deadline,
            image,
            amountCollected: '0',
            status: 'Pending',
            pending: true,
        });
        await campaign.save();
        res.json({ message: 'Campaign created, awaiting approval', campaign });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Duyệt chiến dịch
const ApproveCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findOne({ id, pending: true });
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        // Gọi createCampaign trên blockchain ở đây (yêu cầu logic thêm)
        campaign.pending = false;
        await campaign.save();
        res.json({ message: 'Campaign approved', campaign });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { syncCampaigns, getCachedCampaigns, createPendingCampaign, ApproveCampaign };