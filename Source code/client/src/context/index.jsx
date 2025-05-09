import React, { useContext, createContext } from 'react';
import { useAddress, useContract, useConnect, useDisconnect, metamaskWallet, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
    const { contract } = useContract(import.meta.env.VITE_CONTRACT_ADDRESS);
    const { mutateAsync: createCampaign } = useContractWrite(contract, "createCampaign");

    const address = useAddress();
    const connect = useConnect();
    const disconnect = useDisconnect();
    const connectWithMetamask = () => connect(metamaskWallet());

    const publishCampaign = async (form) => {
        try {
            const data = await createCampaign({
                args: [
                    address, // owner
                    form.title, // title
                    form.description, // description
                    form.target, // target
                    Math.floor(new Date(form.deadline).getTime() / 1000), // deadline (giây)
                    form.image, // image
                ]
            });
            console.log('Contract call success', data);
        } catch (error) {
            console.log('Contract call failure', error);
        }
    };

    const getCampaigns = async () => {
        const campaigns = await contract.call('getCampaigns');
        const parsedCampaigns = campaigns.map((campaign, i) => ({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline: campaign.deadline.toNumber(),
            amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
            image: campaign.image,
            pId: i
        }));
        return parsedCampaigns;
    };

    const getUserCampaigns = async () => {
        const allCampaigns = await getCampaigns();
        const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);
        return filteredCampaigns;
    };

    const donate = async (pId, amount) => {
        const data = await contract.call('donateToCampaign', [pId], { value: ethers.utils.parseEther(amount) });
        return data;
    };

    const getDonations = async (pId) => {
        try {
          const donations = await contract.call('getDonators', [pId]);
          const numberOfDonations = donations[0].length;
          const aggregatedDonations = {};
    
          for (let i = 0; i < numberOfDonations; i++) {
            const donator = donations[0][i];
            const donation = ethers.utils.formatEther(donations[1][i].toString());
            
            if (!aggregatedDonations[donator]) {
              aggregatedDonations[donator] = { donator, donation: 0 };
            }
            aggregatedDonations[donator].donation = (parseFloat(aggregatedDonations[donator].donation) + parseFloat(donation)).toString();
          }
    
          return Object.values(aggregatedDonations);
        } catch (error) {
          console.error('Error fetching donations:', error);
          return [];
        }
    };

    const getStatus = async (pId) => {
        const status = await contract.call('getCampaignStatus', [pId]);
        return status;
    };

    const withdraw = async (pId) => {
        const data = await contract.call('withdrawFunds', [pId]);
        return data;
    };

    const refund = async (pId) => {
        const data = await contract.call('refundDonators', [pId]);
        return data;
    };

    return (
        <StateContext.Provider
            value={{
                address,
                contract,
                connect: connectWithMetamask,
                disconnect,
                createCampaign: publishCampaign,
                getCampaigns,
                getUserCampaigns,
                donate,
                getDonations,
                refund,
                getStatus,
                withdraw,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);