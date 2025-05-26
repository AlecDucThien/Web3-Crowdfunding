const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  owner: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  target: { type: String, required: true },
  deadline: { type: Number, required: true },
  amountCollected: { type: String, default: '0' },
  image: { type: String },
  donators: { type: [String], default: [] }, // Mảng địa chỉ của người quyên góp
  donations: { type: [String], default: [] }, // Mảng số tiền quyên góp
});

module.exports = mongoose.model('Campaign', campaignSchema);