import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';
import { CampaignDetails } from '../components';

const CampaignDetailWithdraw = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { withdraw } = useStateContext();

  const handleWithdraw = async () => {
    try {
      await withdraw(state.pId);
      navigate('/');
    } catch (error) {
      console.error('Withdraw failure:', error);
    }
  };

  return (
    <CampaignDetails
      handleAction={handleWithdraw}
      actionFormProps={{
        title: 'Withdraw',
        description: 'Withdraw the funds',
        buttonText: 'Withdraw',
        buttonColor: 'bg-[#1dc071]',
        showInput: false,
      }}
    />
  );
};

export default CampaignDetailWithdraw;