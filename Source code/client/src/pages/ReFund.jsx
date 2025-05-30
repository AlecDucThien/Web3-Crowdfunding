import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { useNavigate } from 'react-router-dom';
import { DisplayCampaigns } from '../components';

const Refund = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState('');
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const { address, contract,getStatus, getCampaigns, getDonations, searchQuery, createEvent, donateEvent, refundEvent, withdrawEvent} = useStateContext();
  const navigate = useNavigate();

  // Fetch campaigns that the user has donated to
  const fetchDonatedCampaigns = async () => {
    try {
      if (!address) {
        setError('Please connect your wallet to view donated campaigns.');
        return;
      }
      setIsLoading(true);
      setError('');
      const allCampaigns = await getCampaigns();

      // Filter campaigns where the user is a donator
      const donatedCampaigns = await Promise.all(
        allCampaigns.map(async (campaign, i) => {
          try {
            const donations = await getDonations(campaign.pId);
            const userDonation = donations.find((d) => d.donator.toLowerCase() === address.toLowerCase());
            if (!userDonation) return null;

            const status = await getStatus(campaign.pId);
            return {
              ...campaign,
              status,
              pId: campaign.pId,
              userDonation: userDonation.donation
            };
          } catch (err) {
            console.error(`Error processing campaign ${i}:`, err);
            return null;
          }
        })
      );

      // Remove null entries and set campaigns
      setCampaigns(donatedCampaigns.filter((campaign) => campaign !== null));
      setFilteredCampaigns(campaigns);
    } catch (err) {
      setError('Failed to load campaigns. Please check your connection and try again.');
      console.error('Error fetching donated campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load campaigns when address or contract changes
  useEffect(() => {
    if (contract && address) {
      fetchDonatedCampaigns();
    }
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
    <div>
      {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        <DisplayCampaigns
          title="Campaigns You Donated To"
          isLoading={isLoading}
          campaigns={filteredCampaigns}
          purpose="refund"
        />
    </div>
  );
};

export default Refund;