import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

import { useStateContext } from '../context';
import { CountBox, CustomButton, Loader, ActionForm } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';

const CampaignDetails = ({handleAction, actionFormProps}) => {
  const { state } = useLocation();

  const navigate = useNavigate();
  const { getDonations, contract, address, getCampaigns, withdrawEvent } = useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [donators, setDonators] = useState([]);
  const [status, setStatus] = useState(state.status);
  const [numberOfUserCampaigns, setNumberOfUserCampaigns] = useState(0);

  const remainingDays = daysLeft(state.deadline);

  const fetchDonators = async () => {

    const data = await getDonations(state.pId);
    setDonators(data);
  }

  const fetchNumberOfUserCampaigns = async () => {
    const data = await getCampaigns();
    const count = data.filter((campaign) => campaign.owner === state.owner).length;
    setNumberOfUserCampaigns(count);
  }

  useEffect(() => {
    if(contract) {
      fetchDonators();
      fetchNumberOfUserCampaigns();
    }
  }, [contract, address])

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

  return (
    <div>
      {isLoading && <Loader />}

      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <img src={state.image} alt="campaign" className="w-full h-[526px] object-cover rounded-xl"/>
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            <div className="absolute h-full bg-[#4acd8d]" style={{ width: `${calculateBarPercentage(state.target, state.amountCollected)}%`, maxWidth: '100%'}}>
            </div>
          </div>
        </div>

        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Days Left" value={remainingDays} color="#1c1c24"/>
          <CountBox title={`Raised of ${state.target}`} value={state.amountCollected} color="#1c1c24"/>
          <CountBox title="Total Backers" value={donators.length} color="#1c1c24"/>
          <CountBox title="Status" value={state.status} color={getStatusColor(state.status)}/>

        </div>
      </div>

      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
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

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Story</h4>

              <div className="mt-[20px]">
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{state.description}</p>
              </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Donators</h4>

              <div className="mt-[20px] flex flex-col gap-4">
                {donators.length > 0 ? donators.map((item, index) => (
                  <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4">
                    <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px] break-ll">{index + 1}. {item.donator}</p>
                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] break-ll">{item.donation}</p>
                  </div>
                )) : (
                  <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">No donators yet. Be the first one!</p>
                )}
              </div>
          </div>
        </div>

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