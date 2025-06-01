import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';
import { CampaignDetails, Loader } from '../components';

// Component để xử lý rút tiền từ chiến dịch
const CampaignDetailWithdraw = () => {
  const { state } = useLocation(); // Lấy dữ liệu state từ useLocation
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const navigate = useNavigate(); // Hook để điều hướng
  const { withdraw } = useStateContext(); // Lấy hàm withdraw từ context

  // Kiểm tra nếu state không tồn tại, điều hướng về trang chủ
  if (!state) {
    navigate('/');
    return null;
  }

  // Hàm xử lý rút tiền
  const handleWithdraw = async () => {
    try {
      setIsLoading(true); // Bật trạng thái loading
      await withdraw(state.pId); // Gọi hàm withdraw với pId của chiến dịch
      setIsLoading(false); // Tắt trạng thái loading
      alert('Withdrawal successful!'); // Thông báo rút tiền thành công
      navigate('/withdraw'); // Điều hướng đến trang rút tiền
    } catch (error) {
      console.error('Withdraw failure:', error); // Ghi log lỗi nếu rút tiền thất bại
      setIsLoading(false); // Tắt trạng thái loading
      alert('Withdrawal failed: ' + error.message); // Thông báo lỗi
    }
  };

  // Hàm trả về mô tả trạng thái chiến dịch
  const handleDescription = () => {
    if (state.status === 'Successful') {
      return 'You can withdraw the funds now.'; // Chiến dịch thành công, có thể rút tiền
    } else if (state.status === 'Failed') {
      return 'The campaign has failed. You cannot withdraw the funds.'; // Chiến dịch thất bại, không thể rút
    } else if (state.status === 'Ongoing') {
      return 'The campaign is still ongoing. You cannot withdraw the funds yet.'; // Chiến dịch đang diễn ra, chưa thể rút
    } else if (state.status === 'Withdrawn') {
      return 'You have already withdrawn the funds.'; // Đã rút tiền, không thể rút lại
    } else if (state.status === 'Refunded') {
      return 'The campaign has been refunded. You cannot withdraw the funds.'; // Chiến dịch đã được hoàn tiền, không thể rút
    }
  }

  return (
    <div>
      {isLoading && <Loader />} {/* Hiển thị loader khi đang xử lý */}
      <CampaignDetails
        handleAction={handleWithdraw} // Truyền hàm xử lý rút tiền
        actionFormProps={{
          formName: 'Withdraw', // Tên form
          title: 'Withdraw the funds', // Tiêu đề form
          description: handleDescription(), // Mô tả trạng thái
          buttonText: 'Withdraw', // Văn bản nút
          buttonColor: 'bg-[#1dc071]', // Màu nút
          showInput: false, // Không hiển thị input
          disabled: (state.status !== 'Successful'), // Vô hiệu hóa nút nếu trạng thái không phải Successful
        }}
      />
    </div>
  );
};

export default CampaignDetailWithdraw;