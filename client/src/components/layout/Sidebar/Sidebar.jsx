import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, MessageSquare, Palette, User, Settings, 
  PanelLeftOpen, PanelLeftClose 
} from 'lucide-react';
import SidebarLoading from './SidebarLoading';
import { supabase } from '@/utils/supabase';

const SidebarContent = ({ 
  userId,
  isDarkMode
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(() => {
    if (location.state?.patron) {
      return location.state?.patron;
    }
    return location.state?.userData;
  });
  const [loading, setLoading] = useState(true);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
        className: isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : ""
      });
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsCollapsed(true);
    }, 400);
    setHoverTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  const menuItems = [
    {
      title: 'Home',
      icon: Home,
      onClick: () => navigate(
        userData?.usertype === 'agent' ? '/agentdashboard' : '/customerdashboard', 
        { state: { userData } }
      )
    },
    {
      title: 'Messages',
      icon: MessageSquare,
      onClick: () => navigate(
        userData?.usertype === 'agent' ? '/agenttickets' : '/customertickets', 
        { state: { userData } }
      )
    },
    ...(userData?.usertype === 'agent' ? [
      {
        title: 'Portfolio',
        icon: Palette,
        onClick: () => navigate('/portfolio', { state: { userData } })
      }
    ] : []),
    ...(userData?.usertype === 'customer' ? [
      {
        title: 'Discover Creators',
        icon: Palette,
        onClick: () => navigate('/portfolioview', { state: { userData } })
      }
    ] : []),
    {
      title: 'Profile',
      icon: User,
      onClick: () => navigate('/profile', { state: { userData } })
    },
    {
      title: 'Settings',
      icon: Settings,
      onClick: () => navigate('/settings', { state: { userData } })
    }    
  ];
  
  const MenuItem = ({ item }) => (
    <div className="mb-2">
      <button 
        onClick={item.onClick}
        className={`flex items-center w-full p-3 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-100 transition-colors duration-200 ${
          isCollapsed ? 'justify-center' : ''
        }`}
        title={isCollapsed ? item.title : ''}
      >
        <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
        {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
      </button>
    </div>
  );

  MenuItem.propTypes = {
    item: PropTypes.shape({
      title: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      onClick: PropTypes.func.isRequired,
    }).isRequired,
  };

  return(
  <div 
    className={`flex flex-col h-full bg-purple-50/80 dark:bg-purple-950 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
  >
    <Toaster />
    <div className="p-3 border-b border-purple-100 dark:border-purple-900/50 flex items-center justify-between">
      <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed && <span className="text-xl font-semibold dark:text-white">Menu</span>}
        <div className="p-2 hover:bg-purple-100/80 dark:hover:bg-purple-900/50 rounded-lg">
          {isCollapsed ? 
            <PanelLeftOpen className="h-6 w-6 dark:text-white" /> : 
            <PanelLeftClose className="h-6 w-6 dark:text-white" />
          }
        </div>
      </div>
    </div>

    <nav className="flex-1 overflow-y-auto p-4">
      {menuItems.map((item, index) => (
        <MenuItem key={index} item={item} index={index} />
      ))}
    </nav>

    <div className="border-t border-purple-100 dark:border-purple-900/50 p-4 mt-auto">
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {userData?.avatar_url ? (
            <img 
              src={`${userData.avatar_url}`}
              alt={userData.fullname}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `/avatars/${userData.avatar_url}`;
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
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="font-medium truncate dark:text-white">{userData.fullname}</p>
            <p className="text-sm text-purple-600 dark:text-purple-300 truncate">{userData.email}</p>
            {userData.department && (
              <p className="text-xs text-purple-500 dark:text-purple-400 truncate">{userData.department}</p>
            )}
          </div>
        )}
      </div>
    </div>
    {loading && <SidebarLoading isDarkMode={isDarkMode} />}
  </div>
)
};

SidebarContent.propTypes = {
  userId: PropTypes.string.isRequired,
  isDarkMode: PropTypes.bool.isRequired
};

export default SidebarContent;