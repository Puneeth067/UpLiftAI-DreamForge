import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, Settings, LogOut, Ticket, MessageSquare, User, ChevronRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from '../../utils/supabase.js';  // Import supabase

const AgentDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeView, setActiveView] = useState('tickets');
    const [activeItem, setActiveItem] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
      const path = location.pathname;
      const userDataFromAuth = location.state?.userData;
    
      // Set initial active view based on path
      if (path.includes('chat')) {
        setActiveView('chat');
      } else if (path.includes('profile')) {
        setActiveView('profile');
      } else {
        setActiveView('tickets');
      }
    
      // Get user data from location state and handle redirection if missing
      if (!userDataFromAuth) {
        navigate('/auth', { replace: true });
      } else {
        setUserData(userDataFromAuth);
      }
    }, [location, navigate]);
    

  const menuItems = [
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
      onClick: () => navigate('/agentchatinterface')
    },
    {
      title: 'Profile',
      icon: User,
      view: 'profile'
    }
  ];

  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();  // Use supabase to sign out
      if (error) throw error;
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      // Optionally show a toast message here
    }
  };

    // Modified SidebarContent to use actual user data
    const SidebarContent = () => (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Ticket className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-semibold">SupportHub</span>
          </div>
        </div>
  
        <nav className="flex-1 overflow-y-auto p-4">
          {menuItems.map((item, index) => (
            <MenuItem key={index} item={item} index={index} />
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
        className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
          activeView === item.view ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
        }`}
      >
        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
        <span className="text-sm font-medium">{item.title}</span>
        {item.subItems && (
          <ChevronRight className={`ml-auto h-4 w-4 transform transition-transform duration-200 ${activeItem === index ? 'rotate-90' : ''}`} />
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

  const renderContent = () => {
    switch (activeView) {
      case 'tickets':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Tickets Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium mb-2">Active Tickets</h2>
                <p className="text-3xl font-bold text-blue-600">12</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium mb-2">Pending Response</h2>
                <p className="text-3xl font-bold text-yellow-600">5</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium mb-2">Resolved Today</h2>
                <p className="text-3xl font-bold text-green-600">8</p>
              </div>
            </div>
            
            <div className="mt-6 bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Recent Tickets</h2>
                <div className="text-gray-500">No recent tickets to display</div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Agent Profile</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <h2 className="text-xl font-medium">John Doe</h2>
                  <p className="text-gray-500">Support Agent</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
              <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg hidden sm:block">
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto pt-16 p-4 md:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;
