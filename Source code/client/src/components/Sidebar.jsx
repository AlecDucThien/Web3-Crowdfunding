import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStateContext } from '../context';
import { logo } from '../assets';
import { navlinks } from '../constants';

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick }) => (
  <div
    className={`w-[48px] h-[48px] rounded-[10px] ${
      isActive && isActive === name && 'bg-[#2c2f32]'
    } flex justify-center items-center ${
      !disabled && 'cursor-pointer'
    } ${styles}`}
    onClick={handleClick}
  >
    {!isActive ? (
      <img src={imgUrl} alt="fund_logo" className="w-1/2 h-1/2" />
    ) : (
      <img
        src={imgUrl}
        alt="fund_logo"
        className={`w-1/2 h-1/2 ${isActive !== name && 'grayscale'}`}
      />
    )}
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState('dashboard');
  const location = useLocation();
  const { disconnect, address, connect } = useStateContext();

  // Cập nhật isActive dựa trên đường dẫn hiện tại khi component mount hoặc route thay đổi
  useEffect(() => {
    const currentPath = location.pathname.split('/')[1];
    const activeLink = navlinks.find((link) => link.link === '/' + currentPath);
    if (activeLink) {
      setIsActive(activeLink.name);
    } else {
      setIsActive('dashboard');
    }
  }, [location]);

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      disconnect();
      navigate('/', { replace: true });
    }
  };

  const handleNavigation = (link) => {
    if (link.name === 'dashboard') {
      setIsActive(link.name);
      navigate(link.link);
    } else {
      if (!address) {
        const confirmConnect = window.confirm(
          'You need to connect your wallet to access this feature. Do you want to connect now?'
        );
        if (confirmConnect) {
          connect();
        } else {
          setIsActive('dashboard');
          navigate('/');
        }
      } else {
        if (link.name === 'logout') {
          handleLogout();
        } else {
          setIsActive(link.name);
          navigate(link.link);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center sticky top-5 h-[93vh] w-[76px]">
      {/* Logo */}
      <Link to="/">
        <Icon styles="w-[52px] h-[52px] bg-[#2c2f32]" imgUrl={logo} />
      </Link>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col justify-start items-center bg-[#1c1c24] rounded-[20px] w-[76px] py-4 mt-12">
        <div className="flex flex-col h-full justify-between items-center gap-3">
          {navlinks.map((link) => (
            <Icon
              key={link.name}
              {...link}
              isActive={isActive}
              handleClick={() => handleNavigation(link)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;