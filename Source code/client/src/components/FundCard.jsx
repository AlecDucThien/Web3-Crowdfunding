// Nhập thư viện React
import React from 'react';

// Nhập các tài nguyên và hàm tiện ích
import { tagType, thirdweb } from '../assets';
import { daysLeft } from '../utils';

// Component FundCard hiển thị thông tin tóm tắt của một chiến dịch
const FundCard = ({ owner, title, description, target, deadline, amountCollected, image, handleClick, status }) => {
  // Tính số ngày còn lại dựa trên thời hạn chiến dịch
  const remainingDays = daysLeft(deadline);
  
  return (
    // Thẻ div chính chứa toàn bộ nội dung thẻ chiến dịch, có thể click
    <div className="sm:w-[288px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer" onClick={handleClick}>
      {/* Hình ảnh chiến dịch */}
      <img src={image} alt="fund" className="w-full h-[158px] object-cover rounded-[15px]"/>

      {/* Nội dung chi tiết của thẻ */}
      <div className="flex flex-col p-4">
        {/* Phần hiển thị danh mục và trạng thái chiến dịch */}
        <div className="flex flex-row items-center justify-between mb-[18px]">
          <div className='flex flex-row items-center'>
            {/* Icon danh mục */}
            <img src={tagType} alt="tag" className="w-[17px] h-[17px] object-contain"/>
            {/* Tên danh mục (hard-coded là Education) */}
            <p className="ml-[12px] mt-[2px] font-epilogue font-medium text-[12px] text-[#808191]">Education</p>
          </div>
          {/* Trạng thái chiến dịch */}
          <p className="font-epilogue text-[14px] text-[#b2b3bd] font-semibold">{status}</p>
        </div>

        {/* Tiêu đề và mô tả chiến dịch */}
        <div className="block">
          <h3 className="font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate">{title}</h3>
          <p className="mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18px] truncate">{description}</p>
        </div>

        {/* Thông tin số tiền đã quyên góp và số ngày còn lại */}
        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">{amountCollected}</h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">Raised of {target}</p>
          </div>
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">{remainingDays}</h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">Days Left</p>
          </div>
        </div>

        {/* Thông tin chủ sở hữu chiến dịch */}
        <div className="flex items-center mt-[20px] gap-[12px]">
          <div className="w-[30px] h-[30px] rounded-full flex justify-center items-center bg-[#13131a]">
            <img src={thirdweb} alt="user" className="w-1/2 h-1/2 object-contain"/>
          </div>
          <p className="flex-1 font-epilogue font-normal text-[12px] text-[#808191] truncate">by <span className="text-[#b2b3bd]">{owner}</span></p>
        </div>
      </div>
    </div>
  )
}

// Xuất component FundCard để sử dụng trong các file khác
export default FundCard