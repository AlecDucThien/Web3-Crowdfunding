import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Sidebar, Navbar } from './components';
import { CampaignDetailWithdraw, CampaignDetailRefund, CreateCampaign, Home, Profile, WithDraw, ReFund, CampaignDetailDonate} from './pages';

const App = () => {
  return (
    <div className="relative sm:-8 p-4 bg-[#13131a] min-h-screen flex flex-row">
      <div className="sm:flex hidden mr-10 relative">
        <Sidebar />
      </div>

      <div className="flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-campaign" element={<CreateCampaign />} />
          <Route path="/campaign-details/donate/:id" element={<CampaignDetailDonate />} />
          <Route path="/campaign-details/withdraw/:id" element={<CampaignDetailWithdraw />} />
          <Route path="/campaign-details/refund/:id" element={<CampaignDetailRefund />} />
          <Route path="/withdraw" element={<WithDraw />} />
          <Route path="/refund" element={<ReFund />} />
        </Routes>
      </div>
    </div>
  )
}

export default App