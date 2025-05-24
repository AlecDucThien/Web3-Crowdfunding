import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

import { useStateContext } from '../context';
import { CampaignDetails } from '../components';


const CampaignDetailDonate = () => {
  const { state } = useLocation();
  const { donate } = useStateContext();
  const [amount, setAmount] = useState('');

  const handleDonate = async () => {
    //setIsLoading(true);

    await donate(state.pId, amount); 

    navigate('/')
    //setIsLoading(false);
  }

  const handleDescription = () => {
    if (state.status === 'Successful') {
      return 'You can donate to the campaign now.';
    } else if (state.status === 'Failed') {
      return 'The campaign has failed. You cannot donate to the campaign.';
    } else if (state.status === 'Ongoing') {
      return 'The campaign is still ongoing. You can donate to the campaign.';
    }
  } 

  return (
    <CampaignDetails 
      handleAction={handleDonate}
      actionFormProps={{
        formName: 'Fund',
        title: 'Fund the campaign',
        description: handleDescription(),
        buttonText: 'Fund',
        buttonColor: 'bg-[#8c6dfd]',
        showInput: true,
        inputValue: amount,
        setInputValue: setAmount,
        disabled: (state.status !== 'Ongoing'),
      }}
    />
  )
}

export default CampaignDetailDonate