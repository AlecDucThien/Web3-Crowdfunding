const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Lỗi server nội bộ',
      status: err.status || 500,
    },
  });
};

module.exports = errorHandler;