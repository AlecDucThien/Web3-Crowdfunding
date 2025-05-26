import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';
import { CampaignDetails, Loader } from '../components';

const CampaignDetailWithdraw = () => {
  const { state } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { withdraw } = useStateContext();

  // Redirect if state is null (direct page access)
  if (!state) {
    navigate('/');
    return null;
  }

  const handleWithdraw = async () => {
    try {
      setIsLoading(true);
      await withdraw(state.pId);
      setIsLoading(false);
      alert('Withdrawal successful!');
      navigate('/withdraw');
    } catch (error) {
      console.error('Withdraw failure:', error);
      setIsLoading(false);
      alert('Withdrawal failed: ' + error.message);
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
    <div>
      {isLoading && <Loader />}
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
    </div>
    
  );
};

export default CampaignDetailWithdraw;