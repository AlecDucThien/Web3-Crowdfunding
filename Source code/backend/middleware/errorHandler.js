// Middleware xử lý lỗi cho ứng dụng Express
const errorHandler = (err, req, res, next) => {
  // Gửi phản hồi JSON với thông tin lỗi
  res.status(err.status || 500).json({
    error: {
      // Thông báo lỗi, sử dụng message từ lỗi hoặc mặc định là 'Lỗi server nội bộ'
      message: err.message || 'Lỗi server nội bộ',
      // Mã trạng thái HTTP, sử dụng status từ lỗi hoặc mặc định là 500
      status: err.status || 500,
    },
  });
};

// Xuất middleware errorHandler để sử dụng trong các file khác
module.exports = errorHandler;