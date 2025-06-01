import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { useNavigate } from 'react-router-dom';
import { DisplayCampaigns } from '../components';

// Component để hiển thị danh sách chiến dịch mà người dùng đã quyên góp và có thể hoàn tiền
const Refund = () => {
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const [campaigns, setCampaigns] = useState([]); // Danh sách chiến dịch đã quyên góp
  const [error, setError] = useState(''); // Trạng thái lỗi
  const [filteredCampaigns, setFilteredCampaigns] = useState([]); // Danh sách chiến dịch đã lọc
  const { address, contract, getStatus, getCampaigns, getDonations, searchQuery, createEvent, donateEvent, refundEvent, withdrawEvent } = useStateContext(); // Lấy dữ liệu từ context
  const navigate = useNavigate(); // Hook để điều hướng

  // Hàm lấy danh sách chiến dịch mà người dùng đã quyên góp
  const fetchDonatedCampaigns = async () => {
    try {
      if (!address) {
        setError('Please connect your wallet to view donated campaigns.'); // Thông báo lỗi nếu chưa kết nối ví
        return;
      }
      setIsLoading(true); // Bật trạng thái loading
      setError(''); // Xóa lỗi trước đó
      const allCampaigns = await getCampaigns(); // Gọi hàm lấy tất cả chiến dịch

      // Lọc các chiến dịch mà người dùng đã quyên góp
      const donatedCampaigns = await Promise.all(
        allCampaigns.map(async (campaign, i) => {
          try {
            const donations = await getDonations(campaign.pId); // Lấy danh sách quyên góp của chiến dịch
            const userDonation = donations.find((d) => d.donator.toLowerCase() === address.toLowerCase()); // Tìm quyên góp của người dùng
            if (!userDonation) return null; // Nếu không có quyên góp, trả về null

            const status = await getStatus(campaign.pId); // Lấy trạng thái của chiến dịch
            return {
              ...campaign,
              status,
              pId: campaign.pId,
              userDonation: userDonation.donation
            }; // Thêm trạng thái và thông tin quyên góp của người dùng
          } catch (err) {
            console.error(`Error processing campaign ${i}:`, err); // Ghi log lỗi nếu có
            return null;
          }
        })
      );

      // Loại bỏ các mục null và cập nhật danh sách chiến dịch
      setCampaigns(donatedCampaigns.filter((campaign) => campaign !== null));
      setFilteredCampaigns(campaigns);
    } catch (err) {
      setError('Failed to load campaigns. Please check your connection and try again.'); // Thông báo lỗi nếu không tải được chiến dịch
      console.error('Error fetching donated campaigns:', err); // Ghi log lỗi
    } finally {
      setIsLoading(false); // Tắt trạng thái loading
    }
  };

  // Gọi fetchDonatedCampaigns khi contract, address hoặc các sự kiện thay đổi
  useEffect(() => {
    if (contract && address) {
      fetchDonatedCampaigns();
    }
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
    <div>
      {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p> {/* Hiển thị thông báo lỗi */}
          </div>
        )}
        <DisplayCampaigns
          title="Campaigns You Donated To"
          isLoading={isLoading}
          campaigns={filteredCampaigns}
          purpose="refund"
        /> {/* Hiển thị danh sách chiến dịch với mục đích hoàn tiền */}
    </div>
  );
};

export default Refund;