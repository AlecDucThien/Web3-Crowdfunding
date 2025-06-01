import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader } from '../components';
import { useStateContext } from '../context';
import { CampaignDetails } from '../components';

// Component để xử lý quyên góp cho chiến dịch
const CampaignDetailDonate = () => {
  const { state } = useLocation(); // Lấy dữ liệu state từ useLocation
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const { donate } = useStateContext(); // Lấy hàm donate từ context
  const [amount, setAmount] = useState(''); // Số tiền quyên góp
  const navigate = useNavigate(); // Hook để điều hướng

  // Hàm xử lý quyên góp
  const handleDonate = async () => {
    setIsLoading(true); // Bật trạng thái loading
    await donate(state.pId, amount); // Gọi hàm donate với pId và số tiền
    setIsLoading(false); // Tắt trạng thái loading
    alert('Donation successful!'); // Thông báo quyên góp thành công
    setAmount(''); // Xóa giá trị số tiền
    navigate('/'); // Điều hướng về trang chủ
  }

  // Hàm trả về mô tả trạng thái chiến dịch
  const handleDescription = () => {
    if (state.status === 'Successful') {
      return 'You can donate to the campaign now.'; // Chiến dịch thành công, có thể quyên góp
    } else if (state.status === 'Failed') {
      return 'The campaign has failed. You cannot donate to the campaign.'; // Chiến dịch thất bại, không thể quyên góp
    } else if (state.status === 'Ongoing') {
      return 'The campaign is still ongoing. You can donate to the campaign.'; // Chiến dịch đang diễn ra, có thể quyên góp
    } else if (state.status === 'Withdrawn') {
      return 'The campaign has been withdrawn. You cannot donate to the campaign.'; // Chiến dịch đã rút, không thể quyên góp
    } else if (state.status === 'Refunded') {
      return 'The campaign has been refunded. You cannot donate to the campaign.'; // Chiến dịch đã hoàn tiền, không thể quyên góp
    }
  } 

  return (
    <div>
      {isLoading && <Loader />} {/* Hiển thị loader khi đang xử lý */}
      <CampaignDetails 
        handleAction={handleDonate} // Truyền hàm xử lý quyên góp
        actionFormProps={{
          formName: 'Fund', // Tên form
          title: 'Fund the campaign', // Tiêu đề form
          description: handleDescription(), // Mô tả trạng thái
          buttonText: 'Fund', // Văn bản nút
          buttonColor: 'bg-[#8c6dfd]', // Màu nút
          showInput: true, // Hiển thị input số tiền
          inputValue: amount, // Giá trị input
          setInputValue: setAmount, // Hàm cập nhật giá trị input
          disabled: (state.status !== 'Ongoing'), // Vô hiệu hóa nút nếu trạng thái không phải Ongoing
        }}
      />
    </div>
  )
}

export default CampaignDetailDonate;