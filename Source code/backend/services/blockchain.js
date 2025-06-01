// Nhập thư viện ethers để tương tác với blockchain Ethereum
const { ethers } = require('ethers');

// Nhập ABI của hợp đồng từ file contractABI.json
const contractABI = require('../abi/contractABI.json');

// Hàm khởi tạo hợp đồng blockchain
const initializeContract = async () => {
  // Kiểm tra biến môi trường ETHEREUM_NODE_URL
  if (!process.env.ETHEREUM_NODE_URL) {
    throw new Error('ETHEREUM_NODE_URL is not defined in .env');
  }
  // Kiểm tra biến môi trường CONTRACT_ADDRESS
  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS is not defined in .env');
  }

  // Khởi tạo provider để kết nối với node Ethereum
  const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_NODE_URL);
  try {
    // Lấy thông tin mạng Ethereum
    const network = await provider.getNetwork();
    // Ghi log thông tin mạng đã kết nối
    console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);
  } catch (error) {
    // Ném lỗi nếu không kết nối được với mạng Ethereum
    throw new Error(`Failed to connect to Ethereum network: ${error.message}`);
  }

  // Tạo instance của hợp đồng sử dụng ethers.js
  const ethersContract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS, // Địa chỉ hợp đồng từ biến môi trường
    contractABI, // ABI của hợp đồng
    provider // Provider để giao tiếp với blockchain
  );

  try {
    // Kiểm tra hợp đồng bằng cách gọi hàm numberOfCampaigns
    const campaignCount = await ethersContract.numberOfCampaigns();
    // Ghi log số lượng chiến dịch để xác nhận hợp đồng được khởi tạo thành công
    console.log(`Contract initialized, numberOfCampaigns: ${campaignCount.toString()}`);
    // Trả về đối tượng chứa hợp đồng và provider
    return { ethersContract, provider };
  } catch (error) {
    // Ném lỗi nếu khởi tạo hợp đồng thất bại
    throw new Error(`Failed to initialize contract: ${error.message}`);
  }
};

// Hàm đồng bộ hóa dữ liệu chiến dịch từ blockchain sang MongoDB
const syncCampaigns = async ({ ethersContract, provider }) => {
  try {
    // Lấy tổng số chiến dịch từ hợp đồng
    const numberOfCampaigns = await ethersContract.numberOfCampaigns();
    // Ghi log số lượng chiến dịch
    console.log(`Number of campaigns: ${numberOfCampaigns.toString()}`);
    // Nhập model Campaign từ MongoDB
    const Campaign = require('../models/Campaign');

    // Lặp qua từng chiến dịch để đồng bộ
    for (let i = 0; i < numberOfCampaigns.toNumber(); i++) {
      // Lấy thông tin chiến dịch từ hợp đồng
      const campaign = await ethersContract.campaigns(i);
      // Lấy danh sách donators và donations của chiến dịch
      const [donators, donations] = await ethersContract.getDonators(i);

      // Cập nhật hoặc tạo mới bản ghi chiến dịch trong MongoDB
      await Campaign.findOneAndUpdate(
        { id: i }, // Tìm theo ID chiến dịch
        {
          id: i,
          owner: campaign.owner, // Địa chỉ chủ sở hữu chiến dịch
          title: campaign.title, // Tiêu đề chiến dịch
          description: campaign.description, // Mô tả chiến dịch
          target: campaign.target.toString(), // Số tiền mục tiêu (chuyển sang chuỗi)
          deadline: Number(campaign.deadline), // Thời hạn chiến dịch
          amountCollected: campaign.amountCollected.toString(), // Số tiền đã thu được
          image: campaign.image, // URL hoặc hash hình ảnh
          donators: donators, // Danh sách địa chỉ donators
          donations: donations.map(d => d.toString()), // Danh sách số tiền donate (chuyển sang chuỗi)
        },
        { upsert: true, new: true } // Tạo mới nếu không tồn tại, trả về bản ghi đã cập nhật
      );
    }
    // Ghi log xác nhận đồng bộ thành công
    console.log(`Synced ${numberOfCampaigns.toString()} campaigns to MongoDB`);
  } catch (error) {
    // Ghi log lỗi nếu đồng bộ thất bại
    console.error('Error syncing campaigns:', error);
    throw error;
  }
};

