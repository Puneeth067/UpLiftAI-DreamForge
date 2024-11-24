import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"
import {
  Moon,
  Bell,
  ArrowLeft,
  AlertTriangle,
  Mail,
  MessageCircle,
  AlertOctagon,
  MessageSquare,
  Home,
  Star,
  Palette,
  User,
  Settings,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import PropTypes from 'prop-types';
import CyberCursorEffect from "@/components/ui/CyberCursorEffect";

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

const SettingsPage = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [userData, setUserData] = useState(location.state?.userData);
  const userType = location.state?.userData.userType || 'user';
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [setActiveView] = useState('home');
  const [activeItem, setActiveItem] = useState(null);

  const [settings, setSettings] = useState({
    darkMode: isDarkMode,
    notifications: {
      email: true,
      sms: false,
      push: true,
      ticketUpdates: true,
      criticalAlerts: true,
      marketingComms: false
    }
  });

  // Updated menu items for creator dashboard
  const menuItems = [
    {
      title: 'Home',
      icon: Home,
      view: 'home',
      onClick: () => navigate('/agentdashboard', { state: { userData } })
    },
    {
      title: 'Messages',
      icon: MessageSquare,
      view: 'tickets',
      onClick: () => navigate('/agenttickets', { state: { userData } })
    },
    {
      title: 'Featured Work',
      icon: Star,
      view: 'project',
      onClick: () => navigate('/agentprojects', { state: { userData } })
    },
    {
      title: 'Portfolio',
      icon: Palette,
      view: 'portfolio',
      onClick: () => navigate('/portfolio', { state: { userData } })
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

  const SidebarContent = () => (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && <span className="text-xl font-semibold dark:text-white">Menu</span>}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            {isCollapsed ? 
              <PanelLeftOpen  className="h-6 w-6 dark:text-white" /> : 
              <PanelLeftClose className="h-6 w-6 dark:text-white" />
            }
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} index={index} />
        ))}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 mt-auto">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {userData?.avatar_url ? (
              <img 
                src={`/avatars/${userData.avatar_url}`}
                alt={userData.fullname}
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
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="font-medium truncate dark:text-white">{userData.fullname}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{userData.email}</p>
              {userData.department && (
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{userData.department}</p>
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
        className={`flex items-center w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors duration-200 ${
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

  // Get current user and settings on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.id)
          .single();
        
        if (userData) {
          setUserData(userData);
        }
      }
    };

    if (!userData) {
      getCurrentUser();
    }
  }, [userData]);

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: existingSettings, error } = await supabase
          .from('user_settings')
          .select('preferences')
          .eq('user_id', userData.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (existingSettings) {
          setSettings(existingSettings.preferences);
          if (existingSettings.preferences.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } else {
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: userData.id,
              preferences: settings
            });

          if (insertError) throw insertError;
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive"
        });
      }
    };

    if (userData?.id) {
      loadSettings();
    }
  }, [userData?.id]);

  const updateSetting = async (key, value, subKey = null) => {
    try {
      const newSettings = subKey 
        ? { 
            ...settings, 
            [key]: { 
              ...settings[key], 
              [subKey]: value 
            } 
          }
        : { ...settings, [key]: value };

      setSettings(newSettings);

      if (key === 'darkMode') {
        await toggleTheme(userData.id);
      }

      const { error } = await supabase
        .from('user_settings')
        .update({ preferences: newSettings })
        .eq('user_id', userData.id);

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete.toUpperCase() !== 'DELETE') {
      toast({
        title: "Error",
        description: "Please type 'DELETE' to confirm account deletion",
        variant: "destructive"
      });
      return;
    }
  
    setLoading(true);
    try {
      // Ensure we have a valid session
      if (!session) {
        throw new Error("No active session found");
      }
  
      // Call the Edge Function for account deletion
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ user_id: session.user.id })
        }
      );
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account');
      }
  
      // Sign out the user after successful deletion
      await supabase.auth.signOut();
  
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
        duration: 5000
      });
  
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BackgroundSVG className="z-0 "/>
      <CyberCursorEffect />
      <aside className={`hidden md:block fixed left-0 top-0 h-full border-r border-gray-200 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-900 z-30 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <SidebarContent />
      </aside>
      <Toaster />
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center h-full">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mr-4 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Appearance & Language */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appearance Settings */}
            <Card className="overflow-hidden border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-6">
                <div className="flex items-center gap-3">
                  <Moon size={20} className="text-blue-600 dark:text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adjust the appearance of the interface</p>
                  </div>
                  <Switch 
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                    className="ml-4"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="overflow-hidden border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-6">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-blue-600 dark:text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notification Preferences
                  </h2>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Notification Channels */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notification Channels
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-500" />
                        <span>Email Notifications</span>
                      </div>
                      <Switch 
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => updateSetting('notifications', checked, 'email')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle size={16} className="text-gray-500" />
                        <span>Push Notifications</span>
                      </div>
                      <Switch 
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => updateSetting('notifications', checked, 'push')}
                      />
                    </div>
                  </div>

                  {/* Notification Types */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notification Types
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertOctagon size={16} className="text-red-500" />
                        <span>Critical Alerts</span>
                      </div>
                      <Switch 
                        checked={settings.notifications.criticalAlerts}
                        onCheckedChange={(checked) => updateSetting('notifications', checked, 'criticalAlerts')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-yellow-500" />
                        <span>Ticket Updates</span>
                      </div>
                      <Switch 
                        checked={settings.notifications.ticketUpdates}
                        onCheckedChange={(checked) => updateSetting('notifications', checked, 'ticketUpdates')}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Danger Zone */}
          <div className="lg:col-span-1">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-500">
                  <AlertTriangle size={20} />
                  <h2 className="text-lg font-semibold">Danger Zone</h2>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-red-600 dark:text-red-500">Delete Account</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userType === 'user'
                      ? "This action will permanently delete your account and all associated data. This cannot be undone."
                      : "This action will permanently delete your agent account and reassign all your active tickets. This cannot be undone."}
                  </p>
                
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full mt-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                      >
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600 dark:text-red-500">
                          Delete Account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          <div className="space-y-4 text-gray-600 dark:text-gray-400">
                            <div>
                              This action cannot be undone. This will permanently delete your account
                              and remove all associated data from our servers.
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Please type <strong>DELETE</strong> to confirm:
                              </div>
                              <input
                                type="text"
                                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md
                                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600
                                            focus:border-transparent"
                                placeholder="Type DELETE"
                                value={confirmDelete}
                                onChange={(e) => setConfirmDelete(e.target.value)}
                              />
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="mt-0">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                          disabled={loading}
                        >
                          {loading ? "Deleting..." : "Delete Account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;