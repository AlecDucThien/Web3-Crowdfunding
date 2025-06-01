// Nhập các module cần thiết
const express = require('express'); // Framework Express để tạo server
const cors = require('cors'); // Middleware để xử lý CORS
const connectDB = require('./config/db'); // Hàm kết nối với cơ sở dữ liệu
const routes = require('./routes'); // Các tuyến đường API
const errorHandler = require('./middleware/errorHandler'); // Middleware xử lý lỗi
const { initializeContract, syncCampaigns, listenToEvents } = require('./services/blockchain'); // Các hàm tương tác với blockchain
require('dotenv').config(); // Tải biến môi trường từ file .env

// Khởi tạo ứng dụng Express
const app = express();
// Cấu hình cổng server từ biến môi trường hoặc mặc định là 3000
const port = process.env.PORT || 3000;

// Sử dụng middleware CORS để cho phép yêu cầu từ các nguồn khác
app.use(cors());
// Sử dụng middleware để phân tích cú pháp JSON từ body của yêu cầu
app.use(express.json());

// Đăng ký các tuyến đường API với tiền tố '/api'
app.use('/api', routes);

// Sử dụng middleware xử lý lỗi cho toàn bộ ứng dụng
app.use(errorHandler);

// Hàm khởi động server
const startServer = async () => {
  // Kết nối với cơ sở dữ liệu
  await connectDB();
  // Khởi tạo hợp đồng blockchain
  const contract = await initializeContract();
  // Đồng bộ hóa dữ liệu chiến dịch từ blockchain
  await syncCampaigns(contract);
  // Lắng nghe các sự kiện từ hợp đồng blockchain
  listenToEvents(contract);
  // Khởi động server và lắng nghe trên cổng được chỉ định
  app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
  });
};

// Gọi hàm để khởi động server
startServer();