// Hàm lắng nghe các sự kiện từ hợp đồng blockchain
const listenToEvents = ({ ethersContract, provider }) => {
  // Nhập model Campaign từ MongoDB
  const Campaign = require('../models/Campaign');

  // Lắng nghe sự kiện CampaignCreated
  ethersContract.on('CampaignCreated', async (id, owner, title, target, deadline, event) => {
    // Ghi log thông tin sự kiện CampaignCreated
    console.log('CampaignCreated event:', { id, owner, title, target, deadline });
    // Kiểm tra dữ liệu sự kiện hợp lệ
    if (!id || !owner || !title || target === undefined || !deadline) {
      console.error('Invalid CampaignCreated event data:', { id, owner, title, target, deadline });
      return;
    }
    try {
      // Lấy toàn bộ thông tin chiến dịch từ hợp đồng
      const campaignData = await ethersContract.campaigns(id);

      // Cập nhật hoặc tạo mới bản ghi chiến dịch trong MongoDB
      await Campaign.findOneAndUpdate(
        { id: Number(id) }, // Tìm theo ID chiến dịch
        {
          id: Number(id),
          owner: campaignData.owner, // Địa chỉ chủ sở hữu
          title: campaignData.title, // Tiêu đề chiến dịch
          description: campaignData.description, // Mô tả chiến dịch
          target: campaignData.target.toString(), // Số tiền mục tiêu
          deadline: Number(campaignData.deadline), // Thời hạn chiến dịch
          amountCollected: campaignData.amountCollected.toString(), // Số tiền đã thu
          image: campaignData.image, // URL hoặc hash hình ảnh
          donators: campaignData.donators || [], // Danh sách donators (rỗng nếu chưa có)
          donations: campaignData.donations || [], // Danh sách donations (rỗng nếu chưa có)
        },
        { upsert: true, new: true } // Tạo mới nếu không tồn tại, trả về bản ghi đã cập nhật
      );
      // Ghi log xác nhận lưu chiến dịch thành công
      console.log(`Campaign ${id} created and saved to MongoDB`);
    } catch (error) {
      // Ghi log lỗi nếu lưu sự kiện thất bại
      console.error('Error saving CampaignCreated event to MongoDB:', error);
    }
  });

  // Lắng nghe sự kiện DonationReceived
  ethersContract.on('DonationReceived', async (id, donator, amount, event) => {
    // Ghi log thông tin sự kiện DonationReceived
    console.log('DonationReceived event:', { id, donator, amount });
    // Kiểm tra dữ liệu sự kiện hợp lệ
    if (!id || amount === undefined) {
      console.error('Invalid DonationReceived event data:', { id, donator, amount });
      return;
    }
    try {
      // Tìm chiến dịch trong MongoDB theo ID
      const campaign = await Campaign.findOne({ id: Number(id) });
      if (campaign) {
        // Cập nhật số tiền đã thu bằng cách cộng thêm số tiền donate
        campaign.amountCollected = (BigInt(campaign.amountCollected) + BigInt(amount)).toString();
        
        // Thêm donator và số tiền donate vào danh sách
        campaign.donators.push(donator);
        campaign.donations.push(amount.toString());
        
        // Lưu chiến dịch đã cập nhật vào MongoDB
        await campaign.save();
        // Ghi log xác nhận lưu donation thành công
        console.log(`Donation for campaign ${id} saved to MongoDB`);
      } else {
        // Ghi log lỗi nếu không tìm thấy chiến dịch
        console.error(`Campaign ${id} not found in MongoDB`);
      }
    } catch (error) {
      // Ghi log lỗi nếu lưu sự kiện thất bại
      console.error('Error saving DonationReceived event to MongoDB:', error);
    }
  });

  // Lắng nghe sự kiện FundsWithdrawn
  ethersContract.on('FundsWithdrawn', async (id, owner, amount, event) => {
    // Ghi log thông tin sự kiện FundsWithdrawn
    console.log('FundsWithdrawn event:', { id, owner, amount });
    // Kiểm tra dữ liệu sự kiện hợp lệ
    if (!id || amount === undefined) {
      console.error('Invalid FundsWithdrawn event data:', { id, owner, amount });
      return;
    }
    try {
      // Tìm chiến dịch trong MongoDB theo ID
      const campaign = await Campaign.findOne({ id: Number(id) });
      if (campaign) {
        // Reset số tiền đã thu về 0 sau khi rút
        campaign.amountCollected = '0';
        // Lưu chiến dịch đã cập nhật vào MongoDB
        await campaign.save();
        // Ghi log xác nhận cập nhật rút tiền thành công
        console.log(`Funds withdrawn for campaign ${id} and updated in MongoDB`);
      } else {
        // Ghi log lỗi nếu không tìm thấy chiến dịch
        console.error(`Campaign ${id} not found in MongoDB`);
      }
    } catch (error) {
      // Ghi log lỗi nếu lưu sự kiện thất bại
      console.error('Error saving FundsWithdrawn event to MongoDB:', error);
    }
  });

  // Lắng nghe sự kiện FundsRefunded
  ethersContract.on('FundsRefunded', async (id, donator, amount, event) => {
    // Ghi log thông tin sự kiện FundsRefunded
    console.log('FundsRefunded event:', { id, donator, amount });
    // Kiểm tra dữ liệu sự kiện hợp lệ
    if (!id || amount === undefined) {
      console.error('Invalid FundsRefunded event data:', { id, donator, amount });
      return;
    }
    try {
      // Tìm chiến dịch trong MongoDB theo ID
      const campaign = await Campaign.findOne({ id: Number(id) });
      if (campaign) {
        // Giảm số tiền đã thu bằng số tiền hoàn lại
        campaign.amountCollected = (BigInt(campaign.amountCollected) - BigInt(amount)).toString();
        // Xóa donator và donation tương ứng khỏi danh sách
        const donationIndex = campaign.donators.indexOf(donator);
        if (donationIndex !== -1) {
          campaign.donations.splice(donationIndex, 1);
          campaign.donators.splice(donationIndex, 1);
        }
        // Lưu chiến dịch đã cập nhật vào MongoDB
        await campaign.save();
        // Ghi log xác nhận cập nhật hoàn tiền thành công
        console.log(`Funds refunded for campaign ${id} and updated in MongoDB`);
      } else {
        // Ghi log lỗi nếu không tìm thấy chiến dịch
        console.error(`Campaign ${id} not found in MongoDB`);
      }
    } catch (error) {
      // Ghi log lỗi nếu lưu sự kiện thất bại
      console.error('Error saving FundsRefunded event to MongoDB:', error);
    }
  });
};

// Xuất các hàm để sử dụng ở các file khác
module.exports = { initializeContract, syncCampaigns, listenToEvents };