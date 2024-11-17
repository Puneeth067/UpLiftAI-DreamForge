import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, Bell, Settings, LogOut, Ticket, MessageSquare, User, 
  ChevronRight, HeadphonesIcon, Users, Clock, BarChart2, 
  Calendar, CheckCircle, AlertCircle
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../utils/supabase.js';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userData = location.state?.userData;
  const { loadUserTheme } = useTheme();
  const [activeItem, setActiveItem] = useState(null);
  const [activeView, setActiveView] = useState(null);

  useEffect(() => {
    const userDataFromAuth = location.state?.userData;
    if (!userDataFromAuth) {
      navigate('/auth', { replace: true });
      return;
    }

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

  // Updated menu items for agent dashboard
  const menuItems = [
    {
      title: 'Active Tickets',
      icon: Ticket,
      view: 'tickets',
      onClick: () => navigate('/agenttickets', { state: { userData } })
    },
    {
      title: 'Live Chat Queue',
      icon: MessageSquare,
      view: 'chat',
      onClick: () => navigate('/agentchatinterface', { state: { userData } })
    },
    {
      title: 'Performance Metrics',
      icon: BarChart2,
      view: 'metrics',
      onClick: () => navigate('/agentmetrics', { state: { userData } })
    },
    {
      title: 'Schedule',
      icon: Calendar,
      view: 'schedule',
      onClick: () => navigate('/agentschedule', { state: { userData } })
    },
    {
      title: 'Knowledge Base',
      icon: CheckCircle,
      view: 'knowledge',
      onClick: () => navigate('/knowledgebase', { state: { userData } })
    },
    {
      title: 'Team Chat',
      icon: Users,
      view: 'team',
      onClick: () => navigate('/teamchat', { state: { userData } })
    },
    {
      title: 'Profile Settings',
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-semibold dark:text-white">Dashboard</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} index={index} />
        ))}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 mt-auto">
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
            <p className="font-medium truncate dark:text-white">{profileData.fullname}</p>
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
        className="flex items-center w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors duration-200"
      >
        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
        <span className="text-sm font-medium">{item.title}</span>
        {item.subItems && (
          <ChevronRight className={`ml-auto h-4 w-4 transform transition-transform duration-200 ${activeItem === index ? 'rotate-90' : ''}`} />
        )}
      </button>
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, trend, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <span className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-1 dark:text-white">{value}</p>
    </div>
  );

  const RecentTicket = ({ ticket }) => (
    <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${
          ticket.priority === 'high' ? 'bg-red-500' :
          ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        }`} />
        <div>
          <p className="font-medium dark:text-white">{ticket.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">#{ticket.id} • {ticket.time}</p>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm ${
        ticket.status === 'open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
        ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      }`}>
        {ticket.status}
      </span>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <aside className="hidden md:block w-64 fixed left-0 top-0 h-full border-r border-gray-200 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-900 z-30">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 right-0 left-0 md:left-64 z-20 h-16">
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center space-x-3">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg md:hidden">
                    <Menu className="h-6 w-6 dark:text-white" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              
              <div className="flex items-center space-x-2">
                <HeadphonesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-semibold dark:text-white">Uplift-AI Assistance</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative">
                <Bell className="h-6 w-6 dark:text-white" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg hidden sm:block"
              onClick={handleSettingsClick}
              >
                <Settings className="h-6 w-6 dark:text-white" />
              </button>
              <button 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg hidden sm:block"
                onClick={handleLogout}
              >
                <LogOut className="h-6 w-6 dark:text-white" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto mt-16 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Agent Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Welcome back, {profileData?.fullname}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={Ticket}
                title="Active Tickets"
                value="12"
                trend={5}
                color="bg-blue-500"
              />
              <StatCard 
                icon={Clock}
                title="Avg Response Time"
                value="14m"
                trend={-8}
                color="bg-green-500"
              />
              <StatCard 
                icon={CheckCircle}
                title="Resolved Today"
                value="28"
                trend={12}
                color="bg-purple-500"
              />
              <StatCard 
                icon={Users}
                title="Customer Satisfaction"
                value="94%"
                trend={3}
                color="bg-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Tickets */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Tickets</h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  <RecentTicket 
                    ticket={{
                      id: "TK-7890",
                      title: "Login Authentication Issue",
                      priority: "high",
                      status: "open",
                      time: "10 min ago"
                    }}
                  />
                  <RecentTicket 
                    ticket={{
                      id: "TK-7889",
                      title: "Payment Processing Error",
                      priority: "medium",
                      status: "pending",
                      time: "25 min ago"
                    }}
                  />
                  <RecentTicket 
                    ticket={{
                      id: "TK-7888",
                      title: "Account Setup Help",
                      priority: "low",
                      status: "resolved",
                      time: "1 hour ago"
                    }}
                  />
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Current Status</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Ticket Queue</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">8 waiting</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Chat Queue</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">3 waiting</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Start Chat
                        </button>
                        <button className="flex items-center justify-center px-4 py-2 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg hover:bg-green-100 dark:hover:bg-green-800">
                          <Ticket className="h-4 w-4 mr-2" />
                          New Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;