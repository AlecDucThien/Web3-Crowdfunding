import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';
import { CampaignDetails, Loader } from '../components';

// Component để xử lý hoàn tiền cho chiến dịch
const CampaignDetailRefund = () => {
  const { state } = useLocation(); // Lấy dữ liệu state từ useLocation
  const navigate = useNavigate(); // Hook để điều hướng
  const { refund } = useStateContext(); // Lấy hàm refund từ context
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const [error, setError] = useState(''); // Trạng thái lỗi

  // Hàm xử lý hoàn tiền
  const handleRefund = async () => {
    if (state.status !== 'Failed') {
      setError('Cannot refund: Campaign is not failed.'); // Lỗi nếu chiến dịch không thất bại
      return;
    }

    try {
      setIsLoading(true); // Bật trạng thái loading
      setError(''); // Xóa lỗi trước đó
      const tx = await refund(state.pId); // Gọi hàm refund với pId
      await tx.receipt; // Chờ giao dịch hoàn tất
      alert('Funds refunded successfully!'); // Thông báo hoàn tiền thành công
      navigate('/refund'); // Điều hướng đến trang hoàn tiền
    } catch (err) {
      let errorMessage = 'Failed to refund funds. '; // Thông báo lỗi mặc định
      if (err.reason) {
        errorMessage += err.reason; // Thêm lý do lỗi nếu có
      } else if (err.message.includes('Campaign is still ongoing')) {
        errorMessage += 'Campaign has not ended yet.'; // Chiến dịch chưa kết thúc
      } else if (err.message.includes('Campaign reached its target')) {
        errorMessage += 'Campaign was successful, no refund available.'; // Chiến dịch thành công, không thể hoàn tiền
      } else if (err.message.includes('Insufficient contract balance')) {
        errorMessage += 'Contract does not have enough funds to process refunds.'; // Hợp đồng không đủ tiền để hoàn
      } else {
        errorMessage += 'Please try again later.'; // Lỗi không xác định, thử lại sau
      }
      setError(errorMessage); // Cập nhật thông báo lỗi
      console.error('Refund error:', err); // Ghi log lỗi
    } finally {
      setIsLoading(false); // Tắt trạng thái loading
    }
  };

  // Hàm trả về mô tả trạng thái chiến dịch
  const handleDescription = () => {
    if (state.status === 'Successful') {
      return 'The campaign was successful. You cannot refund.'; // Chiến dịch thành công, không thể hoàn tiền
    } else if (state.status === 'Failed') {
      return (state.amountCollected > 0)
        ? 'The campaign has failed. You can refund your donation.' // Chiến dịch thất bại, có thể hoàn tiền
        : 'You cannot refund your donation because the campaign does not have sufficient funds.'; // Chiến dịch không đủ tiền để hoàn
    } else if (state.status === 'Ongoing') {
      return 'The campaign is still ongoing. You cannot refund yet.'; // Chiến dịch đang diễn ra, chưa thể hoàn tiền
    } else if (state.status === 'Withdrawn') {
      return 'Campaign has been withdrawn. You cannot refund your donation.'; // Chiến dịch đã rút, không thể hoàn tiền
    } else if (state.status === 'Refunded') {
      return 'The campaign has been refunded. You cannot refund again.'; // Chiến dịch đã được hoàn tiền, không thể hoàn lại
    }
  }

  return (
    <div>
      {isLoading && <Loader />} {/* Hiển thị loader khi đang xử lý */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p> {/* Hiển thị thông báo lỗi */}
        </div>
      )}
      <CampaignDetails
        handleAction={handleRefund} // Truyền hàm xử lý hoàn tiền
        actionFormProps={{
          formName: 'Refund', // Tên form
          title: 'Refund your donation', // Tiêu đề form
          description: handleDescription(), // Mô tả trạng thái
          buttonText: 'Refund', // Văn bản nút
          buttonColor: 'bg-[#1dc071]', // Màu nút
          showInput: false, // Không hiển thị input
          disabled: (state.status !== 'Failed' ? true : state.amountCollected <= 0), // Vô hiệu hóa nút nếu trạng thái không phải Failed hoặc không đủ tiền
        }}
      />
    </div>
  );
};

export default CampaignDetailRefund;