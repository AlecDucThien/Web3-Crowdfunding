import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Sidebar, Navbar } from './components';
import { CampaignDetailWithdraw, CampaignDetailRefund, CreateCampaign, Home, Profile, WithDraw, ReFund, CampaignDetailDonate} from './pages';

const App = () => {
  return (
    <div className='flex items-center bg-[#13131a] justify-center pt-4'>
      <div className="relative sm:-8 p-4 bg-[#13131a] min-h-screen flex flex-row max-w-[1200px] w-full">
        <div className="sm:flex hidden mr-10 relative">
          <Sidebar />
        </div>

        <div className="flex-1 max-sm:w-full mx-auto sm:pr-5">
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/campaign-details/:id" element={<CampaignDetailDonate />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/donate/campaign-details/:id" element={<CampaignDetailDonate />} />
            <Route path="/withdraw/campaign-details/:id" element={<CampaignDetailWithdraw />} />
            <Route path="/refund/campaign-details/:id" element={<CampaignDetailRefund />} />
            <Route path="/withdraw" element={<WithDraw />} />
            <Route path="/refund" element={<ReFund />} />
          </Routes>
        </div>
      </div>
    </div>
    
  )
}

export default App