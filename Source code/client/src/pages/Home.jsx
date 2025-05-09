import React, { useState, useEffect } from 'react';
import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { address, contract, getCampaigns, getStatus } = useStateContext();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await getCampaigns();
      const campaignsWithStatus = await Promise.all(
        data.map(async (campaign) => {
          const status = await getStatus(campaign.pId);
          return { ...campaign, status };
        })
      );
      setCampaigns(campaignsWithStatus);
    } catch (error) {
      console.error('Error fetching campaigns or statuses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract) fetchCampaigns();
  }, [address, contract]);

  return (
    <DisplayCampaigns
      title="All Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
      purpose='donate'
    />
  );
};

export default Home;