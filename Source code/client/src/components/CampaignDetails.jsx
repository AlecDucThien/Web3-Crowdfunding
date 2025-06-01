
// Component CampaignDetails hiển thị thông tin chi tiết của một chiến dịch gọi vốn cộng đồng
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

// Nhập context và các component tùy chỉnh
import { useStateContext } from '../context';
import { CountBox, CustomButton, Loader, ActionForm } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';

// Component nhận props handleAction và actionFormProps để xử lý hành động và hiển thị form
const CampaignDetails = ({handleAction, actionFormProps}) => {
  // Lấy dữ liệu chiến dịch từ useLocation
  const { state } = useLocation();

  // Khởi tạo navigate để điều hướng
  const navigate = useNavigate();
  // Lấy các giá trị và hàm từ context
  const { getDonations, contract, address, getCampaigns, withdrawEvent } = useStateContext();

  // Quản lý trạng thái: tải, danh sách nhà tài trợ, trạng thái chiến dịch, số chiến dịch của người tạo
  const [isLoading, setIsLoading] = useState(false);
  const [donators, setDonators] = useState([]);
  const [status, setStatus] = useState(state.status);
  const [numberOfUserCampaigns, setNumberOfUserCampaigns] = useState(0);

  // Tính số ngày còn lại của chiến dịch
  const remainingDays = daysLeft(state.deadline);

  // Hàm lấy danh sách nhà tài trợ từ hợp đồng
  const fetchDonators = async () => {
    const data = await getDonations(state.pId);
    setDonators(data);
  }

  // Hàm đếm số chiến dịch của người tạo
  const fetchNumberOfUserCampaigns = async () => {
    const data = await getCampaigns();
    const count = data.filter((campaign) => campaign.owner === state.owner).length;
    setNumberOfUserCampaigns(count);
  }

  // Gọi fetchDonators và fetchNumberOfUserCampaigns khi contract và address thay đổi
  useEffect(() => {
    if(contract) {
      fetchDonators();
      fetchNumberOfUserCampaigns();
    }
  }, [contract, address])

  // Hàm trả về màu sắc tương ứng với trạng thái chiến dịch
  const getStatusColor = (status) => {
    switch (status) {
      case 'Successful':
        return '#4acd8d'; // Xanh
      case 'Failed':
        return '#d9534f'; // Đỏ
      case 'Ongoing':
        return '#f0ad4e'; // Vàng
      case 'Withdrawn':
        return '#5bc0de'; // Xanh dương
      case 'Refunded':
        return '#d9534f'; // Đỏ
      default:
        return '#1c1c24'; // Mặc định (xám)
    }
  }

  // Giao diện hiển thị thông tin chiến dịch
  return (
    <div>
      {/* Hiển thị loader khi đang tải dữ liệu */}
      {isLoading && <Loader />}

      {/* Phần hiển thị hình ảnh và thanh tiến độ */}
      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          {/* Hình ảnh chiến dịch */}
          <img src={state.image} alt="campaign" className="w-full h-[526px] object-cover rounded-xl"/>
          {/* Thanh tiến độ hiển thị phần trăm số tiền đã quyên góp */}
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            <div className="absolute h-full bg-[#4acd8d]" style={{ width: `${calculateBarPercentage(state.target, state.amountCollected)}%`, maxWidth: '100%'}}>
            </div>
          </div>
        </div>

        {/* Các thông tin tóm tắt: ngày còn lại, số tiền đã quyên, số người ủng hộ, trạng thái */}
        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Days Left" value={remainingDays} color="#1c1c24"/>
          <CountBox title={`Raised of ${state.target}`} value={state.amountCollected} color="#1c1c24"/>
          <CountBox title="Total Backers" value={donators.length} color="#1c1c24"/>
          <CountBox title="Status" value={state.status} color={getStatusColor(state.status)}/>
        </div>
      </div>

      {/* Phần hiển thị thông tin chi tiết */}
      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          {/* Thông tin người tạo chiến dịch */}
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Creator</h4>
            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain"/>
              </div>
              <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">{state.owner}</h4>
                <p className="mt-[4px] font-epilogue font-normal text-[12px] text-[#808191]">{`${numberOfUserCampaigns} campaign${numberOfUserCampaigns !== 1 ? 's' : ''}`}</p>
              </div>
            </div>
          </div>

          {/* Mô tả chiến dịch */}
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Story</h4>
            <div className="mt-[20px]">
              <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{state.description}</p>
            </div>
          </div>

          {/* Danh sách nhà tài trợ */}
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Donators</h4>
            <div className="mt-[20px] flex flex-col gap-4">
              {donators.length > 0 ? donators.map((item, index) => (
                <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4">
                  <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px] break-ll">{index + 1}. {item.donator}</p>
                  <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] break-ll">{item.donation}</p>
                </div>
              )) : (
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">Chưa có nhà tài trợ nào. Hãy là người đầu tiên!</p>
              )}
            </div>
          </div>
        </div>

        {/* Form hành động (ví dụ: quyên góp, rút tiền) */}
        <ActionForm
          formName={actionFormProps.formName}
          title={actionFormProps.title}
          description={actionFormProps.description}
          buttonText={actionFormProps.buttonText}
          buttonColor={actionFormProps?.buttonColor}
          campaignStatus={state.status}
          buttonDisabled={actionFormProps?.disabled}
          handleAction={handleAction}
          error=""
          inputValue={actionFormProps?.inputValue}
          setInputValue={actionFormProps?.setInputValue}
          showInput={actionFormProps.showInput}
        />
      </div>
    </div>
  )
}

export default CampaignDetails
