import { createCampaign,refund, create, dashboard, logout, payment, profile, withdraw } from '../assets';

export const navlinks = [
  {
    name: 'dashboard',
    imgUrl: dashboard,
    link: '/',
  },
  {
    name: 'campaign',
    imgUrl: createCampaign,
    link: '/create-campaign',
  },
  {
    name: 'refund',
    imgUrl: refund,
    link: '/refund',
    //disabled: true,
  },
  {
    name: 'withdraw',
    imgUrl: withdraw,
    link: '/withdraw',
    //disabled: true,
  },
  {
    name: 'profile',
    imgUrl: profile,
    link: '/profile',
  },
  {
    name: 'logout',
    imgUrl: logout,
    link: '/',
    //disabled: true,
  },
];