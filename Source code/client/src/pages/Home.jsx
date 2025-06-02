import React, { useState, useEffect } from 'react';
import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context';

// Component trang chủ hiển thị danh sách các chiến dịch
const Home = () => {
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const [campaigns, setCampaigns] = useState([]); // Danh sách tất cả chiến dịch
  const [filteredCampaigns, setFilteredCampaigns] = useState([]); // Danh sách chiến dịch đã lọc
  const { address, contract, getCampaigns, getStatus, searchQuery, createEvent, donateEvent, refundEvent, withdrawEvent } = useStateContext(); // Lấy dữ liệu từ context

  // Hàm lấy danh sách chiến dịch và trạng thái của chúng
  const fetchCampaigns = async () => {
    setIsLoading(true); // Bật trạng thái loading
    try {
      const data = await getCampaigns(); // Gọi hàm lấy danh sách chiến dịch
      const campaignsWithStatus = await Promise.all(
        data.map(async (campaign) => {
          const status = await getStatus(campaign.pId); // Lấy trạng thái của từng chiến dịch
          return { ...campaign, status }; // Thêm trạng thái vào dữ liệu chiến dịch
        })
      );
      setCampaigns(campaignsWithStatus); // Cập nhật danh sách chiến dịch
      setFilteredCampaigns(campaignsWithStatus); // Cập nhật danh sách chiến dịch đã lọc
    } catch (error) {
      console.error('Error fetching campaigns or statuses:', error); // Ghi log lỗi nếu có
    } finally {
      setIsLoading(false); // Tắt trạng thái loading
    }
  };

  // Gọi fetchCampaigns khi contract hoặc các sự kiện thay đổi
  useEffect(() => {
    if (contract) fetchCampaigns();
    console.log('Contract or events changed, fetching campaigns...');
  }, [createEvent, donateEvent, refundEvent, withdrawEvent, address, contract]);

  // Lọc chiến dịch dựa trên từ khóa tìm kiếm
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCampaigns(campaigns); // Nếu không có từ khóa, hiển thị tất cả chiến dịch
    } else {
      const filtered = campaigns.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
      ); // Lọc chiến dịch theo tiêu đề hoặc mô tả
      setFilteredCampaigns(filtered); // Cập nhật danh sách chiến dịch đã lọc
    }
  }, [searchQuery, campaigns]);

  return (
    
    <DisplayCampaigns // Hiển thị danh sách chiến dịch
      title="All Campaigns"
      isLoading={isLoading}
      campaigns={filteredCampaigns}
      purpose='donate'
    /> 
  );
};

export default Home;