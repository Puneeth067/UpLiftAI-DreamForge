import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, Settings, LogOut, MessageSquare, Home, User,
  PanelLeftOpen, PanelLeftClose, Wand2,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import LoadingScreen from "@/components/ui/loading";
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../utils/supabase.js';
import CyberCursorEffect from "@/components/ui/CyberCursorEffect";
import AgentNLP from '../NLP/AgentNLP';

const BackgroundSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    preserveAspectRatio="xMidYMid slice"
    viewBox="0 0 1440 900"
  >
    <defs>
      <radialGradient id="lightGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#F8F0FF" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#F0E6FF" stopOpacity="0.2" />
      </radialGradient>
     
      <radialGradient id="accentGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#9B6DFF" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#D4BBFF" stopOpacity="0.1" />
      </radialGradient>

      <radialGradient id="darkGradient" cx="50%" cy="50%" r="75%">
        <stop offset="0%" stopColor="#2A1352" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#1A0B38" stopOpacity="0.2" />
      </radialGradient>
     
      <filter id="blurFilter">
        <feGaussianBlur stdDeviation="60" />
      </filter>

      <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="currentColor" className="text-purple-200 dark:text-purple-900" opacity="0.3" />
      </pattern>
    </defs>
   
    {/* Light Mode Patterns */}
    <g className="opacity-100 dark:opacity-0">
      <rect width="100%" height="100%" fill="url(#dots)" />
      <circle cx="200" cy="150" r="400" fill="url(#lightGradient)" filter="url(#blurFilter)" />
      <circle cx="1200" cy="300" r="500" fill="url(#lightGradient)" opacity="0.4" filter="url(#blurFilter)" />
      <circle cx="800" cy="600" r="300" fill="url(#accentGradient)" opacity="0.3" filter="url(#blurFilter)" />
      <path d="M0,300 Q720,400 1440,300 Q720,500 0,300" fill="url(#accentGradient)" opacity="0.15" />
      <ellipse cx="600" cy="750" rx="600" ry="300" fill="url(#lightGradient)" opacity="0.2" filter="url(#blurFilter)" />
    </g>
   
    {/* Dark Mode Patterns */}
    <g className="opacity-0 dark:opacity-100">
      <rect width="100%" height="100%" fill="url(#dots)" />
      <circle cx="300" cy="200" r="600" fill="url(#darkGradient)" filter="url(#blurFilter)" />
      <path d="M1440,600 Q720,800 0,600 Q720,400 1440,600" fill="url(#darkGradient)" opacity="0.25" />
      <ellipse cx="1100" cy="500" rx="700" ry="400" fill="url(#darkGradient)" opacity="0.2" filter="url(#blurFilter)" />
      <circle cx="800" cy="750" r="400" fill="url(#darkGradient)" opacity="0.15" filter="url(#blurFilter)" />
    </g>
  </svg>
);

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setProfileData] = useState(location.state?.userData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { loadUserTheme } = useTheme();
  const [activeItem, setActiveItem] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [setActiveView] = useState('home');
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    // Add a small delay before collapsing to make the interaction smoother
    const timeout = setTimeout(() => {
      setIsCollapsed(true);
    }, 400); // 300ms delay
    setHoverTimeout(timeout);
  };

  // Clear timeout on component unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

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

  // Updated menu items for creator dashboard
  const menuItems = [
    {
      title: 'Home',
      icon: Home,
      view: 'home',
      onClick: () => navigate('/customerdashboard', { state: { userData } })
    },
    {
      title: 'Messages',
      icon: MessageSquare,
      view: 'tickets',
      onClick: () => navigate('/customertickets', { state: { userData } })
    },
    {
      title: 'Profile',
      icon: User,
      view: 'profile',
      onClick: () => navigate('/profile', { state: { userData } })
    },
    {
      title: 'Settings',
      icon: Settings,
      view: 'settings',
      onClick: () => navigate('/settings', { state: { userData } })
    }    
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/',{ 
        state: { userData }
      });
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
    <div 
      className={`flex flex-col h-full bg-purple-50/80 dark:bg-purple-950 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
      view: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    }).isRequired,
    index: PropTypes.number.isRequired,
  };

  return (
    <div className={`min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <BackgroundSVG className="z-0 "/>
      <CyberCursorEffect />
      <aside 
        className={`hidden md:block fixed left-0 top-0 h-full border-r border-purple-100 dark:border-purple-900/50 shrink-0 bg-purple-50/80 dark:bg-purple-950/30 z-30 transition-all duration-600 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarContent />
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}>
        <header className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed right-0 top-0 ${isCollapsed ? 'left-20' : 'left-64'} z-20 h-16`}>
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
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="p-3 absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <Wand2 className="h-8 w-8 relative text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    DreamForge
                  </span>
                </div>
              </div>

            <div className="flex items-center space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg hidden sm:block">
                    <LogOut className="h-6 w-6 dark:text-white" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to log out? You`ll need to sign in again to access the DreamForge.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleLogout}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Log out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </div>
          </div>
        </header>
        <AgentNLP userData={userData} isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default CustomerDashboard;