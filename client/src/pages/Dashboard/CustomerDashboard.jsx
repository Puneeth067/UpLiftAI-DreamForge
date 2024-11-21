import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, Settings, LogOut, Ticket, MessageSquare, User, ChevronRight, HeadphonesIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../utils/supabase.js';
import LoadingScreen from '@/components/ui/loading';
import CyberCursorEffect from "@/components/ui/CyberCursorEffect";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userData = location.state?.userData;
  const { loadUserTheme } = useTheme();

  useEffect(() => {
    const userDataFromAuth = location.state?.userData;
    if (!userDataFromAuth) {
      navigate('/auth', { replace: true });
      return;
    }

    // Load user theme
    loadUserTheme(userDataFromAuth.id);

    // Fetch profile data from Supabase
    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userDataFromAuth.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setProfileData(data);
        } else {
          throw new Error('Profile not found');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [location.state, navigate, loadUserTheme]);

  const [activeItem, setActiveItem] = useState(null);
  const [activeView, setActiveView] = useState(null);

  const menuItems = [
    {
      title: 'Tickets',
      icon: Ticket,
      view: 'tickets',
      onClick: () => navigate('/customertickets', { state: { userData } })
    },
    {
      title: 'Chat Support',
      icon: MessageSquare,
      view: 'chat',
      onClick: () => navigate('/customerchatinterface', { state: { userData } })
    },
    {
      title: 'Profile',
      icon: User,
      view: 'profile',
      onClick: () => navigate('/profile', { state: { userData } })
    }
  ];
  
  const handleSettingsClick = () => {
    navigate('/settings', { 
      state: { 
        userData,
        userType: profileData?.usertype || 'user' 
      } 
    });
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-semibold dark:text-gray-100">Dashboard</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} index={index} />
        ))}
      </nav>

      <div className="border-t dark:border-gray-700 p-4 mt-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profileData?.avatar_url ? (
              <img 
                src={`/avatars/${profileData.avatar_url}`}
                alt={profileData.fullname}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/avatars/user.png';
                }}
              />
            ) : (
              <img 
                src="/avatars/user.png"
                alt="Default User"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate dark:text-gray-100">{profileData.fullname}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{profileData.email}</p>
            {profileData.department && (
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{profileData.department}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const MenuItem = ({ item, index }) => (
    <div className="mb-2">
      <button 
        onClick={() => {
          if (item.onClick) {
            item.onClick();
          } else {
            setActiveView(item.view);
            setActiveItem(activeItem === index ? null : index);
          }
        }}
        className="flex items-center w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-200"
      >
        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
        <span className="text-sm font-medium">{item.title}</span>
        {item.subItems && (
          <ChevronRight className={`ml-auto h-4 w-4 transform transition-transform duration-200 ${activeItem === index ? 'rotate-90' : ''}`} />
        )}
      </button>
    </div>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen dark:bg-gray-900">
        <div className="text-lg text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <CyberCursorEffect />
      <aside className="hidden md:block w-64 fixed left-0 top-0 h-full border-r dark:border-gray-700 shrink-0 bg-white dark:bg-gray-900 z-30 transition-colors duration-200">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 fixed top-0 right-0 left-0 md:left-64 z-20 h-16 transition-colors duration-200">
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center space-x-3">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg md:hidden transition-colors duration-200">
                    <Menu className="h-6 w-6 dark:text-gray-100" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              
              <div className="flex items-center space-x-2">
                <HeadphonesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-semibold dark:text-gray-100">Uplift-AI Assistance</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors duration-200">
                <Bell className="h-6 w-6 dark:text-gray-100" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hidden sm:block transition-colors duration-200"
                onClick={handleSettingsClick}
              >
                <Settings className="h-6 w-6 dark:text-gray-100" />
              </button>
              <button 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hidden sm:block transition-colors duration-200"
                onClick={handleLogout}
              >
                <LogOut className="h-6 w-6 dark:text-gray-100" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto mt-16 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg border border-blue-100 dark:border-gray-600 transition-colors duration-200">
              <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-400 mb-4">
                Welcome {profileData.fullname}! 👋
              </h1>
              
              <div className="space-y-6">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Your gateway to seamless customer support. We're here to make your experience smooth and efficient.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-blue-100 dark:border-gray-700 transition-colors duration-200">
                    <div className="flex items-center mb-3">
                      <Ticket className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Quick Support</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Create and track support tickets for faster issue resolution. We prioritize your concerns.
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-blue-100 dark:border-gray-700 transition-colors duration-200">
                    <div className="flex items-center mb-3">
                      <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Live Chat</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Connect with our support team in real-time through our intuitive chat interface.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-lg mt-6 transition-colors duration-200">
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    👉 <span className="font-medium">Use the sidebar menu to navigate between different sections and access all our support features.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;