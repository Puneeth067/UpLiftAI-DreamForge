import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu, Bell, Settings, LogOut, Ticket, MessageSquare, User, ChevronRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from '../../utils/supabase.js';

// Constants
const MENU_ITEMS = [
  {
    title: 'Tickets',
    icon: Ticket,
    view: 'tickets',
    subItems: ['Tickets Assigned', 'Tickets Resolved']
  },
  {
    title: 'Chat Support',
    icon: MessageSquare,
    view: 'chat',
  },
  {
    title: 'Profile',
    icon: User,
    view: 'profile'
  }
];

// MenuItem Component with PropTypes
const MenuItem = ({ item, activeView, activeItem, index, onItemClick }) => {
  const handleClick = () => {
    onItemClick(item, index);
  };

  return (
    <div className="mb-2">
      <button 
        onClick={handleClick}
        className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
          activeView === item.view ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
        }`}
      >
        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
        <span className="text-sm font-medium">{item.title}</span>
        {item.subItems && (
          <ChevronRight 
            className={`ml-auto h-4 w-4 transform transition-transform duration-200 ${
              activeItem === index ? 'rotate-90' : ''
            }`} 
          />
        )}
      </button>
      {item.subItems && activeItem === index && (
        <div className="ml-6 mt-1 space-y-1">
          {item.subItems.map((subItem, subIndex) => (
            <button
              key={subIndex}
              className="flex items-center w-full p-2 text-sm rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200"
            >
              {subItem}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

MenuItem.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    view: PropTypes.string.isRequired,
    subItems: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  activeView: PropTypes.string.isRequired,
  activeItem: PropTypes.number,
  index: PropTypes.number.isRequired,
  onItemClick: PropTypes.func.isRequired
};

const AgentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState('tickets');
  const [activeItem, setActiveItem] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataFromAuth = location.state?.userData;
        
        if (!userDataFromAuth) {
          navigate('/auth', { replace: true });
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userDataFromAuth.id)
          .single();

        if (profileError) throw profileError;

        if (profile.usertype !== 'agent') {
          navigate('/customerdashboard', { replace: true });
          return;
        }

        setUserData({
          id: userDataFromAuth.id,
          email: userDataFromAuth.email,
          fullName: profile.fullname,
          department: profile.department,
          userType: profile.usertype,
        });

      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, location.state?.userData]);

  const handleItemClick = (item, index) => {
    if (item.view === 'chat') {
      navigate('/agentchatinterface');
    } else {
      setActiveView(item.view);
      setActiveItem(activeItem === index ? null : index);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <Ticket className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-semibold">SupportHub</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {MENU_ITEMS.map((item, index) => (
          <MenuItem 
            key={index}
            item={item}
            index={index}
            activeView={activeView}
            activeItem={activeItem}
            onItemClick={handleItemClick}
          />
        ))}
      </nav>

      <div className="border-t p-4 mt-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{userData?.fullName || 'Loading...'}</p>
            <p className="text-sm text-gray-500 truncate">
              {userData?.department || 'Agent'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="hidden md:block w-64 fixed left-0 top-0 h-full border-r shrink-0 bg-white z-30">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <header className="bg-white border-b fixed top-0 right-0 left-0 md:left-64 z-20">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 hover:bg-gray-100 rounded-lg md:hidden">
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              
              <div className="flex items-center space-x-2">
                <Ticket className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-semibold">Support Hub</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg hidden sm:block">
                <Settings className="h-6 w-6" />
              </button>
              <button 
                onClick={handleLogout} 
                className="p-2 hover:bg-gray-100 rounded-lg hidden sm:block"
                disabled={isLoading}
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto pt-16 p-4 md:p-6">
          {/* Content will be added here based on the active view */}
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;