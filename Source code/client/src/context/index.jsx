import React, { useContext, createContext, useEffect, useState } from 'react';
import { useAddress, useContract, useConnect, useDisconnect, metamaskWallet, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract(import.meta.env.VITE_CONTRACT_ADDRESS);
  const { mutateAsync: createCampaign } = useContractWrite(contract, "createCampaign");

  const address = useAddress();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const connectWithMetamask = () => connect(metamaskWallet());

  // State để lưu trữ danh sách chiến dịch
  const [campaigns, setCampaigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [createEvent, setCreateEvent] = useState(false);
  const [donationEvent, setDonationEvent] = useState(false);
  const [withdrawEvent, setWithdrawEvent] = useState(false);
  const [refundEvent, setRefundEvent] = useState(false);

  // Lấy danh sách chiến dịch từ backend khi component mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/campaigns');
        if (!response.ok) throw new Error('Failed to fetch campaigns');
        const data = await response.json();
        // Chuyển đổi dữ liệu để khớp với định dạng cũ
        const parsedCampaigns = data.map((campaign, i) => ({
          owner: campaign.owner,
          title: campaign.title,
          description: campaign.description,
          target: ethers.utils.formatEther(campaign.target), // Chuyển từ Wei sang Ether
          deadline: campaign.deadline,
          amountCollected: ethers.utils.formatEther(campaign.amountCollected), // Chuyển từ Wei sang Ether
          image: campaign.image,
          pId: campaign.id,
        }));
        setCampaigns(parsedCampaigns);
      } catch (error) {
        console.error('Error fetching campaigns from backend:', error);
      }
    };
    fetchCampaigns();
  }, []);

  const publishCampaign = async (form) => {
    try {
      const data = await createCampaign({
        args: [
          address, // owner
          form.title, // title
          form.description, // description
          form.target, // target
          Math.floor(new Date(form.deadline).getTime() / 1000), // deadline (giây)
          form.image, // image
        ],
      });
      console.log('Contract call success', data);
      setCreateEvent(!createEvent); // Đảo ngược trạng thái để kích hoạt re-render
      // Làm mới danh sách chiến dịch từ backend sau khi tạo
      const response = await fetch('http://localhost:5000/api/campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const updatedCampaigns = await response.json();
      const parsedCampaigns = updatedCampaigns.map((campaign, i) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        target: ethers.utils.formatEther(campaign.target),
        deadline: campaign.deadline,
        amountCollected: ethers.utils.formatEther(campaign.amountCollected),
        image: campaign.image,
        pId: campaign.id,
      }));
      setCampaigns(parsedCampaigns);
    } catch (error) {
      console.log('Contract call failure', error);
    }
  };

  const getCampaigns = () => {
    return campaigns;
  };

  const getUserCampaigns = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/campaigns/user?address=${address}`);
      if (!response.ok) throw new Error('Failed to fetch user campaigns');
      const data = await response.json();
      return data.map((campaign) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        target: ethers.utils.formatEther(campaign.target),
        deadline: campaign.deadline,
        amountCollected: ethers.utils.formatEther(campaign.amountCollected),
        image: campaign.image,
        pId: campaign.id,
      }));
    } catch (error) {
      console.error('Error fetching user campaigns:', error);
      return [];
    }
  };

  const donate = async (pId, amount) => {
    const data = await contract.call('donateToCampaign', [pId], { value: ethers.utils.parseEther(amount) });
    setDonationEvent(!donationEvent); // Đảo ngược trạng thái để kích hoạt re-render
    return data;
  };

  const getDonations = async (pId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/campaigns/${pId}/donations`);
      if (!response.ok) throw new Error('Failed to fetch donations');
      const donations = await response.json();
      return donations;
    } catch (error) {
      console.error('Error fetching donations:', error);
      return [];
    }
  };

  const getStatus = async (pId) => {
    const status = await contract.call('getCampaignStatus', [pId]);
    return status;
  };

  const withdraw = async (pId) => {
    const data = await contract.call('withdrawFunds', [pId]);
    setWithdrawEvent(!withdrawEvent); // Đảo ngược trạng thái để kích hoạt re-render
    return data;
  };

  const refund = async (pId) => {
    const data = await contract.call('refundDonators', [pId]);
    setRefundEvent(!refundEvent); // Đảo ngược trạng thái để kích hoạt re-render
    return data;
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect: connectWithMetamask,
        disconnect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        refund,
        getStatus,
        withdraw,
        searchQuery,
        setSearchQuery,
        createEvent,
        donationEvent,
        withdrawEvent,
        refundEvent,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);