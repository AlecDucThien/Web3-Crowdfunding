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

  const handleDescription = () => {
    if (state.status === 'Successful') {
      return 'You can withdraw the funds now.';
    } else if (state.status === 'Failed') {
      return 'The campaign has failed. You cannot withdraw the funds.';
    } else if (state.status === 'Ongoing') {
      return 'The campaign is still ongoing. You cannot withdraw the funds yet.';
    }
  }

  return (
    <CampaignDetails
      handleAction={handleWithdraw}
      actionFormProps={{
        formName: 'Withdraw',
        title: 'Withdraw the funds',
        description: handleDescription(),
        buttonText: 'Withdraw',
        buttonColor: 'bg-[#1dc071]',
        showInput: false,
        disabled: (state.status !== 'Successful'),
      }}
    />
  );
};

export default CampaignDetailWithdraw;