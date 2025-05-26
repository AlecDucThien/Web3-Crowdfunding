const { ethers } = require('ethers');

// Import ABI từ file contractABI.json
const contractABI = require('../abi/contractABI.json');

const initializeContract = async () => {
  if (!process.env.ETHEREUM_NODE_URL) {
    throw new Error('ETHEREUM_NODE_URL is not defined in .env');
  }
  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS is not defined in .env');
  }

  // Khởi tạo provider và kiểm tra mạng
  const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_NODE_URL);
  try {
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);
  } catch (error) {
    throw new Error(`Failed to connect to Ethereum network: ${error.message}`);
  }

  // Tạo instance hợp đồng ethers.js
  const ethersContract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractABI,
    provider
  );

  try {
    // Kiểm tra hợp đồng bằng cách gọi numberOfCampaigns
    const campaignCount = await ethersContract.numberOfCampaigns();
    console.log(`Contract initialized, numberOfCampaigns: ${campaignCount.toString()}`);
    return { ethersContract, provider };
  } catch (error) {
    throw new Error(`Failed to initialize contract: ${error.message}`);
  }
};

const syncCampaigns = async ({ ethersContract, provider }) => {
  try {
    // Lấy số lượng chiến dịch
    const numberOfCampaigns = await ethersContract.numberOfCampaigns();
    console.log(`Number of campaigns: ${numberOfCampaigns.toString()}`);
    const Campaign = require('../models/Campaign');

    for (let i = 0; i < numberOfCampaigns.toNumber(); i++) {
      const campaign = await ethersContract.campaigns(i);
      // Lấy danh sách donators và donations
      const [donators, donations] = await ethersContract.getDonators(i);

      await Campaign.findOneAndUpdate(
        { id: i },
        {
          id: i,
          owner: campaign.owner,
          title: campaign.title,
          description: campaign.description,
          target: campaign.target.toString(),
          deadline: Number(campaign.deadline),
          amountCollected: campaign.amountCollected.toString(),
          image: campaign.image,
          donators: donators, // Cập nhật mảng donators
          donations: donations.map(d => d.toString()), // Chuyển đổi donations sang mảng chuỗi
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Synced ${numberOfCampaigns.toString()} campaigns to MongoDB`);
  } catch (error) {
    console.error('Error syncing campaigns:', error);
    throw error;
  }
};

const listenToEvents = ({ ethersContract, provider }) => {
  const Campaign = require('../models/Campaign');

  // Lắng nghe sự kiện CampaignCreated
  ethersContract.on('CampaignCreated', async (id, owner, title, target, deadline, event) => {
    console.log('CampaignCreated event:', { id, owner, title, target, deadline });
    if (!id || !owner || !title || target === undefined || !deadline) {
      console.error('Invalid CampaignCreated event data:', { id, owner, title, target, deadline });
      return;
    }
    try {
      // Lấy toàn bộ thông tin chiến dịch từ hợp đồng
      const campaignData = await ethersContract.campaigns(id);

      await Campaign.findOneAndUpdate(
        { id: Number(id) },
        {
          id: Number(id),
          owner: campaignData.owner,
          title: campaignData.title,
          description: campaignData.description, // Lấy từ hợp đồng
          target: campaignData.target.toString(),
          deadline: Number(campaignData.deadline),
          amountCollected: campaignData.amountCollected.toString(),
          image: campaignData.image, // Lấy từ hợp đồng
          donators: campaignData.donators || [], // Rỗng nếu không có
          donations: campaignData.donations || [], // Chuyển sang chuỗi, rỗng nếu không có
        },
        { upsert: true, new: true }
      );
      console.log(`Campaign ${id} created and saved to MongoDB`);
    } catch (error) {
      console.error('Error saving CampaignCreated event to MongoDB:', error);
    }
  });

  // Lắng nghe sự kiện DonationReceived
  ethersContract.on('DonationReceived', async (id, donator, amount, event) => {
    console.log('DonationReceived event:', { id, donator, amount });
    if (!id || amount === undefined) {
      console.error('Invalid DonationReceived event data:', { id, donator, amount });
      return;
    }
    try {
      const campaign = await Campaign.findOne({ id: Number(id) });
      if (campaign) {
        campaign.amountCollected = (BigInt(campaign.amountCollected) + BigInt(amount)).toString();
        
        // Cập nhật donators và donations
        campaign.donators.push(donator);
        campaign.donations.push(amount.toString());
        
        await campaign.save();
        console.log(`Donation for campaign ${id} saved to MongoDB`);
      } else {
        console.error(`Campaign ${id} not found in MongoDB`);
      }
    } catch (error) {
      console.error('Error saving DonationReceived event to MongoDB:', error);
    }
  });

  // Lắng nghe sự kiện FundsWithdrawn
  ethersContract.on('FundsWithdrawn', async (id, owner, amount, event) => {
    console.log('FundsWithdrawn event:', { id, owner, amount });
    if (!id || amount === undefined) {
      console.error('Invalid FundsWithdrawn event data:', { id, owner, amount });
      return;
    }
    try {
      const campaign = await Campaign.findOne({ id: Number(id) });
      if (campaign) {
        campaign.amountCollected = '0'; // Reset amountCollected sau khi rút
        await campaign.save();
        console.log(`Funds withdrawn for campaign ${id} and updated in MongoDB`);
      } else {
        console.error(`Campaign ${id} not found in MongoDB`);
      }
    } catch (error) {
      console.error('Error saving FundsWithdrawn event to MongoDB:', error);
    }
  });

  // Lắng nghe sự kiện FundsRefunded
  ethersContract.on('FundsRefunded', async (id, donator, amount, event) => {
    console.log('FundsRefunded event:', { id, donator, amount });
    if (!id || amount === undefined) {
      console.error('Invalid FundsRefunded event data:', { id, donator, amount });
      return;
    }
    try {
      const campaign = await Campaign.findOne({ id: Number(id) });
      if (campaign) {
        campaign.amountCollected = (BigInt(campaign.amountCollected) - BigInt(amount)).toString();
        // Xóa hoặc giảm donation tương ứng (tùy logic hợp đồng)
        const donationIndex = campaign.donators.indexOf(donator);
        if (donationIndex !== -1) {
          campaign.donations.splice(donationIndex, 1);
          campaign.donators.splice(donationIndex, 1);
        }
        await campaign.save();
        console.log(`Funds refunded for campaign ${id} and updated in MongoDB`);
      } else {
        console.error(`Campaign ${id} not found in MongoDB`);
      }
    } catch (error) {
      console.error('Error saving FundsRefunded event to MongoDB:', error);
    }
  });
};

module.exports = { initializeContract, syncCampaigns, listenToEvents };