import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';
import { CampaignDetails } from '../components';

const CampaignDetailRefund = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { refund } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRefund = async () => {
    if (state.status !== 'Failed') {
      setError('Cannot refund: Campaign is not failed.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const tx = await refund(state.pId);
      await tx.receipt;
      alert('Funds refunded successfully!');
      navigate('/refund'); // Redirect to Refund page after success
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

  return (
    <div>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      <CampaignDetails
        handleAction={handleRefund}
        actionFormProps={{
          title: 'Refund',
          description: 'Refund your donation',
          buttonText: isLoading ? 'Processing...' : 'Refund',
          buttonColor: 'bg-[#1dc071]',
          showInput: false,
        }}
      />
    </div>
  );
};

export default CampaignDetailRefund;