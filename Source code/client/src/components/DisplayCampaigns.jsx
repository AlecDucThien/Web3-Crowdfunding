import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import FundCard from './FundCard';
import { loader } from '../assets';
import { useStateContext } from '../context';

const DisplayCampaigns = ({ title, isLoading, campaigns, purpose }) => {
  const { address, connect } = useStateContext();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const campaignsPerPage = 9; // Số chiến dịch mỗi trang

  const handleNavigate = (campaign) => {
    if (!address) {
      const confirmConnect = window.confirm( 
        'You need to connect your wallet to access this feature. Do you want to connect now?'
      );
      if (confirmConnect) {
        connect();
      } else {
        return; // Dừng lại nếu người dùng không muốn kết nối
      }
    }else{
      navigate(`/${purpose}/campaign-details/${campaign.title}`, { state: campaign });
    }
    
  };

  // Tính toán các chiến dịch hiển thị trên trang hiện tại
  const indexOfLastCampaign = currentPage * campaignsPerPage;
  const indexOfFirstCampaign = indexOfLastCampaign - campaignsPerPage;
  const currentCampaigns = campaigns.slice(indexOfFirstCampaign, indexOfLastCampaign);

  // Tính tổng số trang
  const totalPages = Math.ceil(campaigns.length / campaignsPerPage);

  // Xử lý chuyển trang
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="px-8">
      <h1 className="font-epilogue font-semibold text-[18px] text-white text-left">
        {title} ({campaigns.length})
      </h1>

      <div className="flex flex-wrap mt-[20px] gap-[40px]">
        {isLoading && (
          <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain" />
        )}

        {!isLoading && campaigns.length === 0 && (
          <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
            No campaigns yet, start creating one!
          </p>
        )}

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
            Page {currentPage} of {totalPages}
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