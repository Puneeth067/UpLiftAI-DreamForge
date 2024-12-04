import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, LogOut, Bell as BellIcon
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
import SidebarContent from '@/components/layout/Sidebar/Sidebar';

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

const AgentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setProfileData] = useState(location.state?.userData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {isDarkMode, loadUserTheme } = useTheme();
  const [setIsCollapsed] = useState(true);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [notifications, setNotifications] = useState([]);

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

        // Fetch notifications for the user
        const { data: notificationData, error: notificationError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userDataFromAuth.id)
          .order('created_at', { ascending: false });

        if (notificationError) throw notificationError;
        setNotifications(notificationData || []);

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [location.state, navigate, loadUserTheme]);

  const handleLogout = async () => {
  try {
    // First, attempt to refresh the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    // If session exists, proceed with logout
    if (session) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }

    // Navigate away regardless of session status
    navigate('/', { 
      state: { userData }
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    // Fallback navigation in case of persistent session issues
    navigate('/', { 
      state: { userData }
    });
  }
};

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Update the notifications state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Notification Bell */}
      <button
        className="relative p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 hover:bg-violet-100 dark:hover:bg-violet-800/50"
        onClick={toggleDropdown}
      >
        <div className="relative">
          {/* Notification Count */}
          <div
            className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs flex items-center justify-center w-5 h-5${
              notifications.filter((n) => !n.read).length > 0 ? 'block' : 'hidden'
            }`}
          >
            {notifications.filter((n) => !n.read).length}
          </div>
          <BellIcon className="h-6 w-6  text-gray-800 dark:text-white" />
        </div>
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 overflow-hidden">
          {/* Dropdown Caret */}
          <div className="absolute -top-2 right-4 w-4 h-4 bg-white dark:bg-gray-800 transform rotate-45 shadow-sm" />
          <div className="py-2 max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-start ${
                  !notification.read ? 'bg-gray-50 dark:bg-gray-700 border-l-4 border-purple-500' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex-1 text-left">
                  {/* Left-Aligned Content */}
                  <div className="text-gray-900 dark:text-gray-100 text-sm font-medium">
                    {notification.message}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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

  return (
    <div className={`min-h-screen flex bg-violet-50 dark:bg-violet-950/50 transition-colors duration-200`}>
      <BackgroundSVG className="z-0 "/>
      <CyberCursorEffect />
      <aside 
      className={`hidden md:block fixed left-0 top-0 h-full border-r border-purple-100 dark:border-purple-900/50 shrink-0 bg-purple-50/80 dark:bg-purple-950/30 z-30 transition-all duration-600 ease-in-out`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      >
      <SidebarContent 
      userId={userData.id}
      isDarkMode={isDarkMode}
      />
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}>
      <header className={`
        bg-white/80 dark:bg-violet-900/30 
        backdrop-blur-md 
        border-b border-violet-100 dark:border-violet-800/50 
        fixed right-0 top-0 left-20 z-20 h-16 
        shadow-sm dark:shadow-violet-900/20
      `}> 
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center space-x-3">
              <Sheet>
                <SheetTrigger asChild>                  
                  <button className="p-2 hover:bg-violet-100 dark:hover:bg-violet-800/50 rounded-lg md:hidden transition-colors">
                  <Menu className="h-6 w-6 text-violet-600 dark:text-violet-300" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SidebarContent                   
                  userId={userData.id}
                  isDarkMode={isDarkMode}
                  />
                </SheetContent>
              </Sheet>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                 <div className="p-3 absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 100 100" 
                      className="h-8 w-8 relative text-violet-600 dark:text-violet-400"
                    >
                      <circle cx="50" cy="50" r="48" fill="url(#forgeGradient)"/>
                      <defs>
                        <linearGradient id="forgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4A90E2" stopOpacity="1"/>
                          <stop offset="100%" stopColor="#6D41A3" stopOpacity="1"/>
                        </linearGradient>
                      </defs>
                      <path d="M30 55 Q50 35, 70 55" fill="none" stroke="white" strokeWidth="4"/>
                      <path d="M30 55 L20 45 Q15 40, 25 35 Q35 30, 40 35" fill="none" stroke="white" strokeWidth="4"/>
                      <path d="M70 55 L80 45 Q85 40, 75 35 Q65 30, 60 35" fill="none" stroke="white" strokeWidth="4"/>
                      <circle cx="50" cy="55" r="8" fill="white"/>
                      <path d="M40 70 Q50 80, 60 70" fill="none" stroke="white" strokeWidth="3"/>
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-violet-900 dark:text-violet-100 tracking-tight">
                   DreamForge
                  </span>
                </div>
              </div>

            <div className="flex items-center space-x-2">
              <NotificationDropdown />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="p-2 hover:bg-violet-100 dark:hover:bg-violet-800/50 rounded-lg hidden sm:block transition-colors group">
                  <LogOut className="h-6 w-6 text-violet-600 dark:text-violet-300 group-hover:rotate-6 transition-transform" />
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
        <AgentNLP userData={userData} />
      </div>
    </div>
  );
};

export default AgentDashboard;