import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

const Refund = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [error, setError] = useState('');
    const { address, contract, getCampaigns, getDonations, refund } = useStateContext();
    const navigate = useNavigate();

    // Fetch campaigns that the user has donated to
    const fetchDonatedCampaigns = async () => {
        try {
            setIsLoading(true);
            setError('');
            const allCampaigns = await getCampaigns();

            // Filter campaigns where the user is a donator
            const donatedCampaigns = await Promise.all(
                allCampaigns.map(async (campaign, i) => {
                    try {
                        const donations = await getDonations(campaign.pId);
                        const userDonation = donations.find((d) => d.donator.toLowerCase() === address?.toLowerCase());
                        if (!userDonation) return null;

                        const status = await contract.call('getCampaignStatus', [campaign.pId]);
                        // Adjust deadline if it seems to be in milliseconds (legacy campaigns)
                        const adjustedDeadline =
                            campaign.deadline > 1e12 ? campaign.deadline / 1000 : campaign.deadline;
                        return {
                            ...campaign,
                            status,
                            id: campaign.pId,
                            adjustedDeadline,
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
        } catch (err) {
            setError('Failed to load campaigns. Please check your connection and try again.');
            console.error('Error fetching donated campaigns:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle refund request
    const handleRefund = async (campaignId, campaignStatus) => {
        if (campaignStatus !== 'Failed') {
            setError('Cannot refund: Campaign is not failed.');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const tx = await refund(campaignId);
            await tx.receipt;

            alert('Funds refunded successfully!');
            await fetchDonatedCampaigns(); // Refresh campaigns
        } catch (err) {
            let errorMessage = 'Failed to refund funds. ';
            if (err.reason) {
                errorMessage += err.reason;
            } else if (err.message.includes('Campaign is still ongoing')) {
                errorMessage += 'Campaign has not ended yet.';
            } else if (err.message.includes('Campaign reached its target')) {
                errorMessage += 'Campaign was successful, no refund available.';
            } else if (err.message.includes('Insufficient contract balance')) {
                errorMessage += 'Contract does not have enough funds to process refunds.';
            } else {
                errorMessage += 'Please try again later.';
            }

            setError(errorMessage);
            console.error('Refund error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Load campaigns when address or contract changes
    useEffect(() => {
        if (contract && address) {
            fetchDonatedCampaigns();
        }
    }, [address, contract]);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Request Refund</h1>

                {error && (
                    <div className="bg-red-100 border-l-4 scripted-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                    </div>
                ) : campaigns.length === 0 ? (
                    <p className="text-gray-600">You have not donated to any campaigns.</p>
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
                                        <span className="font-medium">Target:</span> {campaign.target} ETH
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        <span className="font-medium">Collected:</span> {campaign.amountCollected} ETH
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        <span className="font-medium">Your Donation:</span> {campaign.userDonation} ETH
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        <span className="font-medium">Deadline:</span>{' '}
                                        {new Date(campaign.adjustedDeadline * 1000).toLocaleDateString()}
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
                                    onClick={() => handleRefund(campaign.id, campaign.status)}
                                    disabled={campaign.status !== 'Failed' || isLoading}
                                    className={`mt-4 w-full py-2 px-4 rounded-md text-white font-medium ${
                                        campaign.status === 'Failed' && !isLoading
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    } transition`}
                                >
                                    {isLoading ? 'Processing...' : 'Request Refund'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Refund;