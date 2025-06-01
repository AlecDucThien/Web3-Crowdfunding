// Nhập module Express để tạo router
const express = require('express');
// Khởi tạo router từ Express
const router = express.Router();
// Nhập model Campaign từ MongoDB
const Campaign = require('../models/Campaign');

// Route: Lấy tất cả chiến dịch (getCampaigns)
router.get('/', async (req, res) => {
  try {
    // Tìm tất cả các chiến dịch trong cơ sở dữ liệu MongoDB
    const campaigns = await Campaign.find();
    // Trả về danh sách chiến dịch dưới dạng JSON
    res.json(campaigns);
  } catch (error) {
    // Ghi log lỗi nếu truy vấn thất bại
    console.error('Error fetching campaigns:', error);
    // Trả về mã trạng thái 500 và thông báo lỗi
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Route: Lấy chiến dịch của người dùng (getUserCampaigns)
router.get('/user', async (req, res) => {
  try {
    // Lấy địa chỉ ví từ query parameters
    const { address } = req.query;
    // Kiểm tra xem địa chỉ ví có được cung cấp không
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    // Tìm các chiến dịch thuộc về địa chỉ ví được cung cấp
    const campaigns = await Campaign.find({ owner: address });
    // Trả về danh sách chiến dịch của người dùng dưới dạng JSON
    res.json(campaigns);
  } catch (error) {
    // Ghi log lỗi nếu truy vấn thất bại
    console.error('Error fetching user campaigns:', error);
    // Trả về mã trạng thái 500 và thông báo lỗi
    res.status(500).json({ error: 'Failed to fetch user campaigns' });
  }
});

// Route: Lấy danh sách quyên góp của chiến dịch (getDonations)
router.get('/:pId/donations', async (req, res) => {
  try {
    // Lấy ID chiến dịch từ tham số URL
    const { pId } = req.params;
    // Tìm chiến dịch trong MongoDB dựa trên ID
    const campaign = await Campaign.findOne({ id: Number(pId) });
    // Kiểm tra xem chiến dịch có tồn tại không
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Tổng hợp quyên góp theo donator, tương tự logic trong getDonations
    const aggregatedDonations = {};
    for (let i = 0; i < campaign.donators.length; i++) {
      const donator = campaign.donators[i];
      // Chuyển đổi số tiền quyên góp từ Wei sang Ether
      const donation = (parseFloat(campaign.donations[i]) / 1e18).toString();
      
      // Khởi tạo bản ghi cho donator nếu chưa tồn tại
      if (!aggregatedDonations[donator]) {
        aggregatedDonations[donator] = { donator, donation: 0 };
      }
      // Cộng dồn số tiền quyên góp của donator
      aggregatedDonations[donator].donation = (
        parseFloat(aggregatedDonations[donator].donation) + parseFloat(donation)
      ).toString();
    }

    // Trả về danh sách quyên góp đã tổng hợp dưới dạng JSON
    res.json(Object.values(aggregatedDonations));
  } catch (error) {
    // Ghi log lỗi nếu truy vấn thất bại
    console.error('Error fetching donations:', error);
    // Trả về mã trạng thái 500 và thông báo lỗi
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Xuất router để sử dụng trong các file khác
module.exports = router;