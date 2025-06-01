
// Nhập các thư viện cần thiết cho React, context, và thirdweb
import React, { useContext, createContext, useEffect, useState } from 'react';
import { useAddress, useContract, useConnect, useDisconnect, metamaskWallet, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

// Tạo context để chia sẻ trạng thái toàn cục
const StateContext = createContext();

// Component cung cấp context cho toàn bộ ứng dụng
export const StateContextProvider = ({ children }) => {
  // Kết nối với hợp đồng thông qua địa chỉ hợp đồng từ biến môi trường
  const { contract } = useContract(import.meta.env.VITE_CONTRACT_ADDRESS);
  // Hàm gọi hàm createCampaign trong hợp đồng
  const { mutateAsync: createCampaign } = useContractWrite(contract, "createCampaign");

  // Lấy địa chỉ ví, kết nối và ngắt kết nối ví
  const address = useAddress();
  const connect = useConnect();
  const disconnect = useDisconnect();
  // Hàm kết nối ví Metamask
  const connectWithMetamask = () => connect(metamaskWallet());

  // Quản lý trạng thái: danh sách chiến dịch và từ khóa tìm kiếm
  const [campaigns, setCampaigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Quản lý trạng thái các sự kiện: tạo, quyên góp, rút tiền, hoàn tiền
  const [createEvent, setCreateEvent] = useState(false);
  const [donationEvent, setDonationEvent] = useState(false);
  const [withdrawEvent, setWithdrawEvent] = useState([0]);
  const [refundEvent, setRefundEvent] = useState([]);

  // Lấy danh sách chiến dịch từ backend khi component mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // Gửi yêu cầu lấy danh sách chiến dịch từ backend
        const response = await fetch('http://localhost:5000/api/campaigns');
        if (!response.ok) throw new Error('Không thể lấy danh sách chiến dịch');
        const data = await response.json();
        // Chuyển đổi dữ liệu để khớp với định dạng hợp đồng
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
        console.error('Lỗi khi lấy danh sách chiến dịch từ backend:', error);
      }
    };
    fetchCampaigns();
  }, []);

  // Hàm tạo chiến dịch mới trên blockchain và cập nhật danh sách chiến dịch
  const publishCampaign = async (form) => {
    try {
      // Gọi hàm createCampaign trên hợp đồng
      const data = await createCampaign({
        args: [
          address, // Chủ sở hữu chiến dịch
          form.title, // Tiêu đề chiến dịch
          form.description, // Mô tả chiến dịch
          form.target, // Mục tiêu số tiền
          Math.floor(new Date(form.deadline).getTime() / 1000), // Hạn chót (giây)
          form.image, // Hình ảnh chiến dịch
        ],
      });
      console.log('Gọi hợp đồng thành công', data);
      setCreateEvent(!createEvent); // Đảo ngược trạng thái để kích hoạt re-render
      // Làm mới danh sách chiến dịch từ backend
      const response = await fetch('http://localhost:5000/api/campaigns');
      if (!response.ok) throw new Error('Không thể lấy danh sách chiến dịch');
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
      console.log('Gọi hợp đồng thất bại', error);
    }
  };

  // Hàm trả về danh sách chiến dịch
  const getCampaigns = () => {
    return campaigns;
  };

  // Hàm lấy danh sách chiến dịch của người dùng hiện tại
  const getUserCampaigns = async () => {
    try {
      // Gửi yêu cầu lấy chiến dịch của người dùng từ backend
      const response = await fetch(`http://localhost:5000/api/campaigns/user?address=${address}`);
      if (!response.ok) throw new Error('Không thể lấy chiến dịch của người dùng');
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
      console.error('Lỗi khi lấy chiến dịch của người dùng:', error);
      return [];
    }
  };

  // Hàm thực hiện quyên góp cho chiến dịch
  const donate = async (pId, amount) => {
    // Gọi hàm donateToCampaign trên hợp đồng
    const data = await contract.call('donateToCampaign', [pId], { value: ethers.utils.parseEther(amount) });
    setDonationEvent(!donationEvent); // Đảo ngược trạng thái để kích hoạt re-render
    return data;
  };

  // Hàm lấy danh sách quyên góp cho một chiến dịch
  const getDonations = async (pId) => {
    try {
      // Gửi yêu cầu lấy danh sách quyên góp từ backend
      const response = await fetch(`http://localhost:5000/api/campaigns/${pId}/donations`);
      if (!response.ok) throw new Error('Không thể lấy danh sách quyên góp');
      const donations = await response.json();
      return donations;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách quyên góp:', error);
      return [];
    }
  };

  // Hàm lấy trạng thái của chiến dịch
  const getStatus = async (pId) => {
    // Gọi hàm getCampaignStatus trên hợp đồng
    const status = await contract.call('getCampaignStatus', [pId]);
    if (withdrawEvent.includes(pId)) {
      return 'Withdrawn'; // Trả về trạng thái "Withdrawn" nếu đã rút tiền
    } else if (refundEvent.includes(pId)) {
      return 'Refunded'; // Trả về trạng thái "Refunded" nếu đã hoàn tiền
    } else {
      return status;
    }
  };

  // Hàm rút tiền từ chiến dịch
  const withdraw = async (pId) => {
    // Gọi hàm withdrawFunds trên hợp đồng
    const data = await contract.call('withdrawFunds', [pId]);
    setWithdrawEvent([...withdrawEvent, pId]); // Thêm pId vào mảng để kích hoạt re-render
    return data;
  };

  // Hàm hoàn tiền cho các nhà tài trợ
  const refund = async (pId) => {
    // Gọi hàm refundDonators trên hợp đồng
    const data = await contract.call('refundDonators', [pId]);
    setRefundEvent([...refundEvent, pId]); // Thêm pId vào mảng để kích hoạt re-render
    return data;
  };

  // Cung cấp các giá trị và hàm cho context
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

// Hook để sử dụng context trong các component khác
export const useStateContext = () => useContext(StateContext);
