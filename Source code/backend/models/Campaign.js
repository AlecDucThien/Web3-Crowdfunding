// Nhập module mongoose để định nghĩa schema và model cho MongoDB
const mongoose = require('mongoose');

// Định nghĩa schema cho chiến dịch (Campaign)
const campaignSchema = new mongoose.Schema({
  // ID duy nhất của chiến dịch, bắt buộc và không trùng lặp
  id: { type: Number, required: true, unique: true },
  // Địa chỉ ví của chủ sở hữu chiến dịch, bắt buộc
  owner: { type: String, required: true },
  // Tiêu đề của chiến dịch, bắt buộc
  title: { type: String, required: true },
  // Mô tả của chiến dịch, bắt buộc
  description: { type: String, required: true },
  // Số tiền mục tiêu của chiến dịch (lưu dưới dạng chuỗi), bắt buộc
  target: { type: String, required: true },
  // Thời hạn chiến dịch (dưới dạng timestamp), bắt buộc
  deadline: { type: Number, required: true },
  // Số tiền đã thu được (lưu dưới dạng chuỗi), mặc định là '0'
  amountCollected: { type: String, default: '0' },
  // URL hoặc hash hình ảnh của chiến dịch, không bắt buộc
  image: { type: String },
  // Mảng chứa địa chỉ của những người quyên góp, mặc định là rỗng
  donators: { type: [String], default: [] },
  // Mảng chứa số tiền quyên góp tương ứng, mặc định là rỗng
  donations: { type: [String], default: [] },
});

// Xuất model Campaign để sử dụng trong các file khác
module.exports = mongoose.model('Campaign', campaignSchema);