import React, { useState, useEffect } from 'react'

import { useStateContext } from '../context';
import { CampaignDetails } from '../components';


const CampaignDetailDonate = () => {
  const { donate } = useStateContext();
  const handleDonate = async () => {
    setIsLoading(true);

    await donate(state.pId, amount); 

    navigate('/')
    setIsLoading(false);
  }

  return (
    <CampaignDetails 
      handleAction={handleDonate}
      actionFormProps={{
        title: 'Fund',
        description: 'Fund the campaign',
        buttonText: 'Fund',
        buttonColor: 'bg-[#8c6dfd]',
        showInput: true,
      }}
    />
  )
}

export default CampaignDetailDonate