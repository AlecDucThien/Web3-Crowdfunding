# Web3 Crowdfunding - Nền Tảng Gọi Vốn Cộng Đồng Phi Tập Trung

## Giới Thiệu

Web3 Crowdfunding là một nền tảng gọi vốn cộng đồng phi tập trung được xây dựng trên blockchain Ethereum. Dự án cho phép mọi người tạo và đóng góp vào các chiến dịch gọi vốn một cách minh bạch và an toàn, không cần thông qua bên trung gian.

## Công Nghệ Sử Dụng

- **Smart Contract**: 
  - Solidity
  - Hardhat Framework
  - OpenZeppelin
  
- **Frontend**: 
  - React
  - Vite
  - TailwindCSS
  - thirdweb SDK
  
- **Backend**:
  - Node.js
  - Express
  - MongoDB
  
- **Blockchain**:
  - Mạng: Ethereum (Sepolia Testnet)
  - Web3 Provider: MetaMask

## Cấu Trúc Dự Án

```
Source code/
├── backend/         # Server Node.js + Express
│   ├── abi/        # Smart contract ABI
│   ├── config/     # Cấu hình database
│   ├── models/     # Schema MongoDB
│   ├── routes/     # API endpoints
│   └── services/   # Blockchain services
├── client/         # Frontend React
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/    # React context
│   │   ├── pages/      # Trang chính
│   │   └── utils/      # Tiện ích
└── web3/           # Smart contracts
    ├── contracts/  # Solidity contracts
    ├── scripts/    # Deploy scripts
    └── test/       # Unit tests
```

## Tính Năng Chính

1. **Quản lý Chiến dịch**
   - Tạo chiến dịch gọi vốn mới
   - Xem danh sách các chiến dịch
   - Tìm kiếm và lọc chiến dịch
   - Xem chi tiết từng chiến dịch

2. **Quản lý Tài chính**
   - Quyên góp ETH cho chiến dịch
   - Rút tiền khi chiến dịch thành công
   - Hoàn tiền cho nhà đầu tư nếu chiến dịch thất bại
   - Theo dõi lịch sử giao dịch

3. **Tính năng Người dùng**
   - Đăng nhập bằng ví MetaMask
   - Xem thông tin cá nhân
   - Theo dõi chiến dịch đã tạo
   - Theo dõi lịch sử đóng góp

## Cài Đặt và Chạy Dự Án

### Yêu Cầu Hệ Thống

- Node.js (>= v16)
- MongoDB
- MetaMask wallet
- Sepolia testnet ETH

### Bước 1: Cài Đặt Smart Contract

```bash
cd "Source code/web3"
npm install

# Deploy smart contract
npx hardhat run scripts/deploy.js --network sepolia
```

### Bước 2: Cài Đặt Backend

```bash
cd "../backend"
npm install

# Tạo file .env với nội dung:
MONGODB_URI=your_mongodb_uri
PORT=5000
ETHEREUM_NODE_URL=your_infura_url
CONTRACT_ADDRESS=your_deployed_contract_address
```

### Bước 3: Cài Đặt Frontend

```bash
cd "../client"
npm install

# Tạo file .env với nội dung:
VITE_CLIENT_ID=your_thirdweb_client_id
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

### Chạy Dự Án

1. **Khởi động Backend**
```bash
cd "../backend"
npm start
```

2. **Khởi động Frontend**
```bash
cd "../client"
npm run dev
```

Truy cập ứng dụng tại: http://localhost:5173

## Hướng Dẫn Sử Dụng

1. Cài đặt MetaMask và tạo ví
2. Chuyển sang mạng Sepolia testnet
3. Lấy testnet ETH từ faucet
4. Kết nối ví với ứng dụng
5. Bắt đầu tạo chiến dịch hoặc đóng góp

## Lưu ý An Toàn

- Luôn kiểm tra địa chỉ smart contract
- Đọc kỹ thông tin chiến dịch trước khi đóng góp
- Bảo mật khóa riêng tư của ví
- Chỉ sử dụng testnet ETH để thử nghiệm



