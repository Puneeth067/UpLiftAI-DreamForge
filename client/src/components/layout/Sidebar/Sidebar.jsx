import React, { useState, useEffect, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Proportions, Palette, User, Settings, 
  PanelLeftOpen, PanelLeftClose, Menu, X, ChevronRight 
} from 'lucide-react';
import SidebarLoading from './SidebarLoading';
import { supabase } from '@/utils/supabase';
import PropTypes from 'prop-types';

// Extract the hook to a separate function before component definition
function useResponsiveScreen() {
  const [screenSize, setScreenSize] = useState(() => {
    const width = window.innerWidth;
    return {
      width,
      isMobile: width <= 768,
      isTablet: width > 768 && width <= 1024
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 768;
      const tablet = width > 768 && width <= 1024;

      setScreenSize({ 
        width, 
        isMobile: mobile, 
        isTablet: tablet 
      });
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return screenSize;
}

const SidebarContent = ({ 
  userId,
  isDarkMode
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(() => {
    return location.state?.patron || location.state?.userData;
  });
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const screenSize = useResponsiveScreen();

  // Optimized fetch profile function
  const fetchProfile = useCallback(async () => {
    if (!userId) return;

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
  }, [userId, isDarkMode]);

  useEffect(() => {
    // Responsive sidebar behavior
    if (screenSize.isMobile) {
      setIsCollapsed(true);
      setIsPinned(false);
    } else if (screenSize.isTablet) {
      setIsCollapsed(true);
    }

    // Existing profile fetch logic remains the same
    fetchProfile();
  }, [screenSize, fetchProfile]);

  // Menu Items Configuration
  const menuItems = [
    {
      title: 'Home',
      icon: Home,
      route: userData?.usertype === 'agent' ? '/agentdashboard' : '/customerdashboard'
    },
    {
      title: 'Proposal',
      icon: Proportions,
      route: userData?.usertype === 'agent' ? '/agenttickets' : '/customertickets'
    },
    ...(userData?.usertype === 'agent' ? [
      {
        title: 'Portfolio',
        icon: Palette,
        route: '/portfolio'
      }
    ] : []),
    ...(userData?.usertype === 'customer' ? [
      {
        title: 'Discover Creators',
        icon: Palette,
        route: '/portfolioview'
      }
    ] : []),
    {
      title: 'Profile',
      icon: User,
      route: '/profile'
    },
    {
      title: 'Settings',
      icon: Settings,
      route: '/settings'
    }
  ];

  // Memoized MenuItem component
const MenuItem = React.memo(function MenuItem({ 
  item, 
  isCollapsed, 
  isMobile, 
  onNavigate 
}) {
  const handleClick = () => onNavigate(item.route);

  return (
    <button 
      onClick={handleClick}
      className={`
        group flex items-center w-full p-3 rounded-lg 
        hover:bg-purple-100 dark:hover:bg-purple-900 
        text-purple-900 dark:text-purple-100 
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-purple-300
        ${isCollapsed && !isMobile ? 'justify-center' : 'space-x-3'}
      `}
      aria-label={item.title}
      title={(isCollapsed && !isMobile) || isMobile ? item.title : ''}
      role="menuitem"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <item.icon 
        className={`
          h-5 w-5 flex-shrink-0 
          transition-transform duration-300 
          group-hover:rotate-6 
          ${isCollapsed && !isMobile ? '' : 'mr-3'}
        `} 
      />
      {(!isCollapsed || isMobile) && (
        <>
          <span 
            className="text-sm font-medium flex-1 truncate"
            aria-hidden={isCollapsed && !isMobile}
          >
            {item.title}
          </span>
          <ChevronRight 
            className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" 
            aria-hidden="true"
          />
        </>
      )}
    </button>
  );
});

MenuItem.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    route: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
  }).isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

const navigateToRoute = useCallback((route) => {
  try {
    navigate(route, { 
      state: { 
        userData,
        navigationSource: 'sidebar' 
      }
    });
    
    // Close mobile menu if open
    if (screenSize.isMobile) setIsMobileMenuOpen(false);
  } catch {
    toast({
      title: "Navigation Error",
      description: "Unable to navigate to the requested route",
      variant: "destructive"
    });
  }
}, [navigate, userData, screenSize.isMobile]);

  // Mobile Overlay Menu
  const MobileMenu = () => (
    <div 
      className="
        fixed inset-0 z-50 
        bg-purple-50/95 dark:bg-purple-950/95 
        backdrop-blur-sm lg:hidden 
        animate-fadeIn
      "
    >
      <div className="flex justify-between p-4 border-b border-purple-100 dark:border-purple-900/50">
        <span className="text-2xl font-bold text-purple-900 dark:text-white">Menu</span>
        <button 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="
            text-purple-900 dark:text-white 
            hover:bg-purple-100 dark:hover:bg-purple-900 
            rounded-full p-2 transition-colors
          "
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="p-4 space-y-2">
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} />
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <aside 
        role="navigation"
        aria-label="Main Menu"
        className={`
          hidden lg:flex flex-col h-screen 
          bg-purple-50/80 dark:bg-purple-950 
          fixed left-0 top-0 bottom-0 
          shadow-lg
          transition-all duration-500 ease-in-out 
          z-40 
          ${(isCollapsed && !screenSize.isMobile) ? 'w-20' : 'w-64'}
        `}
        onMouseEnter={() => !isPinned && !screenSize.isMobile && setIsCollapsed(false)}
        onMouseLeave={() => !isPinned && !screenSize.isMobile && setIsCollapsed(true)}
      >
        <Toaster />
        
        {/* Header */}
        <div 
          className="
            p-4 border-b border-purple-100 
            dark:border-purple-900/50 
            flex items-center justify-between
          "
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
            {!isCollapsed && (
              <span className="text-xl font-bold text-purple-900 dark:text-white">Menu</span>
            )}
            <button 
              onClick={() => setIsPinned(!isPinned)}
              className="
                p-2 hover:bg-purple-100/80 
                dark:hover:bg-purple-900/50 
                rounded-lg cursor-pointer
                transition-colors
              "
              aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
            >
              {isPinned ? 
                <PanelLeftClose className="h-6 w-6 dark:text-white" /> : 
                <PanelLeftOpen className="h-6 w-6 dark:text-white" />
              }
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item, index) => (
            <MenuItem 
              key={index} 
              item={item}
              isCollapsed={isCollapsed}
              isMobile={screenSize.isMobile}
              onNavigate={navigateToRoute}
            />
          ))}
        </nav>

        {/* User Profile Footer */}
        <div 
          className="
            border-t border-purple-100 
            dark:border-purple-900/50 
            p-4 
            transition-all duration-300
          "
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'}`}>
            <div 
              className="
                w-10 h-10 rounded-full 
                bg-purple-100 dark:bg-purple-900/50 
                flex items-center justify-center 
                flex-shrink-0 overflow-hidden
                ring-2 ring-purple-200 dark:ring-purple-700
              "
            >
              <img 
                src={userData?.avatar_url || "/avatars/user.png"}
                alt={userData?.fullname || "User"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/avatars/user.png";
                }}
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="font-bold text-purple-900 dark:text-white truncate">
                  {userData?.fullname}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-300 truncate">
                  {userData?.email}
                </p>
                {userData?.department && (
                  <p className="text-xs text-purple-500 dark:text-purple-400 truncate">
                    {userData.department}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {loading && <SidebarLoading isDarkMode={isDarkMode} />}
      </aside>

      {/* Mobile Header */}
      <header 
        className="
          lg:hidden fixed top-0 left-0 right-0 
          z-40 bg-purple-50/80 dark:bg-purple-950 
          p-4 flex justify-between items-center 
          border-b border-purple-100 dark:border-purple-900/50
          shadow-sm
        "
      >
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="
              text-purple-900 dark:text-white 
              hover:bg-purple-100 dark:hover:bg-purple-900 
              rounded-full p-2 transition-colors
            "
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-xl font-bold text-purple-900 dark:text-white">Menu</span>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && <MobileMenu />}
    </>
  );
};

SidebarContent.propTypes = {
  userId: PropTypes.string.isRequired,
  isDarkMode: PropTypes.bool.isRequired
};

export default SidebarContent;