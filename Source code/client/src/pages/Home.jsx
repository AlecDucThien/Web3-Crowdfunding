import React, { useState, useEffect } from 'react';
import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const { address, contract, getCampaigns, getStatus, searchQuery, createEvent, donateEvent, refundEvent, withdrawEvent } = useStateContext();

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
      setFilteredCampaigns(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns or statuses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract) fetchCampaigns();
  }, [createEvent, donateEvent, refundEvent, withdrawEvent, address, contract]);

  // Lọc chiến dịch dựa trên từ khóa tìm kiếm
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCampaigns(campaigns); // Nếu không có từ khóa, hiển thị tất cả
    } else {
      const filtered = campaigns.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCampaigns(filtered);
    }
  }, [searchQuery, campaigns]);

  return (
    <DisplayCampaigns
      title="All Campaigns"
      isLoading={isLoading}
      campaigns={filteredCampaigns}
      purpose='donate'
    />
  );
};

export default Home;