import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

const Withdraw = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState('');
  const { address, contract, getUserCampaigns } = useStateContext();
  const navigate = useNavigate();

  // Fetch user's campaigns
  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const data = await getUserCampaigns();
      const campaignsWithStatus = await Promise.all(
        data.map(async (campaign, i) => {
          const status = await contract.getCampaignStatus(i);
          return { ...campaign, status, id: i };
        })
      );
      setCampaigns(campaignsWithStatus);
    } catch (err) {
      setError('Failed to load campaigns. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle withdraw funds
  const handleWithdraw = async (campaignId) => {
    try {
      setIsLoading(true);
      setError('');
      const tx = await contract.withdrawFunds(campaignId);
      await tx.wait();
      alert('Funds withdrawn successfully!');
      fetchCampaigns(); // Refresh campaigns after withdrawal
    } catch (err) {
      setError('Failed to withdraw funds. Ensure the campaign has ended and has funds.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract && address) {
      fetchCampaigns();
    }
  }, [address, contract]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Withdraw Funds</h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <p className="text-gray-600">You have no campaigns to withdraw funds from.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/300')}
                />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{campaign.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{campaign.description}</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Target:</span>{' '}
                    {ethers.utils.formatEther(campaign.target)} ETH
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Collected:</span>{' '}
                    {ethers.utils.formatEther(campaign.amountCollected)} ETH
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Deadline:</span>{' '}
                    {new Date(campaign.deadline * 1000).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium">
                    <span className="font-medium">Status:</span>{' '}
                    <span
                      className={
                        campaign.status === 'Successful'
                          ? 'text-green-600'
                          : campaign.status === 'Ongoing'
                          ? 'text-blue-600'
                          : 'text-red-600'
                      }
                    >
                      {campaign.status}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleWithdraw(campaign.id)}
                  disabled={campaign.status !== 'Successful' || isLoading}
                  className={`mt-4 w-full py-2 px-4 rounded-md text-white font-medium ${
                    campaign.status === 'Successful' && !isLoading
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  } transition`}
                >
                  {isLoading ? 'Processing...' : 'Withdraw Funds'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdraw;