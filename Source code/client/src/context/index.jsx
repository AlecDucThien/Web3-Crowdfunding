import React, { useContext, createContext } from 'react';
import { useAddress, useContract, useConnect, metamaskWallet, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
    const { contract } = useContract(import.meta.env.VITE_CONTRACT_ADDRESS);
    const { mutateAsync: createCampaign } = useContractWrite(contract, "createCampaign");

    const address = useAddress();
    const connect = useConnect();
    const connectWithMetamask = () => connect(metamaskWallet());


    const publishCampaign = async (form) => {
        try {
            const data = await createCampaign({
                args: [
                  address, // owner
                  form.title, // title
                  form.description, // description
                  form.target, // target
                  new Date(form.deadline).getTime(), // deadline
                  form.image, // image
                ]
              });              
    
            console.log('Contract call success', data)
            
        } catch (error) {
            console.log('Contract call failure', error)
        }
        
    }
    const getCampaigns = async () => {
        const campaigns = await contract.call('getCampaigns');
    
        const parsedCampaings = campaigns.map((campaign, i) => ({
          owner: campaign.owner,
          title: campaign.title,
          description: campaign.description,
          target: ethers.utils.formatEther(campaign.target.toString()),
          deadline: campaign.deadline.toNumber(),
          amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
          image: campaign.image,
          pId: i
        }));
    
        return parsedCampaings;
      }
    
      const getUserCampaigns = async () => {
        const allCampaigns = await getCampaigns();
    
        const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);
    
        return filteredCampaigns;
      }
    
      const donate = async (pId, amount) => {
        const data = await contract.call('donateToCampaign', [pId], { value: ethers.utils.parseEther(amount)});
    
        return data;
      }
    
      const getDonations = async (pId) => {
        const donations = await contract.call('getDonators', [pId]);
        const numberOfDonations = donations[0].length;
    
        const parsedDonations = [];
    
        for(let i = 0; i < numberOfDonations; i++) {
          parsedDonations.push({
            donator: donations[0][i],
            donation: ethers.utils.formatEther(donations[1][i].toString())
          })
        }
    
        return parsedDonations;
      }
    

    return (
        <StateContext.Provider
            value={{
                address,
                contract,
                connect: connectWithMetamask,
                createCampaign: publishCampaign,
                getCampaigns,
                getUserCampaigns,
                donate,
                getDonations
            }}
        >
            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext);
