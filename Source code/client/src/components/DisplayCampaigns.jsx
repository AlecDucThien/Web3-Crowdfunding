
// Component DisplayCampaigns hiển thị danh sách các chiến dịch gọi vốn
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import FundCard from './FundCard';
import { loader } from '../assets';
import { useStateContext } from '../context';

// Component nhận các props: tiêu đề, trạng thái tải, danh sách chiến dịch, mục đích
const DisplayCampaigns = ({ title, isLoading, campaigns, purpose }) => {
  // Lấy địa chỉ ví và hàm kết nối từ context
  const { address, connect } = useStateContext();
  // Khởi tạo navigate để điều hướng
  const navigate = useNavigate();
  // Quản lý trạng thái trang hiện tại
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const campaignsPerPage = 9; // Số chiến dịch mỗi trang

  // Hàm xử lý điều hướng đến trang chi tiết chiến dịch
  const handleNavigate = (campaign) => {
    // Yêu cầu kết nối ví nếu chưa có địa chỉ
    if (!address) {
      const confirmConnect = window.confirm( 
        'Bạn cần kết nối ví để truy cập tính năng này. Bạn có muốn kết nối ngay bây giờ không?'
      );
      if (confirmConnect) {
        connect();
      } else {
        return; // Dừng nếu người dùng không muốn kết nối
      }
    } else {
      // Điều hướng đến trang chi tiết chiến dịch
      navigate(`/${purpose}/campaign-details/${campaign.title}`, { state: campaign });
    }
  };

  // Tính toán các chiến dịch hiển thị trên trang hiện tại
  const indexOfLastCampaign = currentPage * campaignsPerPage;
  const indexOfFirstCampaign = indexOfLastCampaign - campaignsPerPage;
  const currentCampaigns = campaigns.slice(indexOfFirstCampaign, indexOfLastCampaign);

  // Tính tổng số trang
  const totalPages = Math.ceil(campaigns.length / campaignsPerPage);

  // Xử lý chuyển sang trang trước
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Xử lý chuyển sang trang tiếp theo
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Giao diện hiển thị danh sách chiến dịch
  return (
    <div className="px-8">
      {/* Tiêu đề hiển thị số lượng chiến dịch */}
      <h1 className="font-epilogue font-semibold text-[18px] text-white text-left">
        {title} ({campaigns.length})
      </h1>

      {/* Hiển thị danh sách chiến dịch hoặc thông báo */}
      <div className="flex flex-wrap mt-[20px] gap-[40px]">
        {/* Hiển thị loader khi đang tải */}
        {isLoading && (
          <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain" />
        )}

        {/* Thông báo khi không có chiến dịch */}
        {!isLoading && campaigns.length === 0 && (
          <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
            Chưa có chiến dịch nào, hãy bắt đầu tạo một chiến dịch!
          </p>
        )}

        {/* Hiển thị danh sách chiến dịch */}
        {!isLoading && campaigns.length > 0 && currentCampaigns.map((campaign) => (
          <FundCard
            key={uuidv4()}
            {...campaign}
            handleClick={() => handleNavigate(campaign)}
          />
        ))}
      </div>

      {/* Giao diện phân trang */}
      {!isLoading && campaigns.length > 0 && (
        <div className="flex justify-center items-center mt-8 gap-4">
          <button
            className={`px-4 py-2 rounded-[10px] font-epilogue text-[14px] ${
              currentPage === 1
                ? 'bg-[#3a3a43] text-[#808191] cursor-not-allowed'
                : 'bg-[#1dc071] text-white cursor-pointer'
            }`}
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="font-epilogue text-[14px] text-white">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            className={`px-4 py-2 rounded-[10px] font-epilogue text-[14px] ${
              currentPage === totalPages
                ? 'bg-[#3a3a43] text-[#808191] cursor-not-allowed'
                : 'bg-[#1dc071] text-white cursor-pointer'
            }`}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DisplayCampaigns;
