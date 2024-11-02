import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import Navigation from './Navigation';
import NotificationDropdown from '../../../pages/Notification/NotificationDropdown';

const Header = ({ title }) => {
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');
  const userName = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section: Logo and Navigation */}
          <div className="flex items-center gap-4">
            <img
              className="h-8 w-auto"
              src="/icons/customer-care-logo.png"
              alt="Customer Care Logo"
            />
            <h1 className="text-xl font-bold">{title}</h1>
            <Navigation userType={userType} />
          </div>

          {/* Right section: User actions and profile */}
          <div className="flex items-center gap-4">
            {/* Notification button */}
            <button 
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
              aria-label="Notifications"
            >
              <NotificationDropdown />
            </button>

            {/* Settings button */}
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200" />

            {/* User profile section */}
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <p className="font-medium text-gray-700">{userName}</p>
                <p className="text-gray-500 capitalize">{userType}</p>
              </div>
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
